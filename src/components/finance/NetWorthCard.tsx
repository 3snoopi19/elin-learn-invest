import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Wallet, CreditCard, PiggyBank, Building2, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit_card' | 'investment' | 'loan';
  balance: number;
  institution: string;
  logoUrl?: string;
}

interface NetWorthCardProps {
  accounts?: Account[];
  animationDelay?: number;
}

const mockAccounts: Account[] = [
  { id: '1', name: 'Primary Checking', type: 'checking', balance: 4250.32, institution: 'Chase', logoUrl: '🏦' },
  { id: '2', name: 'Emergency Fund', type: 'savings', balance: 12500.00, institution: 'Marcus', logoUrl: '💰' },
  { id: '3', name: 'Rewards Card', type: 'credit_card', balance: -1847.23, institution: 'Amex', logoUrl: '💳' },
  { id: '4', name: 'Roth IRA', type: 'investment', balance: 45230.87, institution: 'Fidelity', logoUrl: '📈' },
  { id: '5', name: 'Brokerage', type: 'investment', balance: 28450.12, institution: 'Schwab', logoUrl: '📊' },
];

const typeIcons = {
  checking: Wallet,
  savings: PiggyBank,
  credit_card: CreditCard,
  investment: BarChart3,
  loan: Building2,
};

const typeLabels = {
  checking: 'Checking',
  savings: 'Savings',
  credit_card: 'Credit',
  investment: 'Investment',
  loan: 'Loan',
};

export const NetWorthCard = ({ accounts = mockAccounts, animationDelay = 0 }: NetWorthCardProps) => {
  const assets = accounts.filter(a => a.balance > 0).reduce((sum, a) => sum + a.balance, 0);
  const liabilities = Math.abs(accounts.filter(a => a.balance < 0).reduce((sum, a) => sum + a.balance, 0));
  const netWorth = assets - liabilities;
  const monthlyChange = 2847.32; // Mock: would be calculated from historical data
  const percentChange = ((monthlyChange / (netWorth - monthlyChange)) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: animationDelay }}
    >
      <Card className="professional-card overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-text-heading flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              Net Worth
            </CardTitle>
            <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/30">
              {percentChange > 0 ? '+' : ''}{percentChange.toFixed(1)}% this month
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Net Worth Display */}
          <div className="text-center py-4">
            <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary to-success bg-clip-text text-transparent">
              ${netWorth.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center justify-center gap-2 mt-2 text-sm">
              {monthlyChange > 0 ? (
                <TrendingUp className="w-4 h-4 text-success" />
              ) : (
                <TrendingDown className="w-4 h-4 text-destructive" />
              )}
              <span className={monthlyChange > 0 ? 'text-success' : 'text-destructive'}>
                {monthlyChange > 0 ? '+' : '-'}${Math.abs(monthlyChange).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-text-muted">vs last month</span>
            </div>
          </div>

          {/* Assets vs Liabilities Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-success font-medium">Assets: ${assets.toLocaleString()}</span>
              <span className="text-destructive font-medium">Debts: ${liabilities.toLocaleString()}</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden flex">
              <div 
                className="bg-gradient-to-r from-success to-success/80 transition-all duration-500"
                style={{ width: `${(assets / (assets + liabilities)) * 100}%` }}
              />
              <div 
                className="bg-gradient-to-r from-destructive/80 to-destructive transition-all duration-500"
                style={{ width: `${(liabilities / (assets + liabilities)) * 100}%` }}
              />
            </div>
          </div>

          {/* Account List */}
          <div className="space-y-2 pt-2">
            <h4 className="text-sm font-medium text-text-secondary">Connected Accounts</h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {accounts.map((account) => {
                const Icon = typeIcons[account.type];
                return (
                  <div 
                    key={account.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-card flex items-center justify-center text-lg">
                        {account.logoUrl || <Icon className="w-4 h-4 text-text-muted" />}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-text-heading">{account.name}</div>
                        <div className="text-xs text-text-muted">{account.institution} • {typeLabels[account.type]}</div>
                      </div>
                    </div>
                    <div className={`text-sm font-semibold ${account.balance < 0 ? 'text-destructive' : 'text-text-heading'}`}>
                      {account.balance < 0 ? '-' : ''}${Math.abs(account.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
