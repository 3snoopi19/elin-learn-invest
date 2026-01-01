import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowDownLeft, ArrowUpRight, Calendar, Target } from 'lucide-react';
import { motion } from 'framer-motion';

interface CashFlowCardProps {
  income?: number;
  spending?: number;
  budget?: number;
  animationDelay?: number;
}

export const CashFlowCard = ({
  income = 6850.00,
  spending = 4237.52,
  budget = 5000.00,
  animationDelay = 0
}: CashFlowCardProps) => {
  const netFlow = income - spending;
  const budgetUsed = (spending / budget) * 100;
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const currentDay = new Date().getDate();
  const daysRemaining = daysInMonth - currentDay;
  const dailyBudgetRemaining = (budget - spending) / daysRemaining;

  const getBudgetStatus = () => {
    if (budgetUsed <= 70) return { label: 'On Track', color: 'bg-success/10 text-success border-success/30' };
    if (budgetUsed <= 90) return { label: 'Watch It', color: 'bg-warning/10 text-warning border-warning/30' };
    return { label: 'Over Budget', color: 'bg-destructive/10 text-destructive border-destructive/30' };
  };

  const status = getBudgetStatus();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: animationDelay }}
    >
      <Card className="professional-card">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-text-heading flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              Monthly Cash Flow
            </CardTitle>
            <Badge variant="outline" className={`text-xs ${status.color}`}>
              {status.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Income vs Spending */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <ArrowDownLeft className="w-4 h-4 text-success" />
                Income
              </div>
              <div className="text-2xl font-bold text-success">
                +${income.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <Progress value={100} className="h-2 bg-success/20" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <ArrowUpRight className="w-4 h-4 text-destructive" />
                Spending
              </div>
              <div className="text-2xl font-bold text-destructive">
                -${spending.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <Progress value={budgetUsed} className="h-2 bg-destructive/20" />
            </div>
          </div>

          {/* Net Flow */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-success/10 border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-text-secondary">Net Cash Flow</div>
                <div className={`text-2xl font-bold ${netFlow >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {netFlow >= 0 ? '+' : '-'}${Math.abs(netFlow).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-text-secondary">Budget Used</div>
                <div className="text-xl font-semibold text-text-heading">{budgetUsed.toFixed(0)}%</div>
              </div>
            </div>
          </div>

          {/* Daily Budget Remaining */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-sm text-text-secondary">Daily budget remaining</span>
            </div>
            <div className="text-sm font-semibold text-text-heading">
              ${dailyBudgetRemaining.toFixed(2)}/day
              <span className="text-text-muted ml-1">({daysRemaining} days left)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
