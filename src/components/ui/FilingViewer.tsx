import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Download, 
  ExternalLink, 
  X, 
  Maximize, 
  Brain,
  Eye,
  Clock,
  Building2,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface Filing {
  id: number;
  ticker: string;
  company: string;
  title: string;
  description: string;
  date: Date;
  type: string;
  size: string;
  pages: number;
  priority: string;
}

interface FilingViewerProps {
  filing: Filing;
  isOpen: boolean;
  onClose: () => void;
}

// Mock filing content - In production this would fetch actual SEC filing data
const getFilingContent = (filing: Filing) => {
  const mockContent = {
    summary: `${filing.company} (${filing.ticker}) filed this ${filing.type} document containing important business and financial information. This ${filing.pages}-page document includes key metrics, strategic initiatives, and regulatory updates.`,
    keyPoints: [
      `Revenue grew 12.3% year-over-year to $94.8 billion`,
      `Operating margin improved to 29.5% vs 28.1% prior year`,
      `Cash and equivalents totaled $63.9 billion at quarter end`,
      `Announced $15 billion share buyback program`,
      `Management raised full-year guidance for revenue and EPS`
    ],
    riskFactors: [
      'Competition in core markets may impact market share',
      'Regulatory changes could affect business operations',
      'Economic downturns may reduce customer demand'
    ],
    aiInsights: {
      bullishPoints: [
        'Strong revenue growth trajectory continues',
        'Healthy balance sheet with substantial cash reserves',
        'Market-leading position in key segments'
      ],
      bearishPoints: [
        'Increased competitive pressure in core markets',
        'Rising operational costs due to inflation',
        'Dependence on key customer segments'
      ],
      overallSentiment: 'Positive',
      confidence: 87
    }
  };

  return mockContent;
};

export const FilingViewer = ({ filing, isOpen, onClose }: FilingViewerProps) => {
  const [activeTab, setActiveTab] = useState<'content' | 'summary' | 'analysis'>('summary');
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  const [content, setContent] = useState(getFilingContent(filing));

  // Simulate loading delay
  useState(() => {
    if (isOpen) {
      setIsLoadingContent(true);
      setTimeout(() => setIsLoadingContent(false), 1500);
    }
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="max-w-4xl mx-auto h-full flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="professional-card flex-1 flex flex-col overflow-hidden">
              <CardHeader className="border-b border-border/30 flex-shrink-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-lg font-bold text-text-heading mb-1">
                        {filing.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {filing.ticker}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {filing.type}
                        </Badge>
                        <span className="text-text-muted text-sm">
                          {filing.pages} pages • {filing.size}
                        </span>
                      </div>
                      <p className="text-text-muted text-sm">
                        {filing.company} • Filed {filing.date.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-1" />
                      PDF
                    </Button>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-1 mt-4">
                  {[
                    { id: 'summary', label: 'AI Summary', icon: Brain },
                    { id: 'analysis', label: 'Analysis', icon: TrendingUp },
                    { id: 'content', label: 'Full Document', icon: FileText }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <Button
                        key={tab.id}
                        variant={activeTab === tab.id ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setActiveTab(tab.id as any)}
                        className="flex items-center gap-2"
                      >
                        <Icon className="w-3 h-3" />
                        {tab.label}
                      </Button>
                    );
                  })}
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto p-6">
                {isLoadingContent ? (
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <div className="space-y-2">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-3 w-full" />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {activeTab === 'summary' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <div>
                          <h3 className="text-text-heading font-semibold mb-2">Document Summary</h3>
                          <p className="text-text-body leading-relaxed">
                            {content.summary}
                          </p>
                        </div>

                        <div>
                          <h3 className="text-text-heading font-semibold mb-3">Key Highlights</h3>
                          <div className="space-y-2">
                            {content.keyPoints.map((point, index) => (
                              <div key={index} className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-success rounded-full mt-2 flex-shrink-0" />
                                <p className="text-text-body text-sm">{point}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-text-heading font-semibold mb-3">Risk Factors</h3>
                          <div className="space-y-2">
                            {content.riskFactors.map((risk, index) => (
                              <div key={index} className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-warning rounded-full mt-2 flex-shrink-0" />
                                <p className="text-text-body text-sm">{risk}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'analysis' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="mobile-card p-4 bg-success/5 border border-success/20">
                            <h3 className="text-success font-semibold mb-3 flex items-center gap-2">
                              <TrendingUp className="w-4 h-4" />
                              Bullish Indicators
                            </h3>
                            <div className="space-y-2">
                              {content.aiInsights.bullishPoints.map((point, index) => (
                                <div key={index} className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 bg-success rounded-full mt-2 flex-shrink-0" />
                                  <p className="text-text-body text-sm">{point}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="mobile-card p-4 bg-destructive/5 border border-destructive/20">
                            <h3 className="text-destructive font-semibold mb-3 flex items-center gap-2">
                              <TrendingDown className="w-4 h-4" />
                              Risk Considerations
                            </h3>
                            <div className="space-y-2">
                              {content.aiInsights.bearishPoints.map((point, index) => (
                                <div key={index} className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 bg-destructive rounded-full mt-2 flex-shrink-0" />
                                  <p className="text-text-body text-sm">{point}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="mobile-card p-4 bg-primary/5 border border-primary/20">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-primary font-semibold flex items-center gap-2">
                              <Brain className="w-4 h-4" />
                              AI Analysis
                            </h3>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-text-muted">Confidence:</span>
                              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                                {content.aiInsights.confidence}%
                              </Badge>
                            </div>
                          </div>
                          <p className="text-text-body">
                            Overall sentiment: <span className="font-semibold text-success">
                              {content.aiInsights.overallSentiment}
                            </span>
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'content' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <div className="bg-muted/20 border border-border/20 rounded-lg p-6 text-center">
                          <FileText className="w-12 h-12 text-primary mx-auto mb-4" />
                          <h3 className="text-text-heading font-semibold mb-2">Full Document Viewer</h3>
                          <p className="text-text-muted mb-4">
                            The complete SEC filing would be embedded here. In production, this would show the full document content.
                          </p>
                          <div className="flex justify-center gap-3">
                            <Button variant="default">
                              <Eye className="w-4 h-4 mr-2" />
                              Open PDF Viewer
                            </Button>
                            <Button variant="outline">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              View on SEC.gov
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};