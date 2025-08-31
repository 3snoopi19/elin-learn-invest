import { useState, useCallback } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Calculator, Zap, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface CreditPaymentSliderProps {
  card: {
    minimumPayment: number;
    statementBalance: number;
    currentBalance: number;
    interestRate: number;
  };
  onPaymentChange?: (amount: number) => void;
}

export const CreditPaymentSlider = ({ card, onPaymentChange }: CreditPaymentSliderProps) => {
  const [paymentAmount, setPaymentAmount] = useState([card.statementBalance]);
  const [selectedPreset, setSelectedPreset] = useState<'min' | 'statement' | 'ai' | 'custom'>('statement');

  const minPayment = card.minimumPayment;
  const maxPayment = Math.max(card.statementBalance * 1.2, card.currentBalance);
  const aiRecommendation = card.statementBalance; // AI suggests paying full statement

  // Calculate interest savings
  const calculateInterestSavings = (amount: number) => {
    const monthlyRate = card.interestRate / 100 / 12;
    const remainingBalance = Math.max(0, card.statementBalance - amount);
    return remainingBalance * monthlyRate;
  };

  const handleSliderChange = useCallback((value: number[]) => {
    setPaymentAmount(value);
    setSelectedPreset('custom');
    onPaymentChange?.(value[0]);
  }, [onPaymentChange]);

  const handlePresetClick = (preset: 'min' | 'statement' | 'ai', amount: number) => {
    setPaymentAmount([amount]);
    setSelectedPreset(preset);
    onPaymentChange?.(amount);
  };

  const currentPayment = paymentAmount[0];
  const interestSavings = calculateInterestSavings(currentPayment);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Card className="professional-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          Payment Calculator
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Payment Amount Display */}
        <div className="text-center space-y-2">
          <div className="text-3xl md:text-4xl font-bold text-text-heading">
            {formatCurrency(currentPayment)}
          </div>
          <div className="text-text-muted text-sm">
            Monthly Payment Amount
          </div>
        </div>

        {/* Preset Payment Options - Mobile Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button
            variant={selectedPreset === 'min' ? "destructive" : "outline"}
            onClick={() => handlePresetClick('min', minPayment)}
            className={cn(
              "h-auto p-4 flex flex-col items-center gap-2 mobile-button touch-target",
              selectedPreset === 'min' && "bg-destructive/10 text-destructive border-destructive/30"
            )}
          >
            <AlertTriangle className="w-4 h-4" />
            <div className="text-center">
              <div className="font-semibold text-sm">Min</div>
              <div className="text-xs opacity-80">{formatCurrency(minPayment)}</div>
            </div>
          </Button>

          <Button
            variant={selectedPreset === 'statement' ? "success" : "outline"}
            onClick={() => handlePresetClick('statement', card.statementBalance)}
            className={cn(
              "h-auto p-4 flex flex-col items-center gap-2 mobile-button touch-target",
              selectedPreset === 'statement' && "bg-success/10 text-success border-success/30"
            )}
          >
            <DollarSign className="w-4 h-4" />
            <div className="text-center">
              <div className="font-semibold text-sm">Full</div>
              <div className="text-xs opacity-80">{formatCurrency(card.statementBalance)}</div>
            </div>
          </Button>

          <Button
            variant={selectedPreset === 'ai' ? "info" : "outline"}
            onClick={() => handlePresetClick('ai', aiRecommendation)}
            className={cn(
              "h-auto p-4 flex flex-col items-center gap-2 mobile-button touch-target",
              selectedPreset === 'ai' && "bg-secondary/10 text-secondary border-secondary/30"
            )}
          >
            <Zap className="w-4 h-4" />
            <div className="text-center">
              <div className="font-semibold text-sm">AI</div>
              <div className="text-xs opacity-80">{formatCurrency(aiRecommendation)}</div>
            </div>
          </Button>
        </div>

        {/* Payment Slider - Mobile Optimized */}
        <div className="space-y-4 px-2">
          <div className="flex items-center justify-between text-sm font-medium">
            <span className="text-text-muted">Min: {formatCurrency(minPayment)}</span>
            <span className="text-text-muted">Max: {formatCurrency(maxPayment)}</span>
          </div>
          
          <div className="relative">
            <Slider
              value={paymentAmount}
              onValueChange={handleSliderChange}
              max={maxPayment}
              min={minPayment}
              step={25}
              className="w-full touch-target"
              style={{ minHeight: '44px' }} // iOS touch target
            />
            
            {/* Slider markers for key amounts */}
            <div className="absolute top-0 w-full h-2 pointer-events-none">
              {/* Minimum payment marker */}
              <div 
                className="absolute top-0 w-1 h-6 bg-destructive/50 rounded"
                style={{ 
                  left: `${((minPayment - minPayment) / (maxPayment - minPayment)) * 100}%`,
                  transform: 'translateX(-50%)'
                }}
              />
              {/* Statement balance marker */}
              <div 
                className="absolute top-0 w-1 h-6 bg-success/50 rounded"
                style={{ 
                  left: `${((card.statementBalance - minPayment) / (maxPayment - minPayment)) * 100}%`,
                  transform: 'translateX(-50%)'
                }}
              />
            </div>
          </div>
        </div>

        {/* Impact Summary */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPayment}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="professional-card bg-gradient-to-r from-muted/20 to-background-subtle/20 p-4 space-y-3"
          >
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-text-muted text-xs mb-1">Interest This Month</div>
                <div className={cn(
                  "text-lg font-bold",
                  interestSavings > 0 ? "text-destructive" : "text-success"
                )}>
                  {formatCurrency(interestSavings)}
                </div>
              </div>
              <div>
                <div className="text-text-muted text-xs mb-1">Remaining Balance</div>
                <div className="text-lg font-bold text-text-heading">
                  {formatCurrency(Math.max(0, card.statementBalance - currentPayment))}
                </div>
              </div>
            </div>

            {/* Payment recommendation */}
            <div className="text-center pt-2 border-t border-border/20">
              {interestSavings === 0 ? (
                <div className="text-success text-sm font-medium">
                  ✅ No interest charges with this payment
                </div>
              ) : (
                <div className="text-warning text-sm font-medium">
                  ⚠️ You'll pay {formatCurrency(interestSavings)} in interest this month
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Action Button */}
        <Button className="w-full mobile-button bg-primary hover:bg-primary-hover">
          <DollarSign className="w-4 h-4 mr-2" />
          Schedule Payment: {formatCurrency(currentPayment)}
        </Button>
      </CardContent>
    </Card>
  );
};