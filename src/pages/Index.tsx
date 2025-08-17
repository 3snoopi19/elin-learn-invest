import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { BookOpen, Shield, TrendingUp, Users, CheckCircle, Star } from "lucide-react";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const features = [
    {
      icon: BookOpen,
      title: "ELIN AI Mentor",
      description: "Your empathetic AI guide that explains complex investing concepts in simple terms",
    },
    {
      icon: Shield,
      title: "SEC Filing Reader",
      description: "Decode 10-K, 10-Q, and 8-K filings with AI-powered explanations and summaries",
    },
    {
      icon: TrendingUp,
      title: "Portfolio Tracker",
      description: "Track your investments and understand diversification with educational insights",
    },
    {
      icon: Users,
      title: "Learning Paths",
      description: "Structured courses from beginner basics to advanced investment strategies",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-background via-primary/5 to-education/5">
        <div className="container mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            🎉 Now with SEC Filing Integration
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-education bg-clip-text text-transparent">
            Learn Investing with Confidence
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            ELIN is your empathetic AI investment mentor that breaks down complex financial concepts 
            into easy-to-understand educational guidance. No jargon, no pressure, just learning.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/auth?mode=signup')} className="text-lg px-8">
              Start Learning Free
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/pricing')} className="text-lg px-8">
              View Pricing
            </Button>
          </div>
          
          <div className="mt-8 flex items-center justify-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-1 text-success" />
              7-day free trial
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-1 text-success" />
              Educational only
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-1 text-success" />
              No investment advice
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything You Need to Learn Investing</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From understanding basic concepts to reading SEC filings, ELIN guides you through 
              your educational investment journey.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <feature.icon className="h-12 w-12 mx-auto text-primary mb-4" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Educational Only — Not Financial Advice</h2>
            <div className="bg-card border border-warning/20 rounded-lg p-6 text-left">
              <p className="text-lg mb-4">
                <strong>Important Disclaimer:</strong> ELIN provides educational information about investing 
                concepts, market fundamentals, and SEC filing analysis. We do not provide personalized 
                investment advice, recommendations, or guarantees about future performance.
              </p>
              <p className="text-muted-foreground">
                All content is for educational purposes only. For personalized investment advice 
                tailored to your specific financial situation, please consult with a licensed 
                financial advisor or investment professional.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">Trusted by Beginner Investors</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah M.",
                role: "New Investor",
                content: "ELIN helped me understand what I was actually buying when I invested in my first ETF. The explanations are so clear!",
                rating: 5
              },
              {
                name: "Mike R.",
                role: "Career Changer",
                content: "I finally understand what all those numbers in 10-K filings mean. The AI explanations are incredibly helpful.",
                rating: 5
              },
              {
                name: "Jennifer L.",
                role: "College Graduate",
                content: "The learning paths are perfect for building knowledge step by step. I feel so much more confident now.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-warning text-warning" />
                    ))}
                  </div>
                  <p className="mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Learning?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of beginners who are building their investment knowledge with ELIN
          </p>
          <Button size="lg" variant="secondary" onClick={() => navigate('/auth?mode=signup')} className="text-lg px-8">
            Start Your Free Trial
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
