import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Star, Zap, Brain, CreditCard, TrendingUp, Shield, Users, Award } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const ProMode = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    {
      category: "AI Features",
      items: [
        { name: "AI Investment Mentor", free: "Basic chat", pro: "Voice-enabled AI mentor with personalized recommendations" },
        { name: "Market Sentiment Analysis", free: "❌", pro: "✅ Real-time AI sentiment tracking" },
        { name: "Credit Card AI Coach", free: "❌", pro: "✅ Smart payment optimization" },
        { name: "Portfolio AI Insights", free: "Basic suggestions", pro: "Advanced AI analysis with scenario modeling" }
      ]
    },
    {
      category: "Learning & Education",
      items: [
        { name: "Learning Paths", free: "3 basic courses", pro: "15+ advanced courses with certifications" },
        { name: "Interactive Simulators", free: "Basic portfolio simulator", pro: "Advanced scenario testing with AI guidance" },
        { name: "Video Content", free: "❌", pro: "✅ HD video lessons with expert insights" },
        { name: "Live Webinars", free: "❌", pro: "✅ Monthly expert sessions" }
      ]
    },
    {
      category: "Market Intelligence",
      items: [
        { name: "Live Market Data", free: "Delayed 15min", pro: "Real-time quotes and advanced charts" },
        { name: "Watchlists", free: "1 watchlist, 10 stocks", pro: "Unlimited watchlists with alerts" },
        { name: "SEC Filings", free: "Basic search", pro: "Advanced filtering with AI summaries" },
        { name: "Insider Trading Alerts", free: "❌", pro: "✅ Real-time notifications" }
      ]
    },
    {
      category: "Portfolio Management",
      items: [
        { name: "Portfolio Tracking", free: "1 portfolio", pro: "Unlimited portfolios with advanced analytics" },
        { name: "Performance Analytics", free: "Basic metrics", pro: "Advanced attribution analysis" },
        { name: "Rebalancing Alerts", free: "❌", pro: "✅ Smart rebalancing recommendations" },
        { name: "Tax Optimization", free: "❌", pro: "✅ Tax-loss harvesting insights" }
      ]
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Investment Advisor",
      content: "ELIN Pro transformed how I manage client portfolios. The AI insights are incredibly accurate.",
      rating: 5,
      avatar: "/placeholder.svg"
    },
    {
      name: "Michael Rodriguez",
      role: "Day Trader",
      content: "The real-time sentiment analysis gives me an edge in volatile markets. Worth every penny.",
      rating: 5,
      avatar: "/placeholder.svg"
    },
    {
      name: "Emma Thompson",
      role: "Financial Planner",
      content: "My clients love the credit card optimizer. It's saved them thousands in interest payments.",
      rating: 5,
      avatar: "/placeholder.svg"
    }
  ];

  const handleUpgrade = () => {
    if (!user) {
      navigate('/auth');
    } else {
      navigate('/pricing');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/20 to-education/20 rounded-full px-6 py-2 mb-6">
            <Zap className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">ELIN Pro Mode</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-education to-primary bg-clip-text text-transparent">
            Supercharge Your
            <br />
            Investment Journey
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Unlock advanced AI features, real-time market intelligence, and professional-grade tools 
            that put you ahead of the market.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary-hover text-white px-8 py-4 text-lg"
              onClick={handleUpgrade}
            >
              <Star className="w-5 h-5 mr-2" />
              Upgrade to Pro
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
              See Pricing
            </Button>
          </div>
        </motion.div>

        {/* Key Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid md:grid-cols-3 gap-8 mb-16"
        >
          <Card className="text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-primary" />
              </div>
              <CardTitle>AI-Powered Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Get personalized investment recommendations powered by advanced AI algorithms 
                that analyze market trends and your portfolio.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-education/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-education" />
              </div>
              <CardTitle>Real-Time Intelligence</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Access live market data, sentiment analysis, and breaking news that affects 
                your investments before others even know about it.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-success" />
              </div>
              <CardTitle>Professional Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Utilize institutional-grade portfolio management tools, advanced charting, 
                and comprehensive analytics typically reserved for professionals.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Feature Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Free vs Pro Comparison</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See exactly what you get with ELIN Pro and why thousands of investors have upgraded
            </p>
          </div>

          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-education/10">
              <div className="grid grid-cols-3 gap-4">
                <div></div>
                <div className="text-center">
                  <Badge variant="outline" className="border-muted-foreground">
                    Free Plan
                  </Badge>
                </div>
                <div className="text-center">
                  <Badge className="bg-primary text-white">
                    Pro Plan
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              {features.map((category, categoryIndex) => (
                <div key={category.category} className="border-b border-border last:border-b-0">
                  <div className="bg-muted/50 px-6 py-4">
                    <h3 className="font-semibold text-lg">{category.category}</h3>
                  </div>
                  
                  {category.items.map((item, itemIndex) => (
                    <div key={item.name} className="grid grid-cols-3 gap-4 px-6 py-4 border-b border-border/50 last:border-b-0">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-center text-muted-foreground">{item.free}</div>
                      <div className="text-center text-primary font-medium">{item.pro}</div>
                    </div>
                  ))}
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Trusted by Professionals</h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of successful investors using ELIN Pro
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground italic">"{testimonial.content}"</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-16"
        >
          <div className="bg-muted/30 rounded-lg p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-4">Trusted & Secure</h3>
              <p className="text-muted-foreground">
                Your investments and data are protected by industry-leading security
              </p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-8 items-center justify-items-center">
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-success" />
                <span className="font-medium">Bank-Level Security</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-6 h-6 text-primary" />
                <span className="font-medium">SEC Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-6 h-6 text-education" />
                <span className="font-medium">50K+ Users</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-6 h-6 text-warning fill-current" />
                <span className="font-medium">4.9/5 Rating</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="text-center"
        >
          <Card className="bg-gradient-to-r from-primary/10 via-education/10 to-primary/10 border-primary/20">
            <CardContent className="pt-12 pb-12">
              <h2 className="text-3xl font-bold mb-4">Ready to Go Pro?</h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join the elite group of investors using AI-powered tools to maximize their returns
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary-hover text-white px-8 py-4 text-lg"
                  onClick={handleUpgrade}
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Start Pro Trial
                </Button>
                <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
                  Compare Plans
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground mt-4">
                30-day money-back guarantee • Cancel anytime • No setup fees
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProMode;