import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, TrendingUp, MessageSquare, FileText, Award, Star, Brain, Sparkles, Play, History, Settings, ShieldCheck, LineChart, Upload, Search, Eye, PlusCircle } from "lucide-react";
import { RiskProfileBadge } from "@/components/RiskProfileBadge";
import { PortfolioSparkline } from "@/components/PortfolioSparkline";
import { DashboardCard } from "@/components/DashboardCard";
import { ProgressBar } from "@/components/ProgressBar";
import { HeroSummaryCard } from "@/components/HeroSummaryCard";
import { PortfolioOverviewCard } from "@/components/PortfolioOverviewCard";
import { LiveMarketFeed } from "@/components/LiveMarketFeed";
import { RecentActivityCard } from "@/components/RecentActivityCard";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

// Mock data for portfolio donut chart
const portfolioData = [
  { name: "Stocks", value: 60, color: "hsl(var(--primary))" },
  { name: "Bonds", value: 30, color: "hsl(var(--secondary))" },
  { name: "Cash", value: 10, color: "hsl(var(--muted))" }
];

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [savedScenariosCount] = useState(3); // Mock count - would come from API
  const { toast } = useToast();

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
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Summary Card */}
        <div className="mb-8">
          <HeroSummaryCard 
            userName={user.user_metadata?.first_name || 'Investor'}
            hasRiskProfile={!!userProfile?.risk_profile}
          />
        </div>

        {/* Portfolio Overview Card */}
        <div className="mb-8">
          <PortfolioOverviewCard />
        </div>

        {/* Live Market Feed */}
        <div className="mb-8">
          <LiveMarketFeed />
        </div>

        {/* Recent Activity Card */}
        <div className="mb-8">
          <RecentActivityCard />
        </div>

        {/* Premium Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {/* Featured AI Portfolio Simulator Card */}
          <motion.div
            className="xl:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="group relative rounded-2xl p-5 md:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-none border border-zinc-100 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400/70 transition-all duration-300"
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.995 }}
              onClick={() => navigate('/portfolio-simulator')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate('/portfolio-simulator');
                }
              }}
              tabIndex={0}
              role="button"
              aria-label="Open AI Portfolio Simulator"
            >
              {/* Gradient Hero Background */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-500 opacity-90 dark:opacity-80">
                {/* Shimmer effect on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
              </div>
              
              {/* Content Overlay */}
              <div className="relative z-10">
                {/* Header Row */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {/* Brain Icon Chip */}
                    <div className="rounded-xl bg-white/15 p-2 backdrop-blur">
                      <Brain className="h-5 w-5 md:h-6 md:w-6 text-white drop-shadow" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg md:text-xl font-bold text-white">AI Portfolio Simulator</h3>
                        <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                          <Sparkles className="h-3 w-3 mr-1" />
                          New
                        </Badge>
                      </div>
                      <p className="text-sm text-white/80">Model scenarios. Visualize risk. Compare allocations.</p>
                    </div>
                  </div>
                  
                  {/* Stats Chip */}
                  <div className="hidden md:flex items-center gap-1 px-3 py-1 bg-white/15 rounded-full backdrop-blur">
                    <TrendingUp className="h-3 w-3 text-emerald-300" />
                    <span className="text-xs text-emerald-300 font-medium">Last 10y sim +7.2%</span>
                  </div>
                </div>

                {/* Chart and Pills Container */}
                <div className="bg-white/10 rounded-xl p-4 mb-4 backdrop-blur">
                  {/* Mini Chart Preview */}
                  <div className="mb-3">
                    <PortfolioSparkline className="h-8 md:h-16" />
                  </div>
                  
                  {/* Allocation Pills */}
                  <div className="flex flex-wrap gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-xs">
                          <div className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5" />
                          Stocks 60%
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Tap to edit in Simulator</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-xs">
                          <div className="w-2 h-2 rounded-full bg-blue-400 mr-1.5" />
                          Bonds 30%
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Tap to edit in Simulator</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-xs">
                          <div className="w-2 h-2 rounded-full bg-orange-400 mr-1.5" />
                          Crypto 5%
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Tap to edit in Simulator</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Badge className="bg-white/20 text-white border-white/30 text-xs">
                      <ShieldCheck className="h-3 w-3 mr-1" />
                      Edu-only
                    </Badge>
                  </div>
                </div>

                {/* Footer Actions - FIXED */}
                <div className="flex flex-wrap items-center gap-3 md:gap-4 justify-between md:justify-start">
                  <div className="flex flex-col sm:flex-row gap-2">
                    {/* Primary Action */}
                    <Button 
                      size="lg"
                      className="h-11 px-5 rounded-xl bg-white text-emerald-600 hover:bg-white/90 font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/portfolio-simulator');
                      }}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Open Simulator
                    </Button>
                    
                    {/* Secondary Action - FIXED */}
                    <div className="relative">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="lg"
                            className="h-11 px-5 rounded-xl border-white/30 text-white hover:bg-white/10 font-medium focus-visible:ring-2 focus-visible:ring-emerald-400/70"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/portfolio-simulator/saved');
                            }}
                            disabled={savedScenariosCount === 0}
                            aria-disabled={savedScenariosCount === 0}
                          >
                            <History className="h-4 w-4 mr-2" />
                            Saved Scenarios
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{savedScenariosCount === 0 ? "No saved scenarios yet" : "View your saved simulations"}</p>
                        </TooltipContent>
                      </Tooltip>
                      {/* Count Badge */}
                      {savedScenariosCount > 0 && (
                        <Badge className="absolute -top-2 -right-2 bg-emerald-600 text-white dark:bg-emerald-500 text-xs min-w-[1.25rem] h-5 flex items-center justify-center">
                          {savedScenariosCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Tertiary & Settings */}
                  <div className="flex items-center gap-2 text-xs text-white/70 ml-auto">
                    <Button 
                      variant="ghost"
                      size="sm"
                      className="text-xs text-white/70 hover:text-white hover:bg-white/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle last run navigation
                      }}
                    >
                      Last run: 2d ago
                    </Button>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-white/70 hover:text-white hover:bg-white/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/settings');
                          }}
                        >
                          <Settings className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Preferences</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Secondary Scenario Analysis Card */}
          <DashboardCard
            title="Scenario Analysis"
            subtitle="Compare market conditions and their impact"
            icon={<LineChart className="h-6 w-6 text-white drop-shadow" />}
            primaryAction={{
              label: "Open Analysis",
              icon: <LineChart className="h-4 w-4 mr-2" />,
              onClick: () => navigate('/portfolio-simulator?tab=scenarios')
            }}
            onClick={() => navigate('/portfolio-simulator?tab=scenarios')}
            delay={0.1}
            className="h-full shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-none border border-zinc-100 dark:border-zinc-800 bg-gradient-to-tr from-slate-400 via-slate-500 to-slate-600 text-white"
          />
        </div>

        {/* Unified Card System Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Chat with ELIN */}
          <DashboardCard
            title="Chat with ELIN"
            subtitle="Ask anything about investing. Get personalized, educational guidance."
            icon={<MessageSquare className="h-6 w-6 text-primary" />}
            primaryAction={{
              label: "Open Chat",
              icon: <MessageSquare className="h-4 w-4 mr-2" />,
              onClick: () => navigate('/chat')
            }}
            secondaryAction={{
              label: "Prompt Library",
              icon: <FileText className="h-4 w-4 mr-2" />,
              onClick: () => navigate('/chat?tab=prompts')
            }}
            statChip={{ label: "Avg response ~3s" }}
            onClick={() => navigate('/chat')}
            delay={0.2}
          >
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className="text-xs cursor-pointer hover:bg-muted" onClick={(e) => { e.stopPropagation(); navigate('/chat?prompt=explain-etfs'); }}>
                  "Explain ETFs like I'm new"
                </Badge>
              </div>
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className="text-xs cursor-pointer hover:bg-muted" onClick={(e) => { e.stopPropagation(); navigate('/chat?prompt=apple-10k'); }}>
                  "Summarize Apple's 10-K risks"
                </Badge>
              </div>
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className="text-xs cursor-pointer hover:bg-muted" onClick={(e) => { e.stopPropagation(); navigate('/chat?prompt=pe-ratio'); }}>
                  "What does P/E mean?"
                </Badge>
              </div>
            </div>
          </DashboardCard>

          {/* Portfolio Tracker */}
          <DashboardCard
            title="Portfolio Tracker"
            subtitle="Track your positions and see diversification insights."
            icon={<TrendingUp className="h-6 w-6 text-success" />}
            primaryAction={{
              label: "Open Tracker",
              icon: <TrendingUp className="h-4 w-4 mr-2" />,
              onClick: () => navigate('/portfolio')
            }}
            secondaryAction={{
              label: "Import Holdings",
              icon: <Upload className="h-4 w-4 mr-2" />,
              onClick: () => navigate('/portfolio?action=import')
            }}
            onClick={() => navigate('/portfolio')}
            delay={0.3}
          >
            <div className="space-y-3">
              {/* Tiny donut chart */}
              <div className="h-16">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={portfolioData}
                      cx="50%"
                      cy="50%"
                      innerRadius={20}
                      outerRadius={30}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {portfolioData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Pill tags */}
              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary" className="text-xs">
                  <div className="w-2 h-2 rounded-full bg-primary mr-1.5" />
                  Stocks 60%
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  <div className="w-2 h-2 rounded-full bg-secondary mr-1.5" />
                  Bonds 30%
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground mr-1.5" />
                  Cash 10%
                </Badge>
              </div>
            </div>
          </DashboardCard>

          {/* Learning Paths */}
          <DashboardCard
            title="Learning Paths"
            subtitle="Structured courses to build your skills step by step."
            icon={<BookOpen className="h-6 w-6 text-education" />}
            primaryAction={{
              label: "Continue Learning",
              icon: <BookOpen className="h-4 w-4 mr-2" />,
              onClick: () => navigate('/learn')
            }}
            secondaryAction={{
              label: "Browse Courses",
              icon: <Search className="h-4 w-4 mr-2" />,
              onClick: () => navigate('/learn?tab=browse')
            }}
            onClick={() => navigate('/learn')}
            delay={0.4}
          >
            <div className="space-y-3">
              <ProgressBar label="Investment Basics" current={3} total={5} />
              <ProgressBar label="Portfolio Mgmt" current={1} total={4} />
            </div>
          </DashboardCard>

          {/* SEC Filings */}
          <DashboardCard
            title="SEC Filings"
            subtitle="Decode company filings with AI-powered explanations."
            icon={<FileText className="h-6 w-6 text-muted-foreground" />}
            primaryAction={{
              label: "Open Filings",
              icon: <FileText className="h-4 w-4 mr-2" />,
              onClick: () => navigate('/filings')
            }}
            secondaryAction={{
              label: "Watchlist",
              icon: <Eye className="h-4 w-4 mr-2" />,
              onClick: () => navigate('/filings?tab=watchlist')
            }}
            onClick={() => navigate('/filings')}
            delay={0.5}
          >
            <div className="space-y-3">
              <Input 
                placeholder="Search filings..." 
                className="text-xs h-8" 
                disabled 
              />
              <div className="flex gap-1">
                <Badge variant="outline" className="text-xs">
                  AAPL
                </Badge>
              </div>
            </div>
          </DashboardCard>
        </div>

        {/* Personalized Recommendations */}
        {userProfile?.risk_profile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card className="mb-8 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-warning" />
                  Personalized for Your Risk Profile
                </CardTitle>
                <CardDescription>
                  Based on your <RiskProfileBadge riskProfile={userProfile.risk_profile} showIcon={false} className="inline" /> profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {userProfile.risk_profile === 'cautious' && (
                    <>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">📚 Recommended Learning</h4>
                        <p className="text-sm text-muted-foreground">Start with bond fundamentals and risk management strategies</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">💼 Portfolio Focus</h4>
                        <p className="text-sm text-muted-foreground">Explore conservative allocation strategies and stable income investments</p>
                      </div>
                    </>
                  )}
                  {userProfile.risk_profile === 'balanced' && (
                    <>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">📚 Recommended Learning</h4>
                        <p className="text-sm text-muted-foreground">Dive into diversification and long-term growth strategies</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">💼 Portfolio Focus</h4>
                        <p className="text-sm text-muted-foreground">Learn about balanced portfolios and rebalancing techniques</p>
                      </div>
                    </>
                  )}
                  {userProfile.risk_profile === 'bold' && (
                    <>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">📚 Recommended Learning</h4>
                        <p className="text-sm text-muted-foreground">Explore growth investing and advanced market analysis</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">💼 Portfolio Focus</h4>
                        <p className="text-sm text-muted-foreground">Learn about growth stocks and emerging market opportunities</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Learning Journey - Converted to Unified Card System */}
        <motion.div
          className="grid lg:grid-cols-2 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <DashboardCard
            title="Your Learning Journey"
            subtitle="Track your progress through investment education"
            icon={<BookOpen className="h-6 w-6 text-education" />}
            primaryAction={{
              label: "Continue Learning",
              icon: <BookOpen className="h-4 w-4 mr-2" />,
              onClick: () => navigate('/learn')
            }}
            gradientHeader={true}
            delay={0.7}
          >
            <div className="space-y-4">
              <ProgressBar label="Investment Basics" current={3} total={5} />
              <ProgressBar label="Portfolio Management" current={1} total={4} />
              <ProgressBar label="Risk Management" current={0} total={3} />
            </div>
          </DashboardCard>

          <DashboardCard
            title="Recent Activity"
            subtitle="Your latest educational interactions"
            icon={<Star className="h-6 w-6 text-primary" />}
            primaryAction={{
              label: "Start New Conversation",
              icon: <PlusCircle className="h-4 w-4 mr-2" />,
              onClick: () => navigate('/chat')
            }}
            delay={0.8}
          >
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <MessageSquare className="h-5 w-5 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">Asked ELIN about ETFs</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <BookOpen className="h-5 w-5 text-education flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">Completed: Understanding Dividends</p>
                  <p className="text-xs text-muted-foreground">Yesterday</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-5 w-5 text-success flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">Added AAPL to portfolio tracker</p>
                  <p className="text-xs text-muted-foreground">3 days ago</p>
                </div>
              </div>
            </div>
          </DashboardCard>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;