import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BookOpen, TrendingUp, Lightbulb, Clock, ExternalLink, RefreshCw, Calendar, Star } from "lucide-react";
import { motion } from "framer-motion";

interface LearningTip {
  id: string;
  title: string;
  content: string;
  category: 'market' | 'strategy' | 'fundamentals' | 'news';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  readTime: string;
  publishedAt: Date;
  url?: string;
  featured: boolean;
}

const sampleTips: LearningTip[] = [
  {
    id: '1',
    title: 'Understanding P/E Ratios',
    content: 'The Price-to-Earnings ratio helps you determine if a stock is overvalued or undervalued. A lower P/E might indicate a bargain, but could also signal problems with the company.',
    category: 'fundamentals',
    difficulty: 'beginner',
    readTime: '3 min read',
    publishedAt: new Date(),
    featured: true
  },
  {
    id: '2',
    title: 'Dollar-Cost Averaging Strategy',
    content: 'Invest a fixed amount regularly regardless of market conditions. This strategy can help reduce the impact of volatility and potentially lower your average cost per share over time.',
    category: 'strategy',
    difficulty: 'beginner',
    readTime: '4 min read',
    publishedAt: new Date(Date.now() - 86400000),
    featured: false
  },
  {
    id: '3',
    title: 'Fed Interest Rate Impact on Markets',
    content: 'When the Federal Reserve raises interest rates, it typically makes borrowing more expensive and can lead to lower stock valuations. Understanding this relationship is crucial for timing your investments.',
    category: 'market',
    difficulty: 'intermediate',
    readTime: '5 min read',
    publishedAt: new Date(Date.now() - 86400000 * 2),
    featured: false
  },
  {
    id: '4',
    title: 'Diversification Beyond Stocks',
    content: 'While stock diversification is important, consider spreading risk across asset classes: bonds, REITs, commodities, and international markets can provide additional protection.',
    category: 'strategy',
    difficulty: 'intermediate',
    readTime: '6 min read',
    publishedAt: new Date(Date.now() - 86400000 * 3),
    featured: false
  },
  {
    id: '5',
    title: 'Reading Company 10-K Filings',
    content: 'The annual 10-K filing contains comprehensive information about a company\'s business, risks, and financial performance. Focus on the MD&A section for management\'s perspective.',
    category: 'fundamentals',
    difficulty: 'advanced',
    readTime: '8 min read',
    publishedAt: new Date(Date.now() - 86400000 * 4),
    featured: false
  }
];

export const DailyLearningFeed = () => {
  const [tips, setTips] = useState<LearningTip[]>(sampleTips);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'market': return TrendingUp;
      case 'strategy': return Lightbulb;
      case 'fundamentals': return BookOpen;
      case 'news': return Calendar;
      default: return BookOpen;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'market': return 'bg-success/10 text-success border-success/20';
      case 'strategy': return 'bg-education/10 text-education border-education/20';
      case 'fundamentals': return 'bg-primary/10 text-primary border-primary/20';
      case 'news': return 'bg-warning/10 text-warning border-warning/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-success/10 text-success';
      case 'intermediate': return 'bg-warning/10 text-warning';
      case 'advanced': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const refreshFeed = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      // In a real app, this would fetch new content
    }, 1000);
  };

  const filteredTips = selectedCategory === 'all' 
    ? tips 
    : tips.filter(tip => tip.category === selectedCategory);

  const categories = [
    { id: 'all', name: 'All Topics', count: tips.length },
    { id: 'fundamentals', name: 'Fundamentals', count: tips.filter(t => t.category === 'fundamentals').length },
    { id: 'strategy', name: 'Strategy', count: tips.filter(t => t.category === 'strategy').length },
    { id: 'market', name: 'Market Insights', count: tips.filter(t => t.category === 'market').length },
    { id: 'news', name: 'News & Updates', count: tips.filter(t => t.category === 'news').length }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-education" />
              Daily Learning Feed
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshFeed}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Fresh insights and tips to expand your investment knowledge
          </p>
        </CardHeader>
        <CardContent>
          {/* Category filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="gap-2"
              >
                {category.name}
                <Badge variant="secondary" className="ml-1 px-1 py-0 text-xs">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>

          {/* Featured tip */}
          {filteredTips.find(tip => tip.featured) && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Star className="h-4 w-4 text-warning" />
                <span className="text-sm font-medium text-warning">Featured Today</span>
              </div>
              {(() => {
                const featuredTip = filteredTips.find(tip => tip.featured)!;
                const IconComponent = getCategoryIcon(featuredTip.category);
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-gradient-to-r from-primary/5 to-education/5 border border-primary/20 rounded-lg"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{featuredTip.title}</h3>
                          <Badge className={getCategoryColor(featuredTip.category)}>
                            {featuredTip.category}
                          </Badge>
                          <Badge className={getDifficultyColor(featuredTip.difficulty)}>
                            {featuredTip.difficulty}
                          </Badge>
                        </div>
                        <p className="text-foreground mb-3 leading-relaxed">
                          {featuredTip.content}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {featuredTip.readTime}
                          </div>
                          {featuredTip.url && (
                            <Button variant="outline" size="sm" className="gap-2">
                              Read More
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })()}
            </div>
          )}

          <Separator className="my-6" />

          {/* Regular tips */}
          <div className="space-y-4">
            {filteredTips.filter(tip => !tip.featured).map((tip, index) => {
              const IconComponent = getCategoryIcon(tip.category);
              return (
                <motion.div
                  key={tip.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-card border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      <IconComponent className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{tip.title}</h3>
                        <Badge className={getCategoryColor(tip.category)}>
                          {tip.category}
                        </Badge>
                        <Badge className={getDifficultyColor(tip.difficulty)}>
                          {tip.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                        {tip.content}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {tip.readTime}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {tip.publishedAt.toLocaleDateString()}
                          </div>
                        </div>
                        {tip.url && (
                          <Button variant="ghost" size="sm" className="gap-1 text-xs">
                            Learn More
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {filteredTips.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No tips available for this category.</p>
              <Button variant="outline" onClick={refreshFeed} className="mt-4">
                Refresh Feed
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};