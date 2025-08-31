import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Bookmark, BookmarkCheck, Play, CheckCircle, Clock, Target, Star, Award, TrendingUp, BookOpen, Users, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LearningPath {
  id: string;
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  totalLessons: number;
  completedLessons: number;
  estimatedTime: string;
  category: string;
  nextLesson: {
    title: string;
    duration: string;
  };
  bookmarked: boolean;
  rating: number;
  enrolledCount: number;
  skills: string[];
  progressPercentage: number;
}

const mockLearningPaths: LearningPath[] = [
  {
    id: 'path_1',
    title: 'Investment Fundamentals',
    description: 'Master the basics of investing with comprehensive lessons on stocks, bonds, and portfolio management.',
    level: 'Beginner',
    totalLessons: 12,
    completedLessons: 8,
    estimatedTime: '4 weeks',
    category: 'Stocks & Bonds',
    nextLesson: {
      title: 'Understanding Risk vs Return',
      duration: '15 min'
    },
    bookmarked: true,
    rating: 4.8,
    enrolledCount: 15420,
    skills: ['Portfolio Basics', 'Risk Assessment', 'Asset Allocation'],
    progressPercentage: 67
  },
  {
    id: 'path_2',
    title: 'ETF Mastery',
    description: 'Deep dive into Exchange Traded Funds, index investing, and building diversified portfolios.',
    level: 'Intermediate',
    totalLessons: 10,
    completedLessons: 3,
    estimatedTime: '3 weeks',
    category: 'ETFs & Index Funds',
    nextLesson: {
      title: 'ETF vs Mutual Fund Comparison',
      duration: '20 min'
    },
    bookmarked: false,
    rating: 4.9,
    enrolledCount: 8760,
    skills: ['ETF Selection', 'Expense Ratios', 'Index Tracking'],
    progressPercentage: 30
  },
  {
    id: 'path_3',
    title: 'Retirement Planning Pro',
    description: 'Advanced strategies for 401k optimization, IRA management, and long-term wealth building.',
    level: 'Advanced',
    totalLessons: 15,
    completedLessons: 0,
    estimatedTime: '6 weeks',
    category: 'Retirement',
    nextLesson: {
      title: 'Getting Started with Retirement Planning',
      duration: '18 min'
    },
    bookmarked: true,
    rating: 4.7,
    enrolledCount: 12150,
    skills: ['401k Optimization', 'Tax Efficiency', 'Withdrawal Strategies'],
    progressPercentage: 0
  },
  {
    id: 'path_4',
    title: 'Options Trading Basics',
    description: 'Learn the fundamentals of options trading, risk management, and advanced trading strategies.',
    level: 'Advanced',
    totalLessons: 18,
    completedLessons: 5,
    estimatedTime: '8 weeks',
    category: 'Options & Derivatives',
    nextLesson: {
      title: 'Put vs Call Options Explained',
      duration: '25 min'
    },
    bookmarked: false,
    rating: 4.6,
    enrolledCount: 6340,
    skills: ['Options Pricing', 'Greeks', 'Risk Management'],
    progressPercentage: 28
  }
];

const getDifficultyColor = (level: string) => {
  switch (level) {
    case 'Beginner': return 'bg-success/10 text-success border-success/20';
    case 'Intermediate': return 'bg-primary/10 text-primary border-primary/20';
    case 'Advanced': return 'bg-warning/10 text-warning border-warning/20';
    default: return 'bg-muted text-muted-foreground border-border';
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Stocks & Bonds': return <TrendingUp className="w-4 h-4" />;
    case 'ETFs & Index Funds': return <Target className="w-4 h-4" />;
    case 'Retirement': return <DollarSign className="w-4 h-4" />;
    case 'Options & Derivatives': return <BookOpen className="w-4 h-4" />;
    default: return <BookOpen className="w-4 h-4" />;
  }
};

export const EnhancedLearningPaths = () => {
  const [paths, setPaths] = useState<LearningPath[]>(mockLearningPaths);
  const [filter, setFilter] = useState<'all' | 'in-progress' | 'bookmarked'>('all');
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

  const toggleBookmark = (pathId: string) => {
    setPaths(prev => prev.map(path => 
      path.id === pathId ? { ...path, bookmarked: !path.bookmarked } : path
    ));
  };

  const filteredPaths = paths.filter(path => {
    switch (filter) {
      case 'in-progress': return path.completedLessons > 0 && path.completedLessons < path.totalLessons;
      case 'bookmarked': return path.bookmarked;
      default: return true;
    }
  });

  const overallProgress = {
    totalPaths: paths.length,
    inProgress: paths.filter(p => p.completedLessons > 0 && p.completedLessons < p.totalLessons).length,
    completed: paths.filter(p => p.completedLessons === p.totalLessons).length,
    totalLessons: paths.reduce((sum, p) => sum + p.totalLessons, 0),
    completedLessons: paths.reduce((sum, p) => sum + p.completedLessons, 0)
  };

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card className="bg-gradient-to-r from-primary/10 to-success/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Your Learning Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{overallProgress.inProgress}</div>
              <div className="text-xs text-muted-foreground">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{overallProgress.completed}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{overallProgress.completedLessons}</div>
              <div className="text-xs text-muted-foreground">Lessons Done</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">{overallProgress.totalLessons}</div>
              <div className="text-xs text-muted-foreground">Total Lessons</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">
                {Math.round((overallProgress.completedLessons / overallProgress.totalLessons) * 100)}%
              </span>
            </div>
            <Progress 
              value={(overallProgress.completedLessons / overallProgress.totalLessons) * 100} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all', label: 'All Paths', count: paths.length },
          { key: 'in-progress', label: 'In Progress', count: overallProgress.inProgress },
          { key: 'bookmarked', label: 'Bookmarked', count: paths.filter(p => p.bookmarked).length }
        ].map((tab) => (
          <Button
            key={tab.key}
            variant={filter === tab.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(tab.key as any)}
            className="gap-2"
          >
            {tab.label}
            <Badge variant="secondary" className="text-xs">
              {tab.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Learning Paths Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPaths.map((path, index) => (
          <motion.div
            key={path.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onHoverStart={() => setHoveredPath(path.id)}
            onHoverEnd={() => setHoveredPath(null)}
          >
            <Card className={cn(
              "relative overflow-hidden border-2 transition-all duration-300 cursor-pointer group",
              hoveredPath === path.id ? "border-primary/50 shadow-lg scale-[1.02]" : "border-border"
            )}>
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-success" />
              </div>

              <CardHeader className="relative pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(path.category)}
                    <Badge className={getDifficultyColor(path.level)} variant="outline">
                      {path.level}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleBookmark(path.id)}
                    className="h-8 w-8 p-0"
                  >
                    {path.bookmarked ? (
                      <BookmarkCheck className="w-4 h-4 text-primary" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                <div>
                  <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors">
                    {path.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {path.description}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">
                      {path.completedLessons}/{path.totalLessons} lessons
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {path.progressPercentage}%
                    </span>
                  </div>
                  <Progress value={path.progressPercentage} className="h-2" />
                </div>
              </CardHeader>

              <CardContent className="relative space-y-4">
                {/* Next Lesson */}
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Play className="w-3 h-3 text-primary" />
                    <span className="text-xs font-medium text-primary">Next Lesson</span>
                  </div>
                  <div className="text-sm font-medium">{path.nextLesson.title}</div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {path.nextLesson.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {path.enrolledCount.toLocaleString()} enrolled
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-warning text-warning" />
                      {path.rating}
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-2">Skills you'll learn</div>
                  <div className="flex flex-wrap gap-1">
                    {path.skills.slice(0, 3).map((skill, skillIndex) => (
                      <Badge key={skillIndex} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {path.skills.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{path.skills.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <Button 
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  variant={path.completedLessons > 0 ? "default" : "outline"}
                >
                  {path.completedLessons === 0 ? (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Start Learning
                    </>
                  ) : path.completedLessons === path.totalLessons ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Review Path
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Continue Learning
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredPaths.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No learning paths found</h3>
            <p className="text-muted-foreground">
              {filter === 'bookmarked' 
                ? "You haven't bookmarked any paths yet. Bookmark paths to find them easily later!"
                : "Try adjusting your filters or explore all available paths."
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};