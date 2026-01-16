import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Calculator, Clock, TrendingUp, PartyPopper, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";

interface ImpulseInterceptorProps {
  animationDelay?: number;
  onBoughtIt?: (itemName: string, price: number) => void;
}

interface CalculationResult {
  hoursOfWork: number;
  futureValue: number;
  itemName: string;
  price: number;
}

export const ImpulseInterceptor = ({ animationDelay = 0, onBoughtIt }: ImpulseInterceptorProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [itemName, setItemName] = useState("");
  const [price, setPrice] = useState("");
  const [hourlyWage, setHourlyWage] = useState(25);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [totalSaved, setTotalSaved] = useState(0);

  // Fetch user's hourly wage and total saved
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        // Fetch hourly wage from profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('hourly_wage')
          .eq('user_id', user.id)
          .single();

        if (profile?.hourly_wage) {
          setHourlyWage(profile.hourly_wage);
        }

        // Fetch total saved from impulse logs
        const { data: logs } = await supabase
          .from('impulse_prevention_logs')
          .select('price')
          .eq('user_id', user.id);

        if (logs) {
          const total = logs.reduce((sum, log) => sum + Number(log.price), 0);
          setTotalSaved(total);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [user]);

  const calculateImpact = () => {
    const priceNum = parseFloat(price);
    if (!itemName.trim() || isNaN(priceNum) || priceNum <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid item name and price.",
        variant: "destructive",
      });
      return;
    }

    setIsCalculating(true);

    // Simulate calculation time for dramatic effect
    setTimeout(() => {
      const hoursOfWork = priceNum / hourlyWage;
      // Future value = P * (1 + r)^n where r = 8% and n = 20 years
      const futureValue = priceNum * Math.pow(1.08, 20);

      setResult({
        hoursOfWork,
        futureValue,
        itemName: itemName.trim(),
        price: priceNum,
      });
      setIsCalculating(false);
    }, 800);
  };

  const handleResisted = async () => {
    if (!result || !user) return;

    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('impulse_prevention_logs')
        .insert({
          user_id: user.id,
          item_name: result.itemName,
          price: result.price,
          potential_future_value: result.futureValue,
          hours_of_work: result.hoursOfWork,
        });

      if (error) throw error;

      // Trigger confetti explosion
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#10b981', '#059669', '#34d399', '#6ee7b7'],
      });

      // Fire more confetti from sides
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#22c55e', '#10b981'],
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#22c55e', '#10b981'],
      });

      setTotalSaved(prev => prev + result.price);

      toast({
        title: "🎉 You're a Financial Warrior!",
        description: `$${result.price.toLocaleString()} saved! Your future self thanks you.`,
      });

      // Reset form
      setItemName("");
      setPrice("");
      setResult(null);
    } catch (error) {
      console.error('Error saving impulse prevention:', error);
      toast({
        title: "Error",
        description: "Failed to log your victory. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBoughtIt = () => {
    if (!result) return;

    // Call the callback to open add transaction modal
    if (onBoughtIt) {
      onBoughtIt(result.itemName, result.price);
    }

    toast({
      title: "No judgment... 👀",
      description: "We've pre-filled the transaction form for you.",
    });

    // Reset form
    setItemName("");
    setPrice("");
    setResult(null);
  };

  const resetCalculation = () => {
    setResult(null);
    setItemName("");
    setPrice("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: animationDelay }}
    >
      <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-card via-card to-primary/5">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-foreground">
                  Should I Buy It?
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Impulse Interceptor
                </p>
              </div>
            </div>
            {totalSaved > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="px-3 py-1.5 rounded-full bg-success/20 border border-success/30"
              >
                <span className="text-xs font-semibold text-success">
                  ${totalSaved.toLocaleString()} saved
                </span>
              </motion.div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div
                key="input"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="item-name" className="text-sm font-medium">
                      What do you want to buy?
                    </Label>
                    <Input
                      id="item-name"
                      placeholder="e.g., Air Jordans"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      className="bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-sm font-medium">
                      Price
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <Input
                        id="price"
                        type="number"
                        placeholder="200"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="pl-7 bg-background/50"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={calculateImpact}
                  disabled={isCalculating || !itemName || !price}
                  className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                >
                  {isCalculating ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Calculator className="w-4 h-4 mr-2" />
                    </motion.div>
                  ) : (
                    <Calculator className="w-4 h-4 mr-2" />
                  )}
                  {isCalculating ? "Calculating Impact..." : "Calculate True Cost"}
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-5"
              >
                {/* Item Summary */}
                <div className="text-center p-3 rounded-xl bg-muted/50">
                  <p className="text-sm text-muted-foreground">You're considering:</p>
                  <p className="text-xl font-bold text-foreground mt-1">
                    {result.itemName} - ${result.price.toLocaleString()}
                  </p>
                </div>

                {/* Impact Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Time Cost */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-4 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-amber-500" />
                      <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                        Time Cost
                      </span>
                    </div>
                    <p className="text-3xl font-black text-amber-600 dark:text-amber-300">
                      {result.hoursOfWork.toFixed(1)} hours
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      of your life working for this
                    </p>
                  </motion.div>

                  {/* Opportunity Cost */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/10 border border-emerald-500/30"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-emerald-500" />
                      <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                        Future Value (20yr)
                      </span>
                    </div>
                    <p className="text-3xl font-black text-emerald-600 dark:text-emerald-300">
                      ${result.futureValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      if invested in S&P 500 instead
                    </p>
                  </motion.div>
                </div>

                {/* Dramatic Quote */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-center p-4 rounded-xl bg-muted/30 border border-border"
                >
                  <p className="text-base font-semibold text-foreground italic">
                    "That {result.itemName} is{" "}
                    <span className="text-primary font-black">
                      {result.hoursOfWork.toFixed(1)} hours
                    </span>{" "}
                    of your life, or{" "}
                    <span className="text-success font-black">
                      ${result.futureValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>{" "}
                    in your retirement."
                  </p>
                </motion.div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={handleResisted}
                    disabled={isSaving}
                    className="h-14 bg-gradient-to-r from-success to-emerald-600 hover:from-success/90 hover:to-emerald-600/90 text-white font-bold text-base"
                  >
                    <PartyPopper className="w-5 h-5 mr-2" />
                    {isSaving ? "Saving..." : "I Resisted! 🎉"}
                  </Button>
                  <Button
                    onClick={handleBoughtIt}
                    variant="outline"
                    className="h-14 border-2 border-destructive/50 text-destructive hover:bg-destructive/10 font-bold text-base"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    I Bought It 😅
                  </Button>
                </div>

                {/* Reset Button */}
                <Button
                  variant="ghost"
                  onClick={resetCalculation}
                  className="w-full text-muted-foreground"
                >
                  Calculate Another Item
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};
