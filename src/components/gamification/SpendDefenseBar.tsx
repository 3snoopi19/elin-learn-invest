import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Shield, AlertTriangle, Zap, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";

interface SpendDefenseBarProps {
  dailyBudget?: number;
  spentToday?: number;
  streakDays?: number;
  animationDelay?: number;
}

export const SpendDefenseBar = ({ 
  dailyBudget = 100, 
  spentToday = 0, 
  streakDays = 3,
  animationDelay = 0 
}: SpendDefenseBarProps) => {
  const [showReaction, setShowReaction] = useState(false);
  const [reactionMessage, setReactionMessage] = useState("");
  
  const percentUsed = Math.min((spentToday / dailyBudget) * 100, 100);
  const isNoSpend = spentToday === 0;
  const isOverBudget = spentToday > dailyBudget;
  const isWarning = percentUsed > 70 && !isOverBudget;
  
  const getHealthColor = () => {
    if (isNoSpend) return "from-emerald-500 to-green-400";
    if (isOverBudget) return "from-red-600 to-red-400";
    if (isWarning) return "from-amber-500 to-yellow-400";
    return "from-primary to-primary/70";
  };
  
  const getGlowColor = () => {
    if (isNoSpend) return "shadow-[0_0_30px_rgba(16,185,129,0.4)]";
    if (isOverBudget) return "shadow-[0_0_30px_rgba(239,68,68,0.4)]";
    if (isWarning) return "shadow-[0_0_30px_rgba(245,158,11,0.3)]";
    return "shadow-[0_0_20px_rgba(139,92,246,0.3)]";
  };

  const noSpendReactions = [
    "🔥 No Spend Streak activated! Your wallet thanks you.",
    "💪 Zero spending today. You are in beast mode!",
    "🛡️ Defend that budget! Keep it up!",
  ];
  
  const overBudgetReactions = [
    "😬 Ouch. That coffee cost you your streak.",
    "📉 Budget breached! But tomorrow is a new day.",
    "🚨 Overspend alert! Time to course-correct.",
  ];
  
  const warningReactions = [
    "⚠️ Careful! You are nearing your daily limit.",
    "🎯 70% of budget used. Stay focused!",
  ];
  
  const goodReactions = [
    "✨ On track! Keep that momentum going.",
    "👏 Smart spending today. Well done!",
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      let messagePool: string[];
      if (isNoSpend) messagePool = noSpendReactions;
      else if (isOverBudget) messagePool = overBudgetReactions;
      else if (isWarning) messagePool = warningReactions;
      else messagePool = goodReactions;
      
      setReactionMessage(messagePool[Math.floor(Math.random() * messagePool.length)]);
      setShowReaction(true);
    }, 1000 + animationDelay * 1000);

    return () => clearTimeout(timer);
  }, [spentToday, isNoSpend, isOverBudget, isWarning, animationDelay]);

  const remainingBudget = Math.max(dailyBudget - spentToday, 0);
  const healthPercent = Math.max(100 - percentUsed, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: animationDelay }}
    >
      <Card className={`relative overflow-hidden border-0 bg-gradient-to-br from-card/80 to-card p-4 ${getGlowColor()} transition-shadow duration-500`}>
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_var(--primary)_1px,_transparent_1px)] bg-[length:20px_20px]" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ 
                  scale: isNoSpend ? [1, 1.2, 1] : 1,
                  rotate: isNoSpend ? [0, 5, -5, 0] : 0
                }}
                transition={{ duration: 0.5, repeat: isNoSpend ? Infinity : 0, repeatDelay: 2 }}
              >
                <Shield className={`w-5 h-5 ${isNoSpend ? "text-emerald-500" : isOverBudget ? "text-red-500" : "text-primary"}`} />
              </motion.div>
              <span className="font-semibold text-text-heading">Spend Defense</span>
              
              {streakDays > 0 && isNoSpend && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full"
                >
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.8, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    <Flame className="w-4 h-4 text-orange-500" />
                  </motion.div>
                  <span className="text-xs font-bold text-orange-500">{streakDays} day streak!</span>
                </motion.div>
              )}
            </div>
            
            <div className="text-right">
              <p className="text-xs text-text-secondary">Remaining</p>
              <p className={`text-lg font-bold ${isOverBudget ? "text-red-500" : "text-text-heading"}`}>
                ${remainingBudget.toFixed(0)}
              </p>
            </div>
          </div>

          <div className="relative h-6 bg-muted/50 rounded-full overflow-hidden mb-3">
            <div className="absolute inset-0 opacity-20">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 w-px bg-foreground/20"
                  style={{ left: `${(i + 1) * 10}%` }}
                />
              ))}
            </div>
            
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: `${healthPercent}%` }}
              transition={{ duration: 1, delay: animationDelay + 0.3, ease: "easeOut" }}
              className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getHealthColor()} rounded-full`}
            >
              <motion.div
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
              />
            </motion.div>
            
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-foreground drop-shadow-md">
                {healthPercent.toFixed(0)}% HP
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <TrendingDown className="w-3 h-3 text-text-secondary" />
                <span className="text-text-secondary">Spent: </span>
                <span className={`font-medium ${isOverBudget ? "text-red-500" : "text-text-heading"}`}>
                  ${spentToday.toFixed(0)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-text-secondary" />
                <span className="text-text-secondary">Budget: </span>
                <span className="font-medium text-text-heading">${dailyBudget.toFixed(0)}</span>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {showReaction && (
              <motion.div
                initial={{ opacity: 0, y: 10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="mt-3 pt-3 border-t border-border/50"
              >
                <div className={`flex items-start gap-2 p-2 rounded-lg ${
                  isNoSpend ? "bg-emerald-500/10" : 
                  isOverBudget ? "bg-red-500/10" : 
                  isWarning ? "bg-amber-500/10" : 
                  "bg-primary/10"
                }`}>
                  <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 0.5 }}>
                    {isNoSpend ? (
                      <Flame className="w-4 h-4 text-orange-500 mt-0.5" />
                    ) : isOverBudget ? (
                      <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                    ) : (
                      <Shield className="w-4 h-4 text-primary mt-0.5" />
                    )}
                  </motion.div>
                  <p className="text-sm text-text-heading">{reactionMessage}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  );
};
