import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, RefreshCw, Eye } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, ComposedChart } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, isToday, addDays } from "date-fns";

interface ForecastData {
  starting_balance: number;
  avg_daily_spend: number;
  monthly_income: number;
  cash_crunch_date: string | null;
  cash_crunch_warning: boolean;
  predictions: Array<{
    date: string;
    predicted_balance: number;
    events: string[];
  }>;
  summary: {
    day_30_balance: number;
    lowest_balance: number;
    total_subscriptions: number;
    subscription_costs: number;
  };
}

interface CashFlowForecastChartProps {
  animationDelay?: number;
}

export const CashFlowForecastChart = ({ animationDelay = 0 }: CashFlowForecastChartProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const generateForecast = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-cashflow-forecast");

      if (error) throw error;

      if (data && data.success) {
        setForecast(data);
        setHasLoadedOnce(true);
      } else {
        throw new Error(data?.error || "Failed to generate forecast");
      }
    } catch (error) {
      console.error("Error generating forecast:", error);
      toast({
        title: "Forecast Error",
        description: "Could not generate cash flow forecast. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && !hasLoadedOnce) {
      generateForecast();
    }
  }, [user]);

  // Prepare chart data
  const chartData = forecast?.predictions.map((p, index) => {
    const date = parseISO(p.date);
    const isNegative = p.predicted_balance < 0;
    
    return {
      date: format(date, "MMM d"),
      fullDate: p.date,
      balance: p.predicted_balance,
      // Split positive and negative for coloring
      positiveBalance: isNegative ? null : p.predicted_balance,
      negativeBalance: isNegative ? p.predicted_balance : null,
      events: p.events,
      index,
    };
  }) || [];

  // Add today's balance as first point
  const todayData = forecast ? {
    date: "Today",
    fullDate: new Date().toISOString().split("T")[0],
    balance: forecast.starting_balance,
    positiveBalance: forecast.starting_balance,
    negativeBalance: null,
    events: ["Starting balance"],
    index: -1,
  } : null;

  const fullChartData = todayData ? [todayData, ...chartData] : chartData;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isNegative = data.balance < 0;

      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-foreground">{label}</p>
          <p className={`text-lg font-bold ${isNegative ? 'text-destructive' : 'text-success'}`}>
            ${data.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          {data.events && data.events.length > 0 && data.index >= 0 && (
            <div className="mt-2 pt-2 border-t border-border">
              {data.events.slice(0, 3).map((event: string, i: number) => (
                <p key={i} className="text-xs text-muted-foreground">{event}</p>
              ))}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const lowestBalance = forecast?.summary.lowest_balance || 0;
  const day30Balance = forecast?.summary.day_30_balance || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: animationDelay }}
    >
      <Card className="professional-card overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-violet-500" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-foreground">
                  30-Day Crystal Ball
                </CardTitle>
                <p className="text-xs text-muted-foreground">Predictive Cash Flow</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {forecast && (
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    day30Balance < 0 
                      ? 'bg-destructive/10 text-destructive border-destructive/30'
                      : 'bg-success/10 text-success border-success/30'
                  }`}
                >
                  Day 30: ${day30Balance.toLocaleString()}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={generateForecast}
                disabled={isLoading}
                className="h-8 w-8"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          {isLoading && !forecast ? (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 mx-auto mb-3"
                >
                  <Sparkles className="w-12 h-12 text-violet-500" />
                </motion.div>
                <p className="text-sm text-muted-foreground">Gazing into the crystal ball...</p>
              </div>
            </div>
          ) : forecast ? (
            <div className="space-y-4">
              {/* Chart */}
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={fullChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorNegative" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      tickLine={false}
                      axisLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                      tickLine={false}
                      axisLine={false}
                      width={45}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={0} stroke="hsl(var(--destructive))" strokeDasharray="5 5" strokeWidth={2} />
                    
                    {/* Solid line for today */}
                    <Line
                      type="monotone"
                      dataKey="balance"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      strokeDasharray="0"
                      dot={false}
                      connectNulls
                      data={[fullChartData[0]]}
                    />
                    
                    {/* Dashed prediction line */}
                    <Line
                      type="monotone"
                      dataKey="balance"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      strokeDasharray="8 4"
                      dot={(props: any) => {
                        const { cx, cy, payload } = props;
                        if (payload.balance < 0) {
                          return (
                            <circle
                              cx={cx}
                              cy={cy}
                              r={4}
                              fill="hsl(var(--destructive))"
                              stroke="none"
                            />
                          );
                        }
                        return null;
                      }}
                      activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
                    />
                    
                    {/* Area fill */}
                    <Area
                      type="monotone"
                      dataKey="balance"
                      fill="url(#colorPositive)"
                      stroke="none"
                      fillOpacity={1}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-muted/50 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Avg Daily Spend</p>
                  <p className="text-lg font-bold text-foreground">
                    ${forecast.avg_daily_spend.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-muted/50 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Lowest Point</p>
                  <p className={`text-lg font-bold ${lowestBalance < 0 ? 'text-destructive' : 'text-foreground'}`}>
                    ${lowestBalance.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-muted/50 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Monthly Subs</p>
                  <p className="text-lg font-bold text-foreground">
                    ${forecast.summary.subscription_costs.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 pt-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-0.5 bg-primary" />
                  <span className="text-xs text-muted-foreground">Current</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-0.5 border-t-2 border-dashed border-primary" />
                  <span className="text-xs text-muted-foreground">Predicted</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-0.5 border-t-2 border-dashed border-destructive" />
                  <span className="text-xs text-muted-foreground">Danger Zone</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <Button onClick={generateForecast} disabled={isLoading}>
                <Eye className="w-4 h-4 mr-2" />
                Generate Forecast
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
