import { useState, useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi, LineSeries, LineData } from 'lightweight-charts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Asset {
  id: string;
  name: string;
  symbol: string;
  color: string;
  currentPrice: number;
  change24h: number;
}

interface TimeSeriesData {
  time: number;
  value: number;
}

const ASSETS: Asset[] = [
  { id: 'btc', name: 'Bitcoin', symbol: 'BTC/USD', color: '#F7931A', currentPrice: 45234.50, change24h: 2.34 },
  { id: 'gold', name: 'Gold', symbol: 'XAU/USD', color: '#FFD700', currentPrice: 2043.20, change24h: -0.45 },
  { id: 'dxy', name: 'US Dollar', symbol: 'DXY', color: '#00A86B', currentPrice: 104.23, change24h: 0.12 },
  { id: 'tnx', name: '10Y Treasury', symbol: 'TNX', color: '#4169E1', currentPrice: 4.52, change24h: -1.23 }
];

const TIME_PERIODS = [
  { label: '1D', days: 1 },
  { label: '7D', days: 7 },
  { label: '1M', days: 30 },
  { label: '6M', days: 180 },
  { label: 'YTD', days: null }, // Will calculate based on year start
  { label: '1Y', days: 365 }
];

// Generate realistic time series data
const generateTimeSeriesData = (assetId: string, days: number): TimeSeriesData[] => {
  const data: TimeSeriesData[] = [];
  const now = Math.floor(Date.now() / 1000);
  const basePrice = assetId === 'btc' ? 45000 : 
                    assetId === 'gold' ? 2000 :
                    assetId === 'dxy' ? 104 : 4.5;
  
  let currentPrice = basePrice * 0.95; // Start 5% lower
  const volatility = basePrice * 0.02;
  
  for (let i = days; i >= 0; i--) {
    const time = now - i * 24 * 3600;
    const change = (Math.random() - 0.5) * volatility;
    currentPrice += change;
    data.push({ time, value: currentPrice });
  }
  
  return data;
};

// Normalize data to percentage change from start
const normalizeToPercentage = (data: TimeSeriesData[]): TimeSeriesData[] => {
  if (data.length === 0) return [];
  const baseValue = data[0].value;
  return data.map(point => ({
    time: point.time,
    value: ((point.value - baseValue) / baseValue) * 100
  }));
};

// Calculate Pearson correlation coefficient
const calculateCorrelation = (data1: TimeSeriesData[], data2: TimeSeriesData[]): number => {
  if (data1.length !== data2.length || data1.length === 0) return 0;
  
  const n = data1.length;
  const values1 = data1.map(d => d.value);
  const values2 = data2.map(d => d.value);
  
  const mean1 = values1.reduce((a, b) => a + b, 0) / n;
  const mean2 = values2.reduce((a, b) => a + b, 0) / n;
  
  let numerator = 0;
  let sumSq1 = 0;
  let sumSq2 = 0;
  
  for (let i = 0; i < n; i++) {
    const diff1 = values1[i] - mean1;
    const diff2 = values2[i] - mean2;
    numerator += diff1 * diff2;
    sumSq1 += diff1 * diff1;
    sumSq2 += diff2 * diff2;
  }
  
  const denominator = Math.sqrt(sumSq1 * sumSq2);
  return denominator === 0 ? 0 : numerator / denominator;
};

const AssetCard = ({ 
  asset, 
  isSelected, 
  onClick 
}: { 
  asset: Asset; 
  isSelected: boolean; 
  onClick: () => void;
}) => {
  const isPositive = asset.change24h >= 0;
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "min-w-[200px] p-4 rounded-lg border transition-all",
        "hover:shadow-lg hover:scale-105",
        isSelected 
          ? "bg-primary/10 border-primary shadow-md" 
          : "bg-card border-border"
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-semibold text-left text-foreground">{asset.name}</h3>
          <p className="text-xs text-muted-foreground text-left">{asset.symbol}</p>
        </div>
        <div 
          className="w-3 h-3 rounded-full" 
          style={{ backgroundColor: asset.color }}
        />
      </div>
      
      <div className="flex items-baseline gap-2">
        <span className="text-xl font-bold text-foreground">
          ${asset.currentPrice.toLocaleString()}
        </span>
        <div className={cn(
          "flex items-center gap-1 text-sm font-medium",
          isPositive ? "text-success" : "text-destructive"
        )}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(asset.change24h)}%
        </div>
      </div>
    </button>
  );
};

export const GlobalMacroDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState(TIME_PERIODS[2]); // Default to 1M
  const [primaryAsset, setPrimaryAsset] = useState(ASSETS[0]); // Default to BTC
  const [comparisonAssets, setComparisonAssets] = useState<Asset[]>([]);
  const [correlation, setCorrelation] = useState<number | null>(null);
  
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRefs = useRef<Map<string, any>>(new Map());

  // Toggle comparison asset
  const toggleComparisonAsset = (asset: Asset) => {
    if (asset.id === primaryAsset.id) return;
    
    const isSelected = comparisonAssets.some(a => a.id === asset.id);
    if (isSelected) {
      setComparisonAssets(prev => prev.filter(a => a.id !== asset.id));
    } else {
      setComparisonAssets(prev => [...prev, asset]);
    }
  };

  // Chart setup and data update
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create or get chart
    if (!chartRef.current) {
      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: 'transparent' },
          textColor: 'hsl(var(--foreground))',
        },
        grid: {
          vertLines: { color: 'hsl(var(--border) / 0.1)' },
          horzLines: { color: 'hsl(var(--border) / 0.1)' },
        },
        width: chartContainerRef.current.clientWidth,
        height: 500,
        rightPriceScale: {
          borderVisible: false,
        },
        timeScale: {
          borderVisible: false,
          timeVisible: true,
          secondsVisible: false,
        },
        crosshair: {
          horzLine: {
            visible: true,
            labelVisible: true,
          },
          vertLine: {
            visible: true,
            labelVisible: true,
          },
        },
      });

      chartRef.current = chart;
    }

    const chart = chartRef.current;

    // Clear existing series
    seriesRefs.current.forEach(series => chart.removeSeries(series));
    seriesRefs.current.clear();

    // Generate data
    const days = selectedPeriod.days || 365;
    const primaryData = generateTimeSeriesData(primaryAsset.id, days);
    const comparisonData = comparisonAssets.map(asset => ({
      asset,
      data: generateTimeSeriesData(asset.id, days)
    }));

    // Determine if we need percentage view
    const usePercentage = comparisonAssets.length > 0;

    if (usePercentage) {
      // Normalize all data to percentage
      const normalizedPrimary = normalizeToPercentage(primaryData);
      
      // Add primary series
      const primarySeries = chart.addSeries(LineSeries, {
        color: primaryAsset.color,
        lineWidth: 3,
        title: primaryAsset.name,
      });
      primarySeries.setData(normalizedPrimary as LineData[]);
      seriesRefs.current.set(primaryAsset.id, primarySeries);

      // Add comparison series and calculate correlation
      comparisonData.forEach(({ asset, data }) => {
        const normalizedData = normalizeToPercentage(data);
        const series = chart.addSeries(LineSeries, {
          color: asset.color,
          lineWidth: 2,
          title: asset.name,
        });
        series.setData(normalizedData as LineData[]);
        seriesRefs.current.set(asset.id, series);

        // Calculate correlation with primary
        const corr = calculateCorrelation(normalizedPrimary, normalizedData);
        setCorrelation(corr);
      });

      // Update y-axis label
      chart.applyOptions({
        rightPriceScale: {
          scaleMargins: { top: 0.1, bottom: 0.1 },
        },
      });
    } else {
      // Show absolute price
      const primarySeries = chart.addSeries(LineSeries, {
        color: primaryAsset.color,
        lineWidth: 3,
        title: primaryAsset.name,
      });
      primarySeries.setData(primaryData as LineData[]);
      seriesRefs.current.set(primaryAsset.id, primarySeries);
      
      setCorrelation(null);
    }

    chart.timeScale().fitContent();

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [primaryAsset, comparisonAssets, selectedPeriod]);

  const availableAssets = ASSETS.filter(a => a.id !== primaryAsset.id);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Global Macro Dashboard</h1>
            <p className="text-muted-foreground mt-1">Track correlations between key market assets</p>
          </div>
          
          {/* Time Period Selector */}
          <div className="flex gap-2">
            {TIME_PERIODS.map(period => (
              <Button
                key={period.label}
                variant={selectedPeriod.label === period.label ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
              >
                {period.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Focus Chart */}
        <div className="relative bg-card rounded-xl border border-border p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: primaryAsset.color }}
              />
              <h2 className="text-2xl font-bold text-foreground">{primaryAsset.name}</h2>
              <span className="text-muted-foreground">{primaryAsset.symbol}</span>
            </div>
            
            {correlation !== null && (
              <Badge variant="outline" className="text-sm px-4 py-2">
                <span className="font-semibold">Correlation ({selectedPeriod.label}):</span>
                <span className={cn(
                  "ml-2 font-bold",
                  Math.abs(correlation) > 0.7 ? "text-primary" : "text-muted-foreground"
                )}>
                  {correlation.toFixed(2)}
                </span>
              </Badge>
            )}
          </div>
          
          <div ref={chartContainerRef} className="w-full" />
          
          {comparisonAssets.length > 0 && (
            <div className="mt-4 flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Comparing:</span>
              <div className="flex gap-3">
                {comparisonAssets.map(asset => (
                  <div key={asset.id} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: asset.color }}
                    />
                    <span className="text-sm font-medium text-foreground">{asset.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Comparison Panel */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3">
            {comparisonAssets.length === 0 ? 'Select an asset to compare' : 'Other Assets'}
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {availableAssets.map(asset => (
              <AssetCard
                key={asset.id}
                asset={asset}
                isSelected={comparisonAssets.some(a => a.id === asset.id)}
                onClick={() => toggleComparisonAsset(asset)}
              />
            ))}
          </div>
        </div>

        {/* Info Panel */}
        <div className="bg-card/50 rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground">
            <strong>Tip:</strong> Click any asset card below the chart to overlay it and see the correlation. 
            The chart automatically switches to percentage view to enable true performance comparison.
          </p>
        </div>
      </div>
    </div>
  );
};
