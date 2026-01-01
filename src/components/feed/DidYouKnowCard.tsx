import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, ChevronRight, RefreshCw, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface Tip {
  id: string;
  title: string;
  content: string;
  actionLabel: string;
  actionRoute?: string;
  category: 'debt' | 'savings' | 'investing' | 'budgeting' | 'general';
  relevantFor?: string[]; // conditions when this tip is most relevant
}

const tips: Tip[] = [
  {
    id: 'avalanche-vs-snowball',
    title: 'Avalanche vs. Snowball Method',
    content: 'Avalanche pays off highest-interest debt first (saves most money). Snowball pays smallest balances first (wins faster, stays motivated). Which fits your style?',
    actionLabel: 'Learn More',
    actionRoute: '/resources',
    category: 'debt',
    relevantFor: ['high_credit_debt', 'multiple_debts']
  },
  {
    id: 'high-yield-savings',
    title: 'Your Savings Could Work Harder',
    content: 'Most bank savings accounts pay 0.01% APY. High-yield savings accounts pay 4-5%. On $5,000, that is $250/year vs $0.50. Free money!',
    actionLabel: 'See Options',
    actionRoute: '/money-flow',
    category: 'savings',
    relevantFor: ['idle_cash', 'low_apy']
  },
  {
    id: 'employer-match',
    title: 'Free Money Alert: 401(k) Match',
    content: 'If your employer matches 401(k) contributions, not taking the full match is leaving free money on the table. A 3% match on $60k salary = $1,800/year free.',
    actionLabel: 'Check Your Benefits',
    category: 'investing',
    relevantFor: ['employed', 'no_401k']
  },
  {
    id: '50-30-20',
    title: 'The 50/30/20 Rule',
    content: '50% of income for needs (rent, food), 30% for wants (dining out, hobbies), 20% for savings and debt. Simple framework, big results.',
    actionLabel: 'Get the Template',
    actionRoute: '/resources',
    category: 'budgeting',
    relevantFor: ['overspending', 'no_budget']
  },
  {
    id: 'subscription-audit',
    title: 'Hidden Subscriptions Add Up',
    content: 'The average American spends $273/month on subscriptions but thinks they spend $86. Time for a subscription audit?',
    actionLabel: 'Audit Now',
    actionRoute: '/subscriptions',
    category: 'budgeting',
    relevantFor: ['many_subscriptions']
  },
  {
    id: 'emergency-fund',
    title: 'The 3-6 Month Safety Net',
    content: 'An emergency fund covering 3-6 months of expenses protects you from life surprises. Start with $1,000, then build from there.',
    actionLabel: 'Start Saving',
    actionRoute: '/money-flow',
    category: 'savings',
    relevantFor: ['no_emergency_fund', 'low_savings']
  },
  {
    id: 'compound-interest',
    title: 'The 8th Wonder of the World',
    content: 'Einstein called compound interest the 8th wonder. $100/month at 8% becomes $150,000 in 30 years. Time is your biggest asset.',
    actionLabel: 'See the Math',
    actionRoute: '/resources',
    category: 'investing',
    relevantFor: ['young_investor', 'not_investing']
  },
  {
    id: 'credit-utilization',
    title: 'The 30% Credit Rule',
    content: 'Using more than 30% of your available credit hurts your score. If your limit is $10,000, try to keep balances under $3,000.',
    actionLabel: 'Check Your Score',
    actionRoute: '/credit-coach',
    category: 'debt',
    relevantFor: ['high_utilization']
  },
  {
    id: 'index-funds',
    title: 'Index Funds: The Simple Path',
    content: '90% of actively managed funds underperform index funds over 15 years. Lower fees + market returns = more money for you.',
    actionLabel: 'Explore Funds',
    actionRoute: '/portfolio',
    category: 'investing',
    relevantFor: ['new_investor']
  },
  {
    id: 'pay-yourself-first',
    title: 'Pay Yourself First',
    content: 'Set up automatic transfers to savings on payday. What you do not see, you will not spend. Even $50/month adds up.',
    actionLabel: 'Set Up Auto-Save',
    actionRoute: '/router',
    category: 'savings',
    relevantFor: ['no_automation']
  }
];

interface DidYouKnowCardProps {
  animationDelay?: number;
  userContext?: {
    hasHighCreditDebt?: boolean;
    hasMultipleDebts?: boolean;
    hasIdleCash?: boolean;
    hasManySubscriptions?: boolean;
    hasLowSavings?: boolean;
  };
}

export function DidYouKnowCard({ animationDelay = 0, userContext }: DidYouKnowCardProps) {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);
  const navigate = useNavigate();

  // Select relevant tips based on user context
  const relevantTips = useMemo(() => {
    if (!userContext) return tips;
    
    // Score tips by relevance
    const scoredTips = tips.map(tip => {
      let score = 1; // base score
      if (tip.relevantFor) {
        if (userContext.hasHighCreditDebt && tip.relevantFor.includes('high_credit_debt')) score += 3;
        if (userContext.hasMultipleDebts && tip.relevantFor.includes('multiple_debts')) score += 2;
        if (userContext.hasIdleCash && tip.relevantFor.includes('idle_cash')) score += 3;
        if (userContext.hasManySubscriptions && tip.relevantFor.includes('many_subscriptions')) score += 2;
        if (userContext.hasLowSavings && tip.relevantFor.includes('low_savings')) score += 2;
      }
      return { ...tip, score };
    });

    // Sort by score and return top tips
    return scoredTips.sort((a, b) => b.score - a.score).slice(0, 5);
  }, [userContext]);

  const currentTip = relevantTips[currentTipIndex];

  const nextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % relevantTips.length);
  };

  // Auto-rotate tips every 30 seconds
  useEffect(() => {
    const interval = setInterval(nextTip, 30000);
    return () => clearInterval(interval);
  }, [relevantTips.length]);

  if (isDismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: animationDelay }}
    >
      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20 overflow-hidden relative">
        <CardContent className="p-4 md:p-5">
          {/* Dismiss button */}
          <button
            onClick={() => setIsDismissed(true)}
            className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-primary" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-primary uppercase tracking-wide">
                  Did You Know?
                </span>
                <span className="text-xs text-muted-foreground">
                  {currentTipIndex + 1}/{relevantTips.length}
                </span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTip.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="font-semibold text-foreground mb-1">
                    {currentTip.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    {currentTip.content}
                  </p>

                  <div className="flex items-center gap-2">
                    {currentTip.actionRoute && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 text-xs"
                        onClick={() => navigate(currentTip.actionRoute!)}
                      >
                        {currentTip.actionLabel}
                        <ChevronRight className="w-3 h-3 ml-1" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-xs text-muted-foreground"
                      onClick={nextTip}
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Next Tip
                    </Button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-1 mt-4">
            {relevantTips.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTipIndex(index)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  index === currentTipIndex 
                    ? "bg-primary w-4" 
                    : "bg-primary/30 hover:bg-primary/50"
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
