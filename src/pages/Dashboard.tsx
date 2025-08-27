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
import { Button } from "@/components/ui/button";
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
      <div className="bg-gradient-to-r from-card/80 to-card/60 border-b border-border/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-sm">
              <span className="flex items-center gap-2 text-primary font-semibold">
                <div className="w-2 h-2 bg-primary rounded-full live-pulse" />
                Market Open
              </span>
              <span className="text-text-muted">•</span>
              <span className="text-text-body">S&P 500: <span className="text-success font-medium">+0.87%</span></span>
              <span className="text-text-muted">•</span>
              <span className="text-text-body">NASDAQ: <span className="text-success font-medium">+1.23%</span></span>
              <span className="text-text-muted">•</span>
              <span className="text-text-body">BTC: <span className="text-accent font-medium">+2.15%</span></span>
            </div>
            <div className="text-xs text-text-secondary">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Greeting Section */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-text-heading via-text-body to-text-secondary bg-clip-text text-transparent">
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user.user_metadata?.first_name || 'Investor'}!
              </h1>
              <p className="text-lg text-text-secondary">
                Here's your portfolio overview and market insights
              </p>
            </div>
            {!userProfile?.risk_profile && (
              <div className="professional-card p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
                <p className="text-sm text-text-secondary mb-3">Complete your setup</p>
                <Button 
                  onClick={() => navigate('/risk-quiz')}
                  variant="default"
                  size="lg"
                  className="shadow-lg"
                >
                  Take Risk Quiz
                </Button>
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

        {/* Secondary Row - Live Feed, Activity & Credit Card Helper */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
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
          <DashboardCardRenderer
            componentName="CreditCardHelperCard"
            props={{
              animationDelay: 0.4,
              ...dashboardCards.find(c => c.component === 'CreditCardHelperCard')?.props
            }}
          />
        </div>

        {/* Learning & Tools Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <DashboardCardRenderer
            componentName="LearningPathsCard"
            props={{
              animationDelay: 0.5,
              ...dashboardCards.find(c => c.component === 'LearningPathsCard')?.props
            }}
          />
          <DashboardCardRenderer
            componentName="SECFilingsExplorer"
            props={{
              animationDelay: 0.6,
              ...dashboardCards.find(c => c.component === 'SECFilingsExplorer')?.props
            }}
          />
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Chat with ELIN",
              subtitle: "Get instant investment guidance",
              icon: "MessageSquare",
              route: "/chat",
              gradient: "from-primary/20 to-primary/5",
              hover: "hover:from-primary/30 hover:to-primary/10",
              buttonColor: "bg-primary hover:bg-primary-hover"
            },
            {
              title: "Portfolio Simulator", 
              subtitle: "Test investment scenarios",
              icon: "TrendingUp",
              route: "/portfolio-simulator",
              gradient: "from-secondary/20 to-secondary/5",
              hover: "hover:from-secondary/30 hover:to-secondary/10",
              buttonColor: "bg-secondary hover:bg-secondary/90"
            },
            {
              title: "Learning Hub",
              subtitle: "Expand your knowledge",
              icon: "BookOpen", 
              route: "/learn",
              gradient: "from-education/20 to-education/5",
              hover: "hover:from-education/30 hover:to-education/10",
              buttonColor: "bg-education hover:bg-education/90"
            },
            {
              title: "Market Analysis",
              subtitle: "Research companies",
              icon: "BarChart3",
              route: "/filings",
              gradient: "from-warning/20 to-warning/5", 
              hover: "hover:from-warning/30 hover:to-warning/10",
              buttonColor: "bg-warning hover:bg-warning/90"
            }
          ].map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
              className={`professional-card cursor-pointer bg-gradient-to-br ${action.gradient} ${action.hover} group p-6 hover:-translate-y-1`}
              onClick={() => navigate(action.route)}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 rounded-xl bg-card/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {/* Icon component would be rendered here based on action.icon */}
                  <div className="w-6 h-6 bg-primary/60 rounded" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-text-heading group-hover:text-primary transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-text-secondary">
                    {action.subtitle}
                  </p>
                </div>
                <Button
                  size="sm"
                  className={`${action.buttonColor} text-white border-0 opacity-0 group-hover:opacity-100 transition-opacity`}
                >
                  Open
                </Button>
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