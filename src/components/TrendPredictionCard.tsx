import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Search, Brain, Clock, AlertTriangle, Zap, Target } from 'lucide-react';
import { toast } from 'sonner';

interface TrendPrediction {
  symbol: string;
  name: string;
  currentPrice: number;
  predictions: {
    shortTerm: {
      price: number;
      change: number;
      confidence: number;
      timeframe: string;
    };
    longTerm: {
      price: number;
      change: number;
      confidence: number;
      timeframe: string;
    };
  };
  sentiment: 'bullish' | 'bearish' | 'neutral';
  factors: string[];
}

interface MarketTrend {
  category: string;
  trend: 'up' | 'down' | 'sideways';
  strength: number;
  prediction: string;
  confidence: number;
}

const TrendPredictionCard = () => {
  const [activeTab, setActiveTab] = useState('market');
  const [searchTicker, setSearchTicker] = useState('');
  const [timeframe, setTimeframe] = useState('1week');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [marketTrends] = useState<MarketTrend[]>([
    {
      category: 'Technology',
      trend: 'up',
      strength: 78,
      prediction: 'Continued growth expected',
      confidence: 82
    },
    {
      category: 'Healthcare',
      trend: 'up',
      strength: 65,
      prediction: 'Moderate bullish momentum',
      confidence: 71
    },
    {
      category: 'Energy',
      trend: 'down',
      strength: 45,
      prediction: 'Short-term volatility expected',
      confidence: 68
    },
    {
      category: 'Financial Services',
      trend: 'sideways',
      strength: 52,
      prediction: 'Range-bound trading',
      confidence: 63
    }
  ]);

  const [stockPrediction] = useState<TrendPrediction>({
    symbol: 'AAPL',
    name: 'Apple Inc.',
    currentPrice: 182.52,
    predictions: {
      shortTerm: {
        price: 187.30,
        change: 2.62,
        confidence: 73,
        timeframe: '1 week'
      },
      longTerm: {
        price: 210.45,
        change: 15.28,
        confidence: 68,
        timeframe: '3 months'
      }
    },
    sentiment: 'bullish',
    factors: ['Strong earnings', 'Product innovation', 'Market leadership']
  });

  const analyzeTicker = async () => {
    if (!searchTicker.trim()) {
      toast.error('Please enter a ticker symbol');
      return;
    }

    setIsAnalyzing(true);
    toast.info(`Analyzing ${searchTicker.toUpperCase()}...`);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsAnalyzing(false);
    toast.success(`Analysis complete for ${searchTicker.toUpperCase()}`);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-success" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-destructive" />;
      default: return <div className="w-4 h-4 rounded-full bg-warning" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-success';
      case 'down': return 'text-destructive';
      default: return 'text-warning';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 75) return 'text-success';
    if (confidence >= 60) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <Card className="bg-card border-border h-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-text-heading">Trend Prediction</CardTitle>
              <p className="text-sm text-text-muted">AI-powered market forecasting</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            <Zap className="w-3 h-3 mr-1" />
            Beta
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="market">Market Trends</TabsTrigger>
            <TabsTrigger value="stocks">Stock Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="market" className="space-y-4 mt-4">
            {/* Market Overview */}
            <div className="bg-background-subtle rounded-lg p-4">
              <h4 className="font-medium text-text-heading mb-3">Sector Trends</h4>
              <div className="space-y-3">
                {marketTrends.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getTrendIcon(trend.trend)}
                      <div>
                        <div className="font-medium text-text-heading">{trend.category}</div>
                        <div className="text-sm text-text-secondary">{trend.prediction}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${getConfidenceColor(trend.confidence)}`}>
                        {trend.confidence}% confidence
                      </div>
                      <div className="text-xs text-text-muted">
                        Strength: {trend.strength}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Brain className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h5 className="font-medium text-text-heading mb-1">AI Market Insight</h5>
                  <p className="text-sm text-text-secondary">
                    Technology sector showing strong momentum with 78% bullish indicators. 
                    Consider defensive positions in energy as volatility increases.
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Clock className="w-3 h-3 text-text-muted" />
                    <span className="text-xs text-text-muted">Updated 2 hours ago</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Coming Soon Notice */}
            <div className="bg-warning/5 border border-warning/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
                <div>
                  <h5 className="font-medium text-warning mb-1">Enhanced Predictions Coming Soon</h5>
                  <p className="text-sm text-text-secondary">
                    We're developing advanced LSTM and transformer models for more accurate 
                    long-term market predictions. Stay tuned for updates!
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stocks" className="space-y-4 mt-4">
            {/* Stock Search */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter ticker symbol (e.g., AAPL)"
                  value={searchTicker}
                  onChange={(e) => setSearchTicker(e.target.value.toUpperCase())}
                  className="flex-1"
                />
                <Select value={timeframe} onValueChange={setTimeframe}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1week">1 Week</SelectItem>
                    <SelectItem value="1month">1 Month</SelectItem>
                    <SelectItem value="3months">3 Months</SelectItem>
                    <SelectItem value="1year">1 Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={analyzeTicker} 
                className="w-full" 
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Analyze Stock
                  </>
                )}
              </Button>
            </div>

            {/* Sample Stock Analysis */}
            <div className="bg-background-subtle rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-medium text-text-heading">{stockPrediction.name}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-text-secondary">{stockPrediction.symbol}</span>
                    <Badge variant="secondary" className="text-xs">
                      {stockPrediction.sentiment}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-text-heading">
                    ${stockPrediction.currentPrice}
                  </div>
                  <div className="text-xs text-text-muted">Current Price</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-card rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-success" />
                    <span className="text-sm font-medium text-text-heading">Short-term</span>
                    <Badge variant="outline" className="text-xs">
                      {stockPrediction.predictions.shortTerm.timeframe}
                    </Badge>
                  </div>
                  <div className="text-xl font-bold text-success mb-1">
                    ${stockPrediction.predictions.shortTerm.price}
                  </div>
                  <div className="text-sm text-success">
                    +{stockPrediction.predictions.shortTerm.change}%
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-text-secondary">Confidence</span>
                      <span className={getConfidenceColor(stockPrediction.predictions.shortTerm.confidence)}>
                        {stockPrediction.predictions.shortTerm.confidence}%
                      </span>
                    </div>
                    <Progress value={stockPrediction.predictions.shortTerm.confidence} className="h-1" />
                  </div>
                </div>

                <div className="bg-card rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-text-heading">Long-term</span>
                    <Badge variant="outline" className="text-xs">
                      {stockPrediction.predictions.longTerm.timeframe}
                    </Badge>
                  </div>
                  <div className="text-xl font-bold text-primary mb-1">
                    ${stockPrediction.predictions.longTerm.price}
                  </div>
                  <div className="text-sm text-primary">
                    +{stockPrediction.predictions.longTerm.change}%
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-text-secondary">Confidence</span>
                      <span className={getConfidenceColor(stockPrediction.predictions.longTerm.confidence)}>
                        {stockPrediction.predictions.longTerm.confidence}%
                      </span>
                    </div>
                    <Progress value={stockPrediction.predictions.longTerm.confidence} className="h-1" />
                  </div>
                </div>
              </div>

              <div>
                <h5 className="text-sm font-medium text-text-heading mb-2">Key Factors</h5>
                <div className="flex flex-wrap gap-1">
                  {stockPrediction.factors.map((factor, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {factor}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-warning/5 border border-warning/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-warning mt-0.5" />
                <div className="text-xs text-text-secondary">
                  <strong>Disclaimer:</strong> Predictions are based on AI analysis and historical patterns. 
                  Not financial advice. Always do your own research before investing.
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TrendPredictionCard;