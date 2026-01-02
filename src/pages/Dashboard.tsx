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
import { HabitStackCard } from "@/components/gamification/HabitStackCard";
import { DailyBriefingModal } from "@/components/feed/DailyBriefingModal";
import { DidYouKnowCard } from "@/components/feed/DidYouKnowCard";
import { MobileDashboardHero } from "@/components/mobile/MobileDashboardHero";
import { useIsMobile } from "@/hooks/use-mobile";
import { MessageSquare, Repeat, PiggyBank, Settings, Sparkles, BookOpen, CreditCard } from "lucide-react";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [showBriefing, setShowBriefing] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

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
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Desktop Header */}
      <div className="hidden md:block">
        <Header />
      </div>
      
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto w-full">
        <main className="mobile-container px-4 md:px-8 pt-6 md:py-8 pb-40 md:pb-8">
          {/* Daily Briefing Modal */}
          <DailyBriefingModal isOpen={showBriefing} onClose={() => setShowBriefing(false)} />

          {/* Hero Greeting */}
          <div className="mb-6 md:mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1 text-center md:text-left">
                <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-text-heading via-primary to-text-secondary bg-clip-text text-transparent">
                  Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user.user_metadata?.first_name || 'there'}!
                </h1>
                <p className="text-base text-text-secondary">
                  Financial Command Center
                </p>
              </div>
              
              {/* Daily Briefing Button - Instagram Story Ring Style */}
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowBriefing(true)}
                className="relative flex items-center gap-3 group mx-auto md:mx-0"
              >
                {/* Story Ring - Gradient Border */}
                <div className="relative">
                  <div className="absolute -inset-0.5 rounded-full bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 animate-pulse" />
                  <div className="relative w-12 h-12 rounded-full bg-card flex items-center justify-center border-2 border-background">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  {/* New indicator dot */}
                  <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-gradient-to-r from-amber-500 to-pink-500 border-2 border-background" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Daily Briefing</p>
                  <p className="text-xs text-muted-foreground">Tap to play</p>
                </div>
              </motion.button>
            </div>
          </div>

          {/* Mobile Hero - Progress Rings and Big Numbers */}
          {isMobile && !cardsLoading && (
            <div className="mb-5">
              <MobileDashboardHero animationDelay={0.05} />
            </div>
          )}

          {/* Mobile Quick Swipe CTA */}
          {isMobile && !cardsLoading && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onClick={() => navigate('/swipe')}
              className="w-full mb-8 p-4 bg-gradient-to-r from-primary to-primary/80 rounded-3xl flex items-center justify-between shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-white">Daily Swipe</p>
                  <p className="text-sm text-white/80">Review 5 transactions</p>
                </div>
              </div>
              <div className="text-2xl">👉</div>
            </motion.button>
          )}

          {/* Spend Defense + Habit Stack Row - Hidden on mobile */}
          <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
            <div>
              {cardsLoading ? <SkeletonLoader variant="card" /> : <SpendDefenseBar dailyBudget={80} spentToday={0} streakDays={3} animationDelay={0} />}
            </div>
            <div>
              {cardsLoading ? <SkeletonLoader variant="card" /> : <HabitStackCard animationDelay={0.05} />}
            </div>
          </div>

          {/* Main Dashboard Grid - Hide complex cards on mobile */}
          <div className="hidden md:grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
            <div className="lg:col-span-2">
              {cardsLoading ? <SkeletonLoader variant="card" /> : <NetWorthCard animationDelay={0.1} />}
            </div>
            <div className="lg:col-span-1">
              {cardsLoading ? <SkeletonLoader variant="card" /> : <CashFlowCard animationDelay={0.2} />}
            </div>
          </div>

          {/* Goal Visualization - Hidden on mobile */}
          <div className="hidden md:block mb-6">
            {cardsLoading ? <SkeletonLoader variant="chart" /> : <GoalVisualization animationDelay={0.3} />}
          </div>

          {/* Secondary Row - Hidden on mobile */}
          <div className="hidden md:grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
            {cardsLoading ? <SkeletonLoader variant="chart" /> : <PredictiveBalanceCard animationDelay={0.4} />}
            <div className="lg:col-span-1">
              {cardsLoading ? <SkeletonLoader variant="card" /> : <SpendingAnomaliesCard animationDelay={0.5} />}
            </div>
          </div>

          {/* Did You Know Card - Visible on mobile */}
          <div className="mb-8">
            {cardsLoading ? <SkeletonLoader variant="card" /> : <DidYouKnowCard animationDelay={0.55} />}
          </div>

          {/* Transactions Feed - Visible on mobile */}
          <div className="mb-8">
            {cardsLoading ? <SkeletonLoader variant="list" /> : <TransactionsFeed animationDelay={0.6} />}
          </div>

          {/* Quick Actions - Hide on mobile */}
          <div className="hidden md:grid grid-cols-2 md:grid-cols-5 gap-3 pb-8">
            {[
              { title: "Chat with ELIN", icon: MessageSquare, route: "/chat", color: "from-primary/20 to-primary/5" },
              { title: "Subscriptions", icon: Repeat, route: "/subscriptions", color: "from-secondary/20 to-secondary/5" },
              { title: "Savings Goals", icon: PiggyBank, route: "/money-flow", color: "from-success/20 to-success/5" },
              { title: "Resources", icon: BookOpen, route: "/resources", color: "from-amber-500/20 to-amber-600/5" },
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
        
        {/* Desktop Footer */}
        <div className="hidden md:block">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
