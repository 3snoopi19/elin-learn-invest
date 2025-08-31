import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, DollarSign, TrendingUp, AlertCircle, CheckCircle, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from '@/lib/utils';
import { CreditPaymentSlider } from "@/components/ui/CreditPaymentSlider";
import { OnboardingTooltip } from "@/components/onboarding/OnboardingTooltips";

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
    <div className="space-y-4 md:space-y-6">
      {/* Mobile-First Card Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="mobile-card p-4 bg-gradient-to-br from-muted/30 to-muted/10 border-border/30">
          <div className="text-text-secondary text-xs md:text-sm mb-1 font-medium">Current Balance</div>
          <div className="text-lg md:text-xl font-bold text-foreground">
            {formatCurrency(card.currentBalance)}
          </div>
        </div>
        
        <div className="mobile-card p-4 bg-gradient-to-br from-muted/30 to-muted/10 border-border/30">
          <div className="text-text-secondary text-xs md:text-sm mb-1 font-medium">Days Until Due</div>
          <div className="text-lg md:text-xl font-bold text-foreground">
            {daysUntilDue} days
          </div>
        </div>
      </div>

      {/* Credit Utilization - Mobile Responsive */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm md:text-base font-medium flex items-center gap-1">
            Credit Utilization
          </span>
          <span className="text-sm md:text-base text-muted-foreground">{utilizationPercent.toFixed(1)}%</span>
        </div>
        <Progress 
          value={utilizationPercent} 
          className="h-2 md:h-3"
          style={{
            '--progress-color': utilizationPercent > 30 ? 'hsl(var(--destructive))' : 'hsl(var(--success))'
          } as React.CSSProperties}
        />
        <div className="text-xs md:text-sm text-muted-foreground">
          {utilizationPercent > 30 ? 'High utilization may impact credit score' : 'Healthy utilization level'}
        </div>
      </div>

      {/* Payment Scenarios - Mobile Responsive */}
      <div className="space-y-4">
        <h4 className="font-medium text-sm md:text-base">Payment Options</h4>
        
        {paymentScenarios.map((scenario) => (
          <motion.div
            key={scenario.type}
            className={cn(
              "p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 mobile-card touch-target",
              selectedPayment === scenario.type 
                ? 'border-primary bg-primary/5 shadow-lg' 
                : 'border-border hover:border-primary/50 hover:shadow-md'
            )}
            onClick={() => setSelectedPayment(scenario.type as 'minimum' | 'statement' | 'custom')}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className={cn(
                  "p-2 rounded-full flex-shrink-0",
                  scenario.color === 'success' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
                )}>
                  {scenario.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm md:text-base">{scenario.label}</div>
                  <div className="text-xs md:text-sm text-muted-foreground mt-1">
                    {scenario.description}
                  </div>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-bold text-sm md:text-base">{formatCurrency(scenario.amount)}</div>
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
                className="mt-4 pt-4 border-t border-border"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs md:text-sm">
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

      {/* Recommendation - Enhanced Mobile */}
      <div className="professional-card bg-gradient-to-r from-success/10 to-success/5 border-success/20 p-4 md:p-6">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-success mt-1 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="font-medium text-sm md:text-base text-success mb-2">
              Recommended: Pay Statement Balance
            </div>
            <div className="text-xs md:text-sm text-muted-foreground mb-4">
              Pay {formatCurrency(card.statementBalance)} by {formatDate(card.dueDate)} to avoid 
              {formatCurrency(monthlyInterest)} in interest charges this month.
            </div>
            <Button size="sm" className="bg-success hover:bg-success/90 w-full sm:w-auto mobile-button">
              <DollarSign className="w-4 h-4 mr-2" />
              Set Payment: {formatCurrency(card.statementBalance)}
            </Button>
          </div>
        </div>
      </div>

      {/* Interest Savings Visualization - Mobile Enhanced */}
      <Card className="professional-card bg-gradient-to-br from-primary/5 to-success/5 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm md:text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Annual Impact
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Enhanced Payment Slider */}
            <CreditPaymentSlider 
              card={card}
              onPaymentChange={(amount) => {
                setCustomAmount(amount);
                setSelectedPayment('custom');
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};