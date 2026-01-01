import { useState } from "react";
import { motion } from "framer-motion";
import { Calculator, TrendingUp, DollarSign, Sparkles, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const CareerROICalculator = () => {
  const [investmentCost, setInvestmentCost] = useState("");
  const [salaryIncrease, setSalaryIncrease] = useState("");
  const [results, setResults] = useState<{
    tenYearROI: number;
    totalEarnings: number;
    returnMultiple: number;
    breakEvenMonths: number;
  } | null>(null);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const { toast } = useToast();

  const calculateROI = async () => {
    const cost = parseFloat(investmentCost.replace(/[^0-9.]/g, ''));
    const increase = parseFloat(salaryIncrease.replace(/[^0-9.]/g, ''));

    if (isNaN(cost) || isNaN(increase) || cost <= 0 || increase <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: "Please enter valid positive numbers for both fields."
      });
      return;
    }

    setIsCalculating(true);

    // Calculate 10-year ROI
    const yearlyIncrease = increase * 12;
    const totalEarnings = yearlyIncrease * 10;
    const tenYearROI = ((totalEarnings - cost) / cost) * 100;
    const returnMultiple = totalEarnings / cost;
    const breakEvenMonths = Math.ceil(cost / increase);

    setResults({
      tenYearROI,
      totalEarnings,
      returnMultiple,
      breakEvenMonths
    });

    // Get AI insight
    try {
      const { data, error } = await supabase.functions.invoke('explain-term', {
        body: { 
          term: "Career ROI Insight",
          definition: `Investment: $${cost.toLocaleString()}, Monthly salary increase: $${increase.toLocaleString()}, 10-year earnings: $${totalEarnings.toLocaleString()}, ROI: ${tenYearROI.toFixed(0)}%`,
          mode: "career-roi"
        }
      });

      if (error) throw error;

      if (data?.explanation) {
        setAiInsight(data.explanation);
      } else {
        generateDefaultInsight(cost, increase, tenYearROI, returnMultiple);
      }
    } catch (error) {
      console.error('AI insight error:', error);
      generateDefaultInsight(cost, increase, tenYearROI, returnMultiple);
    } finally {
      setIsCalculating(false);
    }
  };

  const generateDefaultInsight = (cost: number, increase: number, roi: number, multiple: number) => {
    if (roi > 1000) {
      setAiInsight(`This is an exceptional investment! Your ${multiple.toFixed(0)}x return makes this one of the best investments you can make. Warren Buffett would be proud—you're investing in yourself, the most valuable asset you own.`);
    } else if (roi > 500) {
      setAiInsight(`Outstanding ROI! This self-investment will pay for itself many times over. Most stock market investors would be thrilled with 10% annual returns—you're looking at ${(roi/10).toFixed(0)}% annually.`);
    } else if (roi > 100) {
      setAiInsight(`Solid investment! Doubling your money in 10 years beats inflation and most savings accounts. This education will compound as you apply these skills throughout your career.`);
    } else {
      setAiInsight(`While the direct ROI is modest, consider the intangible benefits: confidence, new opportunities, and skills that compound over time. Many of the best investments have unmeasurable returns.`);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/20">
            <Calculator className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Career ROI Calculator</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              See how investing in yourself pays off
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="investment" className="text-sm font-medium">
              Self-Improvement Cost
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="investment"
                type="text"
                placeholder="e.g., 500"
                value={investmentCost}
                onChange={(e) => setInvestmentCost(e.target.value)}
                className="pl-9"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Course, certification, bootcamp, etc.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="salary" className="text-sm font-medium">
              Expected Monthly Salary Increase
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="salary"
                type="text"
                placeholder="e.g., 200"
                value={salaryIncrease}
                onChange={(e) => setSalaryIncrease(e.target.value)}
                className="pl-9"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              After promotion, new job, or raise
            </p>
          </div>
        </div>

        <Button 
          onClick={calculateROI}
          disabled={isCalculating}
          className="w-full bg-gradient-to-r from-primary to-primary/80"
        >
          {isCalculating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Calculating...
            </>
          ) : (
            <>
              <TrendingUp className="w-4 h-4 mr-2" />
              Calculate 10-Year ROI
            </>
          )}
        </Button>

        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="grid gap-3 md:grid-cols-4">
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {results.tenYearROI.toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">10-Year ROI</p>
              </div>
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-center">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(results.totalEarnings)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Total Extra Earnings</p>
              </div>
              <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20 text-center">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {results.returnMultiple.toFixed(1)}x
                </p>
                <p className="text-xs text-muted-foreground mt-1">Return Multiple</p>
              </div>
              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {results.breakEvenMonths}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Months to Break Even</p>
              </div>
            </div>

            {aiInsight && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20"
              >
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-primary mb-1">AI Insight</p>
                    <p className="text-sm text-foreground leading-relaxed">{aiInsight}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};
