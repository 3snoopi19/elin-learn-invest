import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { PhoneMockup } from "@/components/landing/PhoneMockup";
import { 
  Shield, 
  TrendingUp, 
  CheckCircle, 
  Star, 
  Brain, 
  MessageSquare, 
  Play, 
  Award,
  Zap,
  CreditCard,
  Target,
  Sparkles
} from "lucide-react";

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
      icon: CreditCard,
      title: "The Daily Swipe",
      description: "Clear your transaction stack every morning. Train your AI to spot bad habits instantly.",
      highlight: true,
    },
    {
      icon: Brain,
      title: "AI-Powered Insights",
      description: "ELIN learns your patterns and coaches you to smarter spending.",
    },
    {
      icon: Target,
      title: "Gamified Goals",
      description: "Turn saving into a game with streaks, badges, and progress rings.",
    },
    {
      icon: MessageSquare,
      title: "Chat with ELIN",
      description: "Ask anything about money—get instant, personalized answers.",
    },
  ];

  const testimonials = [
    {
      name: "Sarah M.",
      role: "Saved $400/month",
      content: "The swipe feature made me realize how much I was wasting on coffee runs. Now I actually think before I spend!",
      rating: 5,
      avatar: "👩‍💼"
    },
    {
      name: "Mike R.",
      role: "Debt-free in 8 months", 
      content: "30 seconds every morning. That's all it takes. I've never stuck with a finance app this long.",
      rating: 5,
      avatar: "👨‍💻"
    },
    {
      name: "Jennifer L.",
      role: "First-time investor",
      content: "Finally, an app that doesn't feel like homework. Swiping through my spending is actually... fun?",
      rating: 5,
      avatar: "👩‍🎓"
    }
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Header />
      
      {/* Hero Section - Mobile-First Swipe Concept */}
      <section className="relative py-12 md:py-20 px-4 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-success/5 -z-10" />
        
        {/* Floating shapes */}
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-2xl"
        />
        <motion.div
          animate={{ 
            y: [0, 20, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute bottom-20 right-10 w-32 h-32 bg-success/10 rounded-full blur-3xl"
        />

        <div className="container mx-auto mobile-container">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left - Copy */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left order-2 lg:order-1"
            >
              <Badge variant="secondary" className="mb-4 animate-fade-in text-xs md:text-sm bg-primary/10 text-primary border-primary/20">
                <Zap className="w-3 h-3 mr-1" />
                30 seconds a day
              </Badge>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 md:mb-6 leading-tight">
                <span className="text-text-heading">Don't Budget.</span>
                <br />
                <span className="bg-gradient-to-r from-primary via-primary to-success bg-clip-text text-transparent">
                  Just Swipe.
                </span>
              </h1>
              
              <p className="text-base md:text-xl text-text-secondary mb-6 md:mb-8 max-w-lg mx-auto lg:mx-0">
                The world's first <span className="font-semibold text-primary">"Tinder-for-Finance"</span> interface. 
                Swipe left on waste, swipe right on wealth. Master your money in 30 seconds a day.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/auth?mode=signup')} 
                  className="text-base md:text-lg px-6 md:px-8 bg-primary hover:bg-primary-hover text-primary-foreground shadow-lg shadow-primary/25 w-full sm:w-auto group"
                >
                  <Sparkles className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                  Start Swiping — Free Trial
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-base md:text-lg px-6 md:px-8 gap-2 border-border text-text-body hover:bg-muted/50 w-full sm:w-auto" 
                  onClick={() => navigate('/risk-quiz')}
                >
                  <Play className="h-4 w-4 md:h-5 md:w-5" />
                  See How It Works
                </Button>
              </div>
              
              {/* Trust indicators */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-6 md:mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-4 md:gap-6 text-xs md:text-sm text-text-muted"
              >
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>Free forever plan</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>No credit card</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>Works offline</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right - Phone Mockup */}
            <div className="flex justify-center lg:justify-end order-1 lg:order-2">
              <PhoneMockup />
            </div>
          </div>
        </div>
      </section>

      {/* Visual Features Section */}
      <section className="py-12 md:py-20 px-4 bg-muted/30">
        <div className="container mx-auto mobile-container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-16"
          >
            <Badge variant="secondary" className="mb-4 text-xs">HOW IT WORKS</Badge>
            <h2 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4">
              Finance That Feels Like <span className="text-primary">Social Media</span>
            </h2>
            <p className="text-base md:text-xl text-text-secondary max-w-2xl mx-auto px-2">
              Fast, addictive, and actually good for you. No spreadsheets. No guilt trips.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {visualFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`text-center hover:shadow-lg transition-all duration-300 hover-scale group h-full ${
                  feature.highlight ? 'ring-2 ring-primary/50 bg-primary/5' : ''
                }`}>
                  <CardHeader className="pb-2 md:pb-4">
                    <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4 transition-colors ${
                      feature.highlight 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-primary/10 group-hover:bg-primary/20'
                    }`}>
                      <feature.icon className={`h-6 w-6 md:h-8 md:w-8 ${feature.highlight ? '' : 'text-primary'}`} />
                    </div>
                    <CardTitle className="text-base md:text-xl">{feature.title}</CardTitle>
                    {feature.highlight && (
                      <Badge className="mx-auto mt-2 bg-primary/20 text-primary border-0 text-xs">
                        ⭐ Core Feature
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-sm md:text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof & Metrics */}
      <section className="py-12 md:py-20 px-4">
        <div className="container mx-auto text-center mobile-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-xl md:text-3xl font-bold mb-3 md:mb-4 px-2">
              Join <span className="text-primary">10,000+</span> people who swipe smarter
            </h2>
            <p className="text-sm md:text-lg text-text-secondary mb-8 md:mb-12">Real results from real swipers</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow h-full">
                  <CardContent className="pt-4 md:pt-6">
                    <div className="flex items-center mb-3 md:mb-4 gap-3">
                      <div className="text-2xl md:text-3xl">{testimonial.avatar}</div>
                      <div className="text-left">
                        <p className="font-semibold text-sm md:text-base">{testimonial.name}</p>
                        <p className="text-xs md:text-sm text-success font-medium">{testimonial.role}</p>
                      </div>
                    </div>
                    <div className="flex mb-3 md:mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 md:h-4 md:w-4 fill-warning text-warning" />
                      ))}
                    </div>
                    <p className="text-left italic text-sm md:text-base text-text-secondary">"{testimonial.content}"</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance Section */}
      <section className="py-10 md:py-16 px-4 bg-muted/30">
        <div className="container mx-auto text-center mobile-container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Educational Only — Not Financial Advice</h2>
            <div className="bg-card border border-border rounded-xl p-4 md:p-6 text-left">
              <p className="text-sm md:text-base mb-3 text-text-secondary">
                <strong className="text-text-heading">Important:</strong> ELIN helps you understand your spending habits 
                and build better financial awareness. We provide educational tools, not personalized investment advice.
              </p>
              <p className="text-xs md:text-sm text-text-muted">
                For investment decisions, please consult with a licensed financial advisor.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Boosters */}
      <section className="py-8 md:py-12 px-4">
        <div className="container mx-auto mobile-container">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 text-xs md:text-sm text-text-muted">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-success" />
              <span>Bank-level encryption</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-success" />
              <span>Read-only access</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <span>No data selling</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 px-4 bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 border-2 border-white rounded-full" />
          <div className="absolute bottom-10 right-10 w-60 h-60 border-2 border-white rounded-full" />
        </div>
        
        <div className="container mx-auto text-center mobile-container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-4xl font-black mb-3 md:mb-4">
              Ready to swipe your way to wealth?
            </h2>
            <p className="text-base md:text-xl mb-6 md:mb-8 opacity-90 px-4 max-w-xl mx-auto">
              Join thousands who spend 30 seconds a day building better money habits
            </p>
            <Button 
              size="lg" 
              variant="secondary" 
              onClick={() => navigate('/auth?mode=signup')} 
              className="text-base md:text-lg px-8 md:px-10 bg-white hover:bg-white/90 text-primary font-bold shadow-xl w-full sm:w-auto"
            >
              Start Swiping — It's Free
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
