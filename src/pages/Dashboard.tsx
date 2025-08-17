import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DASHBOARD_CARDS } from "@/config/dashboard.layout";
import { dedupeCards } from "@/utils/dashboard/dedupe";
import { DashboardCardRenderer } from "@/utils/dashboard/ComponentMapper";
import { motion } from "framer-motion";
const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [userProfile, setUserProfile] = useState<any>(null);
  const { toast } = useToast();

  // Get deduplicated dashboard cards
  const dashboardCards = dedupeCards(DASHBOARD_CARDS);

  // Check if user just completed the quiz
  useEffect(() => {
    if (searchParams.get('quiz_completed') === 'true') {
      toast({
        title: "🎉 Risk Profile Complete!",
        description: "Your personalized investment recommendations are now available.",
      });
    }
  }, [searchParams, toast]);

  // Redirect non-authenticated users
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Fetch user profile data
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
      }
    };

    fetchProfile();
  }, [user]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Live Market Updates Banner */}
      <div className="bg-gradient-to-r from-card/50 to-card/30 border-b border-border/50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-2 text-primary font-medium">
                <div className="w-2 h-2 bg-primary rounded-full live-pulse" />
                Market Open
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="text-foreground">S&P 500: <span className="text-primary">+0.87%</span></span>
              <span className="text-muted-foreground">•</span>
              <span className="text-foreground">NASDAQ: <span className="text-primary">+1.23%</span></span>
              <span className="text-muted-foreground">•</span>
              <span className="text-foreground">BTC: <span className="text-accent">+2.15%</span></span>
            </div>
            <div className="text-xs text-muted-foreground">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Greeting Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user.user_metadata?.first_name || 'Investor'}!
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                Here's your portfolio overview and market insights
              </p>
            </div>
            {!userProfile?.risk_profile && (
              <div className="neon-card p-4">
                <p className="text-sm text-muted-foreground mb-2">Complete your setup</p>
                <button 
                  onClick={() => navigate('/risk-quiz')}
                  className="neon-button-primary text-sm"
                >
                  Take Risk Quiz
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          
          {/* Portfolio Overview - Large Card */}
          <div className="lg:col-span-8">
            <DashboardCardRenderer
              componentName="PortfolioOverviewCard"
              props={{
                animationDelay: 0,
                ...dashboardCards.find(c => c.component === 'PortfolioOverviewCard')?.props
              }}
            />
          </div>
          
          {/* AI Insights - Side Panel */}
          <div className="lg:col-span-4">
            <DashboardCardRenderer
              componentName="AIInsightsCard"
              props={{
                animationDelay: 0.1,
                ...dashboardCards.find(c => c.component === 'AIInsightsCard')?.props
              }}
            />
          </div>
        </div>

        {/* Secondary Row - Live Feed & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <DashboardCardRenderer
            componentName="LiveMarketFeed"
            props={{
              animationDelay: 0.2,
              ...dashboardCards.find(c => c.component === 'LiveMarketFeed')?.props
            }}
          />
          <DashboardCardRenderer
            componentName="RecentActivityCard"
            props={{
              animationDelay: 0.3,
              ...dashboardCards.find(c => c.component === 'RecentActivityCard')?.props
            }}
          />
        </div>

        {/* Learning & Tools Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <DashboardCardRenderer
            componentName="LearningPathsCard"
            props={{
              animationDelay: 0.4,
              ...dashboardCards.find(c => c.component === 'LearningPathsCard')?.props
            }}
          />
          <DashboardCardRenderer
            componentName="SECFilingsExplorer"
            props={{
              animationDelay: 0.5,
              ...dashboardCards.find(c => c.component === 'SECFilingsExplorer')?.props
            }}
          />
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: "Chat with ELIN",
              subtitle: "Get instant investment guidance",
              icon: "MessageSquare",
              route: "/chat",
              gradient: "from-primary/20 to-primary/5",
              hover: "hover:from-primary/30 hover:to-primary/10"
            },
            {
              title: "Portfolio Simulator", 
              subtitle: "Test investment scenarios",
              icon: "TrendingUp",
              route: "/portfolio-simulator",
              gradient: "from-secondary/20 to-secondary/5",
              hover: "hover:from-secondary/30 hover:to-secondary/10"
            },
            {
              title: "Learning Hub",
              subtitle: "Expand your knowledge",
              icon: "BookOpen", 
              route: "/learn",
              gradient: "from-accent/20 to-accent/5",
              hover: "hover:from-accent/30 hover:to-accent/10"
            },
            {
              title: "Market Analysis",
              subtitle: "Research companies",
              icon: "BarChart3",
              route: "/filings",
              gradient: "from-warning/20 to-warning/5", 
              hover: "hover:from-warning/30 hover:to-warning/10"
            }
          ].map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
              onClick={() => navigate(action.route)}
              className={`neon-card p-6 cursor-pointer bg-gradient-to-br ${action.gradient} ${action.hover} group`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-card/50 flex items-center justify-center">
                  {/* Icon component would be rendered here based on action.icon */}
                  <div className="w-5 h-5 bg-primary/60 rounded" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {action.subtitle}
                  </p>
                </div>
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