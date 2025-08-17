import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, HelpCircle } from "lucide-react";
import { PortfolioSparkline } from "@/components/PortfolioSparkline";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface HeroSummaryCardProps {
  userName?: string;
  portfolioValue?: number;
  dailyChange?: number;
  weeklyChange?: number;
  hasRiskProfile?: boolean;
}

export const HeroSummaryCard = ({ 
  userName = "Investor", 
  portfolioValue = 125750.50,
  dailyChange = 2.34,
  weeklyChange = 5.67,
  hasRiskProfile = false
}: HeroSummaryCardProps) => {
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly'>('daily');
  
  const currentChange = timeframe === 'daily' ? dailyChange : weeklyChange;
  const isPositive = currentChange >= 0;
  
  // Mock sparkline data - would come from API
  const sparklineData = [
    { date: '2024-01-01', value: 120000 },
    { date: '2024-01-02', value: 122000 },
    { date: '2024-01-03', value: 121500 },
    { date: '2024-01-04', value: 124000 },
    { date: '2024-01-05', value: 123500 },
    { date: '2024-01-06', value: 125750 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-emerald-600/10 to-blue-600/10 animate-pulse" />
        
        {/* Neon glow border */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 via-blue-400/20 to-emerald-400/20 rounded-lg blur-sm" />
        <div className="absolute inset-[1px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-lg" />
        
        <CardContent className="relative p-8">
          {/* Header Section */}
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-text-heading mb-2">
              Welcome back, {userName}!
            </h2>
            <p className="text-text-secondary">Here's your portfolio summary</p>
          </div>

          {/* Portfolio Value Section */}
          <div className="mb-6">
            <div className="flex items-baseline gap-4 mb-3">
              <span className="text-5xl font-bold text-white">
                ${portfolioValue.toLocaleString('en-US', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}
              </span>
            </div>
            
            {/* Change and Sparkline Section */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Timeframe Toggle */}
                <div className="flex bg-slate-800/50 rounded-lg p-1">
                  <button
                    onClick={() => setTimeframe('daily')}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      timeframe === 'daily' 
                        ? 'bg-emerald-500 text-white' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Daily
                  </button>
                  <button
                    onClick={() => setTimeframe('weekly')}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      timeframe === 'weekly' 
                        ? 'bg-emerald-500 text-white' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Weekly
                  </button>
                </div>

                {/* Change Indicator */}
                <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
                  isPositive 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {isPositive ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span className="font-semibold">
                    {isPositive ? '+' : ''}{currentChange}%
                  </span>
                </div>
              </div>

              {/* Mini Sparkline */}
              <div className="w-32 h-12">
                <PortfolioSparkline 
                  data={sparklineData} 
                  color={isPositive ? '#16a34a' : '#ef4444'}
                />
              </div>
            </div>
          </div>

          {/* CTA Section */}
          {!hasRiskProfile && (
            <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-lg p-4 border border-emerald-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    Unlock Personalized Insights
                  </h3>
                  <p className="text-sm text-slate-400">
                    Complete your risk assessment to get tailored investment recommendations
                  </p>
                </div>
                <Button 
                  onClick={() => navigate('/risk-quiz')}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-lg shadow-emerald-500/25"
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Take Risk Quiz
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};