import { useState, useEffect, useMemo } from "react";
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
import { OnboardingCarousel } from "@/components/onboarding/OnboardingCarousel";
import { ProgressBadges } from "@/components/gamification/ProgressBadges";
import { DailyLearningFeed } from "@/components/feed/DailyLearningFeed";
import { MarketSentimentGauge } from "@/components/market/MarketSentimentGauge";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showProgressBadges, setShowProgressBadges] = useState(false);
  const [showLearningFeed, setShowLearningFeed] = useState(true);
  const [cardsLoading, setCardsLoading] = useState(true);
  const { toast } = useToast();

  // Get deduplicated dashboard cards (memoized to prevent infinite renders)
  const dashboardCards = useMemo(() => dedupeCards(DASHBOARD_CARDS), []);

  // Check if user just completed the quiz or is new
  useEffect(() => {
    if (searchParams.get('quiz_completed') === 'true') {
      toast({
        title: "🎉 Risk Profile Complete!",
        description: "Your personalized investment recommendations are now available.",
      });
    }
    
    // Show onboarding for new users (simulate check for first-time users)
    const hasSeenOnboarding = localStorage.getItem('elin_onboarding_completed');
    if (!hasSeenOnboarding && user) {
      setShowOnboarding(true);
    }
  }, [searchParams, toast, user]);

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
      } finally {
        // Simulate brief loading for perceived performance
        setTimeout(() => setCardsLoading(false), 800);
      }
    };

    fetchProfile();
  }, [user]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    localStorage.setItem('elin_onboarding_completed', 'true');
    toast({
      title: "Welcome to ELIN!",
      description: "You're all set to start your investment learning journey.",
    });
  };

  if (loading) {
    return <LoadingScreen message="Loading dashboard..." showLogo={true} />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Live Market Updates Banner - Hidden on small mobile for better UX */}
      <div className="hidden sm:block bg-gradient-to-r from-card/80 to-card/60 border-b border-border/50 backdrop-blur">
        <div className="container mx-auto px-4 py-2 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-6 text-xs md:text-sm">
              <span className="flex items-center gap-2 text-primary font-semibold">
                <div className="w-2 h-2 bg-primary rounded-full live-pulse" />
                Market Open
              </span>
              <span className="hidden md:inline text-text-muted">•</span>
              <span className="text-text-body">S&P 500: <span className="text-success font-medium">+0.87%</span></span>
              <span className="hidden sm:inline text-text-muted">•</span>
              <span className="hidden sm:inline text-text-body">NASDAQ: <span className="text-success font-medium">+1.23%</span></span>
              <span className="hidden md:inline text-text-muted">•</span>
              <span className="hidden md:inline text-text-body">BTC: <span className="text-accent font-medium">+2.15%</span></span>
            </div>
            <div className="hidden md:block text-xs text-text-secondary">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
      
      <main className="mobile-content mobile-container py-4 md:py-8">
        {/* Hero Greeting Section - Mobile optimized */}
        <div className="mb-6 md:mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-text-heading via-text-body to-text-secondary bg-clip-text text-transparent leading-tight">
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user.user_metadata?.first_name || 'Investor'}!
              </h1>
              <p className="text-base md:text-lg text-text-secondary">
                Here's your portfolio overview and market insights
              </p>
            </div>
            {!userProfile?.risk_profile && (
              <div className="professional-card p-4 md:p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 w-full md:w-auto">
                <p className="text-sm text-text-secondary mb-3">Complete your setup</p>
                <Button 
                  onClick={() => navigate('/risk-quiz')}
                  variant="default"
                  size="lg"
                  className="w-full md:w-auto shadow-lg mobile-button"
                >
                  Take Risk Quiz
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Main Dashboard Grid - Mobile responsive with consistent spacing */}
        <div className="mobile-grid mb-6 md:mb-8">
          {/* Portfolio Overview - Full width stacked layout */}
          <div className="lg:col-span-2">
            {cardsLoading ? (
              <SkeletonLoader variant="card" />
            ) : (
              <DashboardCardRenderer
                componentName="PortfolioOverviewCard"
                props={{
                  animationDelay: 0,
                  ...dashboardCards.find(c => c.component === 'PortfolioOverviewCard')?.props
                }}
              />
            )}
          </div>
          
          {/* AI Insights - Full width on mobile */}
          <div className="lg:col-span-1">
            {cardsLoading ? (
              <SkeletonLoader variant="card" />
            ) : (
              <DashboardCardRenderer
                componentName="AIInsightsCard"
                props={{
                  animationDelay: 0.1,
                  ...dashboardCards.find(c => c.component === 'AIInsightsCard')?.props
                }}
              />
            )}
          </div>
        </div>

        {/* Secondary Row - Responsive grid with unified spacing */}
        <div className="mobile-grid mb-6 md:mb-8">
          {cardsLoading ? (
            <>
              <SkeletonLoader variant="chart" />
              <SkeletonLoader variant="card" />
              <SkeletonLoader variant="market" />
              <SkeletonLoader variant="list" />
            </>
          ) : (
            <>
              <MarketSentimentGauge />
              <DashboardCardRenderer
                componentName="RiskAnalysisCard"
                props={{
                  animationDelay: 0.2,
                  ...dashboardCards.find(c => c.component === 'RiskAnalysisCard')?.props
                }}
              />
              <DashboardCardRenderer
                componentName="LiveMarketFeed"
                props={{
                  animationDelay: 0.3,
                  ...dashboardCards.find(c => c.component === 'LiveMarketFeed')?.props
                }}
              />
              <DashboardCardRenderer
                componentName="RecentActivityCard"
                props={{
                  animationDelay: 0.4,
                  ...dashboardCards.find(c => c.component === 'RecentActivityCard')?.props
                }}
              />
            </>
          )}
        </div>

        {/* Tools & Features Row */}
        <div className="mobile-grid mb-6 md:mb-8">
          <DashboardCardRenderer
            componentName="MarketSimulatorCard"
            props={{
              animationDelay: 0.5,
              ...dashboardCards.find(c => c.component === 'MarketSimulatorCard')?.props
            }}
          />
          <DashboardCardRenderer
            componentName="GlossaryCard"
            props={{
              animationDelay: 0.6,
              ...dashboardCards.find(c => c.component === 'GlossaryCard')?.props
            }}
          />
          <DashboardCardRenderer
            componentName="CreditCardHelperCard"
            props={{
              animationDelay: 0.7,
              ...dashboardCards.find(c => c.component === 'CreditCardHelperCard')?.props
            }}
          />
        </div>

        {/* Learning & Tools Row - Mobile responsive */}
        <div className="mobile-grid mb-8">
          <div className="md:col-span-2">
            <DashboardCardRenderer
              componentName="LearningPathsCard"
              props={{
                animationDelay: 0.5,
                ...dashboardCards.find(c => c.component === 'LearningPathsCard')?.props
              }}
            />
          </div>
          <div className="md:col-span-1">
            <DashboardCardRenderer
              componentName="SECFilingsExplorer"
              props={{
                animationDelay: 0.6,
                ...dashboardCards.find(c => c.component === 'SECFilingsExplorer')?.props
              }}
            />
          </div>
        </div>

        {/* Enhanced Features Row - Mobile responsive */}
        <div className="mobile-grid mb-8">
          {/* Progress Badges */}
          <div className="mobile-card p-4 md:p-6 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="mobile-subheading">Achievement Progress</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowProgressBadges(!showProgressBadges)}
                className="mobile-button"
                aria-label={showProgressBadges ? "Hide progress badges" : "Show progress badges"}
              >
                {showProgressBadges ? "Hide" : "View All"}
              </Button>
            </div>
            {showProgressBadges ? (
              <ProgressBadges />
            ) : (
              <div className="text-center py-8">
                <div className="text-3xl mb-3">🏆</div>
                <p className="mobile-body mb-4 text-text-secondary">
                  Track your learning achievements
                </p>
                <Button
                  size="sm"
                  onClick={() => setShowProgressBadges(true)}
                  className="bg-primary hover:bg-primary-hover mobile-button"
                >
                  View Badges
                </Button>
              </div>
            )}
          </div>

          {/* Daily Learning Feed */}
          <div className="md:col-span-2">
            {showLearningFeed && <DailyLearningFeed />}
          </div>
        </div>

        {/* Quick Actions Grid - Mobile optimized */}
        <div className="mobile-grid pb-24 md:pb-8">
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
              className={`professional-card cursor-pointer bg-gradient-to-br ${action.gradient} ${action.hover} group p-6 hover:-translate-y-1 touch-target`}
              onClick={() => navigate(action.route)}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 rounded-xl bg-card/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {/* Icon component would be rendered here based on action.icon */}
                  <div className="w-6 h-6 bg-primary/60 rounded" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold mobile-body text-text-heading group-hover:text-primary transition-colors">
                    {action.title}
                  </h3>
                  <p className="mobile-caption text-text-secondary hidden sm:block">
                    {action.subtitle}
                  </p>
                </div>
                <Button
                  size="sm"
                  className={`${action.buttonColor} text-white border-0 opacity-0 group-hover:opacity-100 transition-opacity mobile-button w-full`}
                >
                  Open
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
      
      <Footer />
      
      {/* Onboarding Modal */}
      <OnboardingCarousel
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
};

export default Dashboard;