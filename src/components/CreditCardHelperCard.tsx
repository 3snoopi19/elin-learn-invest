import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, AlertTriangle, CheckCircle, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface CreditCardData {
  cardName: string;
  currentBalance: number;
  minimumPayment: number;
  statementBalance: number;
  dueDate: string;
  interestRate: number;
  creditLimit: number;
}

interface PaymentStrategy {
  type: 'minimum' | 'statement' | 'optimal';
  amount: number;
  description: string;
  riskLevel: 'safe' | 'warning' | 'danger';
  savings?: number;
}

export const CreditCardHelperCard = () => {
  const [creditCards, setCreditCards] = useState<CreditCardData[]>([]);
  const [selectedCard, setSelectedCard] = useState<CreditCardData | null>(null);
  const [strategies, setStrategies] = useState<PaymentStrategy[]>([]);

  // Mock data - in real implementation, this would come from Plaid API
  useEffect(() => {
    const mockCards: CreditCardData[] = [
      {
        cardName: "Chase Sapphire Reserve",
        currentBalance: 2847.32,
        minimumPayment: 75.00,
        statementBalance: 2650.00,
        dueDate: "2025-01-15",
        interestRate: 22.99,
        creditLimit: 10000
      },
      {
        cardName: "American Express Gold",
        currentBalance: 1234.56,
        minimumPayment: 35.00,
        statementBalance: 1200.00,
        dueDate: "2025-01-18",
        interestRate: 24.99,
        creditLimit: 5000
      }
    ];
    
    setCreditCards(mockCards);
    setSelectedCard(mockCards[0]);
  }, []);

  useEffect(() => {
    if (!selectedCard) return;

    const calculateStrategies = (): PaymentStrategy[] => {
      const monthlyInterestRate = selectedCard.interestRate / 100 / 12;
      const interestCharges = selectedCard.statementBalance * monthlyInterestRate;

      return [
        {
          type: 'minimum',
          amount: selectedCard.minimumPayment,
          description: 'Pay minimum to avoid late fees',
          riskLevel: 'danger',
        },
        {
          type: 'statement',
          amount: selectedCard.statementBalance,
          description: 'Pay full statement balance to avoid interest',
          riskLevel: 'safe',
          savings: interestCharges
        },
        {
          type: 'optimal',
          amount: Math.min(selectedCard.statementBalance * 1.1, selectedCard.currentBalance),
          description: 'AI recommended payment for optimal credit health',
          riskLevel: 'safe',
          savings: interestCharges + (selectedCard.currentBalance - selectedCard.statementBalance) * monthlyInterestRate
        }
      ];
    };

    setStrategies(calculateStrategies());
  }, [selectedCard]);

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'safe': return 'text-success bg-success/10 border-success/20';
      case 'warning': return 'text-warning bg-warning/10 border-warning/20';
      case 'danger': return 'text-destructive bg-destructive/10 border-destructive/20';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'safe': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'danger': return <AlertTriangle className="w-4 h-4" />;
      default: return null;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (!selectedCard) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Credit Card Helper
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Connect your credit cards via Plaid to get AI-powered payment recommendations</p>
            <Button className="mt-4" variant="outline">
              Connect Cards
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const daysUntilDue = getDaysUntilDue(selectedCard.dueDate);
  const utilizationRate = (selectedCard.currentBalance / selectedCard.creditLimit) * 100;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Credit Card AI Helper
          </CardTitle>
          {creditCards.length > 1 && (
            <select 
              value={selectedCard.cardName}
              onChange={(e) => setSelectedCard(creditCards.find(c => c.cardName === e.target.value) || null)}
              className="text-sm bg-background border rounded px-2 py-1"
            >
              {creditCards.map(card => (
                <option key={card.cardName} value={card.cardName}>
                  {card.cardName}
                </option>
              ))}
            </select>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Card Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Current Balance</span>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(selectedCard.currentBalance)}</p>
            <p className="text-xs text-muted-foreground">
              {utilizationRate.toFixed(1)}% of {formatCurrency(selectedCard.creditLimit)} limit
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Due Date</span>
            </div>
            <p className="text-2xl font-bold">
              {formatDate(selectedCard.dueDate)}
            </p>
            <p className={`text-xs ${daysUntilDue <= 3 ? 'text-destructive' : daysUntilDue <= 7 ? 'text-warning' : 'text-muted-foreground'}`}>
              {daysUntilDue} days remaining
            </p>
          </div>
        </div>

        {/* Payment Strategies */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Payment Strategies
          </h4>
          <div className="space-y-3">
            {strategies.map((strategy, index) => (
              <motion.div
                key={strategy.type}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border ${getRiskColor(strategy.riskLevel)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getRiskIcon(strategy.riskLevel)}
                    <Badge variant={strategy.riskLevel === 'safe' ? 'default' : strategy.riskLevel === 'warning' ? 'secondary' : 'destructive'}>
                      {strategy.type === 'minimum' ? 'Minimum' : strategy.type === 'statement' ? 'Full Balance' : 'AI Optimal'}
                    </Badge>
                  </div>
                  <span className="text-xl font-bold">
                    {formatCurrency(strategy.amount)}
                  </span>
                </div>
                <p className="text-sm opacity-90 mb-2">{strategy.description}</p>
                {strategy.savings && (
                  <p className="text-xs font-medium">
                    💰 Saves {formatCurrency(strategy.savings)} in interest
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button size="sm" className="flex-1">
            Make Payment
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            Set Autopay
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};