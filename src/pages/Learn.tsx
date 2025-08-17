import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, Trophy, TrendingUp, Shield, DollarSign, BarChart3, Target } from "lucide-react";

const Learn = () => {
  const learningPaths = [
    {
      id: 1,
      title: "Investment Fundamentals",
      description: "Master the basics of investing, from stocks and bonds to portfolio theory",
      level: "Beginner",
      duration: "4 weeks",
      modules: 8,
      progress: 0,
      icon: BookOpen,
      topics: ["Stock Market Basics", "Bond Fundamentals", "Risk & Return", "Diversification"]
    },
    {
      id: 2,
      title: "Financial Statement Analysis",
      description: "Learn to read and analyze company financial statements like a pro",
      level: "Intermediate",
      duration: "6 weeks",
      modules: 12,
      progress: 0,
      icon: BarChart3,
      topics: ["Income Statements", "Balance Sheets", "Cash Flow", "Ratio Analysis"]
    },
    {
      id: 3,
      title: "Portfolio Management",
      description: "Build and manage diversified investment portfolios effectively",
      level: "Intermediate",
      duration: "5 weeks",
      modules: 10,
      progress: 0,
      icon: Target,
      topics: ["Asset Allocation", "Rebalancing", "Risk Management", "Performance Tracking"]
    },
    {
      id: 4,
      title: "Advanced Trading Strategies",
      description: "Explore sophisticated trading techniques and market timing",
      level: "Advanced",
      duration: "8 weeks",
      modules: 16,
      progress: 0,
      icon: TrendingUp,
      topics: ["Technical Analysis", "Options Trading", "Market Psychology", "Advanced Strategies"]
    },
    {
      id: 5,
      title: "Risk Management & Compliance",
      description: "Understand regulatory frameworks and risk mitigation strategies",
      level: "Intermediate",
      duration: "4 weeks",
      modules: 8,
      progress: 0,
      icon: Shield,
      topics: ["Regulatory Compliance", "Risk Assessment", "Legal Frameworks", "Ethics"]
    },
    {
      id: 6,
      title: "Alternative Investments",
      description: "Explore REITs, commodities, crypto, and other alternative assets",
      level: "Advanced",
      duration: "6 weeks",
      modules: 12,
      progress: 0,
      icon: DollarSign,
      topics: ["REITs", "Commodities", "Cryptocurrency", "Private Equity"]
    }
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Intermediate": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "Advanced": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Learning Paths
          </h1>
          <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
            Master investing with our comprehensive, structured learning paths designed for every skill level
          </p>
          <div className="flex justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" />
              <span>Expert-curated content</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span>Self-paced learning</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <span>Interactive modules</span>
            </div>
          </div>
        </div>

        {/* Learning Paths Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {learningPaths.map((path) => {
            const IconComponent = path.icon;
            return (
              <Card key={path.id} className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <Badge className={getLevelColor(path.level)}>
                      {path.level}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {path.title}
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {path.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Course Stats */}
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {path.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      {path.modules} modules
                    </span>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{path.progress}%</span>
                    </div>
                    <Progress value={path.progress} className="h-2" />
                  </div>

                  {/* Topics */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Key Topics:</h4>
                    <div className="flex flex-wrap gap-1">
                      {path.topics.map((topic, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button 
                    className="w-full mt-4 group-hover:bg-primary group-hover:text-primary-foreground transition-all" 
                    variant={path.progress > 0 ? "default" : "outline"}
                  >
                    {path.progress > 0 ? "Continue Learning" : "Start Course"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to Begin Your Journey?</CardTitle>
              <CardDescription className="text-base">
                Start with our Investment Fundamentals course and build your knowledge step by step
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Get Started Today
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Learn;