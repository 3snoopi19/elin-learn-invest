import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Search, 
  Eye, 
  Calendar, 
  Building2,
  Brain,
  Star,
  X,
  Filter,
  Download,
  ExternalLink,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { FilingViewer } from "@/components/ui/FilingViewer";

// Mock SEC filings data
const filings = [
  {
    id: 1,
    ticker: "AAPL",
    company: "Apple Inc.",
    title: "Form 10-K - Annual Report",
    description: "Annual report pursuant to Section 13 or 15(d) of the Securities Exchange Act of 1934",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    type: "10-K",
    size: "2.4 MB",
    pages: 112,
    priority: "high"
  },
  {
    id: 2,
    ticker: "TSLA",
    company: "Tesla, Inc.",
    title: "Form 8-K - Current Report",
    description: "Current report filing regarding material corporate events",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), // 1 day ago
    type: "8-K",
    size: "1.8 MB",
    pages: 45,
    priority: "medium"
  },
  {
    id: 3,
    ticker: "GOOGL",
    company: "Alphabet Inc.",
    title: "Form 10-Q - Quarterly Report",
    description: "Quarterly report pursuant to Section 13 or 15(d) of the Securities Exchange Act",
    date: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
    type: "10-Q",
    size: "3.1 MB",
    pages: 78,
    priority: "high"
  },
  {
    id: 4,
    ticker: "MSFT",
    company: "Microsoft Corporation",
    title: "Form DEF 14A - Proxy Statement",
    description: "Definitive proxy statement relating to annual meeting of shareholders",
    date: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
    type: "DEF 14A",
    size: "1.2 MB",
    pages: 89,
    priority: "low"
  },
  {
    id: 5,
    ticker: "NVDA",
    company: "NVIDIA Corporation",
    title: "Form 8-K - Current Report",
    description: "Current report regarding earnings release and conference call",
    date: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    type: "8-K",
    size: "0.9 MB",
    pages: 23,
    priority: "high"
  }
];

// Watchlist tickers
const watchlistTickers = ["AAPL", "TSLA", "GOOGL", "MSFT", "NVDA", "AMZN", "META", "NFLX"];

const getFilingTypeColor = (type: string) => {
  switch (type) {
    case "10-K": return "bg-red-500/20 text-red-400 border-red-500/30";
    case "10-Q": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "8-K": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    case "DEF 14A": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    default: return "bg-slate-500/20 text-slate-400 border-slate-500/30";
  }
};

const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case "high": return <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />;
    case "medium": return <div className="w-2 h-2 bg-yellow-400 rounded-full" />;
    case "low": return <div className="w-2 h-2 bg-slate-400 rounded-full" />;
    default: return null;
  }
};

export const SECFilingsExplorer = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTickers, setSelectedTickers] = useState<string[]>(["AAPL", "TSLA"]);
  const [isSummarizing, setIsSummarizing] = useState<number | null>(null);
  const [selectedFiling, setSelectedFiling] = useState<typeof filings[0] | null>(null);

  const toggleTicker = (ticker: string) => {
    setSelectedTickers(prev => 
      prev.includes(ticker) 
        ? prev.filter(t => t !== ticker)
        : [...prev, ticker]
    );
  };

  const filteredFilings = filings.filter(filing => {
    const matchesSearch = searchQuery === "" || 
      filing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      filing.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      filing.ticker.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTicker = selectedTickers.length === 0 || selectedTickers.includes(filing.ticker);
    
    return matchesSearch && matchesTicker;
  });

  const handleSummarize = async (filingId: number) => {
    setIsSummarizing(filingId);
    // Simulate AI processing time
    setTimeout(() => setIsSummarizing(null), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <Card className="professional-card relative overflow-hidden border-0 bg-gradient-to-br from-card via-card to-slate-900 shadow-xl">
        {/* Enhanced neon glow border */}
        <div className="absolute inset-0 bg-gradient-to-r from-accent/20 via-primary/20 to-accent/20 rounded-lg blur-sm" />
        <div className="absolute inset-[1px] bg-gradient-to-br from-card via-card to-slate-900 rounded-lg" />
        
        <CardHeader className="relative pb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-accent/20 rounded-lg">
              <FileText className="w-6 h-6 text-accent" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold text-text-heading">SEC Filings Explorer</CardTitle>
              <p className="text-text-secondary text-sm">AI-powered financial document analysis</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-accent rounded-full live-pulse" />
              <span className="text-accent text-sm font-medium">Live</span>
            </div>
          </div>

          {/* Enhanced Search Bar */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-primary/20 rounded-lg blur-md" />
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-accent z-10" />
              <Input
                placeholder="Search filings by company, ticker, or document type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-12 bg-muted/50 border-accent/30 text-text-body placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 h-12"
              />
              <div className="absolute right-4 flex items-center gap-2 z-10">
                <Filter className="w-4 h-4 text-text-muted" />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchQuery("")}
                    className="h-6 w-6 p-0 text-text-muted hover:text-text-heading"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Watchlist Tags */}
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-warning" />
              <span className="text-text-body text-sm font-medium">Watchlist</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {watchlistTickers.map(ticker => (
                <motion.button
                  key={ticker}
                  onClick={() => toggleTicker(ticker)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedTickers.includes(ticker)
                      ? 'bg-accent text-white shadow-lg shadow-accent/25 border border-accent'
                      : 'bg-muted/50 text-text-secondary border border-border hover:bg-muted hover:text-text-heading hover:border-border'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {ticker}
                  {selectedTickers.includes(ticker) && (
                    <X className="w-3 h-3 ml-1 inline" />
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative max-h-96 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={searchQuery + selectedTickers.join(",")}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {filteredFilings.map((filing, index) => (
                <motion.div
                  key={filing.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group professional-card p-4 hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Hover glow effect */}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-accent/10 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="flex items-center gap-2">
                          {getPriorityIcon(filing.priority)}
                          <Badge className="bg-muted text-text-heading font-mono text-xs border-border">
                            {filing.ticker}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getFilingTypeColor(filing.type)}`}
                          >
                            {filing.type}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="text-text-secondary text-sm flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDistanceToNow(filing.date, { addSuffix: true })}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="mb-3">
                      <h4 className="text-text-heading font-semibold text-sm mb-1 group-hover:text-accent transition-colors">
                        {filing.title}
                      </h4>
                      <p className="text-text-secondary text-sm leading-relaxed mb-2">
                        {filing.description}
                      </p>
                      <div className="flex items-center gap-4 text-text-muted text-xs">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {filing.company}
                        </span>
                        <span>{filing.size}</span>
                        <span>{filing.pages} pages</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <Button 
                          size="sm"
                          variant="default"
                          className="shadow-md"
                          onClick={() => setSelectedFiling(filing)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Quick View
                        </Button>
                        
                        <Button 
                          size="sm"
                          variant="outline"
                          className="shadow-sm"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                      </div>

                      {/* AI Summarize Button */}
                      <Button
                        size="sm"
                        onClick={() => handleSummarize(filing.id)}
                        disabled={isSummarizing === filing.id}
                        variant="secondary"
                        className={`relative overflow-hidden ${
                          isSummarizing === filing.id
                            ? 'bg-accent text-white'
                            : 'bg-gradient-to-r from-accent/80 to-primary/80 hover:from-accent hover:to-primary text-white'
                        } border-0 shadow-md`}
                      >
                        {/* Glowing effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-primary/20 animate-pulse" />
                        
                        <div className="relative flex items-center gap-1">
                          <Brain className={`w-3 h-3 ${isSummarizing === filing.id ? 'animate-spin' : ''}`} />
                          {isSummarizing === filing.id ? 'Analyzing...' : 'AI Summary'}
                        </div>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {filteredFilings.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-text-secondary"
            >
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No filings found</p>
              <p className="text-sm">Try adjusting your search criteria or watchlist</p>
            </motion.div>
          )}
        </CardContent>

        {/* Footer Stats */}
        <div className="relative px-6 py-4 border-t border-border/30">
          <div className="flex justify-between items-center text-sm">
            <span className="text-text-secondary">
              {filteredFilings.length} of {filings.length} filings
            </span>
            <div className="flex items-center gap-4 text-text-secondary">
              <span>Last updated: 5 min ago</span>
              <Button
                variant="ghost"
                size="sm"
                className="text-accent hover:text-text-heading hover:bg-accent/10"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                SEC.gov
              </Button>
            </div>
          </div>
        </div>
        </Card>

        {/* Filing Viewer Modal */}
        {selectedFiling && (
          <FilingViewer 
            filing={selectedFiling}
            isOpen={!!selectedFiling}
            onClose={() => setSelectedFiling(null)}
          />
        )}

      {/* Custom scrollbar styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.7);
        }
      `}</style>
    </motion.div>
  );
};