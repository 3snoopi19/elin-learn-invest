import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Heart, Rocket, Sparkles, Shield, Zap, MessageSquare, PiggyBank, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Slider } from "@/components/ui/slider";

const Pricing = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [price, setPrice] = useState([9]); // Default $9/mo

  const handlePurchase = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to start your membership.",
        variant: "destructive",
      });
      navigate('/auth?mode=signup');
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { price: price[0] }
      });
      
      if (error) throw error;
      
      if (data?.url) {
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

  const getFeedbackMessage = (value: number) => {
    if (value <= 5) {
      return {
        text: "Covers our server costs. Thank you!",
        icon: Heart,
        color: "text-success"
      };
    } else if (value <= 12) {
      return {
        text: "Helps us build new AI features faster!",
        icon: Zap,
        color: "text-primary"
      };
    } else {
      return {
        text: "You are a Super Supporter! 🚀",
        icon: Rocket,
        color: "text-alert-purple"
      };
    }
  };

  const feedback = getFeedbackMessage(price[0]);
  const FeedbackIcon = feedback.icon;

  const benefits = [
    { icon: MessageSquare, text: "Unlimited AI Chat with ELIN" },
    { icon: PiggyBank, text: "Full Net Worth Tracking" },
    { icon: Search, text: "Subscription Waste Scanner" },
    { icon: Sparkles, text: "Personalized Learning Paths" },
    { icon: Shield, text: "Portfolio Risk Analysis" },
    { icon: Zap, text: "All Future Features Included" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 md:py-20">
        {/* Hero Section */}
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-alert-purple bg-clip-text text-transparent">
            Commit to Your Financial Future.
            <br />
            You Choose the Price.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            We believe financial freedom shouldn't have a barrier. Pay what you think ELIN is worth to you.
          </p>
        </div>
        
        {/* Main Pricing Card */}
        <Card className="max-w-2xl mx-auto border-2 border-primary/20 shadow-2xl shadow-primary/5">
          <CardContent className="p-6 md:p-10">
            {/* Price Display */}
            <div className="text-center mb-8">
              <div className="inline-flex items-baseline gap-1">
                <span className="text-2xl text-muted-foreground">$</span>
                <span className="text-6xl md:text-7xl font-bold text-foreground tabular-nums">
                  {price[0]}
                </span>
                <span className="text-xl text-muted-foreground">/month</span>
              </div>
              {price[0] === 9 && (
                <div className="mt-2">
                  <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                    <Sparkles className="h-3 w-3" />
                    Most Popular
                  </span>
                </div>
              )}
            </div>

            {/* Slider */}
            <div className="mb-8 px-2">
              <Slider
                value={price}
                onValueChange={setPrice}
                min={3}
                max={25}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>$3</span>
                <span>$25</span>
              </div>
            </div>

            {/* Dynamic Feedback */}
            <div className={`text-center mb-8 p-4 rounded-xl bg-muted/50 ${feedback.color}`}>
              <div className="flex items-center justify-center gap-2 font-medium">
                <FeedbackIcon className="h-5 w-5" />
                <span>{feedback.text}</span>
              </div>
            </div>

            {/* Benefits List */}
            <div className="mb-8">
              <h3 className="text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                Full Access to Everything
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-success/10 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-success" />
                    </div>
                    <span className="text-sm font-medium">{benefit.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <Button 
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-alert-purple hover:opacity-90 transition-opacity"
              onClick={handlePurchase}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : `Start Membership at $${price[0]}/mo`}
            </Button>

            {/* Trust Badge */}
            <p className="text-center text-sm text-muted-foreground mt-4">
              Cancel anytime. No questions asked.
            </p>
          </CardContent>
        </Card>

        {/* Trust Section */}
        <div className="mt-16 text-center max-w-2xl mx-auto">
          <h3 className="text-xl font-semibold mb-6 text-muted-foreground">
            Why "Pay What You Want"?
          </h3>
          <div className="grid gap-4 text-left">
            <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
              <Heart className="h-6 w-6 text-success flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium mb-1">We trust you.</p>
                <p className="text-sm text-muted-foreground">
                  Everyone's financial situation is different. We want ELIN to be accessible to everyone, whether you're a college student or a seasoned professional.
                </p>
              </div>
            </div>
            <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
              <Shield className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium mb-1">Same features, no tiers.</p>
                <p className="text-sm text-muted-foreground">
                  No artificial limits. No "premium" gatekeeping. Whatever you pay, you get the full ELIN experience.
                </p>
              </div>
            </div>
            <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
              <Rocket className="h-6 w-6 text-alert-purple flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium mb-1">Your support fuels innovation.</p>
                <p className="text-sm text-muted-foreground">
                  Higher contributions help us hire more engineers and ship features faster. You're investing in the product.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
