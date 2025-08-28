import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TrendingUp, TrendingDown, Minus, Brain, RefreshCw, Info, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

type SentimentLevel = 'very_bearish' | 'bearish' | 'neutral' | 'bullish' | 'very_bullish';

interface MarketSentiment {
  level: SentimentLevel;
  score: number; // -100 to 100
  confidence: number; // 0 to 100
  factors: {
    technicalIndicators: number;
    economicData: number;
    newsAnalysis: number;
    marketVolatility: number;
  };
  lastUpdated: Date;
  trend: 'improving' | 'declining' | 'stable';
}

const sentimentConfig = {
  very_bearish: {
    label: 'Very Bearish',
    icon: TrendingDown,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    borderColor: 'border-destructive/20',
    emoji: '🔴',
    description: 'Extremely negative market conditions expected'
  },
  bearish: {
    label: 'Bearish',
    icon: TrendingDown,
    color: 'text-destructive',
    bgColor: 'bg-destructive/5',
    borderColor: 'border-destructive/10',
    emoji: '🟠',
    description: 'Negative market sentiment prevailing'
  },
  neutral: {
    label: 'Neutral',
    icon: Minus,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/10',
    borderColor: 'border-muted/20',
    emoji: '🟡',
    description: 'Mixed signals, no clear direction'
  },
  bullish: {
    label: 'Bullish',
    icon: TrendingUp,
    color: 'text-success',
    bgColor: 'bg-success/5',
    borderColor: 'border-success/10',
    emoji: '🟢',
    description: 'Positive market sentiment emerging'
  },
  very_bullish: {
    label: 'Very Bullish',
    icon: TrendingUp,
    color: 'text-success',
    bgColor: 'bg-success/10',
    borderColor: 'border-success/20',
    emoji: '🟢',
    description: 'Extremely positive market conditions expected'
  }
};

export const MarketSentimentGauge = () => {
  const [sentiment, setSentiment] = useState<MarketSentiment>({
    level: 'bullish',
    score: 25,
    confidence: 78,
    factors: {
      technicalIndicators: 65,
      economicData: 70,
      newsAnalysis: 55,
      marketVolatility: 45
    },
    lastUpdated: new Date(),
    trend: 'improving'
  });

  const [loading, setLoading] = useState(false);

  const refreshSentiment = async () => {
    setLoading(true);
    
    // Simulate API call with random sentiment
    setTimeout(() => {
      const sentimentLevels: SentimentLevel[] = ['very_bearish', 'bearish', 'neutral', 'bullish', 'very_bullish'];
      const randomLevel = sentimentLevels[Math.floor(Math.random() * sentimentLevels.length)];
      const randomScore = Math.floor(Math.random() * 200) - 100; // -100 to 100
      
      setSentiment({
        level: randomLevel,
        score: randomScore,
        confidence: Math.floor(Math.random() * 40) + 60, // 60-100
        factors: {
          technicalIndicators: Math.floor(Math.random() * 100),
          economicData: Math.floor(Math.random() * 100),
          newsAnalysis: Math.floor(Math.random() * 100),
          marketVolatility: Math.floor(Math.random() * 100)
        },
        lastUpdated: new Date(),
        trend: ['improving', 'declining', 'stable'][Math.floor(Math.random() * 3)] as any
      });
      
      setLoading(false);
    }, 1500);
  };

  const getSentimentFromScore = (score: number): SentimentLevel => {
    if (score <= -60) return 'very_bearish';
    if (score <= -20) return 'bearish';
    if (score <= 20) return 'neutral';
    if (score <= 60) return 'bullish';
    return 'very_bullish';
  };

  const config = sentimentConfig[sentiment.level];
  const IconComponent = config.icon;

  const getTrendIcon = () => {
    switch (sentiment.trend) {
      case 'improving': return <TrendingUp className="h-3 w-3 text-success" />;
      case 'declining': return <TrendingDown className="h-3 w-3 text-destructive" />;
      default: return <Minus className="h-3 w-3 text-muted-foreground" />;
    }
  };

  // Convert score (-100 to 100) to gauge position (0 to 100)
  const gaugePosition = ((sentiment.score + 100) / 200) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className={`${config.bgColor} ${config.borderColor} border-2 relative overflow-hidden`}>
        {/* Subtle animated background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-current to-transparent animate-pulse" />
        </div>
        
        <CardHeader className="relative pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="h-5 w-5 text-primary" />
              AI Market Sentiment
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshSentiment}
                disabled={loading}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Info className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>How AI Sentiment Analysis Works</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Our AI analyzes multiple data sources to gauge overall market sentiment:
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <BarChart3 className="h-4 w-4 text-primary" />
                        <div>
                          <p className="font-medium text-sm">Technical Indicators</p>
                          <p className="text-xs text-muted-foreground">RSI, MACD, moving averages</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <div>
                          <p className="font-medium text-sm">Economic Data</p>
                          <p className="text-xs text-muted-foreground">GDP, inflation, unemployment</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Brain className="h-4 w-4 text-primary" />
                        <div>
                          <p className="font-medium text-sm">News Analysis</p>
                          <p className="text-xs text-muted-foreground">Financial news sentiment processing</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-warning/10 rounded-lg text-xs text-warning-foreground">
                      <strong>Educational Only:</strong> This is for learning purposes. Not investment advice.
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative space-y-4">
          {/* Main sentiment display */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">{config.emoji}</span>
              <IconComponent className={`h-6 w-6 ${config.color}`} />
            </div>
            
            <div className="space-y-1">
              <Badge className={`${config.bgColor} ${config.color} ${config.borderColor} border text-sm px-3 py-1`}>
                {config.label}
              </Badge>
              <p className="text-xs text-muted-foreground">{config.description}</p>
            </div>

            {/* Score and trend */}
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Score:</span>
                <span className={`font-medium ${config.color}`}>
                  {sentiment.score > 0 ? '+' : ''}{sentiment.score}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Trend:</span>
                <div className="flex items-center gap-1">
                  {getTrendIcon()}
                  <span className="text-xs capitalize">{sentiment.trend}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sentiment gauge */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Very Bearish</span>
              <span>Neutral</span>
              <span>Very Bullish</span>
            </div>
            
            <div className="relative h-2 bg-gradient-to-r from-destructive via-warning to-success rounded-full overflow-hidden">
              <motion.div
                className="absolute top-0 w-1 h-full bg-foreground/80 border border-background shadow-lg"
                style={{ left: `${gaugePosition}%` }}
                initial={{ left: '50%' }}
                animate={{ left: `${gaugePosition}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Confidence and factors */}
          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/50">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Confidence</span>
                <span className="font-medium">{sentiment.confidence}%</span>
              </div>
              <Progress value={sentiment.confidence} className="h-1" />
            </div>
            
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-1">Last Updated</p>
              <p className="text-xs font-medium">
                {sentiment.lastUpdated.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>

          {/* Factor breakdown - simplified */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full">
                View Analysis Breakdown
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Sentiment Analysis Factors</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {Object.entries(sentiment.factors).map(([factor, value]) => (
                  <div key={factor} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">
                        {factor.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="font-medium">{value}%</span>
                    </div>
                    <Progress value={value} className="h-2" />
                  </div>
                ))}
                <div className="mt-4 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
                  <strong>Note:</strong> These factors are weighted and combined using our proprietary AI model. 
                  Individual factor scores don't directly translate to overall sentiment.
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </motion.div>
  );
};