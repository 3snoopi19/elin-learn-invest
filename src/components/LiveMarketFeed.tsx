import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity, AlertCircle, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { getSymbolInfo } from "@/lib/market/symbols";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface MarketQuote {
  symbol: string;
  price: number;
  changePct: number;
  changeAbs: number;
  prevClose: number;
  time: number;
}

// Environment configuration
const ENABLE_MARKET_WS = false; // Disabled as per requirements
const MARKET_FEED_REFRESH_SEC = 30;
const MARKET_FEED_SYMBOLS = ['MSFT', 'TSLA', 'AAPL', 'SPY'];

// Mini sparkline component
const MiniSparkline = ({ isPositive }: { isPositive: boolean }) => {
  const points = isPositive 
    ? "M0,20 Q10,15 20,10 T40,8 T60,5"
    : "M0,5 Q10,8 20,12 T40,15 T60,20";
  
  return (
    <svg width="60" height="20" className="opacity-80">
      <path
        d={points}
        stroke={isPositive ? "#16a34a" : "#ef4444"}
        strokeWidth="1.5"
        fill="none"
        className="drop-shadow-sm"
      />
    </svg>
  );
};

// Individual ticker item - Mobile optimized
const TickerItem = ({ data, index }: { data: MarketQuote, index: number }) => {
  const isPositive = data.changeAbs >= 0;
  const isUnchanged = data.changeAbs === 0;
  const symbolInfo = getSymbolInfo(data.symbol);
  
  // Use specified colors: green (#16a34a) for up, red (#dc2626) for down
  const positiveColor = '#16a34a';
  const negativeColor = '#dc2626';
  
  return (
    <motion.div
      className={`flex-shrink-0 bg-card/60 backdrop-blur-sm rounded-lg p-3 md:p-4 border border-border/50 min-w-[240px] md:min-w-[280px] mx-1 md:mx-2 shadow-lg hover:scale-105 transition-transform duration-200 glass-effect`}
      style={{
        boxShadow: isPositive 
          ? `0 4px 6px -1px ${positiveColor}10` 
          : isUnchanged 
          ? '0 4px 6px -1px rgba(71, 85, 105, 0.1)' 
          : `0 4px 6px -1px ${negativeColor}10`
      }}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 md:gap-3 mb-2">
            <span className="font-bold text-foreground text-base md:text-lg">{data.symbol}</span>
            <div 
              className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
              style={{
                backgroundColor: isPositive 
                  ? `${positiveColor}20` 
                  : isUnchanged 
                  ? 'rgba(71, 85, 105, 0.2)'
                  : `${negativeColor}20`,
                color: isPositive 
                  ? positiveColor 
                  : isUnchanged 
                  ? 'rgb(148, 163, 184)'
                  : negativeColor
              }}
            >
              {!isUnchanged && (isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />)}
              {isPositive ? '+' : ''}{data.changePct.toFixed(2)}%
            </div>
          </div>
          
          <div className="text-muted-foreground text-xs md:text-sm mb-2 truncate">{symbolInfo.displayName}</div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="text-foreground text-lg md:text-xl font-semibold">
                ${data.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div 
                className="text-xs md:text-sm"
                style={{
                  color: isPositive 
                    ? positiveColor 
                    : isUnchanged 
                    ? 'rgb(148, 163, 184)'
                    : negativeColor
                }}
              >
                {isPositive ? '+' : ''}{data.changeAbs.toFixed(2)}
              </div>
            </div>
            
            <div className="ml-3 md:ml-4">
              <MiniSparkline isPositive={isPositive} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Loading skeleton for ticker items
const TickerSkeleton = () => (
  <div className="flex-shrink-0 bg-card/60 backdrop-blur-sm rounded-lg p-4 border border-border/50 min-w-[280px] mx-2 glass-effect">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <Skeleton className="h-6 w-16 bg-muted" />
          <Skeleton className="h-6 w-20 bg-muted" />
        </div>
        <Skeleton className="h-4 w-32 mb-2 bg-muted" />
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-6 w-24 mb-1 bg-muted" />
            <Skeleton className="h-4 w-16 bg-muted" />
          </div>
          <Skeleton className="h-5 w-15 bg-muted" />
        </div>
      </div>
    </div>
  </div>
);

export const LiveMarketFeed = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [marketData, setMarketData] = useState<MarketQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [nextRetryIn, setNextRetryIn] = useState<number>(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const fetchMarketData = useCallback(async () => {
    try {
      setError(null);
      setIsRetrying(true);
      
      // Diagnostic logging for preview env
      if (process.env.NODE_ENV === 'development') {
        console.log('Fetching market data for symbols:', MARKET_FEED_SYMBOLS.join(','));
      }
      
      const { data, error: fetchError } = await supabase.functions.invoke('market-quotes', {
        body: { symbols: MARKET_FEED_SYMBOLS.join(',') }
      });

      // Diagnostic logging
      if (process.env.NODE_ENV === 'development') {
        console.log('Market data response status:', fetchError ? 'error' : 'success');
        console.log('Response preview:', JSON.stringify(data).substring(0, 20) + '...');
      }

      if (fetchError) {
        console.error('Market data fetch error:', fetchError);
        throw new Error(fetchError.message || 'Market data service unavailable');
      }

      if (data && Array.isArray(data) && data.length > 0) {
        setMarketData(data);
        setLastUpdated(new Date());
        setNextRetryIn(0);
        setError(null);
      } else {
        throw new Error('No market data available');
      }
    } catch (err) {
      console.error('Error fetching market data:', err);
      
      // Show more user-friendly error messages
      const errorMessage = err instanceof Error ? err.message : 'Connection failed';
      setError(`${errorMessage} — next refresh in ${MARKET_FEED_REFRESH_SEC}s`);
      
      // Start countdown for next retry
      setNextRetryIn(MARKET_FEED_REFRESH_SEC);
      
      // Show fallback educational data if no real data exists
      if (!marketData.length) {
        const fallbackData = MARKET_FEED_SYMBOLS.map((symbol, index) => ({
          symbol,
          price: 150 + Math.random() * 300,
          changePct: (Math.random() - 0.5) * 6,
          changeAbs: (Math.random() - 0.5) * 10,
          prevClose: 145 + Math.random() * 300,
          time: Date.now() / 1000
        }));
        setMarketData(fallbackData);
        setError('Using sample data for educational purposes');
      }
    } finally {
      setLoading(false);
      setIsRetrying(false);
    }
  }, [marketData.length]);

  // Countdown timer for retry
  useEffect(() => {
    if (nextRetryIn > 0) {
      const timer = setTimeout(() => {
        setNextRetryIn(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (nextRetryIn === 0 && error) {
      // Auto retry when countdown reaches 0
      fetchMarketData();
    }
  }, [nextRetryIn, error, fetchMarketData]);

  // Initial fetch and periodic updates (REST polling)
  useEffect(() => {
    if (!ENABLE_MARKET_WS) {
      fetchMarketData();
      
      const interval = setInterval(fetchMarketData, MARKET_FEED_REFRESH_SEC * 1000);
      return () => clearInterval(interval);
    }
  }, [fetchMarketData]);

  // Auto-scroll effect
  useEffect(() => {
    if (marketData.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % Math.max(1, marketData.length - 2));
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [marketData.length]);

  const handleRefreshNow = () => {
    setNextRetryIn(0);
    setError(null);
    fetchMarketData();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="relative overflow-hidden border-0 neon-card">
        {/* Neon glow border */}
        <div className="absolute inset-0 bg-gradient-to-r from-accent/20 via-education/20 to-accent/20 rounded-lg blur-sm" />
        <div className="absolute inset-[1px] bg-card rounded-lg" />
        
        <CardHeader className="relative pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/20 rounded-lg">
              <Activity className="w-5 h-5 text-accent" />
            </div>
            <CardTitle className="text-xl font-bold text-text-heading">Live Market Feed</CardTitle>
            <div className="flex items-center gap-2 ml-auto">
              {error ? (
                <>
                  <AlertCircle className="w-4 h-4 text-warning" />
                  <span className="text-warning text-sm font-medium">
                    Error {nextRetryIn > 0 ? `(${nextRetryIn}s)` : ''}
                  </span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                  <span className="text-success text-sm font-medium">Live</span>
                </>
              )}
            </div>
          </div>
          {lastUpdated && (
            <div className="text-muted-foreground text-xs mt-2">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </CardHeader>

        <CardContent className="relative">
          {error && (
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-warning text-sm">{error}</span>
                <Button 
                  onClick={handleRefreshNow}
                  size="sm"
                  variant="outline"
                  className="h-7 px-3 text-xs border-warning/20 text-warning hover:bg-warning/10"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Refresh now
                </Button>
              </div>
            </div>
          )}
          
          {/* FINNHUB_API_KEY missing warning for preview builds */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-warning" />
                <span className="text-warning text-sm">
                  Preview mode: Using sample data. FINNHUB_API_KEY required for live data.
                </span>
              </div>
            </div>
          )}
          
      {/* Scrolling ticker - Mobile optimized */}
      <div className="relative overflow-hidden">
        <motion.div
          className="flex"
          animate={{ x: loading ? 0 : -currentIndex * 260 }} // Reduced width for mobile
          transition={{ duration: 0.8, ease: "easeInOut" }}
          aria-live="polite"
          aria-label="Live market data feed"
        >
          {loading ? (
            // Show loading skeletons
            Array.from({ length: 4 }).map((_, index) => (
              <TickerSkeleton key={`skeleton-${index}`} />
            ))
          ) : marketData.length > 0 ? (
            marketData.map((item, index) => (
              <TickerItem key={item.symbol} data={item} index={index} />
            ))
          ) : (
            <div className="flex-shrink-0 bg-card/60 backdrop-blur-sm rounded-lg p-6 md:p-8 border border-border/50 min-w-[240px] md:min-w-[280px] mx-2 text-center glass-effect">
              <AlertCircle className="w-6 h-6 md:w-8 md:h-8 text-muted-foreground mx-auto mb-2" />
              <div className="text-muted-foreground text-sm md:text-base">No market data available</div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Gradient fade edges */}
      <div className="absolute left-0 top-0 w-6 md:w-8 h-full bg-gradient-to-r from-card to-transparent pointer-events-none z-10" />
      <div className="absolute right-0 top-0 w-6 md:w-8 h-full bg-gradient-to-l from-card to-transparent pointer-events-none z-10" />

      {/* Market status indicators - Mobile responsive */}
      <div className="grid grid-cols-3 gap-4 md:gap-6 mt-4 md:mt-6 pt-4 border-t border-border/30">
        <div className="text-center">
          <div className="text-success text-base md:text-lg font-bold">+1,247</div>
          <div className="text-muted-foreground text-xs">Gainers</div>
        </div>
        <div className="text-center">
          <div className="text-destructive text-base md:text-lg font-bold">-892</div>
          <div className="text-muted-foreground text-xs">Losers</div>
        </div>
        <div className="text-center">
          <div className="text-muted-foreground text-base md:text-lg font-bold">2,156</div>
          <div className="text-muted-foreground text-xs">Unchanged</div>
        </div>
      </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};