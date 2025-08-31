import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import { TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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
      className="w-full"
    >
      <Card className="professional-card border-0 shadow-2xl hover:shadow-3xl transition-all duration-500">
        <CardHeader className="pb-4 md:pb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-xl md:text-2xl font-bold text-text-heading flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg shrink-0">
                <PieChartIcon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              </div>
              Portfolio Overview
            </CardTitle>
            
            {/* View Mode Toggle - Mobile Optimized */}
            <div className="flex bg-muted/30 rounded-lg p-1 border border-border/30 self-start md:self-auto">
              <Button
                variant={viewMode === 'allocation' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('allocation')}
                className="flex items-center gap-2 text-xs md:text-sm px-2 md:px-3 py-1.5 min-h-[36px]"
              >
                <PieChartIcon className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Allocation</span>
              </Button>
              <Button
                variant={viewMode === 'performance' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('performance')}
                className="flex items-center gap-2 text-xs md:text-sm px-2 md:px-3 py-1.5 min-h-[36px]"
              >
                <BarChart3 className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Performance</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 md:p-6">
          {/* Key Metrics Row - Mobile Responsive */}
          <div className="mobile-grid gap-3 md:gap-4 mb-6">
            <div className="mobile-card p-4 bg-gradient-to-br from-primary/5 to-background border-primary/10">
              <p className="text-text-secondary text-xs md:text-sm mb-1 font-medium">Total Value</p>
              <p className="text-text-heading text-lg md:text-2xl font-bold">
                ${totalValue.toLocaleString()}
              </p>
            </div>
            
            <div className="mobile-card p-4 bg-gradient-to-br from-secondary/5 to-background border-secondary/10">
              <p className="text-text-secondary text-xs md:text-sm mb-1 font-medium">30-Day Change</p>
              <div className={`flex items-center gap-2 ${
                isPositive ? 'text-success' : 'text-destructive'
              }`}>
                {isPositive ? (
                  <TrendingUp className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
                ) : (
                  <TrendingDown className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
                )}
                <span className="text-lg md:text-2xl font-bold">
                  {isPositive ? '+' : ''}{changePercent}%
                </span>
              </div>
            </div>
            
            <div className="mobile-card p-4 bg-gradient-to-br from-accent/5 to-background border-accent/10">
              <p className="text-text-secondary text-xs md:text-sm mb-1 font-medium">Diversification</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-text-heading text-lg md:text-2xl font-bold">{diversificationScore}</span>
                <Badge 
                  variant="secondary"
                  className={cn(
                    "text-xs font-medium",
                    diversificationScore >= 80 
                      ? 'bg-success/20 text-success border-success/30' 
                      : diversificationScore >= 60
                      ? 'bg-warning/20 text-warning border-warning/30'
                      : 'bg-destructive/20 text-destructive border-destructive/30'
                  )}
                >
                  {diversificationScore >= 80 ? 'Excellent' : diversificationScore >= 60 ? 'Good' : 'Poor'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Chart Section - Mobile Responsive */}
          <div className="min-h-[320px] md:min-h-[400px]">
            {viewMode === 'allocation' ? (
              <div className="flex flex-col lg:flex-row items-start justify-between h-full gap-6">
                {/* Pie Chart */}
                <div className="flex-1 w-full min-h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={allocationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={100}
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
                              filter: activeIndex === index ? 'brightness(1.2) drop-shadow(0 0 8px rgba(255,255,255,0.3))' : 'none',
                              transition: 'all 0.3s ease'
                            }}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend - Mobile Responsive */}
                <div className="w-full lg:w-56 space-y-4">
                  <h4 className="text-text-heading font-semibold text-sm md:text-base">Asset Allocation</h4>
                  <div className="space-y-2">
                    {allocationData.map((item, index) => (
                      <motion.div
                        key={item.name}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-300 touch-target border", 
                          activeIndex === index 
                            ? 'bg-primary/10 border-primary/30 shadow-md scale-105' 
                            : 'bg-muted/20 hover:bg-muted/30 border-border/20 hover:border-border/40 hover:scale-102'
                        )}
                        onMouseEnter={() => setActiveIndex(index)}
                        onMouseLeave={() => setActiveIndex(null)}
                        onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div 
                            className="w-4 h-4 rounded-full shrink-0 border-2 border-white/20" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-text-heading text-sm font-medium truncate">{item.name}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-text-heading font-bold text-sm">{item.value}%</div>
                          <div className="text-text-muted text-xs">
                            ${(item.amount / 1000).toFixed(0)}k
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Performance Chart - Mobile Responsive */
              <div>
                <h4 className="text-text-heading font-semibold mb-4 text-sm md:text-base">30-Day Performance</h4>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={performanceData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <XAxis 
                      dataKey="date" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--text-muted))', fontSize: 11 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--text-muted))', fontSize: 11 }}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                      width={45}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="hsl(var(--success))"
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--success))', strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5, fill: 'hsl(var(--success))', stroke: 'hsl(var(--card))', strokeWidth: 2 }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--text-heading))',
                        fontSize: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
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