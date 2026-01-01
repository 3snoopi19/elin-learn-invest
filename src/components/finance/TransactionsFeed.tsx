import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Receipt, Coffee, ShoppingBag, Car, Home, Utensils, Zap, Smartphone, Film, Heart, Repeat, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, isToday, isYesterday } from 'date-fns';

interface Transaction {
  id: string;
  merchantName: string;
  category: string;
  amount: number;
  date: Date;
  isRecurring?: boolean;
  isSubscription?: boolean;
  logoUrl?: string;
}

const categoryIcons: Record<string, React.ElementType> = {
  'Food & Drink': Coffee,
  'Shopping': ShoppingBag,
  'Transport': Car,
  'Housing': Home,
  'Dining': Utensils,
  'Utilities': Zap,
  'Phone': Smartphone,
  'Entertainment': Film,
  'Health': Heart,
  'Subscription': Repeat,
  'Other': Receipt,
};

const categoryColors: Record<string, string> = {
  'Food & Drink': 'bg-amber-500/20 text-amber-500',
  'Shopping': 'bg-pink-500/20 text-pink-500',
  'Transport': 'bg-blue-500/20 text-blue-500',
  'Housing': 'bg-green-500/20 text-green-500',
  'Dining': 'bg-orange-500/20 text-orange-500',
  'Utilities': 'bg-yellow-500/20 text-yellow-500',
  'Phone': 'bg-cyan-500/20 text-cyan-500',
  'Entertainment': 'bg-purple-500/20 text-purple-500',
  'Health': 'bg-red-500/20 text-red-500',
  'Subscription': 'bg-primary/20 text-primary',
  'Other': 'bg-muted text-text-muted',
};

// Brand logos as emoji placeholders (would be actual logos in production)
const brandLogos: Record<string, string> = {
  'Netflix': '🎬',
  'Spotify': '🎵',
  'Starbucks': '☕',
  'Amazon': '📦',
  'Uber': '🚗',
  'DoorDash': '🍔',
  'Apple': '🍎',
  'Whole Foods': '🥬',
  'Target': '🎯',
  'Shell': '⛽',
  'Gym': '💪',
  'Default': '💳',
};

const mockTransactions: Transaction[] = [
  { id: '1', merchantName: 'Netflix', category: 'Subscription', amount: -15.99, date: new Date(), isSubscription: true },
  { id: '2', merchantName: 'Starbucks', category: 'Food & Drink', amount: -6.45, date: new Date() },
  { id: '3', merchantName: 'Uber', category: 'Transport', amount: -24.50, date: new Date() },
  { id: '4', merchantName: 'Whole Foods', category: 'Shopping', amount: -89.32, date: new Date(Date.now() - 86400000) },
  { id: '5', merchantName: 'Spotify', category: 'Subscription', amount: -10.99, date: new Date(Date.now() - 86400000), isSubscription: true },
  { id: '6', merchantName: 'Shell', category: 'Transport', amount: -52.18, date: new Date(Date.now() - 86400000 * 2) },
  { id: '7', merchantName: 'Amazon', category: 'Shopping', amount: -34.99, date: new Date(Date.now() - 86400000 * 2) },
  { id: '8', merchantName: 'DoorDash', category: 'Dining', amount: -28.45, date: new Date(Date.now() - 86400000 * 3) },
  { id: '9', merchantName: 'Target', category: 'Shopping', amount: -67.23, date: new Date(Date.now() - 86400000 * 3) },
  { id: '10', merchantName: 'Gym', category: 'Health', amount: -49.99, date: new Date(Date.now() - 86400000 * 4), isRecurring: true },
];

interface TransactionsFeedProps {
  transactions?: Transaction[];
  animationDelay?: number;
}

const formatDate = (date: Date) => {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMM d');
};

export const TransactionsFeed = ({ transactions = mockTransactions, animationDelay = 0 }: TransactionsFeedProps) => {
  // Group transactions by date
  const groupedTransactions = transactions.reduce((groups, transaction) => {
    const dateKey = format(transaction.date, 'yyyy-MM-dd');
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(transaction);
    return groups;
  }, {} as Record<string, Transaction[]>);

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
                <Receipt className="w-4 h-4 text-primary" />
              </div>
              Recent Transactions
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-text-muted hover:text-text-heading">
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            <div className="p-4 space-y-4">
              {Object.entries(groupedTransactions).map(([dateKey, txns]) => (
                <div key={dateKey} className="space-y-2">
                  <div className="text-xs font-medium text-text-muted uppercase tracking-wider px-1">
                    {formatDate(new Date(dateKey))}
                  </div>
                  <div className="space-y-1">
                    {txns.map((transaction) => {
                      const Icon = categoryIcons[transaction.category] || Receipt;
                      const colorClass = categoryColors[transaction.category] || categoryColors['Other'];
                      const logo = brandLogos[transaction.merchantName] || brandLogos['Default'];

                      return (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-card border border-border/50 flex items-center justify-center text-lg shadow-sm">
                              {logo}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-text-heading group-hover:text-primary transition-colors">
                                  {transaction.merchantName}
                                </span>
                                {transaction.isSubscription && (
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-primary/30">
                                    Subscription
                                  </Badge>
                                )}
                                {transaction.isRecurring && !transaction.isSubscription && (
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                    Recurring
                                  </Badge>
                                )}
                              </div>
                              <div className={`flex items-center gap-1.5 text-xs ${colorClass} mt-0.5`}>
                                <Icon className="w-3 h-3" />
                                {transaction.category}
                              </div>
                            </div>
                          </div>
                          <div className={`text-sm font-semibold ${transaction.amount < 0 ? 'text-text-heading' : 'text-success'}`}>
                            {transaction.amount < 0 ? '-' : '+'}${Math.abs(transaction.amount).toFixed(2)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
};
