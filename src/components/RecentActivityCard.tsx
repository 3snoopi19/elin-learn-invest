import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  FileText, 
  Brain, 
  BarChart3, 
  Clock, 
  Filter,
  Play,
  Eye,
  PlusCircle,
  Settings
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

// Mock activity data
const activityData = [
  {
    id: 1,
    type: "investment",
    action: "Portfolio Rebalancing",
    description: "Adjusted allocation: +5% NVDA, -3% TSLA",
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    icon: BarChart3,
    iconColor: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    amount: "+$2,350"
  },
  {
    id: 2,
    type: "ai_insight",
    action: "AI Risk Analysis",
    description: "Market volatility increased, suggesting defensive positioning",
    timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
    icon: Brain,
    iconColor: "text-cyan-400",
    bgColor: "bg-cyan-500/10"
  },
  {
    id: 3,
    type: "filing",
    action: "SEC Filing Reviewed",
    description: "Apple Inc. (AAPL) - Form 10-K Annual Report",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    icon: FileText,
    iconColor: "text-blue-400",
    bgColor: "bg-blue-500/10"
  },
  {
    id: 4,
    type: "investment",
    action: "Scenario Simulation",
    description: "Tested \"Market Correction\" scenario with 85% confidence",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    icon: Play,
    iconColor: "text-purple-400",
    bgColor: "bg-purple-500/10"
  },
  {
    id: 5,
    type: "ai_insight",
    action: "ELIN Recommendation",
    description: "Suggested increasing bond allocation for stability",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
    icon: Brain,
    iconColor: "text-cyan-400",
    bgColor: "bg-cyan-500/10"
  },
  {
    id: 6,
    type: "filing",
    action: "Earnings Report",
    description: "Microsoft Corp. (MSFT) - Q4 2024 Earnings Call",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
    icon: Eye,
    iconColor: "text-blue-400",
    bgColor: "bg-blue-500/10"
  },
  {
    id: 7,
    type: "investment",
    action: "New Position Added",
    description: "Initiated position in Clean Energy ETF (ICLN)",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    icon: PlusCircle,
    iconColor: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    amount: "+$5,000"
  }
];

const filterTabs = [
  { id: "all", label: "All", count: activityData.length },
  { id: "investment", label: "Investments", count: activityData.filter(a => a.type === "investment").length },
  { id: "filing", label: "Filings", count: activityData.filter(a => a.type === "filing").length },
  { id: "ai_insight", label: "AI Insights", count: activityData.filter(a => a.type === "ai_insight").length }
];

export const RecentActivityCard = () => {
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredActivities = activeFilter === "all" 
    ? activityData 
    : activityData.filter(activity => activity.type === activeFilter);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl">
        {/* Neon glow border */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-400/20 via-blue-400/20 to-violet-400/20 rounded-lg blur-sm" />
        <div className="absolute inset-[1px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-lg" />
        
        <CardHeader className="relative pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-500/20 rounded-lg">
                <Clock className="w-5 h-5 text-violet-400" />
              </div>
              <CardTitle className="text-xl font-bold text-text-heading">Recent Activity</CardTitle>
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-slate-400 text-sm">Filter</span>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mt-4">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeFilter === tab.id
                    ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/25'
                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                {tab.label}
                <Badge 
                  variant="secondary" 
                  className={`ml-2 text-xs ${
                    activeFilter === tab.id 
                      ? 'bg-white/20 text-white' 
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {tab.count}
                </Badge>
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="relative max-h-96 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              {filteredActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative p-4 rounded-lg bg-slate-800/30 border border-slate-700/30 hover:bg-slate-700/40 hover:border-slate-600/50 transition-all duration-200 cursor-pointer"
                >
                  {/* Hover glow effect */}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative flex items-start gap-4">
                    {/* Icon */}
                    <div className={`p-2 rounded-lg ${activity.bgColor} flex-shrink-0`}>
                      <activity.icon className={`w-5 h-5 ${activity.iconColor}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-white font-semibold text-sm mb-1 group-hover:text-blue-100 transition-colors">
                            {activity.action}
                          </h4>
                          <p className="text-slate-400 text-sm leading-relaxed">
                            {activity.description}
                          </p>
                        </div>
                        
                        {activity.amount && (
                          <div className="text-emerald-400 font-semibold text-sm ml-4 flex-shrink-0">
                            {activity.amount}
                          </div>
                        )}
                      </div>

                      {/* Timestamp */}
                      <div className="flex items-center gap-2 mt-3">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span className="text-slate-500 text-xs">
                          {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {filteredActivities.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-slate-400"
            >
              <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No activities found for this filter</p>
            </motion.div>
          )}
        </CardContent>
      </Card>

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
          background: rgba(139, 92, 246, 0.5);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.7);
        }
      `}</style>
    </motion.div>
  );
};