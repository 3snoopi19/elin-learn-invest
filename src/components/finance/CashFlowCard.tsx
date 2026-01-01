import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowDownLeft, ArrowUpRight, Calendar, Target, Users, TrendingDown, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface SpendingCategory {
  name: string;
  amount: number;
  percentile?: number;
  comparisonType: 'top' | 'below' | 'above' | 'average';
}

interface CashFlowCardProps {
  income?: number;
  spending?: number;
  budget?: number;
  animationDelay?: number;
}

// Mock spending categories with peer comparison data
const mockCategories: SpendingCategory[] = [
  { name: 'Dining Out', amount: 450, percentile: 15, comparisonType: 'top' },
  { name: 'Groceries', amount: 380, percentile: 20, comparisonType: 'below' },
  { name: 'Transport', amount: 210, percentile: 8, comparisonType: 'above' },
  { name: 'Entertainment', amount: 185, percentile: 25, comparisonType: 'below' },
];

const PeerBadge = ({ category }: { category: SpendingCategory }) => {
  const getBadgeConfig = () => {
    switch (category.comparisonType) {
      case 'top':
        return {
          icon: TrendingUp,
          text: `Top ${category.percentile}% spender`,
          className: 'bg-warning/10 text-warning border-warning/30'
        };
      case 'below':
        return {
          icon: TrendingDown,
          text: `${category.percentile}% less than avg`,
          className: 'bg-success/10 text-success border-success/30'
        };
      case 'above':
        return {
          icon: TrendingUp,
          text: `${category.percentile}% above avg`,
          className: 'bg-destructive/10 text-destructive border-destructive/30'
        };
      default:
        return {
          icon: Users,
          text: 'Average',
          className: 'bg-muted text-text-secondary border-border'
        };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`text-[10px] px-1.5 py-0.5 ${config.className}`}>
      <Icon className="w-2.5 h-2.5 mr-1" />
      {config.text}
    </Badge>
  );
};

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

          {/* Spending Categories with Peer Comparison */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-text-secondary flex items-center gap-2">
              <Users className="w-4 h-4" />
              Spending by Category (vs. peers in your city)
            </h4>
            <div className="space-y-2">
              {mockCategories.map((cat, idx) => (
                <motion.div
                  key={cat.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: animationDelay + 0.1 * idx }}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-text-heading">{cat.name}</span>
                    <span className="text-sm text-text-muted">${cat.amount}</span>
                  </div>
                  <PeerBadge category={cat} />
                </motion.div>
              ))}
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
