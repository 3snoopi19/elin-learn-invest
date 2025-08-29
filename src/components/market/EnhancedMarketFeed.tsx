import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, Activity, AlertCircle, RefreshCw, Search, Star, Plus, Eye, BarChart3, Newspaper, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { getSymbolInfo } from "@/lib/market/symbols";
import { Skeleton } from "@/components/ui/skeleton";

interface MarketQuote {
  symbol: string;
  price: number;
  changePct: number;
  changeAbs: number;
  prevClose: number;
  time: number;
  volume?: number;
  marketCap?: number;
}

interface WatchlistItem {
  symbol: string;
  addedAt: Date;
  alerts: {
    priceTarget?: number;
    priceAlert?: "above" | "below";
    percentChange?: number;
  };
}

interface MarketSentiment {
  symbol: string;
  sentiment: "bullish" | "bearish" | "neutral";
  score: number; // -1 to 1
  sources: number;
  lastUpdated: Date;
}

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  publishedAt: Date;
  sentiment: "positive" | "negative" | "neutral";
  relevantSymbols: string[];
  url: string;
}

const MARKET_FEED_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'SPY', 'QQQ', 'IWM'];

// Mock data generators
const generateSentimentData = (symbols: string[]): MarketSentiment[] => {
  return symbols.map(symbol => ({
    symbol,
    sentiment: Math.random() > 0.6 ? "bullish" : Math.random() > 0.3 ? "neutral" : "bearish",
    score: (Math.random() - 0.5) * 2,
    sources: Math.floor(Math.random() * 50) + 10,
    lastUpdated: new Date()
  }));
};

const generateNewsData = (): NewsItem[] => {
  const headlines = [
    { title: "Market Rally Continues as Tech Stocks Surge", sentiment: "positive" as const, symbols: ["AAPL", "MSFT", "GOOGL"] },
    { title: "Federal Reserve Signals Potential Rate Changes", sentiment: "neutral" as const, symbols: ["SPY", "QQQ"] },
    { title: "Tesla Reports Strong Q4 Delivery Numbers", sentiment: "positive" as const, symbols: ["TSLA"] },
    { title: "Amazon Web Services Announces New AI Initiative", sentiment: "positive" as const, symbols: ["AMZN"] },
    { title: "Nvidia Stock Faces Headwinds from Chip Restrictions", sentiment: "negative" as const, symbols: ["NVDA"] },
  ];

  return headlines.map((item, index) => ({
    id: `news-${index}`,
    title: item.title,
    summary: `${item.title.substring(0, 80)}... Full analysis shows market implications for affected sectors.`,
    source: ["Reuters", "Bloomberg", "MarketWatch", "Financial Times"][Math.floor(Math.random() * 4)],
    publishedAt: new Date(Date.now() - Math.random() * 86400000 * 3), // Last 3 days
    sentiment: item.sentiment,
    relevantSymbols: item.symbols,
    url: "#"
  }));
};

export const EnhancedMarketFeed = () => {
  const [marketData, setMarketData] = useState<MarketQuote[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [sentimentData, setSentimentData] = useState<MarketSentiment[]>([]);
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [selectedTab, setSelectedTab] = useState("watchlist");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize watchlist with some default symbols
  useEffect(() => {
    const defaultWatchlist: WatchlistItem[] = [
      { symbol: "AAPL", addedAt: new Date(), alerts: { priceTarget: 200 } },
      { symbol: "MSFT", addedAt: new Date(), alerts: { percentChange: 5 } },
      { symbol: "TSLA", addedAt: new Date(), alerts: {} },
      { symbol: "SPY", addedAt: new Date(), alerts: { priceAlert: "below", priceTarget: 450 } },
    ];
    setWatchlist(defaultWatchlist);
    setSentimentData(generateSentimentData(MARKET_FEED_SYMBOLS));
    setNewsData(generateNewsData());
  }, []);

  const fetchMarketData = useCallback(async () => {
    try {
      setError(null);
      
      const { data, error: fetchError } = await supabase.functions.invoke('market-quotes', {
        body: { symbols: MARKET_FEED_SYMBOLS.join(',') }
      });

      if (fetchError) {
        throw new Error(fetchError.message || 'API request failed');
      }

      if (data && Array.isArray(data)) {
        setMarketData(data);
      } else {
        throw new Error('Invalid data format received');
      }
    } catch (err) {
      console.error('Error fetching market data:', err);
      setError('Live data unavailable');
      
      // Fallback data
      const fallbackData = MARKET_FEED_SYMBOLS.map((symbol) => ({
        symbol,
        price: 150 + Math.random() * 300,
        changePct: (Math.random() - 0.5) * 6,
        changeAbs: (Math.random() - 0.5) * 10,
        prevClose: 145 + Math.random() * 300,
        time: Date.now() / 1000,
        volume: Math.floor(Math.random() * 10000000),
        marketCap: Math.floor(Math.random() * 1000000000000)
      }));
      setMarketData(fallbackData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 30000);
    return () => clearInterval(interval);
  }, [fetchMarketData]);

  const addToWatchlist = (symbol: string) => {
    if (!watchlist.find(item => item.symbol === symbol)) {
      setWatchlist(prev => [...prev, {
        symbol,
        addedAt: new Date(),
        alerts: {}
      }]);
    }
  };

  const removeFromWatchlist = (symbol: string) => {
    setWatchlist(prev => prev.filter(item => item.symbol !== symbol));
  };

  const getSentimentBadge = (sentiment: MarketSentiment) => {
    const colors = {
      bullish: "bg-success/20 text-success border-success/30",
      bearish: "bg-destructive/20 text-destructive border-destructive/30", 
      neutral: "bg-muted text-muted-foreground border-border"
    };

    return (
      <Badge className={`${colors[sentiment.sentiment]} border text-xs`}>
        {sentiment.sentiment} {sentiment.score > 0 ? '+' : ''}{(sentiment.score * 100).toFixed(0)}%
      </Badge>
    );
  };

  const getNewsIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive": return <TrendingUp className="w-4 h-4 text-success" />;
      case "negative": return <TrendingDown className="w-4 h-4 text-destructive" />;
      default: return <Newspaper className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const filteredData = marketData.filter(item => 
    searchQuery === "" || 
    item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getSymbolInfo(item.symbol).displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const watchlistData = marketData.filter(item => 
    watchlist.some(watchItem => watchItem.symbol === item.symbol)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="relative overflow-hidden neon-card">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-education/10 to-primary/10 rounded-lg blur-sm" />
        <div className="absolute inset-[1px] bg-card rounded-lg" />
        
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Smart Market Intelligence</CardTitle>
                <p className="text-sm text-muted-foreground">AI-powered watchlists, sentiment & news</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {error ? (
                <Button onClick={fetchMarketData} size="sm" variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                  <span className="text-success text-sm font-medium">Live</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search stocks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="watchlist" className="text-xs">
                <Star className="w-4 h-4 mr-1" />
                Watchlist
              </TabsTrigger>
              <TabsTrigger value="market" className="text-xs">
                <Activity className="w-4 h-4 mr-1" />
                Market
              </TabsTrigger>
              <TabsTrigger value="sentiment" className="text-xs">
                <Eye className="w-4 h-4 mr-1" />
                Sentiment
              </TabsTrigger>
              <TabsTrigger value="news" className="text-xs">
                <Newspaper className="w-4 h-4 mr-1" />
                News
              </TabsTrigger>
            </TabsList>

            <TabsContent value="watchlist" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">My Watchlist ({watchlist.length})</h3>
                <Select onValueChange={addToWatchlist}>
                  <SelectTrigger className="w-32">
                    <Plus className="w-4 h-4 mr-2" />
                    <span className="text-xs">Add</span>
                  </SelectTrigger>
                  <SelectContent>
                    {MARKET_FEED_SYMBOLS.filter(symbol => 
                      !watchlist.some(item => item.symbol === symbol)
                    ).map(symbol => (
                      <SelectItem key={symbol} value={symbol}>
                        {symbol} - {getSymbolInfo(symbol).displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-3">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))
                ) : (
                  watchlistData.map((item, index) => {
                    const sentiment = sentimentData.find(s => s.symbol === item.symbol);
                    const isPositive = item.changeAbs >= 0;
                    
                    return (
                      <motion.div
                        key={item.symbol}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{item.symbol}</span>
                              {sentiment && getSentimentBadge(sentiment)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {getSymbolInfo(item.symbol).displayName}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-semibold">
                            ${item.price.toFixed(2)}
                          </div>
                          <div className={`text-sm flex items-center gap-1 ${
                            isPositive ? 'text-success' : 'text-destructive'
                          }`}>
                            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {isPositive ? '+' : ''}{item.changePct.toFixed(2)}%
                          </div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromWatchlist(item.symbol)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Star className="w-4 h-4 fill-current" />
                        </Button>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </TabsContent>

            <TabsContent value="market" className="space-y-4">
              <h3 className="font-semibold">Market Overview</h3>
              <div className="grid gap-3">
                {(loading ? Array.from({ length: 6 }) : filteredData).map((item: any, index) => {
                  if (loading) {
                    return <Skeleton key={index} className="h-16 w-full" />;
                  }
                  
                  const isPositive = item.changeAbs >= 0;
                  const isInWatchlist = watchlist.some(w => w.symbol === item.symbol);
                  
                  return (
                    <motion.div
                      key={item.symbol}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{item.symbol}</span>
                            <Badge variant="outline" className="text-xs">
                              Vol: {((item.volume || 0) / 1000000).toFixed(1)}M
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {getSymbolInfo(item.symbol).displayName}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-semibold">
                          ${item.price.toFixed(2)}
                        </div>
                        <div className={`text-sm flex items-center gap-1 ${
                          isPositive ? 'text-success' : 'text-destructive'
                        }`}>
                          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {isPositive ? '+' : ''}{item.changePct.toFixed(2)}%
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => isInWatchlist ? removeFromWatchlist(item.symbol) : addToWatchlist(item.symbol)}
                        className={isInWatchlist ? "text-primary" : "text-muted-foreground"}
                      >
                        <Star className={`w-4 h-4 ${isInWatchlist ? 'fill-current' : ''}`} />
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="sentiment" className="space-y-4">
              <h3 className="font-semibold">Market Sentiment Analysis</h3>
              <div className="grid gap-3">
                {sentimentData.map((sentiment, index) => (
                  <motion.div
                    key={sentiment.symbol}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{sentiment.symbol}</span>
                          {getSentimentBadge(sentiment)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Based on {sentiment.sources} sources
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {sentiment.sources} analysts
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="news" className="space-y-4">
              <h3 className="font-semibold">Market News & Insights</h3>
              <div className="space-y-4">
                {newsData.map((news, index) => (
                  <motion.div
                    key={news.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-muted/30 rounded-lg border hover:border-primary/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      {getNewsIcon(news.sentiment)}
                      <div className="flex-1">
                        <h4 className="font-medium mb-2">{news.title}</h4>
                        <p className="text-sm text-muted-foreground mb-3">{news.summary}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{news.source}</span>
                            <span className="text-xs text-muted-foreground">
                              {news.publishedAt.toLocaleDateString()}
                            </span>
                          </div>
                          
                          <div className="flex gap-1">
                            {news.relevantSymbols.map(symbol => (
                              <Badge key={symbol} variant="outline" className="text-xs">
                                {symbol}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
};