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
    iconColor: "text-success",
    bgColor: "bg-success/10",
    amount: "+$2,350"
  },
  {
    id: 2,
    type: "ai_insight",
    action: "AI Risk Analysis",
    description: "Market volatility increased, suggesting defensive positioning",
    timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
    icon: Brain,
    iconColor: "text-accent",
    bgColor: "bg-accent/10"
  },
  {
    id: 3,
    type: "filing",
    action: "SEC Filing Reviewed",
    description: "Apple Inc. (AAPL) - Form 10-K Annual Report",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    icon: FileText,
    iconColor: "text-primary",
    bgColor: "bg-primary/10"
  },
  {
    id: 4,
    type: "investment",
    action: "Scenario Simulation",
    description: "Tested \"Market Correction\" scenario with 85% confidence",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    icon: Play,
    iconColor: "text-education",
    bgColor: "bg-education/10"
  },
  {
    id: 5,
    type: "ai_insight",
    action: "ELIN Recommendation",
    description: "Suggested increasing bond allocation for stability",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
    icon: Brain,
    iconColor: "text-accent",
    bgColor: "bg-accent/10"
  },
  {
    id: 6,
    type: "filing",
    action: "Earnings Report",
    description: "Microsoft Corp. (MSFT) - Q4 2024 Earnings Call",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
    icon: Eye,
    iconColor: "text-primary",
    bgColor: "bg-primary/10"
  },
  {
    id: 7,
    type: "investment",
    action: "New Position Added",
    description: "Initiated position in Clean Energy ETF (ICLN)",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    icon: PlusCircle,
    iconColor: "text-success",
    bgColor: "bg-success/10",
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
      <Card className="professional-card overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-xl font-bold text-text-heading">Recent Activity</CardTitle>
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-text-muted" />
              <span className="text-text-muted text-sm">Filter</span>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeFilter === tab.id
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'bg-muted text-text-secondary hover:bg-muted/80 hover:text-text-heading'
                }`}
              >
                {tab.label}
                <Badge 
                  variant="secondary" 
                  className={`ml-2 text-xs ${
                    activeFilter === tab.id 
                      ? 'bg-primary-foreground/20 text-primary-foreground' 
                      : 'bg-background text-text-secondary'
                  }`}
                >
                  {tab.count}
                </Badge>
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="relative max-h-96 overflow-y-auto mobile-scroll">
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
                  className="group relative p-4 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 hover:border-border transition-all duration-200 cursor-pointer"
                >
                  {/* Hover glow effect */}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative flex items-start gap-4">
                    {/* Icon */}
                    <div className={`p-2 rounded-lg ${activity.bgColor} flex-shrink-0`}>
                      <activity.icon className={`w-5 h-5 ${activity.iconColor}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-text-heading font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
                            {activity.action}
                          </h4>
                          <p className="text-text-secondary text-sm leading-relaxed">
                            {activity.description}
                          </p>
                        </div>
                        
                        {activity.amount && (
                          <div className="text-success font-semibold text-sm ml-4 flex-shrink-0">
                            {activity.amount}
                          </div>
                        )}
                      </div>

                      {/* Timestamp */}
                      <div className="flex items-center gap-2 mt-3">
                        <Clock className="w-3 h-3 text-text-muted" />
                        <span className="text-text-muted text-xs">
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
              className="text-center py-8 text-text-secondary"
            >
              <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No activities found for this filter</p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};