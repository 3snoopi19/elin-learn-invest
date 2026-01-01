import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { NetWorthCard } from "@/components/finance/NetWorthCard";
import { CashFlowCard } from "@/components/finance/CashFlowCard";
import { TransactionsFeed } from "@/components/finance/TransactionsFeed";
import { SpendingAnomaliesCard } from "@/components/finance/SpendingAnomaliesCard";
import { PredictiveBalanceCard } from "@/components/finance/PredictiveBalanceCard";
import { SpendDefenseBar } from "@/components/gamification/SpendDefenseBar";
import { GoalVisualization } from "@/components/gamification/GoalVisualization";
import { DailyBriefingModal } from "@/components/feed/DailyBriefingModal";
import { MessageSquare, Repeat, PiggyBank, Settings, Sparkles } from "lucide-react";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [showBriefing, setShowBriefing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (searchParams.get('setup_completed') === 'true') {
      toast({
        title: "🎉 Setup Complete!",
        description: "Your accounts are connected. Let's start saving money!",
      });
    }
  }, [searchParams, toast]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        if (error) throw error;
        setUserProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setTimeout(() => setCardsLoading(false), 600);
      }
    };
    fetchProfile();
  }, [user]);

  if (loading) {
    return <LoadingScreen message="Loading your finances..." showLogo={true} />;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="mobile-content mobile-container py-4 md:py-8 pb-32 md:pb-8">
        {/* Daily Briefing Modal */}
        <DailyBriefingModal isOpen={showBriefing} onClose={() => setShowBriefing(false)} />

        {/* Hero Greeting */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-text-heading via-primary to-text-secondary bg-clip-text text-transparent">
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user.user_metadata?.first_name || 'there'}!
              </h1>
              <p className="text-base text-text-secondary">
                Here's your financial command center
              </p>
            </div>
            
            {/* Daily Briefing Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowBriefing(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 hover:border-primary/50 transition-all group"
            >
              <Sparkles className="w-5 h-5 text-primary group-hover:animate-pulse" />
              <span className="font-medium text-primary">Daily Briefing</span>
            </motion.button>
          </div>
        </div>

        {/* Spend Defense Health Bar - Gamification */}
        <div className="mb-6">
          {cardsLoading ? <SkeletonLoader variant="card" /> : <SpendDefenseBar dailyBudget={80} spentToday={0} streakDays={3} animationDelay={0} />}
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
          {/* Net Worth - Takes 2 cols on large */}
          <div className="lg:col-span-2">
            {cardsLoading ? <SkeletonLoader variant="card" /> : <NetWorthCard animationDelay={0.1} />}
          </div>
          
          {/* Cash Flow */}
          <div className="lg:col-span-1">
            {cardsLoading ? <SkeletonLoader variant="card" /> : <CashFlowCard animationDelay={0.2} />}
          </div>
        </div>

        {/* Goal Visualization - Gamification */}
        <div className="mb-6">
          {cardsLoading ? <SkeletonLoader variant="chart" /> : <GoalVisualization animationDelay={0.3} />}
        </div>

        {/* Secondary Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
          {/* Predictive Balance - Takes 2 cols */}
          {cardsLoading ? <SkeletonLoader variant="chart" /> : <PredictiveBalanceCard animationDelay={0.4} />}
          
          {/* Spending Anomalies */}
          <div className="lg:col-span-1">
            {cardsLoading ? <SkeletonLoader variant="card" /> : <SpendingAnomaliesCard animationDelay={0.5} />}
          </div>
        </div>

        {/* Transactions Feed */}
        <div className="mb-8">
          {cardsLoading ? <SkeletonLoader variant="list" /> : <TransactionsFeed animationDelay={0.6} />}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pb-8">
          {[
            { title: "Chat with ELIN", icon: MessageSquare, route: "/chat", color: "from-primary/20 to-primary/5" },
            { title: "Subscriptions", icon: Repeat, route: "/subscriptions", color: "from-secondary/20 to-secondary/5" },
            { title: "Savings Goals", icon: PiggyBank, route: "/money-flow", color: "from-success/20 to-success/5" },
            { title: "Settings", icon: Settings, route: "/settings", color: "from-muted to-muted/50" },
          ].map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
              className={`professional-card cursor-pointer bg-gradient-to-br ${action.color} p-4 hover:-translate-y-1 transition-transform`}
              onClick={() => navigate(action.route)}
            >
              <div className="flex flex-col items-center text-center gap-2">
                <action.icon className="w-6 h-6 text-primary" />
                <span className="text-sm font-medium text-text-heading">{action.title}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
