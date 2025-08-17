import { useState } from "react";
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
import { motion, AnimatePresence } from "framer-motion";

// Mock AI insights data
const aiInsights = [
  {
    id: 1,
    title: "Portfolio Rebalancing Opportunity",
    description: "Your bond allocation is 5% below target. Consider rebalancing to maintain risk profile.",
    priority: "medium",
    category: "allocation",
    icon: BarChart3,
    recommendation: "Increase bond allocation from 25% to 30% of total portfolio",
    explanation: "Based on your Conservative risk profile, maintaining a 30% bond allocation helps preserve capital while providing steady income. Current market volatility suggests defensive positioning.",
    action: "Rebalance Portfolio",
    learningModule: "Portfolio Management Fundamentals",
    confidence: 87
  },
  {
    id: 2,
    title: "Crypto Exposure Alert",
    description: "Cryptocurrency holdings exceed recommended allocation for your risk tolerance.",
    priority: "high",
    category: "risk",
    icon: Shield,
    recommendation: "Reduce crypto allocation from 20% to 10% of total portfolio",
    explanation: "Your Conservative risk profile suggests limiting crypto exposure to 5-10%. High volatility in crypto markets could significantly impact portfolio stability. Consider taking profits and diversifying into traditional assets.",
    action: "Adjust Allocation",
    learningModule: "Risk Management Essentials",
    confidence: 93
  },
  {
    id: 3,
    title: "Market Opportunity Detected",
    description: "Current market conditions favor value stocks in your portfolio composition.",
    priority: "low",
    category: "opportunity",
    icon: TrendingUp,
    recommendation: "Consider increasing exposure to value stocks by 3-5%",
    explanation: "Market analysis indicates value stocks are trading at attractive valuations. Your current growth-heavy allocation could benefit from value diversification to capitalize on potential rotation.",
    action: "Explore Opportunities",
    learningModule: "Market Analysis & Timing",
    confidence: 74
  }
];

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high": return "bg-red-500/20 text-red-400 border-red-500/30";
    case "medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "low": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    default: return "bg-slate-500/20 text-slate-400 border-slate-500/30";
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

  const toggleExpansion = (id: number) => {
    setExpandedInsight(expandedInsight === id ? null : id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-slate-900 via-indigo-900/50 to-slate-900 shadow-2xl">
        {/* Animated neon glow border */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/30 via-blue-400/30 to-purple-400/30 rounded-lg blur-sm animate-pulse" />
        <div className="absolute inset-[1px] bg-gradient-to-br from-slate-900 via-indigo-900/50 to-slate-900 rounded-lg" />
        
        <CardHeader className="relative pb-4">
          <div className="flex items-center gap-3">
            <div className="relative p-2 bg-cyan-500/20 rounded-lg">
              <Brain className="w-6 h-6 text-cyan-400" />
              {/* Pulsing effect */}
              <div className="absolute inset-0 bg-cyan-400/20 rounded-lg animate-ping" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold text-white">AI Insights</CardTitle>
              <p className="text-slate-400 text-sm">Personalized recommendations powered by ELIN</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              <span className="text-cyan-400 text-sm font-medium">Active</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative space-y-4">
          {aiInsights.map((insight) => {
            const CategoryIcon = getCategoryIcon(insight.category);
            const isExpanded = expandedInsight === insight.id;
            
            return (
              <motion.div
                key={insight.id}
                layout
                className="group relative p-4 rounded-lg bg-slate-800/40 border border-slate-700/30 hover:border-slate-600/50 transition-all duration-300"
              >
                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 bg-indigo-500/20 rounded-lg flex-shrink-0">
                        <CategoryIcon className="w-4 h-4 text-indigo-400" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-white font-semibold text-sm group-hover:text-blue-100 transition-colors">
                            {insight.title}
                          </h4>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getPriorityColor(insight.priority)}`}
                          >
                            {insight.priority}
                          </Badge>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed">
                          {insight.description}
                        </p>
                      </div>
                    </div>

                    {/* Confidence Score */}
                    <div className="text-right ml-4 flex-shrink-0">
                      <div className="text-cyan-400 font-bold text-lg">{insight.confidence}%</div>
                      <div className="text-slate-500 text-xs">confidence</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Button 
                        size="sm"
                        className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-lg shadow-emerald-500/25"
                      >
                        {insight.action}
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                      
                      <Button 
                        size="sm"
                        variant="outline"
                        className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Learn More
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpansion(insight.id)}
                      className="text-slate-400 hover:text-white hover:bg-slate-700"
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
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 pt-4 border-t border-slate-700/50"
                      >
                        <div className="space-y-3">
                          <div>
                            <h5 className="text-white font-medium text-sm mb-2">Recommendation</h5>
                            <p className="text-cyan-200 text-sm leading-relaxed bg-cyan-500/10 p-3 rounded-lg border border-cyan-500/20">
                              {insight.recommendation}
                            </p>
                          </div>
                          
                          <div>
                            <h5 className="text-white font-medium text-sm mb-2">Analysis</h5>
                            <p className="text-slate-300 text-sm leading-relaxed">
                              {insight.explanation}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <div className="text-slate-400 text-xs">
                              Related: <span className="text-blue-400">{insight.learningModule}</span>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                            >
                              View Module
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-slate-700/30 text-center">
            <p className="text-slate-400 text-sm mb-3">
              Insights updated 2 minutes ago • Next analysis in 4 hours
            </p>
            <Button 
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
            >
              <Brain className="w-4 h-4 mr-2" />
              Request New Analysis
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};