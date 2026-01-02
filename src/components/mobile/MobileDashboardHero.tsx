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

/**
 * MobileDashboardHero - Responsive hero card that adapts to screen height
 * iPhone SE/Mini (< 700px): Compact mode with smaller text and reduced padding
 * iPhone Pro/Max (≥ 700px): Standard mode with full spacing
 */
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
      className="bg-card/80 backdrop-blur-xl rounded-3xl border border-border/50 shadow-xl md:hidden
        p-3 min-[700px]:p-5"
    >
      {/* Net Worth - Responsive sizing */}
      <div className="text-center mb-2 min-[700px]:mb-4">
        <p className="text-[9px] min-[700px]:text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-0.5 min-[700px]:mb-1 flex items-center justify-center gap-1">
          <Wallet className="w-2.5 h-2.5 min-[700px]:w-3 min-[700px]:h-3" />
          Net Worth
        </p>
        <motion.h1
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: animationDelay + 0.2, type: "spring" }}
          className="text-2xl min-[700px]:text-4xl font-black text-foreground tracking-tight leading-none"
        >
          ${netWorth.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </motion.h1>
        <div className="flex items-center justify-center gap-1 mt-0.5 min-[700px]:mt-1">
          <TrendingUp className="w-3 h-3 min-[700px]:w-3.5 min-[700px]:h-3.5 text-success" />
          <span className="text-[10px] min-[700px]:text-xs font-bold text-success">+2.4%</span>
          <span className="text-[9px] min-[700px]:text-[10px] text-text-muted">this month</span>
        </div>
      </div>

      {/* Progress Rings Row - Responsive sizing */}
      <div className="flex justify-around items-start">
        {/* Daily Spend Ring */}
        <div className="flex flex-col items-center">
          <div className="min-[700px]:hidden">
            <ProgressRing
              progress={spendPercent}
              size={56}
              strokeWidth={5}
              color={isUnderBudget ? "hsl(var(--success))" : "hsl(var(--destructive))"}
              value={`$${dailySpend.toFixed(0)}`}
              label="spent"
            />
          </div>
          <div className="hidden min-[700px]:block">
            <ProgressRing
              progress={spendPercent}
              size={80}
              strokeWidth={7}
              color={isUnderBudget ? "hsl(var(--success))" : "hsl(var(--destructive))"}
              value={`$${dailySpend.toFixed(0)}`}
              label="spent"
            />
          </div>
          <p className="text-[9px] min-[700px]:text-[10px] text-text-muted mt-0.5 min-[700px]:mt-1 font-medium">
            ${remaining.toFixed(0)} left
          </p>
        </div>

        {/* Savings Goal Ring */}
        <div className="flex flex-col items-center">
          <div className="min-[700px]:hidden">
            <ProgressRing
              progress={savingsProgress}
              size={56}
              strokeWidth={5}
              color="hsl(var(--primary))"
              value={`${savingsProgress}%`}
              label="saved"
            />
          </div>
          <div className="hidden min-[700px]:block">
            <ProgressRing
              progress={savingsProgress}
              size={80}
              strokeWidth={7}
              color="hsl(var(--primary))"
              value={`${savingsProgress}%`}
              label="saved"
            />
          </div>
          <p className="text-[9px] min-[700px]:text-[10px] text-text-muted mt-0.5 min-[700px]:mt-1 font-medium">
            Emergency fund
          </p>
        </div>
      </div>
    </motion.div>
  );
};
