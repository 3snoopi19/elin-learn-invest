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
      <Card className="professional-card relative overflow-hidden border-0 bg-gradient-to-br from-card via-card to-slate-900 shadow-xl">
        {/* Enhanced gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 animate-pulse" />
        
        {/* Professional border glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-lg blur-sm" />
        <div className="absolute inset-[1px] bg-gradient-to-br from-card via-card to-slate-900 rounded-lg" />
        
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
            <div className="flex items-baseline gap-4 mb-4">
              <span className="text-5xl font-bold text-text-heading">
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
                <div className="flex bg-muted/30 rounded-lg p-1 border border-border/30">
                  <Button
                    variant={timeframe === 'daily' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setTimeframe('daily')}
                  >
                    Daily
                  </Button>
                  <Button
                    variant={timeframe === 'weekly' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setTimeframe('weekly')}
                  >
                    Weekly
                  </Button>
                </div>

                {/* Change Indicator */}
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                  isPositive 
                    ? 'bg-success/10 text-success border-success/20' 
                    : 'bg-destructive/10 text-destructive border-destructive/20'
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
                  color={isPositive ? 'hsl(var(--success))' : 'hsl(var(--destructive))'}
                />
              </div>
            </div>
          </div>

          {/* CTA Section */}
          {!hasRiskProfile && (
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-4 border border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-text-heading mb-1">
                    Unlock Personalized Insights
                  </h3>
                  <p className="text-sm text-text-secondary">
                    Complete your risk assessment to get tailored investment recommendations
                  </p>
                </div>
                <Button 
                  onClick={() => navigate('/risk-quiz')}
                  variant="default"
                  className="shadow-lg"
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