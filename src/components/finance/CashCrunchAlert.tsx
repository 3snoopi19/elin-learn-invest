import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Calendar, ArrowRight, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, parseISO, differenceInDays } from "date-fns";
import { useNavigate } from "react-router-dom";

interface CashCrunchAlertProps {
  animationDelay?: number;
}

export const CashCrunchAlert = ({ animationDelay = 0 }: CashCrunchAlertProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [crunchDate, setCrunchDate] = useState<string | null>(null);
  const [lowestBalance, setLowestBalance] = useState<number>(0);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkForCashCrunch = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        // Check balance predictions for any negative values
        const { data: predictions, error } = await supabase
          .from("balance_predictions")
          .select("prediction_date, predicted_balance")
          .eq("user_id", user.id)
          .lt("predicted_balance", 0)
          .order("prediction_date", { ascending: true })
          .limit(1);

        if (error) throw error;

        if (predictions && predictions.length > 0) {
          setCrunchDate(predictions[0].prediction_date);
          setLowestBalance(predictions[0].predicted_balance);
        }

        // Also get overall lowest balance
        const { data: allPredictions } = await supabase
          .from("balance_predictions")
          .select("predicted_balance")
          .eq("user_id", user.id)
          .order("predicted_balance", { ascending: true })
          .limit(1);

        if (allPredictions && allPredictions.length > 0) {
          setLowestBalance(allPredictions[0].predicted_balance);
        }
      } catch (error) {
        console.error("Error checking cash crunch:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkForCashCrunch();
  }, [user]);

  if (isLoading || !crunchDate || isDismissed) return null;

  const daysUntilCrunch = differenceInDays(parseISO(crunchDate), new Date());
  const formattedDate = format(parseISO(crunchDate), "MMMM d, yyyy");

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.4, delay: animationDelay }}
        className="relative overflow-hidden rounded-2xl border-2 border-destructive/50 bg-gradient-to-br from-destructive/20 via-red-500/10 to-orange-500/10"
      >
        {/* Animated background pulse */}
        <motion.div
          animate={{ opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-destructive/10"
        />

        {/* Content */}
        <div className="relative p-4 md:p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              {/* Warning Icon */}
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="p-3 rounded-xl bg-destructive/20 border border-destructive/30"
              >
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </motion.div>

              {/* Alert Content */}
              <div className="flex-1">
                <h3 className="text-lg font-bold text-destructive flex items-center gap-2">
                  ⚠️ Cash Crunch Warning
                </h3>
                <p className="text-sm text-foreground mt-1">
                  You are projected to hit a{" "}
                  <span className="font-bold text-destructive">negative balance</span> on{" "}
                  <span className="font-semibold">{formattedDate}</span>
                </p>

                {/* Stats Row */}
                <div className="flex flex-wrap items-center gap-4 mt-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-destructive/10 border border-destructive/20">
                    <Calendar className="w-4 h-4 text-destructive" />
                    <span className="text-sm font-semibold text-destructive">
                      {daysUntilCrunch} days away
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-destructive/10 border border-destructive/20">
                    <TrendingDown className="w-4 h-4 text-destructive" />
                    <span className="text-sm font-semibold text-destructive">
                      Lowest: ${lowestBalance.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  onClick={() => navigate("/money-flow")}
                  className="mt-4 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  size="sm"
                >
                  View Details
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* Dismiss Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDismissed(true)}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
