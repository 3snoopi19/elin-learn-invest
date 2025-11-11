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

// Fetch live Bitcoin data from CoinGecko
const fetchBitcoinData = async (days: number): Promise<TimeSeriesData[]> => {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=${days}&interval=daily`
    );
    const data = await response.json();
    
    if (data.prices && Array.isArray(data.prices)) {
      return data.prices.map(([timestamp, price]: [number, number]) => ({
        time: Math.floor(timestamp / 1000), // Convert to seconds
        value: price
      }));
    }
    
    // Fallback to mock data if API fails
    return generateMockTimeSeriesData('btc', days);
  } catch (error) {
    console.error('Failed to fetch Bitcoin data:', error);
    return generateMockTimeSeriesData('btc', days);
  }
};

// Generate realistic mock data for other assets
const generateMockTimeSeriesData = (assetId: string, days: number): TimeSeriesData[] => {
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

// Simulate API fetch for mock data (makes it easy to add real APIs later)
const fetchMockAssetData = async (assetId: string, days: number): Promise<TimeSeriesData[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateMockTimeSeriesData(assetId, days));
    }, 100); // Small delay to simulate network request
  });
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
        "flex-1 min-w-[140px] p-3 rounded-lg border transition-all active:scale-95",
        isSelected 
          ? "bg-primary/10 border-primary shadow-md" 
          : "bg-card border-border"
      )}
    >
      <div className="flex items-start justify-between mb-1.5">
        <div>
          <h3 className="font-semibold text-left text-foreground text-sm">{asset.name}</h3>
          <p className="text-[10px] text-muted-foreground text-left">{asset.symbol}</p>
        </div>
        <div 
          className="w-2.5 h-2.5 rounded-full shrink-0" 
          style={{ backgroundColor: asset.color }}
        />
      </div>
      
      <div className="flex items-baseline gap-1.5">
        <span className="text-base font-bold text-foreground">
          ${asset.currentPrice.toLocaleString()}
        </span>
        <div className={cn(
          "flex items-center gap-0.5 text-xs font-medium",
          isPositive ? "text-success" : "text-destructive"
        )}>
          {isPositive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
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
  const [isLoading, setIsLoading] = useState(false);
  
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
        height: 350,
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

    // Fetch data with live Bitcoin and mock data for others
    const loadChartData = async () => {
      setIsLoading(true);
      try {
        const days = selectedPeriod.days || 365;
        
        // Fetch primary asset data
        const primaryData = primaryAsset.id === 'btc' 
          ? await fetchBitcoinData(days)
          : await fetchMockAssetData(primaryAsset.id, days);
        
        // Fetch comparison assets data
        const comparisonDataPromises = comparisonAssets.map(async asset => ({
          asset,
          data: asset.id === 'btc' 
            ? await fetchBitcoinData(days)
            : await fetchMockAssetData(asset.id, days)
        }));
        
        const comparisonData = await Promise.all(comparisonDataPromises);

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
      } catch (error) {
        console.error('Error loading chart data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadChartData();

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
      <div className="mx-auto p-4 space-y-4 pb-safe">
        {/* Header */}
        <div className="space-y-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Global Macro</h1>
            <p className="text-sm text-muted-foreground">Track asset correlations</p>
          </div>
          
          {/* Time Period Selector */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {TIME_PERIODS.map(period => (
              <Button
                key={period.label}
                variant={selectedPeriod.label === period.label ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
                className="shrink-0"
              >
                {period.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Focus Chart */}
        <div className="relative bg-card rounded-lg border border-border p-3 shadow-lg">
          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: primaryAsset.color }}
              />
              <h2 className="text-lg font-bold text-foreground">{primaryAsset.name}</h2>
              <span className="text-xs text-muted-foreground">{primaryAsset.symbol}</span>
            </div>
            
            {correlation !== null && (
              <Badge variant="outline" className="text-xs px-2 py-1">
                <span className="font-semibold">Corr ({selectedPeriod.label}):</span>
                <span className={cn(
                  "ml-1.5 font-bold",
                  Math.abs(correlation) > 0.7 ? "text-primary" : "text-muted-foreground"
                )}>
                  {correlation.toFixed(2)}
                </span>
              </Badge>
            )}
          </div>
          
          <div ref={chartContainerRef} className="w-full relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-lg z-10">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span>Loading...</span>
                </div>
              </div>
            )}
          </div>
          
          {comparisonAssets.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border">
              <span className="text-xs text-muted-foreground block mb-2">Comparing with:</span>
              <div className="flex gap-2 flex-wrap">
                {comparisonAssets.map(asset => (
                  <div key={asset.id} className="flex items-center gap-1.5 bg-background/50 px-2 py-1 rounded">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: asset.color }}
                    />
                    <span className="text-xs font-medium text-foreground">{asset.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Comparison Panel */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-2">
            {comparisonAssets.length === 0 ? 'Tap to compare' : 'Other Assets'}
          </h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
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
      </div>
    </div>
  );
};
