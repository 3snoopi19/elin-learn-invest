import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { BrainCircuit, AlertCircle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { addDays, format } from 'date-fns';

interface PredictionPoint {
  date: string;
  actual?: number;
  predicted?: number;
  low?: number;
  high?: number;
}

interface UpcomingBill {
  name: string;
  amount: number;
  date: Date;
}

const generateMockData = (): PredictionPoint[] => {
  const data: PredictionPoint[] = [];
  const today = new Date();
  let balance = 4250;

  // Historical data (past 7 days)
  for (let i = -7; i <= 0; i++) {
    const date = addDays(today, i);
    balance += (Math.random() - 0.6) * 200;
    data.push({
      date: format(date, 'MMM d'),
      actual: Math.round(balance * 100) / 100,
    });
  }

  // Predicted data (next 30 days)
  let predictedBalance = balance;
  for (let i = 1; i <= 30; i++) {
    const date = addDays(today, i);
    
    // Simulate recurring bills
    if (i === 1) predictedBalance -= 15.99; // Netflix
    if (i === 5) predictedBalance -= 49.99; // Gym
    if (i === 10) predictedBalance -= 89.99; // Utilities
    if (i === 15) predictedBalance += 3425; // Paycheck
    if (i === 20) predictedBalance -= 1200; // Rent
    
    // Daily spending pattern
    predictedBalance -= Math.random() * 50 + 20;
    
    const variance = predictedBalance * 0.08;
    
    data.push({
      date: format(date, 'MMM d'),
      predicted: Math.round(predictedBalance * 100) / 100,
      low: Math.round((predictedBalance - variance) * 100) / 100,
      high: Math.round((predictedBalance + variance) * 100) / 100,
    });
  }

  return data;
};

const mockUpcomingBills: UpcomingBill[] = [
  { name: 'Netflix', amount: 15.99, date: addDays(new Date(), 1) },
  { name: 'Gym Membership', amount: 49.99, date: addDays(new Date(), 5) },
  { name: 'Electric Bill', amount: 89.99, date: addDays(new Date(), 10) },
  { name: 'Rent', amount: 1200.00, date: addDays(new Date(), 20) },
];

interface PredictiveBalanceCardProps {
  animationDelay?: number;
}

export const PredictiveBalanceCard = ({ animationDelay = 0 }: PredictiveBalanceCardProps) => {
  const data = generateMockData();
  const currentBalance = data.find(d => d.actual !== undefined && !d.predicted)?.actual || 4250;
  const predictedEnd = data[data.length - 1]?.predicted || 0;
  const lowestPoint = Math.min(...data.filter(d => d.predicted).map(d => d.low || d.predicted || 0));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-text-heading mb-1">{label}</p>
          {dataPoint.actual !== undefined && (
            <p className="text-sm text-primary">
              Actual: ${dataPoint.actual.toLocaleString()}
            </p>
          )}
          {dataPoint.predicted !== undefined && (
            <>
              <p className="text-sm text-success">
                Predicted: ${dataPoint.predicted.toLocaleString()}
              </p>
              <p className="text-xs text-text-muted">
                Range: ${dataPoint.low?.toLocaleString()} - ${dataPoint.high?.toLocaleString()}
              </p>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: animationDelay }}
      className="lg:col-span-2"
    >
      <Card className="professional-card">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-text-heading flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <BrainCircuit className="w-4 h-4 text-primary" />
              </div>
              30-Day Balance Forecast
            </CardTitle>
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
              AI Powered
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-xs text-text-muted mb-1">Current</div>
              <div className="text-lg font-bold text-text-heading">
                ${currentBalance.toLocaleString()}
              </div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-xs text-text-muted mb-1">Predicted (30d)</div>
              <div className={`text-lg font-bold ${predictedEnd >= currentBalance ? 'text-success' : 'text-destructive'}`}>
                ${predictedEnd.toLocaleString()}
              </div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-xs text-text-muted mb-1">Lowest Point</div>
              <div className={`text-lg font-bold ${lowestPoint < 500 ? 'text-destructive' : 'text-warning'}`}>
                ${lowestPoint.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 10, fill: 'hsl(var(--text-muted))' }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 10, fill: 'hsl(var(--text-muted))' }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={0} stroke="hsl(var(--destructive))" strokeDasharray="3 3" />
                <Area
                  type="monotone"
                  dataKey="actual"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#colorActual)"
                />
                <Area
                  type="monotone"
                  dataKey="predicted"
                  stroke="hsl(var(--success))"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill="url(#colorPredicted)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Upcoming Bills */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-text-secondary flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Upcoming Bills Factored In
            </h4>
            <div className="flex flex-wrap gap-2">
              {mockUpcomingBills.slice(0, 4).map((bill, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {bill.name}: ${bill.amount} on {format(bill.date, 'MMM d')}
                </Badge>
              ))}
            </div>
          </div>

          {/* Low Balance Warning */}
          {lowestPoint < 500 && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
              <span className="text-sm text-destructive">
                Warning: Balance may drop below $500 around {data.find(d => (d.low || d.predicted) === lowestPoint)?.date}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
