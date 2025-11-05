import { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi, AreaSeries } from 'lightweight-charts';

interface ChartConfig {
  title: string;
  symbol: string;
  color: string;
}

const chartConfigs: ChartConfig[] = [
  { title: 'Bitcoin', symbol: 'BTC/USD', color: '#F7931A' },
  { title: 'Gold', symbol: 'XAU/USD', color: '#FFD700' },
  { title: 'US Dollar Index', symbol: 'DXY', color: '#00A86B' },
  { title: '10-Year Treasury', symbol: 'TNX', color: '#4169E1' }
];

const ChartWidget = ({ title, symbol, color }: ChartConfig) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<any>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'hsl(var(--card))' },
        textColor: 'hsl(var(--foreground))',
      },
      grid: {
        vertLines: { color: 'hsl(var(--border))' },
        horzLines: { color: 'hsl(var(--border))' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 300,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const series = chart.addSeries(AreaSeries, {
      lineColor: color,
      topColor: color + '80',
      bottomColor: color + '00',
      lineWidth: 2,
    });

    chartRef.current = chart;
    seriesRef.current = series;

    // Generate sample data with realistic price movements
    const generateData = () => {
      const data = [];
      const now = Math.floor(Date.now() / 1000);
      let basePrice = symbol === 'BTC/USD' ? 45000 : 
                      symbol === 'XAU/USD' ? 2000 :
                      symbol === 'DXY' ? 104 : 4.5;
      
      for (let i = 100; i >= 0; i--) {
        const time = now - i * 3600; // Hourly data
        const volatility = basePrice * 0.02;
        const change = (Math.random() - 0.5) * volatility;
        basePrice += change;
        
        data.push({
          time: time as any,
          value: basePrice,
        });
      }
      return data;
    };

    series.setData(generateData());

    // Simulate real-time updates
    const interval = setInterval(() => {
      const lastBar = series.dataByIndex(series.data().length - 1) as any;
      if (lastBar) {
        const volatility = lastBar.value * 0.001;
        const change = (Math.random() - 0.5) * volatility;
        const newValue = lastBar.value + change;
        
        series.update({
          time: Math.floor(Date.now() / 1000) as any,
          value: newValue,
        });
      }
    }, 2000);

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
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [symbol, color]);

  return (
    <div className="bg-card rounded-lg border border-border p-4 transition-all hover:shadow-lg">
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{symbol}</p>
      </div>
      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
};

export const KeyMarketDashboard = () => {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-foreground">
          Key Market Dashboard
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {chartConfigs.map((config) => (
            <ChartWidget key={config.symbol} {...config} />
          ))}
        </div>
      </div>
    </div>
  );
};
