import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Star, Crown, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

const Pricing = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to purchase premium access.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment');
      
      if (error) throw error;
      
      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: "There was an issue processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Investment Learning Journey</h1>
          <p className="text-xl text-muted-foreground">Start free and upgrade when you're ready to accelerate your growth</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Starter Investor */}
          <Card className="relative">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Starter Investor
              </CardTitle>
              <CardDescription>Learn basics, access free courses, basic quizzes</CardDescription>
              <div className="text-3xl font-bold">$0<span className="text-sm font-normal">/month</span></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span className="text-sm">Basic ELIN chat (10 messages/day)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span className="text-sm">View 3 SEC filings/month</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span className="text-sm">Basic learning modules</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span className="text-sm">Investment fundamentals quiz</span>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <p className="text-xs italic text-muted-foreground mb-2">💬 What users say:</p>
                <p className="text-sm italic">"Perfect starting point for absolute beginners."</p>
              </div>
              
              <Button className="w-full" variant="outline" onClick={() => navigate('/auth?mode=signup')}>
                Get Started Free
              </Button>
            </CardContent>
          </Card>
          
          {/* Smart Investor */}
          <Card className="border-2 border-primary relative scale-105">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                <Crown className="h-4 w-4" />
                Most Popular
              </div>
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Smart Investor
              </CardTitle>
              <CardDescription>Portfolio analysis, advanced courses, weekly AI report</CardDescription>
              <div className="text-3xl font-bold">$19.99<span className="text-sm font-normal">/month</span></div>
              <p className="text-sm text-success font-medium">Free 7-day trial</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span className="text-sm">Unlimited ELIN conversations</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span className="text-sm">Portfolio analysis & tracking</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span className="text-sm">Advanced learning courses</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span className="text-sm">Weekly AI performance report</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span className="text-sm">Unlimited SEC filing access</span>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <p className="text-xs italic text-muted-foreground mb-2">💬 What users say:</p>
                <p className="text-sm italic">"ELIN's portfolio check gave me instant clarity."</p>
              </div>
              
              <Button 
                className="w-full" 
                onClick={handlePurchase}
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Start Free Trial"}
              </Button>
            </CardContent>
          </Card>

          {/* Confident Investor */}
          <Card className="relative">
            <div className="absolute -top-3 right-4">
              <div className="bg-education text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <Trophy className="h-3 w-3" />
                Best Value
              </div>
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Confident Investor
              </CardTitle>
              <CardDescription>All features + AI mentor, scenario simulator, premium webinars</CardDescription>
              <div className="text-3xl font-bold">$49.99<span className="text-sm font-normal">/month</span></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span className="text-sm">Everything in Smart Investor</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span className="text-sm">Personal AI mentor sessions</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span className="text-sm">Advanced scenario simulator</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span className="text-sm">Premium webinars & workshops</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span className="text-sm">Exclusive community access</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span className="text-sm">Priority support</span>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <p className="text-xs italic text-muted-foreground mb-2">💬 What users say:</p>
                <p className="text-sm italic">"The scenario builder changed my entire approach."</p>
              </div>
              
              <Button 
                className="w-full" 
                onClick={handlePurchase}
                disabled={isProcessing}
                variant="outline"
              >
                {isProcessing ? "Processing..." : "Upgrade to Pro"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Additional testimonials section */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold mb-8">Join thousands of confident investors</h3>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                ))}
              </div>
              <span className="text-sm font-medium">4.9/5 average rating</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
              <CheckCircle className="h-5 w-5 text-success" />
              <span className="text-sm font-medium">1,000+ active learners</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
              <Trophy className="h-5 w-5 text-education" />
              <span className="text-sm font-medium">95% completion rate</span>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;