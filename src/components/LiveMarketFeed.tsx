import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { motion } from "framer-motion";

// Mock market data
const marketData = [
  { symbol: "AAPL", name: "Apple Inc.", price: 192.53, change: 2.45, changePercent: 1.29 },
  { symbol: "GOOGL", name: "Alphabet Inc.", price: 140.07, change: -1.23, changePercent: -0.87 },
  { symbol: "MSFT", name: "Microsoft Corp.", price: 378.85, change: 4.32, changePercent: 1.15 },
  { symbol: "TSLA", name: "Tesla Inc.", price: 248.50, change: -3.67, changePercent: -1.45 },
  { symbol: "AMZN", name: "Amazon.com Inc.", price: 153.40, change: 1.85, changePercent: 1.22 },
  { symbol: "NVDA", name: "NVIDIA Corp.", price: 735.20, change: 12.45, changePercent: 1.72 },
  { symbol: "BTC", name: "Bitcoin", price: 43250.00, change: 850.30, changePercent: 2.01 },
  { symbol: "ETH", name: "Ethereum", price: 2650.75, change: -45.25, changePercent: -1.68 },
  { symbol: "META", name: "Meta Platforms", price: 486.91, change: 8.23, changePercent: 1.72 },
  { symbol: "NFLX", name: "Netflix Inc.", price: 485.30, change: -2.15, changePercent: -0.44 }
];

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
const TickerItem = ({ data, index }: { data: typeof marketData[0], index: number }) => {
  const isPositive = data.change >= 0;
  const isUnchanged = data.change === 0;
  
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
              {isPositive ? '+' : ''}{data.changePercent}%
            </div>
          </div>
          
          <div className="text-slate-400 text-sm mb-2 truncate">{data.name}</div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white text-xl font-semibold">
                ${data.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className={`text-sm ${
                isPositive ? 'text-emerald-400' : isUnchanged ? 'text-slate-400' : 'text-red-400'
              }`}>
                {isPositive ? '+' : ''}{data.change.toFixed(2)}
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

export const LiveMarketFeed = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-scroll effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % (marketData.length - 2));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

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
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-emerald-400 text-sm font-medium">Live</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative">
          {/* Scrolling ticker */}
          <div className="relative overflow-hidden">
            <motion.div
              className="flex"
              animate={{ x: -currentIndex * 300 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              {marketData.map((item, index) => (
                <TickerItem key={item.symbol} data={item} index={index} />
              ))}
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