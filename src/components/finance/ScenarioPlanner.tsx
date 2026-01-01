import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles,
  PiggyBank,
  DollarSign,
  Target,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { toast } from 'sonner';

interface AnalysisResult {
  isAffordable: boolean;
  freeCashFlowBefore: number;
  freeCashFlowAfter: number;
  difference: number;
  safeToSpendPercentage: number;
  message: string;
  breakdown: {
    income: number;
    bills: number;
    spending: number;
  };
}

// Mock financial data (would come from user's connected accounts)
const mockFinancialData = {
  monthlyIncome: 5200,
  monthlyBills: 1850,
  averageSpending: 1400,
};

export const ScenarioPlanner = () => {
  const [purchaseName, setPurchaseName] = useState('');
  const [monthlyCost, setMonthlyCost] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const calculateFreeCashFlow = () => {
    const { monthlyIncome, monthlyBills, averageSpending } = mockFinancialData;
    return monthlyIncome - monthlyBills - averageSpending;
  };

  const handleAnalyze = async () => {
    if (!purchaseName.trim() || !monthlyCost.trim()) {
      toast.error('Please enter both purchase name and monthly cost');
      return;
    }

    const cost = parseFloat(monthlyCost);
    if (isNaN(cost) || cost <= 0) {
      toast.error('Please enter a valid monthly cost');
      return;
    }

    setIsAnalyzing(true);

    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const { monthlyIncome, monthlyBills, averageSpending } = mockFinancialData;
    const freeCashFlowBefore = calculateFreeCashFlow();
    const freeCashFlowAfter = freeCashFlowBefore - cost;
    const difference = freeCashFlowAfter;
    const safeToSpendPercentage = Math.max(0, Math.min(100, (freeCashFlowAfter / freeCashFlowBefore) * 100));

    const isAffordable = freeCashFlowAfter >= 0;
    const message = isAffordable
      ? `Approved! You'll still save $${freeCashFlowAfter.toFixed(0)}/mo.`
      : `This will put you in the red by $${Math.abs(freeCashFlowAfter).toFixed(0)}/mo.`;

    setResult({
      isAffordable,
      freeCashFlowBefore,
      freeCashFlowAfter,
      difference,
      safeToSpendPercentage,
      message,
      breakdown: {
        income: monthlyIncome,
        bills: monthlyBills,
        spending: averageSpending,
      },
    });

    setIsAnalyzing(false);
  };

  const handleSaveGoal = () => {
    toast.success(`Goal "${purchaseName}" saved! We'll track your progress.`);
    // Reset form
    setPurchaseName('');
    setMonthlyCost('');
    setResult(null);
  };

  const handleReset = () => {
    setPurchaseName('');
    setMonthlyCost('');
    setResult(null);
  };

  const cost = parseFloat(monthlyCost) || 0;

  const beforeData = [
    { name: 'Bills', value: mockFinancialData.monthlyBills, color: 'hsl(var(--destructive))' },
    { name: 'Spending', value: mockFinancialData.averageSpending, color: 'hsl(var(--warning))' },
    { name: 'Free Cash', value: calculateFreeCashFlow(), color: 'hsl(var(--success))' },
  ];

  const afterData = result ? [
    { name: 'Bills', value: mockFinancialData.monthlyBills, color: 'hsl(var(--destructive))' },
    { name: 'Spending', value: mockFinancialData.averageSpending, color: 'hsl(var(--warning))' },
    { name: purchaseName || 'New Purchase', value: cost, color: 'hsl(var(--primary))' },
    { name: 'Free Cash', value: Math.max(0, result.freeCashFlowAfter), color: 'hsl(var(--success))' },
  ] : [];

  return (
    <Card className="professional-card border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Calculator className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Can I Afford It?
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI Powered
                </Badge>
              </CardTitle>
              <CardDescription>
                Test financial decisions before making them
              </CardDescription>
            </div>
          </div>
          {result && (
            <Button variant="ghost" size="sm" onClick={handleReset}>
              Reset
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Interface */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="purchase-name" className="text-sm font-medium">
              What do you want to buy?
            </Label>
            <Input
              id="purchase-name"
              placeholder="e.g., New Car, Gym Membership"
              value={purchaseName}
              onChange={(e) => setPurchaseName(e.target.value)}
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="monthly-cost" className="text-sm font-medium">
              Monthly Cost
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="monthly-cost"
                type="number"
                placeholder="450"
                value={monthlyCost}
                onChange={(e) => setMonthlyCost(e.target.value)}
                className="h-12 pl-9"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                /mo
              </span>
            </div>
          </div>
        </div>

        <Button 
          onClick={handleAnalyze} 
          disabled={isAnalyzing || !purchaseName.trim() || !monthlyCost.trim()}
          className="w-full h-12 text-lg font-semibold"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Analyze
            </>
          )}
        </Button>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Safe to Spend Gauge */}
              <div className={`p-6 rounded-2xl border ${
                result.isAffordable 
                  ? 'bg-success/10 border-success/30' 
                  : 'bg-destructive/10 border-destructive/30'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {result.isAffordable ? (
                      <CheckCircle2 className="w-8 h-8 text-success" />
                    ) : (
                      <AlertTriangle className="w-8 h-8 text-destructive" />
                    )}
                    <div>
                      <h3 className={`text-xl font-bold ${
                        result.isAffordable ? 'text-success' : 'text-destructive'
                      }`}>
                        {result.isAffordable ? 'Affordable!' : 'Not Recommended'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {result.message}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Safe to Spend</p>
                    <p className={`text-3xl font-bold ${
                      result.isAffordable ? 'text-success' : 'text-destructive'
                    }`}>
                      {result.safeToSpendPercentage.toFixed(0)}%
                    </p>
                  </div>
                </div>
                
                <Progress 
                  value={result.safeToSpendPercentage} 
                  className={`h-3 ${!result.isAffordable ? '[&>div]:bg-destructive' : '[&>div]:bg-success'}`}
                />

                <div className="grid grid-cols-3 gap-4 mt-4 text-center text-sm">
                  <div>
                    <p className="text-muted-foreground">Before</p>
                    <p className="font-semibold text-success">
                      +${result.freeCashFlowBefore.toFixed(0)}/mo
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">New Cost</p>
                    <p className="font-semibold text-primary">
                      -${cost.toFixed(0)}/mo
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">After</p>
                    <p className={`font-semibold ${
                      result.isAffordable ? 'text-success' : 'text-destructive'
                    }`}>
                      {result.freeCashFlowAfter >= 0 ? '+' : ''}${result.freeCashFlowAfter.toFixed(0)}/mo
                    </p>
                  </div>
                </div>
              </div>

              {/* Before vs After Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-card border">
                  <h4 className="text-sm font-semibold text-center mb-2 text-muted-foreground">
                    Current Budget
                  </h4>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={beforeData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {beforeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => `$${value.toFixed(0)}`}
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Legend 
                          verticalAlign="bottom" 
                          height={36}
                          formatter={(value) => <span className="text-xs">{value}</span>}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-card border">
                  <h4 className="text-sm font-semibold text-center mb-2 text-muted-foreground">
                    With {purchaseName || 'New Purchase'}
                  </h4>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={afterData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {afterData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => `$${value.toFixed(0)}`}
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Legend 
                          verticalAlign="bottom" 
                          height={36}
                          formatter={(value) => <span className="text-xs">{value}</span>}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Save Goal Button */}
              {result.isAffordable && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button 
                    onClick={handleSaveGoal}
                    variant="outline"
                    className="w-full h-12 border-success text-success hover:bg-success hover:text-success-foreground"
                  >
                    <Target className="w-5 h-5 mr-2" />
                    Save "{purchaseName}" as a Goal
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Financial Summary (always visible) */}
        {!result && (
          <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
            <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <PiggyBank className="w-4 h-4" />
              Your Current Free Cash Flow
            </h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Income</p>
                <p className="font-semibold text-success">
                  ${mockFinancialData.monthlyIncome.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Bills + Spending</p>
                <p className="font-semibold text-destructive">
                  -${(mockFinancialData.monthlyBills + mockFinancialData.averageSpending).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Free Cash</p>
                <p className="font-bold text-primary">
                  ${calculateFreeCashFlow().toLocaleString()}/mo
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
