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
      <div className="bg-slate-900/80 border-y border-slate-700/50 py-2 overflow-hidden">
        <div className="flex space-x-8 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-2 text-sm">
              <div className="w-12 h-4 bg-slate-700 rounded"></div>
              <div className="w-16 h-4 bg-slate-700 rounded"></div>
              <div className="w-12 h-4 bg-slate-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/80 border-y border-slate-700/50 py-2 overflow-hidden relative">
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
              className="flex items-center space-x-2 text-sm whitespace-nowrap"
            >
              <span className="font-semibold text-white">{quote.symbol}</span>
              <span className="text-slate-300">
                ${quote.price.toFixed(2)}
              </span>
              <div className={`flex items-center space-x-1 ${
                isPositive ? 'text-emerald-400' : isNegative ? 'text-red-400' : 'text-slate-400'
              }`}>
                {isPositive && <TrendingUp className="w-3 h-3" />}
                {isNegative && <TrendingDown className="w-3 h-3" />}
                <span>
                  {isPositive ? '+' : ''}{quote.changePct.toFixed(2)}%
                </span>
              </div>
            </div>
          );
        })}
      </motion.div>
      
      {/* Gradient fades */}
      <div className="absolute left-0 top-0 w-8 h-full bg-gradient-to-r from-slate-900 to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 w-8 h-full bg-gradient-to-l from-slate-900 to-transparent pointer-events-none" />
    </div>
  );
};
