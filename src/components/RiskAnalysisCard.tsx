import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  BarChart3,
  TrendingDown,
  TrendingUp,
  ArrowRight,
  RefreshCw
} from "lucide-react";

interface RiskMetric {
  category: string;
  score: number;
  status: 'low' | 'medium' | 'high';
  description: string;
  suggestion: string;
}

interface PortfolioRisk {
  overallRisk: 'low' | 'medium' | 'high';
  riskScore: number;
  metrics: RiskMetric[];
  recommendations: string[];
}

const mockPortfolioData = {
  assets: [
    { symbol: 'AAPL', weight: 25, volatility: 0.28 },
    { symbol: 'GOOGL', weight: 20, volatility: 0.32 },
    { symbol: 'TSLA', weight: 15, volatility: 0.65 },
    { symbol: 'VTI', weight: 20, volatility: 0.18 },
    { symbol: 'BND', weight: 20, volatility: 0.08 }
  ],
  totalValue: 50000,
  sectors: { tech: 60, index: 20, bonds: 20 }
};

const calculateRiskAnalysis = (): PortfolioRisk => {
  const { assets, sectors } = mockPortfolioData;
  
  // Calculate diversification score (lower is better)
  const diversificationRisk = Math.max(0, (sectors.tech - 40) / 60 * 100);
  
  // Calculate volatility risk
  const weightedVolatility = assets.reduce((acc, asset) => 
    acc + (asset.weight / 100) * asset.volatility, 0);
  const volatilityRisk = weightedVolatility * 100;
  
  // Calculate concentration risk
  const maxWeight = Math.max(...assets.map(a => a.weight));
  const concentrationRisk = Math.max(0, (maxWeight - 20) / 80 * 100);
  
  const metrics: RiskMetric[] = [
    {
      category: "Diversification",
      score: 100 - diversificationRisk,
      status: diversificationRisk > 50 ? 'high' : diversificationRisk > 25 ? 'medium' : 'low',
      description: `${sectors.tech}% tech concentration`,
      suggestion: "Consider adding international or sector-specific ETFs"
    },
    {
      category: "Volatility",
      score: Math.max(0, 100 - volatilityRisk),
      status: volatilityRisk > 40 ? 'high' : volatilityRisk > 25 ? 'medium' : 'low',
      description: `${(weightedVolatility * 100).toFixed(1)}% portfolio volatility`,
      suggestion: "Add more stable assets like bonds or dividend stocks"
    },
    {
      category: "Concentration",
      score: Math.max(0, 100 - concentrationRisk),
      status: concentrationRisk > 50 ? 'high' : concentrationRisk > 25 ? 'medium' : 'low',
      description: `${maxWeight}% max single position`,
      suggestion: "Reduce largest positions to under 20% each"
    }
  ];
  
  const avgRisk = metrics.reduce((acc, m) => {
    const riskValue = m.status === 'high' ? 80 : m.status === 'medium' ? 50 : 20;
    return acc + riskValue;
  }, 0) / metrics.length;
  
  return {
    overallRisk: avgRisk > 60 ? 'high' : avgRisk > 35 ? 'medium' : 'low',
    riskScore: Math.round(avgRisk),
    metrics,
    recommendations: [
      "Rebalance to reduce tech sector concentration",
      "Add emerging market exposure",
      "Consider defensive positions for market volatility"
    ]
  };
};

const getRiskColor = (status: string) => {
  switch (status) {
    case 'high': return 'text-destructive';
    case 'medium': return 'text-warning';
    case 'low': return 'text-success';
    default: return 'text-muted-foreground';
  }
};

const getRiskIcon = (status: string) => {
  switch (status) {
    case 'high': return AlertTriangle;
    case 'medium': return Shield;
    case 'low': return CheckCircle;
    default: return BarChart3;
  }
};

export const RiskAnalysisCard = () => {
  const [riskData, setRiskData] = useState<PortfolioRisk | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRiskData(calculateRiskAnalysis());
    setIsAnalyzing(false);
  };

  useEffect(() => {
    runAnalysis();
  }, []);

  const OverallRiskIcon = riskData ? getRiskIcon(riskData.overallRisk) : Shield;

  return (
    <Card className="professional-card border-0 shadow-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative p-2 bg-warning/20 rounded-lg">
              <OverallRiskIcon className={`w-6 h-6 ${riskData ? getRiskColor(riskData.overallRisk) : 'text-warning'}`} />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-text-heading">Risk Analysis</CardTitle>
              <p className="text-text-secondary text-sm">Portfolio risk assessment</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={runAnalysis}
            disabled={isAnalyzing}
            className="mobile-button"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
            {isAnalyzing ? 'Analyzing...' : 'Refresh'}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {isAnalyzing ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-text-secondary">Analyzing portfolio risk factors...</p>
          </div>
        ) : riskData ? (
          <>
            {/* Overall Risk Score */}
            <div className="text-center p-6 bg-card/50 rounded-lg border border-border/50">
              <div className="flex items-center justify-center gap-3 mb-3">
                <OverallRiskIcon className={`w-8 h-8 ${getRiskColor(riskData.overallRisk)}`} />
                <div>
                  <div className="text-3xl font-bold text-text-heading">{riskData.riskScore}</div>
                  <div className="text-text-secondary text-sm">Risk Score</div>
                </div>
              </div>
              <Badge 
                variant="outline" 
                className={`${getRiskColor(riskData.overallRisk)} border-current`}
              >
                {riskData.overallRisk.toUpperCase()} RISK
              </Badge>
            </div>

            {/* Risk Metrics */}
            <div className="space-y-4">
              <h4 className="font-semibold text-text-heading">Risk Breakdown</h4>
              {riskData.metrics.map((metric, index) => {
                const MetricIcon = getRiskIcon(metric.status);
                return (
                  <div key={index} className="p-4 bg-card/30 rounded-lg border border-border/30">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <MetricIcon className={`w-4 h-4 ${getRiskColor(metric.status)}`} />
                        <span className="font-medium text-text-heading">{metric.category}</span>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getRiskColor(metric.status)} border-current`}
                      >
                        {metric.status}
                      </Badge>
                    </div>
                    
                    <Progress 
                      value={metric.score} 
                      className="mb-2 h-2"
                    />
                    
                    <p className="text-sm text-text-secondary mb-2">{metric.description}</p>
                    <p className="text-xs text-text-muted bg-muted/50 p-2 rounded">
                      💡 {metric.suggestion}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Recommendations */}
            <div className="space-y-3">
              <h4 className="font-semibold text-text-heading">Recommendations</h4>
              <div className="space-y-2">
                {riskData.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
                    <ArrowRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-text-body">{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button className="flex-1 mobile-button">
                <TrendingUp className="w-4 h-4 mr-2" />
                Optimize Portfolio
              </Button>
              <Button variant="outline" className="flex-1 mobile-button">
                <BarChart3 className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
};