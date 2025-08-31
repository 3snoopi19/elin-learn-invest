import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, DollarSign, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

interface CreditCard {
  id: string;
  name: string;
  currentBalance: number;
  statementBalance: number;
  minimumPayment: number;
  dueDate: string;
  interestRate: number;
  creditLimit: number;
  lastPayment: number;
  paymentHistory: string;
}

interface CreditInterestVisualizationProps {
  card: CreditCard;
}

export const CreditInterestVisualization = ({ card }: CreditInterestVisualizationProps) => {
  const [selectedPayment, setSelectedPayment] = useState<'minimum' | 'statement' | 'custom'>('statement');
  const [customAmount, setCustomAmount] = useState(card.statementBalance);

  // Calculate monthly interest charge
  const monthlyInterest = card.statementBalance * (card.interestRate / 100 / 12);
  
  // Calculate days until due date
  const daysUntilDue = Math.ceil(
    (new Date(card.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  // Calculate utilization percentage
  const utilizationPercent = (card.currentBalance / card.creditLimit) * 100;
  
  // Payment scenarios
  const paymentScenarios = [
    {
      type: 'minimum',
      amount: card.minimumPayment,
      label: 'Minimum Payment',
      interestCost: monthlyInterest,
      description: 'You will pay interest',
      color: 'destructive',
      icon: <AlertCircle className="w-4 h-4" />
    },
    {
      type: 'statement',
      amount: card.statementBalance,
      label: 'Statement Balance',
      interestCost: 0,
      description: 'No interest charges',
      color: 'success',
      icon: <CheckCircle className="w-4 h-4" />
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Card Overview */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-muted/30 rounded-lg">
          <div className="text-lg font-bold text-foreground">
            {formatCurrency(card.currentBalance)}
          </div>
          <div className="text-xs text-muted-foreground">Current Balance</div>
        </div>
        
        <div className="text-center p-3 bg-muted/30 rounded-lg">
          <div className="text-lg font-bold text-foreground">
            {daysUntilDue} days
          </div>
          <div className="text-xs text-muted-foreground">Until Due</div>
        </div>
      </div>

      {/* Credit Utilization */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Credit Utilization</span>
          <span className="text-sm text-muted-foreground">{utilizationPercent.toFixed(1)}%</span>
        </div>
        <Progress 
          value={utilizationPercent} 
          className="h-2"
          style={{
            '--progress-color': utilizationPercent > 30 ? 'hsl(var(--destructive))' : 'hsl(var(--success))'
          } as React.CSSProperties}
        />
        <div className="text-xs text-muted-foreground">
          {utilizationPercent > 30 ? 'High utilization may impact credit score' : 'Healthy utilization level'}
        </div>
      </div>

      {/* Payment Scenarios */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Payment Options</h4>
        
        {paymentScenarios.map((scenario) => (
          <motion.div
            key={scenario.type}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selectedPayment === scenario.type 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => setSelectedPayment(scenario.type as 'minimum' | 'statement' | 'custom')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className={`p-1 rounded ${
                  scenario.color === 'success' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
                }`}>
                  {scenario.icon}
                </div>
                <div>
                  <div className="font-medium text-sm">{scenario.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {scenario.description}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-sm">{formatCurrency(scenario.amount)}</div>
                {scenario.interestCost > 0 && (
                  <div className="text-xs text-destructive">
                    +{formatCurrency(scenario.interestCost)} interest
                  </div>
                )}
              </div>
            </div>

            {selectedPayment === scenario.type && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 pt-3 border-t border-border"
              >
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="text-muted-foreground">Remaining Balance</div>
                    <div className="font-medium">
                      {formatCurrency(card.statementBalance - scenario.amount)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Due Date</div>
                    <div className="font-medium">{formatDate(card.dueDate)}</div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Recommendation */}
      <div className="bg-gradient-to-r from-success/10 to-success/5 border border-success/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-success mt-0.5" />
          <div>
            <div className="font-medium text-sm text-success">
              Recommended: Pay Statement Balance
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Pay {formatCurrency(card.statementBalance)} by {formatDate(card.dueDate)} to avoid 
              {formatCurrency(monthlyInterest)} in interest charges this month.
            </div>
            <div className="mt-3">
              <Button size="sm" className="bg-success hover:bg-success/90">
                <DollarSign className="w-4 h-4 mr-1" />
                Set Payment: {formatCurrency(card.statementBalance)}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Interest Savings Visualization */}
      <Card className="bg-gradient-to-br from-primary/5 to-success/5 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Annual Impact
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-destructive">
                {formatCurrency(monthlyInterest * 12)}
              </div>
              <div className="text-xs text-muted-foreground">
                Annual interest if paying minimum
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-success">
                $0
              </div>
              <div className="text-xs text-muted-foreground">
                Annual interest if paying statement
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};