import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { BookOpen, Shield, TrendingUp, Users, CheckCircle, Star, Brain, PieChart, Settings, MessageSquare, Play, Award } from "lucide-react";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const visualFeatures = [
    {
      icon: Brain,
      title: "AI-Powered Learning Paths",
      description: "Lessons adapt as you progress",
    },
    {
      icon: PieChart,
      title: "Portfolio Snapshot",
      description: "Instant diversification & risk health check",
    },
    {
      icon: Settings,
      title: "Scenario Builder",
      description: "Test \"what-if\" investment scenarios",
    },
    {
      icon: MessageSquare,
      title: "Daily Journal + AI Feedback",
      description: "Reflect daily with ELIN's coaching",
    },
  ];

  const testimonials = [
    {
      name: "Sarah M.",
      role: "New Investor",
      content: "ELIN's portfolio check gave me instant clarity about my risk exposure. I finally understand diversification!",
      rating: 5,
      avatar: "👩‍💼"
    },
    {
      name: "Mike R.",
      role: "Career Changer", 
      content: "The scenario builder helped me test different investment strategies before committing real money.",
      rating: 5,
      avatar: "👨‍💻"
    },
    {
      name: "Jennifer L.",
      role: "College Graduate",
      content: "The daily journal feature with AI feedback keeps me accountable and learning every day.",
      rating: 5,
      avatar: "👩‍🎓"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section - Mobile optimized */}
      <section className="py-12 md:py-20 px-4 bg-gradient-to-br from-background via-primary/5 to-education/5">
        <div className="container mx-auto text-center mobile-container">
          <Badge variant="secondary" className="mb-4 animate-fade-in text-xs md:text-sm">
            🎉 Now with SEC Filing Integration
          </Badge>
          
          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-primary to-education bg-clip-text text-transparent animate-fade-in leading-tight px-2">
            Meet ELIN — Your Personal AI Investing Coach
          </h1>
          
          <p className="text-base md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto animate-fade-in px-4">
            Learn smarter, invest confidently, and grow your wealth with AI.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center animate-fade-in px-4">
            <Button size="lg" onClick={() => navigate('/auth?mode=signup')} className="text-base md:text-lg px-6 md:px-8 bg-primary hover:bg-primary-hover text-primary-foreground mobile-button w-full sm:w-auto">
              Start Learning Free
            </Button>
            <Button size="lg" variant="outline" className="text-base md:text-lg px-6 md:px-8 gap-2 border-primary text-primary hover:bg-primary/10 mobile-button w-full sm:w-auto" onClick={() => navigate('/risk-quiz')}>
              <Play className="h-4 w-4 md:h-5 md:w-5" />
              Take Risk Quiz
            </Button>
          </div>
          
          <div className="mt-6 md:mt-8 flex flex-wrap items-center justify-center gap-3 md:gap-4 text-xs md:text-sm text-muted-foreground animate-fade-in">
            <div className="flex items-center">
              <CheckCircle className="h-3 w-3 md:h-4 md:w-4 mr-1 text-success" />
              7-day free trial
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-3 w-3 md:h-4 md:w-4 mr-1 text-success" />
              Educational only
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-3 w-3 md:h-4 md:w-4 mr-1 text-success" />
              No investment advice
            </div>
          </div>
        </div>
      </section>

      {/* Visual Features Section */}
      <section className="py-12 md:py-20 px-4">
        <div className="container mx-auto mobile-container">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">Powerful Tools for Smart Investing</h2>
            <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
              AI-powered features that adapt to your learning style and help you make informed decisions.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {visualFeatures.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 hover-scale group mobile-card">
                <CardHeader className="pb-2 md:pb-4">
                  <div className="bg-primary/10 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                  </div>
                  <CardTitle className="text-base md:text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-sm md:text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance Section */}
      <section className="py-10 md:py-16 px-4 bg-muted/30">
        <div className="container mx-auto text-center mobile-container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl md:text-3xl font-bold mb-4 md:mb-6">Educational Only — Not Financial Advice</h2>
            <div className="bg-card border border-warning/20 rounded-lg p-4 md:p-6 text-left">
              <p className="text-sm md:text-lg mb-3 md:mb-4">
                <strong>Important Disclaimer:</strong> ELIN provides educational information about investing 
                concepts, market fundamentals, and SEC filing analysis. We do not provide personalized 
                investment advice, recommendations, or guarantees about future performance.
              </p>
              <p className="text-xs md:text-base text-muted-foreground">
                All content is for educational purposes only. For personalized investment advice 
                tailored to your specific financial situation, please consult with a licensed 
                financial advisor or investment professional.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof & Metrics */}
      <section className="py-10 md:py-16 px-4 bg-muted/30">
        <div className="container mx-auto text-center mobile-container">
          <h2 className="text-xl md:text-3xl font-bold mb-3 md:mb-4 px-2">Trusted by 1,000+ new investors building confidence in the markets</h2>
          <p className="text-sm md:text-lg text-muted-foreground mb-8 md:mb-12">Real feedback from real learners</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow mobile-card">
                <CardContent className="pt-4 md:pt-6">
                  <div className="flex items-center mb-3 md:mb-4 gap-3">
                    <div className="text-xl md:text-2xl">{testimonial.avatar}</div>
                    <div className="text-left">
                      <p className="font-semibold text-sm md:text-base">{testimonial.name}</p>
                      <p className="text-xs md:text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="flex mb-3 md:mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 md:h-4 md:w-4 fill-warning text-warning" />
                    ))}
                  </div>
                  <p className="text-left italic text-sm md:text-base">"{testimonial.content}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Boosters */}
      <section className="py-8 md:py-12 px-4">
        <div className="container mx-auto mobile-container">
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-xs md:text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 md:h-5 md:w-5 text-success" />
              <span>SSL Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 md:h-5 md:w-5 text-success" />
              <span>SEC-EDGAR data</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-success" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center mobile-container">
          <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">Ready to Start Learning?</h2>
          <p className="text-base md:text-xl mb-6 md:mb-8 opacity-90 px-4">
            Join thousands of beginners who are building their investment knowledge with ELIN
          </p>
          <Button size="lg" variant="secondary" onClick={() => navigate('/auth?mode=signup')} className="text-base md:text-lg px-6 md:px-8 bg-white hover:bg-white/90 text-primary mobile-button w-full sm:w-auto">
            Start Your Free Trial
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
