import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { ProgressRing, MultiProgressRing } from "./ProgressRing";

interface MobileDashboardHeroProps {
  netWorth?: number;
  dailySpend?: number;
  dailyBudget?: number;
  savingsProgress?: number;
  animationDelay?: number;
}

export const MobileDashboardHero = ({
  netWorth = 24850.32,
  dailySpend = 45.50,
  dailyBudget = 80,
  savingsProgress = 68,
  animationDelay = 0,
}: MobileDashboardHeroProps) => {
  const spendPercent = Math.min((dailySpend / dailyBudget) * 100, 100);
  const isUnderBudget = dailySpend <= dailyBudget;
  const remaining = Math.max(dailyBudget - dailySpend, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: animationDelay }}
      className="bg-card/80 backdrop-blur-xl rounded-3xl p-6 border border-border/50 shadow-xl md:hidden"
    >
      {/* Net Worth - MASSIVE */}
      <div className="text-center mb-8">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-2 flex items-center justify-center gap-1.5">
          <Wallet className="w-3.5 h-3.5" />
          Net Worth
        </p>
        <motion.h1
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: animationDelay + 0.2, type: "spring" }}
          className="text-[44px] font-black text-foreground tracking-tight leading-none"
        >
          ${netWorth.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </motion.h1>
        <div className="flex items-center justify-center gap-1.5 mt-2">
          <TrendingUp className="w-4 h-4 text-success" />
          <span className="text-sm font-bold text-success">+2.4%</span>
          <span className="text-xs text-text-muted">this month</span>
        </div>
      </div>

      {/* Progress Rings Row */}
      <div className="flex justify-around items-start px-2">
        {/* Daily Spend Ring */}
        <div className="flex flex-col items-center">
          <ProgressRing
            progress={spendPercent}
            size={96}
            strokeWidth={8}
            color={isUnderBudget ? "hsl(var(--success))" : "hsl(var(--destructive))"}
            value={`$${dailySpend.toFixed(0)}`}
            label="spent"
          />
          <p className="text-[11px] text-text-muted mt-2 font-medium">
            ${remaining.toFixed(0)} left today
          </p>
        </div>

        {/* Savings Goal Ring */}
        <div className="flex flex-col items-center">
          <ProgressRing
            progress={savingsProgress}
            size={96}
            strokeWidth={8}
            color="hsl(var(--primary))"
            value={`${savingsProgress}%`}
            label="saved"
          />
          <p className="text-[11px] text-text-muted mt-2 font-medium">
            Emergency fund
          </p>
        </div>
      </div>
    </motion.div>
  );
};
