import { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence } from "framer-motion";
import { ShoppingBag, Zap, Check, X, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

interface Transaction {
  id: string;
  merchant_name: string;
  amount: number;
  category: string;
  transaction_date: string;
}

// Mock transactions for demo
const mockTransactions: Transaction[] = [
  { id: "1", merchant_name: "Starbucks", amount: 6.50, category: "Food & Drink", transaction_date: "2025-01-02" },
  { id: "2", merchant_name: "Netflix", amount: 15.99, category: "Subscriptions", transaction_date: "2025-01-01" },
  { id: "3", merchant_name: "Whole Foods", amount: 87.32, category: "Groceries", transaction_date: "2025-01-01" },
  { id: "4", merchant_name: "Uber", amount: 24.50, category: "Transport", transaction_date: "2024-12-31" },
  { id: "5", merchant_name: "Amazon", amount: 45.99, category: "Shopping", transaction_date: "2024-12-31" },
];

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case "food & drink":
      return "☕";
    case "subscriptions":
      return "📺";
    case "groceries":
      return "🛒";
    case "transport":
      return "🚗";
    case "shopping":
      return "🛍️";
    default:
      return "💳";
  }
};

interface SwipeCardProps {
  transaction: Transaction;
  onSwipe: (direction: "left" | "right") => void;
  isTop: boolean;
}

const SwipeCard = ({ transaction, onSwipe, isTop }: SwipeCardProps) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-25, 0, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);
  
  // Swipe indicators
  const leftIndicatorOpacity = useTransform(x, [-100, 0], [1, 0]);
  const rightIndicatorOpacity = useTransform(x, [0, 100], [0, 1]);

  const triggerHaptic = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (e) {
      // Haptics not available (web)
    }
  };

  const handleDragEnd = async (_: any, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      await triggerHaptic();
      onSwipe("right");
    } else if (info.offset.x < -threshold) {
      await triggerHaptic();
      onSwipe("left");
    }
  };

  return (
    <motion.div
      className="absolute w-full"
      style={{ x, rotate, opacity }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      initial={{ scale: isTop ? 1 : 0.95, y: isTop ? 0 : 10 }}
      animate={{ scale: isTop ? 1 : 0.95, y: isTop ? 0 : 10 }}
      exit={{ 
        x: x.get() > 0 ? 300 : -300,
        opacity: 0,
        transition: { duration: 0.3 }
      }}
    >
      <div className="relative bg-card rounded-3xl p-6 shadow-2xl border border-border/50 touch-none select-none">
        {/* Swipe Indicators */}
        <motion.div 
          className="absolute -left-4 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-destructive/20 border-2 border-destructive flex items-center justify-center"
          style={{ opacity: leftIndicatorOpacity }}
        >
          <X className="w-8 h-8 text-destructive" />
        </motion.div>
        <motion.div 
          className="absolute -right-4 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-success/20 border-2 border-success flex items-center justify-center"
          style={{ opacity: rightIndicatorOpacity }}
        >
          <Check className="w-8 h-8 text-success" />
        </motion.div>

        {/* Card Content */}
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Category Icon */}
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-4xl">
            {getCategoryIcon(transaction.category)}
          </div>
          
          {/* Merchant Name */}
          <h2 className="text-2xl font-bold text-text-heading">
            {transaction.merchant_name}
          </h2>
          
          {/* Amount - MASSIVE */}
          <div className="text-5xl font-black text-primary">
            ${transaction.amount.toFixed(2)}
          </div>
          
          {/* Category Badge */}
          <span className="px-4 py-2 rounded-full bg-muted text-text-secondary text-sm font-medium">
            {transaction.category}
          </span>
          
          {/* Date */}
          <p className="text-text-muted text-sm">
            {new Date(transaction.transaction_date).toLocaleDateString('en-US', { 
              weekday: 'long',
              month: 'short', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Swipe Instructions */}
        <div className="mt-6 flex justify-between text-sm text-text-muted">
          <div className="flex items-center gap-2">
            <X className="w-4 h-4 text-destructive" />
            <span>Impulse</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Essential</span>
            <Check className="w-4 h-4 text-success" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

interface TransactionSwipeStackProps {
  onComplete?: () => void;
}

export const TransactionSwipeStack = ({ onComplete }: TransactionSwipeStackProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [impulseCount, setImpulseCount] = useState(0);
  const [essentialCount, setEssentialCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const handleSwipe = (direction: "left" | "right") => {
    if (direction === "left") {
      setImpulseCount(prev => prev + 1);
    } else {
      setEssentialCount(prev => prev + 1);
    }
    
    setTransactions(prev => prev.slice(1));
  };

  useEffect(() => {
    if (transactions.length === 0 && !isComplete) {
      setIsComplete(true);
      
      // Celebrate!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8B5CF6', '#10B981', '#F59E0B']
      });

      onComplete?.();
    }
  }, [transactions.length, isComplete, onComplete]);

  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="w-24 h-24 rounded-full bg-success/20 flex items-center justify-center mb-6"
        >
          <Sparkles className="w-12 h-12 text-success" />
        </motion.div>
        
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-4xl font-black text-text-heading mb-2"
        >
          Day Reviewed! 🎉
        </motion.h1>
        
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-text-secondary text-lg mb-8"
        >
          You're building better money habits
        </motion.p>

        {/* Stats */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex gap-8"
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-destructive">{impulseCount}</div>
            <div className="text-sm text-text-muted">Impulse Buys</div>
          </div>
          <div className="w-px bg-border" />
          <div className="text-center">
            <div className="text-3xl font-bold text-success">{essentialCount}</div>
            <div className="text-sm text-text-muted">Essential</div>
          </div>
        </motion.div>

        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          onClick={() => {
            setTransactions(mockTransactions);
            setImpulseCount(0);
            setEssentialCount(0);
            setIsComplete(false);
          }}
          className="mt-8 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-lg shadow-lg hover:bg-primary-hover transition-colors"
        >
          Review Again
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-center px-4">
      {/* Progress */}
      <div className="w-full mb-6">
        <div className="flex justify-between text-sm text-text-muted mb-2">
          <span>{mockTransactions.length - transactions.length} reviewed</span>
          <span>{transactions.length} remaining</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-success"
            initial={{ width: 0 }}
            animate={{ 
              width: `${((mockTransactions.length - transactions.length) / mockTransactions.length) * 100}%` 
            }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Card Stack */}
      <div className="relative w-full h-[400px] flex items-center justify-center">
        <AnimatePresence mode="popLayout">
          {transactions.slice(0, 3).reverse().map((transaction, index, arr) => (
            <SwipeCard
              key={transaction.id}
              transaction={transaction}
              onSwipe={handleSwipe}
              isTop={index === arr.length - 1}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-8 mt-6">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => handleSwipe("left")}
          className="w-16 h-16 rounded-full bg-destructive/10 border-2 border-destructive flex items-center justify-center shadow-lg"
        >
          <X className="w-8 h-8 text-destructive" />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => handleSwipe("right")}
          className="w-16 h-16 rounded-full bg-success/10 border-2 border-success flex items-center justify-center shadow-lg"
        >
          <Check className="w-8 h-8 text-success" />
        </motion.button>
      </div>
    </div>
  );
};
