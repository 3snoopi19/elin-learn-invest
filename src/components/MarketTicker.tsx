import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { getSymbolInfo } from "@/lib/market/symbols";
import { TrendingUp, TrendingDown } from "lucide-react";

interface TickerQuote {
  symbol: string;
  price: number;
  changePct: number;
  direction: 'up' | 'down' | 'unchanged';
}

export const MarketTicker = () => {
  const [quotes, setQuotes] = useState<TickerQuote[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickerData = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('market-ticker');
      
      if (error) throw error;
      
      if (data?.quotes) {
        setQuotes(data.quotes);
      }
    } catch (error) {
      console.error('Error fetching ticker data:', error);
      // Set fallback data or keep empty
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickerData();
    const interval = setInterval(fetchTickerData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  if (loading || quotes.length === 0) {
    return (
      <div className="bg-card/80 backdrop-blur border-y border-border/50 py-3 overflow-hidden">
        <div className="flex space-x-8 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-3 text-sm">
              <div className="w-12 h-4 bg-muted rounded"></div>
              <div className="w-16 h-4 bg-muted rounded"></div>
              <div className="w-12 h-4 bg-muted rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card/80 backdrop-blur border-y border-border/50 py-3 overflow-hidden relative">
      <motion.div
        className="flex space-x-8"
        animate={{ x: [0, -50] }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        {[...quotes, ...quotes].map((quote, index) => {
          const symbolInfo = getSymbolInfo(quote.symbol);
          const isPositive = quote.changePct > 0;
          const isNegative = quote.changePct < 0;
          
          return (
            <div 
              key={`${quote.symbol}-${index}`}
              className="flex items-center space-x-3 text-sm whitespace-nowrap"
            >
              <span className="font-semibold text-text-heading">{quote.symbol}</span>
              <span className="text-text-body">
                ${quote.price.toFixed(2)}
              </span>
              <div className={`flex items-center space-x-1 ${
                isPositive ? 'text-success' : isNegative ? 'text-destructive' : 'text-text-muted'
              }`}>
                {isPositive && <TrendingUp className="w-3 h-3" />}
                {isNegative && <TrendingDown className="w-3 h-3" />}
                <span className="font-medium">
                  {isPositive ? '+' : ''}{quote.changePct.toFixed(2)}%
                </span>
              </div>
            </div>
          );
        })}
      </motion.div>
      
      {/* Gradient fades */}
      <div className="absolute left-0 top-0 w-8 h-full bg-gradient-to-r from-background to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 w-8 h-full bg-gradient-to-l from-background to-transparent pointer-events-none" />
    </div>
  );
};
