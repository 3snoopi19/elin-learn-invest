import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingUp, TrendingDown, Sparkles, Eye, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface Insight {
  id: string;
  type: 'anomaly' | 'opportunity' | 'trend' | 'positive';
  title: string;
  description: string;
  amountInvolved?: number;
  percentChange?: number;
  category?: string;
  severity: 'info' | 'warning' | 'critical' | 'positive';
}

const mockInsights: Insight[] = [
  {
    id: '1',
    type: 'anomaly',
    title: 'Dining spending spike',
    description: 'You spent 47% more on dining out this week compared to your 4-week average.',
    amountInvolved: 187.50,
    percentChange: 47,
    category: 'Dining',
    severity: 'warning',
  },
  {
    id: '2',
    type: 'opportunity',
    title: 'Bundle detected',
    description: 'You pay for both Hulu ($17.99) and Disney+ ($13.99) separately. Bundling saves $5.98/mo.',
    amountInvolved: 5.98,
    severity: 'info',
  },
  {
    id: '3',
    type: 'trend',
    title: 'Grocery costs rising',
    description: 'Your grocery spending has increased 23% over the past 3 months.',
    amountInvolved: 89.32,
    percentChange: 23,
    category: 'Groceries',
    severity: 'warning',
  },
  {
    id: '4',
    type: 'positive',
    title: 'Transport savings',
    description: 'Great job! Your transport spending is down 15% from last month.',
    amountInvolved: 45.00,
    percentChange: -15,
    category: 'Transport',
    severity: 'positive',
  },
];

const severityStyles = {
  info: {
    icon: Sparkles,
    badge: 'bg-primary/10 text-primary border-primary/30',
    border: 'border-l-primary',
    bg: 'bg-primary/5',
  },
  warning: {
    icon: AlertTriangle,
    badge: 'bg-warning/10 text-warning border-warning/30',
    border: 'border-l-warning',
    bg: 'bg-warning/5',
  },
  critical: {
    icon: AlertTriangle,
    badge: 'bg-destructive/10 text-destructive border-destructive/30',
    border: 'border-l-destructive',
    bg: 'bg-destructive/5',
  },
  positive: {
    icon: TrendingDown,
    badge: 'bg-success/10 text-success border-success/30',
    border: 'border-l-success',
    bg: 'bg-success/5',
  },
};

interface SpendingAnomaliesCardProps {
  insights?: Insight[];
  animationDelay?: number;
}

export const SpendingAnomaliesCard = ({ insights = mockInsights, animationDelay = 0 }: SpendingAnomaliesCardProps) => {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const visibleInsights = insights.filter(i => !dismissedIds.has(i.id));

  const handleDismiss = (id: string) => {
    setDismissedIds(prev => new Set([...prev, id]));
  };

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
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              AI Spending Insights
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {visibleInsights.length} active
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <AnimatePresence mode="popLayout">
            {visibleInsights.map((insight) => {
              const styles = severityStyles[insight.severity];
              const Icon = styles.icon;

              return (
                <motion.div
                  key={insight.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  className={`p-4 rounded-lg border-l-4 ${styles.border} ${styles.bg} relative group`}
                >
                  <button
                    onClick={() => handleDismiss(insight.id)}
                    className="absolute top-2 right-2 p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-muted transition-all"
                    aria-label="Dismiss insight"
                  >
                    <X className="w-3.5 h-3.5 text-text-muted" />
                  </button>

                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${styles.bg}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-text-heading text-sm">
                          {insight.title}
                        </span>
                        {insight.percentChange !== undefined && (
                          <Badge variant="outline" className={`text-xs ${styles.badge}`}>
                            {insight.percentChange > 0 ? '+' : ''}{insight.percentChange}%
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-text-secondary leading-relaxed">
                        {insight.description}
                      </p>
                      {insight.amountInvolved && insight.type === 'opportunity' && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs text-success font-medium">
                            Potential savings: ${insight.amountInvolved.toFixed(2)}/mo
                          </span>
                          <Button size="sm" variant="outline" className="h-7 text-xs">
                            <Eye className="w-3 h-3 mr-1" />
                            Show me
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {visibleInsights.length === 0 && (
            <div className="text-center py-8 text-text-muted">
              <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">All caught up! No new insights.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
