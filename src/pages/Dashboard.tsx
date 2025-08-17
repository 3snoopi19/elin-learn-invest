import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, TrendingUp, MessageSquare, FileText, Users, Plus, Award, Star, Brain, Sparkles, Play, History, Settings, ShieldCheck, LineChart } from "lucide-react";
import { RiskProfileBadge } from "@/components/RiskProfileBadge";
import { PortfolioSparkline } from "@/components/PortfolioSparkline";
import { motion } from "framer-motion";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [userProfile, setUserProfile] = useState<any>(null);
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
        {/* Welcome Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user.user_metadata?.first_name || 'Investor'}! 
            </h1>
            <div className="flex items-center gap-4">
              <p className="text-muted-foreground">Continue your investment education journey</p>
              <RiskProfileBadge riskProfile={userProfile?.risk_profile} />
            </div>
          </div>
          
          {!userProfile?.risk_profile && (
            <Button onClick={() => navigate('/risk-quiz')} className="gap-2">
              <Award className="h-4 w-4" />
              Take Risk Quiz
            </Button>
          )}
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

                {/* Footer Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button 
                      className="bg-white text-emerald-600 hover:bg-white/90 font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/portfolio-simulator');
                      }}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Open Simulator
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="border-white/30 text-white hover:bg-white/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/portfolio-simulator?tab=scenarios');
                      }}
                    >
                      <History className="h-4 w-4 mr-2" />
                      Saved Scenarios
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-white/70">
                    <span>Last run: 2d ago</span>
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

          {/* Secondary Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <motion.div
              className="group relative rounded-2xl p-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-none border border-zinc-100 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400/70 transition-all duration-300 h-full"
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.995 }}
              onClick={() => navigate('/portfolio-simulator?tab=scenarios')}
              tabIndex={0}
              role="button"
              aria-label="Open Scenario Analysis"
            >
              {/* Neutral Gradient Background */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-slate-400 via-slate-500 to-slate-600 opacity-80 dark:opacity-70">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-xl bg-white/15 p-2 backdrop-blur">
                    <LineChart className="h-5 w-5 text-white drop-shadow" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Scenario Analysis</h3>
                    <p className="text-sm text-white/80">Compare market conditions</p>
                  </div>
                </div>
                
                <Button 
                  className="bg-white text-slate-600 hover:bg-white/90 font-medium w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/portfolio-simulator?tab=scenarios');
                  }}
                >
                  Open Analysis
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Standard Quick Actions Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full" onClick={() => navigate('/chat')}>
              <CardHeader className="pb-3">
                <MessageSquare className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Chat with ELIN</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Ask questions about investing concepts and get personalized educational guidance
                </CardDescription>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full" onClick={() => navigate('/portfolio')}>
              <CardHeader className="pb-3">
                <TrendingUp className="h-8 w-8 text-success mb-2" />
                <CardTitle className="text-lg">Portfolio Tracker</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Track your investments and learn about diversification strategies
                </CardDescription>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full" onClick={() => navigate('/learn')}>
              <CardHeader className="pb-3">
                <BookOpen className="h-8 w-8 text-education mb-2" />
                <CardTitle className="text-lg">Learning Paths</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Structured courses to build your investment knowledge step by step
                </CardDescription>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full" onClick={() => navigate('/filings')}>
              <CardHeader className="pb-3">
                <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                <CardTitle className="text-lg">SEC Filings</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Decode and understand company filings with AI-powered explanations
                </CardDescription>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Personalized Recommendations */}
        {userProfile?.risk_profile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card className="mb-8">
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

        {/* Learning Progress Section */}
        <motion.div
          className="grid lg:grid-cols-2 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Your Learning Journey</CardTitle>
              <CardDescription>Track your progress through investment education</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Investment Basics</span>
                  <span className="text-sm text-muted-foreground">3/5 lessons</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Portfolio Management</span>
                  <span className="text-sm text-muted-foreground">1/4 lessons</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '25%' }}></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Risk Management</span>
                  <span className="text-sm text-muted-foreground">0/3 lessons</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-muted h-2 rounded-full"></div>
                </div>
              </div>
              
              <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/learn')}>
                Continue Learning
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest educational interactions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <MessageSquare className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Asked ELIN about ETFs</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <BookOpen className="h-5 w-5 text-education" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Completed: Understanding Dividends</p>
                  <p className="text-xs text-muted-foreground">Yesterday</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-5 w-5 text-success" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Added AAPL to portfolio tracker</p>
                  <p className="text-xs text-muted-foreground">3 days ago</p>
                </div>
              </div>
              
              <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/chat')}>
                Start New Conversation
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;