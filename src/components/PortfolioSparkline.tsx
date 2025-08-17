import { AreaChart, Area, ResponsiveContainer } from "recharts";

const mockData = [
  { value: 10000 },
  { value: 10500 },
  { value: 10200 },
  { value: 11000 },
  { value: 10800 },
  { value: 11500 },
  { value: 12000 },
  { value: 11800 },
  { value: 12500 },
  { value: 13200 },
  { value: 12900 },
  { value: 13800 },
  { value: 14200 },
  { value: 13900 },
  { value: 14800 },
  { value: 15200 }
];

interface PortfolioSparklineProps {
  className?: string;
  data?: Array<{ date?: string; value: number }>;
  color?: string;
}

export const PortfolioSparkline = ({ className = "", data, color = "rgb(52, 211, 153)" }: PortfolioSparklineProps) => {
  const chartData = data || mockData;
  return (
    <div className={`relative ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="sparklineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(52, 211, 153)" stopOpacity={0.4} />
              <stop offset="100%" stopColor="rgb(52, 211, 153)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="conservativeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(148, 163, 184)" stopOpacity={0.2} />
              <stop offset="100%" stopColor="rgb(148, 163, 184)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="aggressiveGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity={0.2} />
              <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity={0} />
            </linearGradient>
          </defs>
          
          {/* Conservative band */}
          <Area
            type="monotone"
            dataKey={() => 9500}
            stroke="none"
            fill="url(#conservativeGradient)"
            strokeWidth={0}
          />
          
          {/* Aggressive band */}
          <Area
            type="monotone"
            dataKey={() => 16000}
            stroke="none"
            fill="url(#aggressiveGradient)"
            strokeWidth={0}
          />
          
          {/* Main sparkline */}
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            fill="url(#sparklineGradient)"
            dot={false}
            activeDot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
      
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 opacity-10 dark:opacity-5">
        <svg className="w-full h-full">
          <defs>
            <pattern id="grid" width="20" height="10" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
    </div>
  );
};