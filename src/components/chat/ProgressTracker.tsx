import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  BookOpen, 
  Brain, 
  Target, 
  TrendingUp,
  Award,
  Star,
  Zap
} from "lucide-react";

interface ProgressData {
  lessonsCompleted: number;
  quizzesCompleted: number;
  scenariosCompleted: number;
  totalLearningTime: number; // in minutes
  level: 'beginner' | 'intermediate' | 'advanced';
  badges: Array<{
    id: string;
    name: string;
    description: string;
    earned: boolean;
    icon: any;
  }>;
  streak: number; // days
}

interface ProgressTrackerProps {
  progress: ProgressData;
  isVisible: boolean;
  onToggle: () => void;
}

const badges = [
  {
    id: "first-lesson",
    name: "First Steps",
    description: "Completed your first lesson",
    icon: BookOpen,
    requirement: "lessons >= 1"
  },
  {
    id: "quiz-master",
    name: "Quiz Master",
    description: "Completed 5 quizzes",
    icon: Brain,
    requirement: "quizzes >= 5"
  },
  {
    id: "scenario-pro",
    name: "Scenario Pro",
    description: "Completed 3 real-world scenarios",
    icon: Target,
    requirement: "scenarios >= 3"
  },
  {
    id: "learning-streak",
    name: "Consistent Learner",
    description: "7-day learning streak",
    icon: Zap,
    requirement: "streak >= 7"
  },
  {
    id: "portfolio-expert",
    name: "Portfolio Expert",
    description: "Mastered portfolio concepts",
    icon: TrendingUp,
    requirement: "lessons >= 10"
  },
  {
    id: "investment-scholar",
    name: "Investment Scholar",
    description: "Completed 20 lessons",
    icon: Award,
    requirement: "lessons >= 20"
  }
];

export const ProgressTracker = ({ progress, isVisible, onToggle }: ProgressTrackerProps) => {
  if (!isVisible) {
    return (
      <Card className="mb-4 cursor-pointer hover:bg-accent/50 transition-colors" onClick={onToggle}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-education" />
              <span className="font-medium text-sm">View Your Progress</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              Level: {progress.level}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getLevelProgress = () => {
    const totalCompleted = progress.lessonsCompleted + progress.quizzesCompleted + progress.scenariosCompleted;
    switch (progress.level) {
      case 'beginner':
        return { current: totalCompleted, target: 10, next: 'intermediate' };
      case 'intermediate':
        return { current: totalCompleted - 10, target: 20, next: 'advanced' };
      case 'advanced':
        return { current: totalCompleted - 30, target: 50, next: 'expert' };
      default:
        return { current: 0, target: 10, next: 'intermediate' };
    }
  };

  const levelProgress = getLevelProgress();
  const progressPercentage = Math.min((levelProgress.current / levelProgress.target) * 100, 100);

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-education" />
            Learning Progress
          </CardTitle>
          <button 
            onClick={onToggle}
            className="text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            Hide
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Level Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="capitalize bg-education">
                {progress.level}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {levelProgress.current}/{levelProgress.target} to {levelProgress.next}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Learning Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <BookOpen className="w-4 h-4 text-education mr-1" />
              <span className="font-semibold">{progress.lessonsCompleted}</span>
            </div>
            <p className="text-xs text-muted-foreground">Lessons</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Brain className="w-4 h-4 text-success mr-1" />
              <span className="font-semibold">{progress.quizzesCompleted}</span>
            </div>
            <p className="text-xs text-muted-foreground">Quizzes</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Target className="w-4 h-4 text-warning mr-1" />
              <span className="font-semibold">{progress.scenariosCompleted}</span>
            </div>
            <p className="text-xs text-muted-foreground">Scenarios</p>
          </div>
        </div>

        {/* Badges */}
        <div>
          <h4 className="text-sm font-medium mb-2">Recent Achievements</h4>
          <div className="grid grid-cols-2 gap-2">
            {badges.slice(0, 4).map((badge) => {
              const Icon = badge.icon;
              const isEarned = checkBadgeEarned(badge.requirement, progress);
              
              return (
                <div 
                  key={badge.id}
                  className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                    isEarned 
                      ? 'bg-success/10 border-success/20 text-success' 
                      : 'bg-muted/20 border-border/30 text-muted-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{badge.name}</p>
                    <p className="text-xs opacity-75 truncate">{badge.description}</p>
                  </div>
                  {isEarned && <Star className="w-3 h-3 text-success flex-shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Learning Streak */}
        {progress.streak > 0 && (
          <div className="flex items-center justify-between p-3 bg-accent/20 rounded-lg">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-education" />
              <span className="text-sm font-medium">Learning Streak</span>
            </div>
            <Badge variant="secondary" className="bg-education text-white">
              {progress.streak} days
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

function checkBadgeEarned(requirement: string, progress: ProgressData): boolean {
  // Simple requirement parser
  if (requirement.includes("lessons >= 1")) return progress.lessonsCompleted >= 1;
  if (requirement.includes("quizzes >= 5")) return progress.quizzesCompleted >= 5;
  if (requirement.includes("scenarios >= 3")) return progress.scenariosCompleted >= 3;
  if (requirement.includes("streak >= 7")) return progress.streak >= 7;
  if (requirement.includes("lessons >= 10")) return progress.lessonsCompleted >= 10;
  if (requirement.includes("lessons >= 20")) return progress.lessonsCompleted >= 20;
  return false;
}