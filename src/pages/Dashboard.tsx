import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, TrendingUp, MessageSquare, FileText, Users, Plus, Award, Star, Brain } from "lucide-react";
import { RiskProfileBadge } from "@/components/RiskProfileBadge";

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

        {/* Quick Actions Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/chat')}>
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
          
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/portfolio')}>
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
          
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/learn')}>
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
          
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/filings')}>
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

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/portfolio-simulator')}>
            <CardHeader className="pb-3">
              <Brain className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">AI Portfolio Simulator</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Simulate portfolio performance across different market scenarios with AI analysis
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Personalized Recommendations */}
        {userProfile?.risk_profile && (
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
        )}

        {/* Learning Progress Section */}
        <div className="grid lg:grid-cols-2 gap-6">
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
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;