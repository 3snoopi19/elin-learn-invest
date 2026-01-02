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
      className="bg-gradient-to-br from-primary/15 via-card to-background backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl md:hidden
        py-6 px-4 min-[700px]:py-8 min-[700px]:px-6"
    >
      {/* Net Worth - Premium typography hierarchy */}
      <div className="text-center mb-4 min-[700px]:mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1 min-[700px]:mb-2 flex items-center justify-center gap-1.5">
          <Wallet className="w-3 h-3 min-[700px]:w-3.5 min-[700px]:h-3.5" />
          Net Worth
        </p>
        <motion.h1
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: animationDelay + 0.2, type: "spring" }}
          className="text-3xl min-[700px]:text-5xl font-black text-white tracking-tight leading-none"
        >
          ${netWorth.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </motion.h1>
        <div className="flex items-center justify-center gap-1.5 mt-1.5 min-[700px]:mt-2">
          <TrendingUp className="w-3.5 h-3.5 min-[700px]:w-4 min-[700px]:h-4 text-success" />
          <span className="text-xs min-[700px]:text-sm font-bold text-success">+2.4%</span>
          <span className="text-[10px] min-[700px]:text-xs text-muted-foreground">this month</span>
        </div>
      </div>

      {/* Progress Rings Row - Responsive sizing with clear labels */}
      <div className="flex justify-around items-start">
        {/* Daily Spend Ring */}
        <div className="flex flex-col items-center">
          <div className="min-[700px]:hidden">
            <ProgressRing
              progress={spendPercent}
              size={64}
              strokeWidth={6}
              color={isUnderBudget ? "hsl(var(--success))" : "hsl(var(--destructive))"}
              value={`$${dailySpend.toFixed(0)}`}
              label="spent"
            />
          </div>
          <div className="hidden min-[700px]:block">
            <ProgressRing
              progress={spendPercent}
              size={88}
              strokeWidth={8}
              color={isUnderBudget ? "hsl(var(--success))" : "hsl(var(--destructive))"}
              value={`$${dailySpend.toFixed(0)}`}
              label="spent"
            />
          </div>
          <p className="text-[10px] min-[700px]:text-xs text-muted-foreground mt-2 font-semibold uppercase tracking-wide">
            Spent Today
          </p>
          <p className="text-[9px] min-[700px]:text-[10px] text-muted-foreground/70 font-medium">
            ${remaining.toFixed(0)} left
          </p>
        </div>

        {/* Savings Goal Ring */}
        <div className="flex flex-col items-center">
          <div className="min-[700px]:hidden">
            <ProgressRing
              progress={savingsProgress}
              size={64}
              strokeWidth={6}
              color="hsl(var(--primary))"
              value={`${savingsProgress}%`}
              label="saved"
            />
          </div>
          <div className="hidden min-[700px]:block">
            <ProgressRing
              progress={savingsProgress}
              size={88}
              strokeWidth={8}
              color="hsl(var(--primary))"
              value={`${savingsProgress}%`}
              label="saved"
            />
          </div>
          <p className="text-[10px] min-[700px]:text-xs text-muted-foreground mt-2 font-semibold uppercase tracking-wide">
            Saved
          </p>
          <p className="text-[9px] min-[700px]:text-[10px] text-muted-foreground/70 font-medium">
            Emergency fund
          </p>
        </div>
      </div>
    </motion.div>
  );
};
