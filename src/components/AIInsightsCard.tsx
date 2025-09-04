import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  ChevronDown, 
  ChevronUp, 
  TrendingUp, 
  Shield, 
  BarChart3,
  Lightbulb,
  ExternalLink,
  ArrowRight
} from "lucide-react";

// Enhanced AI insights with real-time market data integration
const generateAIInsights = () => {
  const marketConditions = {
    volatility: Math.random() * 40 + 10, // 10-50%
    sentiment: Math.random() > 0.5 ? 'bullish' : 'bearish',
    sectorRotation: Math.random() > 0.7 ? 'tech' : 'value'
  };

  const baseInsights = [
    {
      id: 1,
      title: "Portfolio Rebalancing Signal",
      description: `Market volatility at ${marketConditions.volatility.toFixed(1)}% suggests rebalancing opportunity`,
      priority: marketConditions.volatility > 30 ? "high" : "medium",
      category: "allocation",
      icon: BarChart3,
      recommendation: "Adjust portfolio allocation based on current market conditions",
      explanation: `Current market volatility of ${marketConditions.volatility.toFixed(1)}% indicates ${marketConditions.volatility > 30 ? 'high uncertainty' : 'moderate fluctuation'}. Consider ${marketConditions.sentiment === 'bearish' ? 'defensive positioning with increased bond allocation' : 'maintaining growth exposure while managing risk'}.`,
      action: marketConditions.volatility > 30 ? "Defensive Rebalance" : "Standard Rebalance",
      learningModule: "Portfolio Management Fundamentals",
      confidence: Math.round(85 + Math.random() * 10)
    },
    {
      id: 2,
      title: `${marketConditions.sentiment === 'bullish' ? 'Growth' : 'Defensive'} Positioning Alert`,
      description: `Market sentiment is ${marketConditions.sentiment}, adjust strategy accordingly`,
      priority: "medium",
      category: "risk",
      icon: Shield,
      recommendation: `${marketConditions.sentiment === 'bullish' ? 'Consider increasing growth allocation' : 'Reduce risk exposure and focus on quality'}`,
      explanation: `Current ${marketConditions.sentiment} market sentiment suggests ${marketConditions.sentiment === 'bullish' ? 'potential for continued growth, but maintain risk management' : 'caution is warranted, focus on defensive assets and quality companies'}.`,
      action: marketConditions.sentiment === 'bullish' ? "Optimize Growth" : "Risk Management",
      learningModule: "Market Sentiment Analysis",
      confidence: Math.round(80 + Math.random() * 15)
    },
    {
      id: 3,
      title: `${marketConditions.sectorRotation === 'tech' ? 'Technology' : 'Value'} Sector Opportunity`,
      description: `Market rotation favoring ${marketConditions.sectorRotation} stocks detected`,
      priority: "low",
      category: "opportunity", 
      icon: TrendingUp,
      recommendation: `Consider ${marketConditions.sectorRotation === 'tech' ? 'increasing tech exposure by 3-5%' : 'rotating into value stocks for potential outperformance'}`,
      explanation: `Technical analysis indicates ${marketConditions.sectorRotation === 'tech' ? 'technology stocks showing momentum with AI and cloud computing driving growth' : 'value stocks becoming attractive with improving fundamentals and reasonable valuations'}.`,
      action: "Sector Rotation",
      learningModule: "Sector Analysis & Timing",
      confidence: Math.round(70 + Math.random() * 20)
    }
  ];

  return baseInsights;
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high": return "bg-destructive/20 text-destructive border-destructive/30";
    case "medium": return "bg-warning/20 text-warning border-warning/30";
    case "low": return "bg-success/20 text-success border-success/30";
    default: return "bg-muted text-muted-foreground border-border";
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "allocation": return BarChart3;
    case "risk": return Shield;
    case "opportunity": return TrendingUp;
    default: return Lightbulb;
  }
};

export const AIInsightsCard = () => {
  const [expandedInsight, setExpandedInsight] = useState<number | null>(null);
  const [aiInsights, setAiInsights] = useState(generateAIInsights());
  
  // Refresh insights every 30 seconds to simulate real-time AI analysis
  useEffect(() => {
    const interval = setInterval(() => {
      setAiInsights(generateAIInsights());
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const toggleExpansion = (id: number) => {
    setExpandedInsight(expandedInsight === id ? null : id);
  };

  return (
    <div className="animate-fade-in-up">
      <Card className="neon-card border-0 shadow-2xl">
        <CardHeader className="relative pb-4">
          <div className="flex items-center gap-3">
            <div className="relative p-2 bg-education/20 rounded-lg">
              <Brain className="w-6 h-6 text-education" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold text-white">AI Insights</CardTitle>
              <p className="text-gray-300 text-sm">Personalized recommendations powered by ELIN</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-education rounded-full animate-pulse" />
              <span className="text-education text-sm font-medium">Active</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative space-y-4">
          {aiInsights.map((insight) => {
            const CategoryIcon = getCategoryIcon(insight.category);
            const isExpanded = expandedInsight === insight.id;
            
            return (
              <div
                key={insight.id}
                className="group relative p-4 rounded-lg mobile-card hover:border-border/70 transition-all duration-200"
              >
                <div className="relative">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 bg-secondary/20 rounded-lg flex-shrink-0">
                        <CategoryIcon className="w-4 h-4 text-secondary" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-white font-semibold text-sm group-hover:text-primary transition-colors">
                            {insight.title}
                          </h4>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getPriorityColor(insight.priority)}`}
                          >
                            {insight.priority}
                          </Badge>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {insight.description}
                        </p>
                      </div>
                    </div>

                    {/* Confidence Score */}
                    <div className="text-right ml-4 flex-shrink-0">
                      <div className="text-accent font-bold text-lg">{insight.confidence}%</div>
                      <div className="text-gray-400 text-xs">confidence</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Button 
                        size="sm"
                        variant="success"
                      >
                        {insight.action}
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                      
                      <Button 
                        size="sm"
                        variant="outline"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Learn More
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpansion(insight.id)}
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-4 h-4 mr-1" />
                          Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4 mr-1" />
                          Details
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Expandable Content */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-700/50 animate-fade-in-up">
                      <div className="space-y-3">
                        <div>
                          <h5 className="text-white font-medium text-sm mb-2">Recommendation</h5>
                          <p className="text-accent text-sm leading-relaxed bg-accent/10 p-3 rounded-lg border border-accent/20">
                            {insight.recommendation}
                          </p>
                        </div>
                        
                        <div>
                          <h5 className="text-white font-medium text-sm mb-2">Analysis</h5>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            {insight.explanation}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <div className="text-gray-400 text-xs">
                            Related: <span className="text-education">{insight.learningModule}</span>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-education/30 text-education hover:bg-education/10"
                          >
                            View Module
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-border/30 text-center">
            <p className="text-gray-400 text-sm mb-3">
              Insights updated 2 minutes ago • Next analysis in 4 hours
            </p>
            <Button 
              variant="outline"
            >
              <Brain className="w-4 h-4 mr-2" />
              Request New Analysis
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};