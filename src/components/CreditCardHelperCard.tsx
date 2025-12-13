import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { CreditCard, AlertTriangle, CheckCircle, DollarSign, Calendar, TrendingUp, Calculator } from 'lucide-react';
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
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [selectedStrategy, setSelectedStrategy] = useState<PaymentStrategy | null>(null);

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

    const newStrategies = calculateStrategies();
    setStrategies(newStrategies);
    setPaymentAmount(newStrategies[1].amount); // Default to statement balance
    setSelectedStrategy(newStrategies[1]);
  }, [selectedCard]);

  // Update selected strategy based on payment amount
  useEffect(() => {
    if (!selectedCard || strategies.length === 0) return;
    
    let currentStrategy = strategies[0]; // default to minimum
    
    if (paymentAmount >= selectedCard.statementBalance) {
      currentStrategy = strategies[1]; // statement balance
    }
    if (paymentAmount >= strategies[2]?.amount) {
      currentStrategy = strategies[2]; // optimal
    }
    
    setSelectedStrategy(currentStrategy);
  }, [paymentAmount, strategies, selectedCard]);

  const getProgressColor = () => {
    if (!selectedStrategy || !selectedCard) return '#dc2626';
    
    if (paymentAmount >= selectedCard.statementBalance) return '#16a34a'; // green
    if (paymentAmount >= selectedCard.minimumPayment * 2) return '#f59e0b'; // yellow
    return '#dc2626'; // red
  };

  const getProgressPercentage = () => {
    if (!selectedCard) return 0;
    return Math.min((paymentAmount / selectedCard.currentBalance) * 100, 100);
  };

  const CircularProgress = ({ percentage, color }: { percentage: number; color: string }) => {
    const radius = 120;
    const strokeWidth = 12;
    const normalizedRadius = radius - strokeWidth * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

    return (
      <div className="relative">
        <svg
          height={radius * 2}
          width={radius * 2}
          className="transform -rotate-90"
        >
          <circle
            stroke="hsl(var(--muted))"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <motion.circle
            stroke={color}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            initial={{ strokeDasharray: `0 ${circumference}` }}
            animate={{ strokeDasharray }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-4xl font-bold text-center">
            {formatCurrency(paymentAmount)}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            Payment Amount
          </div>
        </div>
      </div>
    );
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
            Credit Card AI Helper
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
      <CardHeader className="p-4 md:p-6">
        <div className="flex flex-col gap-3">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Calculator className="w-5 h-5 shrink-0" />
            <span>Choose Payment Amount</span>
          </CardTitle>
          {creditCards.length > 1 && (
            <select 
              value={selectedCard.cardName}
              onChange={(e) => setSelectedCard(creditCards.find(c => c.cardName === e.target.value) || null)}
              className="w-full text-sm bg-card border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
            >
              {creditCards.map(card => (
                <option key={card.cardName} value={card.cardName}>
                  {card.cardName}
                </option>
              ))}
            </select>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-3">
          Make payments by March 15
        </p>
      </CardHeader>
      <CardContent className="space-y-6 p-4 md:p-6 pt-0 md:pt-0">
        {/* Circular Payment Selector */}
        <div className="flex flex-col items-center space-y-6">
          <CircularProgress 
            percentage={getProgressPercentage()} 
            color={getProgressColor()} 
          />
          
          {/* Payment Amount Slider */}
          <div className="w-full max-w-sm space-y-4">
            <Slider
              value={[paymentAmount]}
              onValueChange={(value) => setPaymentAmount(value[0])}
              max={selectedCard.currentBalance}
              min={selectedCard.minimumPayment}
              step={25}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Min: {formatCurrency(selectedCard.minimumPayment)}</span>
              <span>Max: {formatCurrency(selectedCard.currentBalance)}</span>
            </div>
          </div>

          {/* Current Strategy Info */}
          {selectedStrategy && (
            <motion.div
              key={selectedStrategy.type}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-2"
            >
              <Badge 
                variant={selectedStrategy.riskLevel === 'safe' ? 'default' : selectedStrategy.riskLevel === 'warning' ? 'secondary' : 'destructive'}
                className="text-sm"
              >
                {selectedStrategy.riskLevel === 'safe' && <CheckCircle className="w-3 h-3 mr-1" />}
                {selectedStrategy.riskLevel === 'danger' && <AlertTriangle className="w-3 h-3 mr-1" />}
                {selectedStrategy.description}
              </Badge>
              {selectedStrategy.savings && (
                <p className="text-sm font-medium text-success">
                  💰 Saves {formatCurrency(selectedStrategy.savings)} in interest charges
                </p>
              )}
            </motion.div>
          )}
        </div>

        {/* Quick Payment Options */}
        <div className="grid grid-cols-3 gap-2">
          {strategies.map((strategy) => (
            <Button
              key={strategy.type}
              variant={paymentAmount === strategy.amount ? "default" : "outline"}
              size="sm"
              onClick={() => setPaymentAmount(strategy.amount)}
              className="text-xs p-2 h-auto flex flex-col"
            >
              <span className="font-semibold">
                {strategy.type === 'minimum' ? 'Min' : strategy.type === 'statement' ? 'Full' : 'AI'}
              </span>
              <span className="opacity-75">
                {formatCurrency(strategy.amount)}
              </span>
            </Button>
          ))}
        </div>

        {/* Card Info */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Balance</p>
            <p className="font-semibold">{formatCurrency(selectedCard.currentBalance)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Due</p>
            <p className={`font-semibold ${daysUntilDue <= 3 ? 'text-destructive' : ''}`}>
              {formatDate(selectedCard.dueDate)} ({daysUntilDue}d)
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button size="lg" className="h-12">
            Pay Now
          </Button>
          <Button size="lg" variant="outline" className="h-12">
            Pay Later
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};