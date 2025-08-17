import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { BookOpen, TrendingUp, FileText, GraduationCap, AlertCircle } from "lucide-react";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  const quickActions = [
    {
      title: "Chat with ELIN",
      description: "Ask questions about investing concepts",
      icon: BookOpen,
      href: "/chat",
      color: "text-primary"
    },
    {
      title: "Browse Filings",
      description: "Search and read SEC filings with AI explanations",
      icon: FileText,
      href: "/filings",
      color: "text-education"
    },
    {
      title: "Track Portfolio",
      description: "Monitor your investments and learn about diversification",
      icon: TrendingUp,
      href: "/portfolio",
      color: "text-success"
    },
    {
      title: "Learning Paths",
      description: "Continue your structured investment education",
      icon: GraduationCap,
      href: "/learn",
      color: "text-warning"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user.user_metadata?.first_name || 'Investor'}! 👋
          </h1>
          <p className="text-muted-foreground">
            Continue your investment education journey with ELIN
          </p>
        </div>

        {/* Compliance Notice */}
        <Card className="mb-8 border-warning/20 bg-warning/5">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
              <div>
                <p className="font-medium text-warning">Educational Content Only</p>
                <p className="text-sm text-muted-foreground mt-1">
                  All content provided by ELIN is for educational purposes only and does not constitute 
                  personalized investment advice. Please consult a licensed financial advisor for 
                  investment recommendations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickActions.map((action, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(action.href)}>
              <CardHeader className="text-center">
                <action.icon className={`h-12 w-12 mx-auto mb-4 ${action.color}`} />
                <CardTitle className="text-lg">{action.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  {action.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity & Progress */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Learning Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Learning Progress</CardTitle>
              <CardDescription>Your investment education journey</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Investment Basics</span>
                  <Badge variant="secondary">Completed</Badge>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-success h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Understanding ETFs</span>
                  <Badge variant="outline">In Progress</Badge>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Reading SEC Filings</span>
                  <Badge variant="outline">Not Started</Badge>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-muted h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>
              
              <Button className="w-full mt-4" onClick={() => navigate('/learn')}>
                Continue Learning
              </Button>
            </CardContent>
          </Card>

          {/* Recent Filings */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Filings</CardTitle>
              <CardDescription>Latest SEC filings from your watchlist</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">AAPL - Form 10-Q</p>
                    <p className="text-sm text-muted-foreground">Filed 2 days ago</p>
                  </div>
                  <Button variant="outline" size="sm">View</Button>
                </div>
                
                <div className="flex justify-between items-center p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">TSLA - Form 8-K</p>
                    <p className="text-sm text-muted-foreground">Filed 1 week ago</p>
                  </div>
                  <Button variant="outline" size="sm">View</Button>
                </div>
                
                <div className="flex justify-between items-center p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">SPY - Annual Report</p>
                    <p className="text-sm text-muted-foreground">Filed 2 weeks ago</p>
                  </div>
                  <Button variant="outline" size="sm">View</Button>
                </div>
              </div>
              
              <Button variant="outline" className="w-full" onClick={() => navigate('/filings')}>
                Browse All Filings
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