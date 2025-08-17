import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { getSymbolInfo, DEFAULT_SYMBOLS } from "@/lib/market/symbols";
import { Skeleton } from "@/components/ui/skeleton";

interface MarketQuote {
  symbol: string;
  price: number;
  changePct: number;
  changeAbs: number;
  prevClose: number;
  high: number;
  low: number;
  time: number;
}

interface MarketFeedData {
  quotes: MarketQuote[];
  errors?: any[];
  timestamp: number;
}

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

// Individual ticker item
const TickerItem = ({ data, index }: { data: MarketQuote, index: number }) => {
  const isPositive = data.changeAbs >= 0;
  const isUnchanged = data.changeAbs === 0;
  const symbolInfo = getSymbolInfo(data.symbol);
  
  return (
    <motion.div
      className={`flex-shrink-0 bg-slate-800/40 backdrop-blur-sm rounded-lg p-4 border border-slate-700/30 min-w-[280px] mx-2 ${
        isPositive ? 'shadow-emerald-500/10' : isUnchanged ? 'shadow-slate-500/10' : 'shadow-red-500/10'
      } shadow-lg hover:scale-105 transition-transform duration-200`}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-bold text-white text-lg">{data.symbol}</span>
            <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
              isPositive 
                ? 'bg-emerald-500/20 text-emerald-400' 
                : isUnchanged 
                ? 'bg-slate-500/20 text-slate-400'
                : 'bg-red-500/20 text-red-400'
            }`}>
              {!isUnchanged && (isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />)}
              {isPositive ? '+' : ''}{data.changePct.toFixed(2)}%
            </div>
          </div>
          
          <div className="text-slate-400 text-sm mb-2 truncate">{symbolInfo.displayName}</div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white text-xl font-semibold">
                ${data.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className={`text-sm ${
                isPositive ? 'text-emerald-400' : isUnchanged ? 'text-slate-400' : 'text-red-400'
              }`}>
                {isPositive ? '+' : ''}{data.changeAbs.toFixed(2)}
              </div>
            </div>
            
            <div className="ml-4">
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
  <div className="flex-shrink-0 bg-slate-800/40 backdrop-blur-sm rounded-lg p-4 border border-slate-700/30 min-w-[280px] mx-2">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <Skeleton className="h-6 w-16 bg-slate-700" />
          <Skeleton className="h-6 w-20 bg-slate-700" />
        </div>
        <Skeleton className="h-4 w-32 mb-2 bg-slate-700" />
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-6 w-24 mb-1 bg-slate-700" />
            <Skeleton className="h-4 w-16 bg-slate-700" />
          </div>
          <Skeleton className="h-5 w-15 bg-slate-700" />
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

  const fetchMarketData = async () => {
    try {
      setError(null);
      const { data, error: fetchError } = await supabase.functions.invoke('market-quotes', {
        body: { symbols: DEFAULT_SYMBOLS.join(',') }
      });

      if (fetchError) {
        console.error('Market data fetch error:', fetchError);
        throw new Error(fetchError.message || 'API request failed');
      }

      if (data?.quotes && Array.isArray(data.quotes)) {
        setMarketData(data.quotes);
        setLastUpdated(new Date());
      } else {
        throw new Error('Invalid data format received');
      }
    } catch (err) {
      console.error('Error fetching market data:', err);
      setError('Real-time data temporarily unavailable. Displaying educational placeholders while reconnecting...');
      
      // Show fallback data for educational purposes
      const fallbackData = DEFAULT_SYMBOLS.map((symbol, index) => ({
        symbol,
        price: 150 + Math.random() * 300,
        changePct: (Math.random() - 0.5) * 6,
        changeAbs: (Math.random() - 0.5) * 10,
        prevClose: 145 + Math.random() * 300,
        high: 155 + Math.random() * 300,
        low: 140 + Math.random() * 300,
        time: Date.now() / 1000
      }));
      
      if (!marketData.length) {
        setMarketData(fallbackData);
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and periodic updates
  useEffect(() => {
    fetchMarketData();
    
    const interval = setInterval(fetchMarketData, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll effect
  useEffect(() => {
    if (marketData.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % Math.max(1, marketData.length - 2));
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [marketData.length]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl">
        {/* Neon glow border */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-blue-400/20 to-cyan-400/20 rounded-lg blur-sm" />
        <div className="absolute inset-[1px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-lg" />
        
        <CardHeader className="relative pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <Activity className="w-5 h-5 text-cyan-400" />
            </div>
            <CardTitle className="text-xl font-bold text-text-heading">Live Market Feed</CardTitle>
            <div className="flex items-center gap-2 ml-auto">
              {error ? (
                <>
                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 text-sm font-medium">Reconnecting...</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-emerald-400 text-sm font-medium">Live</span>
                </>
              )}
            </div>
          </div>
          {lastUpdated && (
            <div className="text-slate-400 text-xs mt-2">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </CardHeader>

        <CardContent className="relative">
          {error && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-4 text-center">
              <span className="text-yellow-400 text-sm">{error}</span>
            </div>
          )}
          
          {/* Scrolling ticker */}
          <div className="relative overflow-hidden">
            <motion.div
              className="flex"
              animate={{ x: loading ? 0 : -currentIndex * 300 }}
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
                <div className="flex-shrink-0 bg-slate-800/40 backdrop-blur-sm rounded-lg p-8 border border-slate-700/30 min-w-[280px] mx-2 text-center">
                  <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <div className="text-slate-400">No market data available</div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Gradient fade edges */}
          <div className="absolute left-0 top-0 w-8 h-full bg-gradient-to-r from-slate-900 to-transparent pointer-events-none z-10" />
          <div className="absolute right-0 top-0 w-8 h-full bg-gradient-to-l from-slate-900 to-transparent pointer-events-none z-10" />

          {/* Market status indicators */}
          <div className="flex justify-center gap-6 mt-6 pt-4 border-t border-slate-700/30">
            <div className="text-center">
              <div className="text-emerald-400 text-lg font-bold">+1,247</div>
              <div className="text-slate-400 text-xs">Gainers</div>
            </div>
            <div className="text-center">
              <div className="text-red-400 text-lg font-bold">-892</div>
              <div className="text-slate-400 text-xs">Losers</div>
            </div>
            <div className="text-center">
              <div className="text-slate-400 text-lg font-bold">2,156</div>
              <div className="text-slate-400 text-xs">Unchanged</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};