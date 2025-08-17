import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import { TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon } from "lucide-react";
import { motion } from "framer-motion";

// Portfolio allocation data with neon colors
const allocationData = [
  { name: "Stocks", value: 45, color: "#16a34a", amount: 56437.5 },
  { name: "Bonds", value: 30, color: "#3b82f6", amount: 37625 },
  { name: "Crypto", value: 15, color: "#06b6d4", amount: 18862.5 },
  { name: "Cash", value: 10, color: "#f59e0b", amount: 12575 }
];

// Performance data for the last 30 days
const performanceData = [
  { date: "Day 1", value: 118000 },
  { date: "Day 5", value: 120000 },
  { date: "Day 10", value: 119500 },
  { date: "Day 15", value: 122000 },
  { date: "Day 20", value: 124500 },
  { date: "Day 25", value: 123800 },
  { date: "Day 30", value: 125750 }
];

interface PortfolioOverviewCardProps {
  totalValue?: number;
  changePercent?: number;
  diversificationScore?: number;
}

export const PortfolioOverviewCard = ({ 
  totalValue = 125750,
  changePercent = 2.34,
  diversificationScore = 85
}: PortfolioOverviewCardProps) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'allocation' | 'performance'>('allocation');
  
  const isPositive = changePercent >= 0;

  const handlePieHover = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const handlePieLeave = () => {
    setActiveIndex(null);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-lg">
          <p className="text-white font-semibold">{data.name}</p>
          <p className="text-emerald-400">{data.value}% • ${data.amount.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl">
        {/* Neon glow border */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-emerald-400/20 to-blue-400/20 rounded-lg blur-sm" />
        <div className="absolute inset-[1px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-lg" />
        
        <CardHeader className="relative pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-white">Portfolio Overview</CardTitle>
            
            {/* View Mode Toggle */}
            <div className="flex bg-slate-800/50 rounded-lg p-1">
              <button
                onClick={() => setViewMode('allocation')}
                className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
                  viewMode === 'allocation' 
                    ? 'bg-emerald-500 text-white' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <PieChartIcon className="w-4 h-4" />
                Allocation
              </button>
              <button
                onClick={() => setViewMode('performance')}
                className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
                  viewMode === 'performance' 
                    ? 'bg-emerald-500 text-white' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Performance
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative">
          {/* Key Metrics Row */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
              <p className="text-slate-400 text-sm mb-1">Total Value</p>
              <p className="text-white text-xl font-bold">
                ${totalValue.toLocaleString()}
              </p>
            </div>
            
            <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
              <p className="text-slate-400 text-sm mb-1">30-Day Change</p>
              <div className={`flex items-center gap-2 ${
                isPositive ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {isPositive ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="text-xl font-bold">
                  {isPositive ? '+' : ''}{changePercent}%
                </span>
              </div>
            </div>
            
            <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
              <p className="text-slate-400 text-sm mb-1">Diversification</p>
              <div className="flex items-center gap-2">
                <span className="text-white text-xl font-bold">{diversificationScore}</span>
                <Badge 
                  variant="secondary"
                  className={`${
                    diversificationScore >= 80 
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                      : diversificationScore >= 60
                      ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                      : 'bg-red-500/20 text-red-400 border-red-500/30'
                  }`}
                >
                  {diversificationScore >= 80 ? 'Excellent' : diversificationScore >= 60 ? 'Good' : 'Poor'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="h-80">
            {viewMode === 'allocation' ? (
              <div className="flex items-center justify-between h-full">
                {/* Pie Chart */}
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={allocationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={2}
                        dataKey="value"
                        onMouseEnter={handlePieHover}
                        onMouseLeave={handlePieLeave}
                      >
                        {allocationData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color}
                            stroke={activeIndex === index ? entry.color : 'transparent'}
                            strokeWidth={activeIndex === index ? 3 : 0}
                            style={{
                              filter: activeIndex === index ? 'brightness(1.2)' : 'none',
                              transition: 'all 0.3s ease'
                            }}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend */}
                <div className="w-48 pl-6">
                  <h4 className="text-white font-semibold mb-4">Asset Allocation</h4>
                  <div className="space-y-3">
                    {allocationData.map((item, index) => (
                      <motion.div
                        key={item.name}
                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                          activeIndex === index 
                            ? 'bg-slate-700/50 border border-slate-600' 
                            : 'bg-slate-800/30 hover:bg-slate-700/30'
                        }`}
                        onMouseEnter={() => setActiveIndex(index)}
                        onMouseLeave={() => setActiveIndex(null)}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-white text-sm font-medium">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-semibold">{item.value}%</div>
                          <div className="text-slate-400 text-xs">
                            ${item.amount.toLocaleString()}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Performance Chart */
              <div>
                <h4 className="text-white font-semibold mb-4">30-Day Performance</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={performanceData}>
                    <XAxis 
                      dataKey="date" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#16a34a"
                      strokeWidth={3}
                      dot={{ fill: '#16a34a', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: '#16a34a', stroke: '#fff', strokeWidth: 2 }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                      formatter={(value: any) => [`$${value.toLocaleString()}`, 'Portfolio Value']}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};