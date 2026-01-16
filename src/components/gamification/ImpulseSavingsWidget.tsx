import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ImpulseSavingsWidgetProps {
  animationDelay?: number;
}

export const ImpulseSavingsWidget = ({ animationDelay = 0 }: ImpulseSavingsWidgetProps) => {
  const { user } = useAuth();
  const [totalSaved, setTotalSaved] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSavings = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('impulse_prevention_logs')
          .select('price')
          .eq('user_id', user.id);

        if (error) throw error;

        if (data) {
          const total = data.reduce((sum, log) => sum + Number(log.price), 0);
          setTotalSaved(total);
          setItemCount(data.length);
        }
      } catch (error) {
        console.error('Error fetching impulse savings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavings();
  }, [user]);

  if (isLoading || totalSaved === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: animationDelay }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-success/20 via-emerald-500/15 to-green-600/10 border border-success/30 p-4"
    >
      {/* Background decoration */}
      <div className="absolute -top-4 -right-4 w-20 h-20 bg-success/10 rounded-full blur-2xl" />
      <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-emerald-500/10 rounded-full blur-2xl" />

      <div className="relative flex items-center gap-4">
        <div className="p-3 rounded-xl bg-success/20">
          <ShieldCheck className="w-6 h-6 text-success" />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-success uppercase tracking-wide">
              Impulse Buys Prevented
            </span>
            <TrendingUp className="w-3 h-3 text-success" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-success">
              ${totalSaved.toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground">
              ({itemCount} {itemCount === 1 ? 'item' : 'items'})
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
