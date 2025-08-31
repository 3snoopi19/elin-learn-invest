import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Target, Lightbulb, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface InsightData {
  type: 'positive' | 'warning' | 'neutral' | 'tip';
  title: string;
  description: string;
  amount?: number;
  action?: string;
  icon?: React.ReactNode;
}

interface MoneyFlowInsightsProps {
  className?: string;
  totals: {
    income: number;
    expenses: number;
    netWorth: number;
    cashFlow: number;
  };
}

export const MoneyFlowInsights: React.FC<MoneyFlowInsightsProps> = ({ 
  className, 
  totals 
}) => {
  // Generate insights based on financial data
  const insights: InsightData[] = [
    {
      type: 'positive',
      title: 'Strong Monthly Surplus',
      description: `You're saving ${((totals.cashFlow / totals.income) * 100).toFixed(0)}% of your income`,
      amount: totals.cashFlow,
      icon: <TrendingUp className="h-4 w-4" />,
      action: 'Optimize Investments'
    },
    {
      type: 'warning',
      title: 'High Housing Costs',
      description: 'Housing takes 36% of income. Consider refinancing options.',
      icon: <AlertTriangle className="h-4 w-4" />,
      action: 'Explore Options'
    },
    {
      type: 'tip',
      title: 'Auto-Save Opportunity',
      description: 'Set up automatic 20% transfers to high-yield savings',
      icon: <Lightbulb className="h-4 w-4" />,
      action: 'Setup Automation'
    }
  ];

  const getInsightStyles = (type: InsightData['type']) => {
    switch (type) {
      case 'positive':
        return {
          card: 'bg-gradient-to-br from-success/10 to-success/5 border-success/20',
          badge: 'bg-success/15 text-success border-success/30',
          button: 'bg-success hover:bg-success/90'
        };
      case 'warning':
        return {
          card: 'bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20',
          badge: 'bg-warning/15 text-warning border-warning/30',
          button: 'bg-warning hover:bg-warning/90'
        };
      case 'tip':
        return {
          card: 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20',
          badge: 'bg-primary/15 text-primary border-primary/30',
          button: 'bg-primary hover:bg-primary/90'
        };
      default:
        return {
          card: 'bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20',
          badge: 'bg-secondary/15 text-secondary border-secondary/30',
          button: 'bg-secondary hover:bg-secondary/90'
        };
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-text-heading flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Smart Insights
          </h3>
          <p className="text-sm text-text-secondary">
            AI-powered recommendations for your financial flow
          </p>
        </div>
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
          Live Analysis
        </Badge>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.map((insight, index) => {
          const styles = getInsightStyles(insight.type);
          
          return (
            <Card 
              key={index} 
              className={cn(
                "professional-card transition-all duration-300 hover:scale-[1.02]",
                styles.card
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {insight.icon}
                    <CardTitle className="text-sm font-semibold">
                      {insight.title}
                    </CardTitle>
                  </div>
                  <Badge className={cn("text-xs", styles.badge)}>
                    {insight.type === 'positive' ? '✓' : insight.type === 'warning' ? '!' : '💡'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-text-secondary mb-3">
                  {insight.description}
                </p>
                
                {insight.amount && (
                  <div className="mb-3">
                    <div className={cn(
                      "text-lg font-bold",
                      insight.type === 'positive' ? 'text-success' : 'text-text-heading'
                    )}>
                      {insight.amount > 0 ? '+' : ''}${Math.abs(insight.amount).toLocaleString()}
                    </div>
                  </div>
                )}
                
                {insight.action && (
                  <Button 
                    size="sm" 
                    className={cn(
                      "w-full text-white text-xs h-8",
                      styles.button
                    )}
                  >
                    {insight.action}
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Banner */}
      <Card className="professional-card bg-gradient-to-r from-primary/8 via-primary/5 to-primary/8 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-text-heading">
                  Financial Health Score: 8.2/10
                </h4>
                <p className="text-sm text-text-secondary">
                  You're on track! Focus on automating savings and reducing housing costs.
                </p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="border-primary/30 hover:bg-primary/10">
              Full Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};