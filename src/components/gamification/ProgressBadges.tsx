import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Target, BookOpen, TrendingUp, Shield, Award, Lock, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface BadgeType {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  category: 'learning' | 'portfolio' | 'engagement' | 'achievement';
  requirement: {
    type: 'lessons_completed' | 'quizzes_passed' | 'simulations_run' | 'days_active' | 'portfolio_entries';
    count: number;
  };
  earned: boolean;
  earnedDate?: Date;
  progress: number; // 0-100
}

interface UserProgress {
  lessonsCompleted: number;
  quizzesPassed: number;
  simulationsRun: number;
  daysActive: number;
  portfolioEntries: number;
}

const allBadges: BadgeType[] = [
  // Learning Badges
  {
    id: 'first_lesson',
    name: 'First Steps',
    description: 'Complete your first lesson',
    icon: BookOpen,
    color: 'text-success',
    category: 'learning',
    requirement: { type: 'lessons_completed', count: 1 },
    earned: true,
    earnedDate: new Date(Date.now() - 86400000 * 2),
    progress: 100
  },
  {
    id: 'beginner',
    name: 'Beginner Investor',
    description: 'Complete 5 lessons',
    icon: Star,
    color: 'text-education',
    category: 'learning',
    requirement: { type: 'lessons_completed', count: 5 },
    earned: false,
    progress: 60
  },
  {
    id: 'quiz_master',
    name: 'Quiz Master',
    description: 'Pass 10 quizzes with 80% or higher',
    icon: Target,
    color: 'text-primary',
    category: 'learning',
    requirement: { type: 'quizzes_passed', count: 10 },
    earned: false,
    progress: 30
  },
  
  // Portfolio Badges
  {
    id: 'first_portfolio',
    name: 'Portfolio Builder',
    description: 'Create your first portfolio entry',
    icon: TrendingUp,
    color: 'text-success',
    category: 'portfolio',
    requirement: { type: 'portfolio_entries', count: 1 },
    earned: true,
    earnedDate: new Date(Date.now() - 86400000 * 5),
    progress: 100
  },
  {
    id: 'diversified',
    name: 'Diversification Pro',
    description: 'Add 10 different holdings to your portfolio',
    icon: Shield,
    color: 'text-warning',
    category: 'portfolio',
    requirement: { type: 'portfolio_entries', count: 10 },
    earned: false,
    progress: 70
  },
  
  // Engagement Badges
  {
    id: 'consistent_learner',
    name: 'Consistent Learner',
    description: 'Use ELIN for 7 consecutive days',
    icon: Trophy,
    color: 'text-education',
    category: 'engagement',
    requirement: { type: 'days_active', count: 7 },
    earned: false,
    progress: 85
  },
  {
    id: 'simulation_expert',
    name: 'Scenario Expert',
    description: 'Run 20 portfolio simulations',
    icon: Award,
    color: 'text-primary',
    category: 'achievement',
    requirement: { type: 'simulations_run', count: 20 },
    earned: false,
    progress: 15
  }
];

export const ProgressBadges = () => {
  const [badges, setBadges] = useState<BadgeType[]>(allBadges);
  const [userProgress] = useState<UserProgress>({
    lessonsCompleted: 3,
    quizzesPassed: 3,
    simulationsRun: 3,
    daysActive: 6,
    portfolioEntries: 7
  });

  const [selectedBadge, setSelectedBadge] = useState<BadgeType | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  // Simulate badge earning
  useEffect(() => {
    const checkBadgeProgress = () => {
      setBadges(prevBadges => 
        prevBadges.map(badge => {
          if (badge.earned) return badge;
          
          let currentProgress = 0;
          switch (badge.requirement.type) {
            case 'lessons_completed':
              currentProgress = (userProgress.lessonsCompleted / badge.requirement.count) * 100;
              break;
            case 'quizzes_passed':
              currentProgress = (userProgress.quizzesPassed / badge.requirement.count) * 100;
              break;
            case 'simulations_run':
              currentProgress = (userProgress.simulationsRun / badge.requirement.count) * 100;
              break;
            case 'days_active':
              currentProgress = (userProgress.daysActive / badge.requirement.count) * 100;
              break;
            case 'portfolio_entries':
              currentProgress = (userProgress.portfolioEntries / badge.requirement.count) * 100;
              break;
          }
          
          const progress = Math.min(100, currentProgress);
          const newlyEarned = progress >= 100 && !badge.earned;
          
          if (newlyEarned) {
            // Show celebration for newly earned badges
            setTimeout(() => {
              toast.success(`🎉 Badge Earned: ${badge.name}!`);
              setShowCelebration(true);
              setTimeout(() => setShowCelebration(false), 3000);
            }, 500);
          }
          
          return {
            ...badge,
            progress,
            earned: progress >= 100,
            earnedDate: newlyEarned ? new Date() : badge.earnedDate
          };
        })
      );
    };

    checkBadgeProgress();
  }, [userProgress]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'learning': return 'bg-education/10 border-education/20 text-education';
      case 'portfolio': return 'bg-success/10 border-success/20 text-success';
      case 'engagement': return 'bg-primary/10 border-primary/20 text-primary'; 
      case 'achievement': return 'bg-warning/10 border-warning/20 text-warning';
      default: return 'bg-muted border-border text-muted-foreground';
    }
  };

  const earnedBadges = badges.filter(badge => badge.earned);
  const inProgressBadges = badges.filter(badge => !badge.earned && badge.progress > 0);
  const lockedBadges = badges.filter(badge => !badge.earned && badge.progress === 0);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-warning" />
            Achievement Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{earnedBadges.length}</div>
              <div className="text-sm text-muted-foreground">Earned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-education">{inProgressBadges.length}</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">{lockedBadges.length}</div>
              <div className="text-sm text-muted-foreground">Locked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{badges.length}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Earned Badges */}
      {earnedBadges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              Earned Badges ({earnedBadges.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {earnedBadges.map((badge) => {
                const IconComponent = badge.icon;
                return (
                  <Dialog key={badge.id}>
                    <DialogTrigger asChild>
                      <motion.div
                        className="relative p-4 bg-card border-2 border-success/20 rounded-lg cursor-pointer hover:shadow-lg transition-all duration-300 group"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="text-center space-y-2">
                          <div className="mx-auto w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                            <IconComponent className={`h-6 w-6 ${badge.color}`} />
                          </div>
                          <h3 className="font-medium text-sm">{badge.name}</h3>
                          <Badge className={getCategoryColor(badge.category)}>
                            {badge.category}
                          </Badge>
                        </div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-success rounded-full flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                      </motion.div>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <IconComponent className={`h-6 w-6 ${badge.color}`} />
                          {badge.name}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p className="text-muted-foreground">{badge.description}</p>
                        <div className="p-4 bg-success/10 rounded-lg">
                          <div className="flex items-center gap-2 text-success">
                            <CheckCircle className="h-4 w-4" />
                            <span className="font-medium">Badge Earned!</span>
                          </div>
                          {badge.earnedDate && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Earned on {badge.earnedDate.toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* In Progress Badges */}
      {inProgressBadges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-education" />
              In Progress ({inProgressBadges.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inProgressBadges.map((badge) => {
                const IconComponent = badge.icon;
                return (
                  <div key={badge.id} className="p-4 bg-card border rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <IconComponent className={`h-5 w-5 ${badge.color}`} />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{badge.name}</h3>
                          <Badge className={getCategoryColor(badge.category)}>
                            {badge.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{badge.description}</p>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Progress</span>
                            <span>{Math.round(badge.progress)}%</span>
                          </div>
                          <Progress value={badge.progress} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Locked Badges */}
      {lockedBadges.length > 0 && (
        <Card className="opacity-75">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-muted-foreground" />
              Locked Badges ({lockedBadges.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {lockedBadges.map((badge) => {
                const IconComponent = badge.icon;
                return (
                  <div key={badge.id} className="p-4 bg-muted/50 border border-dashed rounded-lg text-center space-y-2">
                    <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium text-sm text-muted-foreground">{badge.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {badge.category}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Celebration Animation */}
      {showCelebration && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
        >
          <div className="bg-primary text-primary-foreground p-8 rounded-lg shadow-lg text-center">
            <Trophy className="h-16 w-16 mx-auto mb-4 animate-bounce" />
            <h2 className="text-2xl font-bold mb-2">Achievement Unlocked!</h2>
            <p className="text-primary-foreground/80">Keep up the great work!</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};