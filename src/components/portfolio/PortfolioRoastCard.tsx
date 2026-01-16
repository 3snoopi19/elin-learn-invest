import { motion } from "framer-motion";
import { Flame, AlertTriangle, CheckCircle, TrendingUp, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface RoastResult {
  roast_score: number;
  headline_roast: string;
  key_risks: string[];
  actionable_fix: string;
}

interface PortfolioRoastCardProps {
  result: RoastResult;
  onClose: () => void;
}

const getScoreColor = (score: number): string => {
  if (score >= 80) return "text-green-500";
  if (score >= 60) return "text-yellow-500";
  if (score >= 40) return "text-orange-500";
  return "text-red-500";
};

const getScoreLabel = (score: number): string => {
  if (score >= 80) return "Wall Street Ready";
  if (score >= 60) return "Getting There";
  if (score >= 40) return "Needs Work";
  if (score >= 20) return "Rookie Mistakes";
  return "Dumpster Fire";
};

const getProgressColor = (score: number): string => {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-yellow-500";
  if (score >= 40) return "bg-orange-500";
  return "bg-red-500";
};

export const PortfolioRoastCard = ({ result, onClose }: PortfolioRoastCardProps) => {
  const { roast_score, headline_roast, key_risks, actionable_fix } = result;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Card className="border-2 border-orange-500/30 bg-gradient-to-br from-orange-950/20 via-red-950/10 to-background overflow-hidden">
        {/* Heat gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-orange-500/5 to-transparent pointer-events-none" />
        
        <CardHeader className="relative pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Flame className="h-5 w-5 md:h-6 md:w-6 text-orange-500 animate-pulse" />
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent font-bold">
                Portfolio Roast
              </span>
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 hover:bg-orange-500/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="relative space-y-6">
          {/* Roast Score Circle */}
          <div className="flex flex-col items-center py-4">
            <div className="relative w-32 h-32 md:w-40 md:h-40">
              {/* Background circle */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-muted/20"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="url(#roastGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${roast_score * 2.64} 264`}
                  initial={{ strokeDasharray: "0 264" }}
                  animate={{ strokeDasharray: `${roast_score * 2.64} 264` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="roastGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#ef4444" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Score text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  className={`text-3xl md:text-4xl font-bold ${getScoreColor(roast_score)}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {roast_score}
                </motion.span>
                <span className="text-xs text-muted-foreground">/ 100</span>
              </div>
            </div>
            <motion.p
              className={`mt-3 text-sm font-semibold ${getScoreColor(roast_score)}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              {getScoreLabel(roast_score)}
            </motion.p>
          </div>

          {/* Headline Roast */}
          <motion.div
            className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg p-4 border border-orange-500/20"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-base md:text-lg font-semibold text-foreground leading-relaxed">
              "{headline_roast}"
            </p>
          </motion.div>

          {/* Key Risks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h4 className="flex items-center gap-2 text-sm font-semibold text-orange-400 mb-3">
              <AlertTriangle className="h-4 w-4" />
              Key Risks Identified
            </h4>
            <ul className="space-y-2">
              {key_risks.map((risk, index) => (
                <motion.li
                  key={index}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                  {risk}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Actionable Fix */}
          <motion.div
            className="bg-green-500/10 rounded-lg p-4 border border-green-500/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <h4 className="flex items-center gap-2 text-sm font-semibold text-green-400 mb-2">
              <TrendingUp className="h-4 w-4" />
              How to Improve
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {actionable_fix}
            </p>
          </motion.div>

          {/* Educational disclaimer */}
          <p className="text-xs text-muted-foreground/60 text-center pt-2">
            This roast is for educational purposes only. Not financial advice.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};
