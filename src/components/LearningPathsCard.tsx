import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Play, 
  Trophy, 
  Clock,
  CheckCircle,
  ArrowRight,
  Star
} from "lucide-react";
import { motion } from "framer-motion";

// Mock learning paths data
const learningPaths = [
  {
    id: 1,
    title: "Investment Basics",
    description: "Master the fundamentals of investing",
    progress: 75,
    totalLessons: 12,
    completedLessons: 9,
    estimatedTime: "45 min",
    difficulty: "Beginner",
    category: "Foundation",
    lastAccessed: "2 hours ago",
    nextLesson: "Understanding Market Indices"
  },
  {
    id: 2,
    title: "Portfolio Management",
    description: "Learn to build and optimize investment portfolios",
    progress: 40,
    totalLessons: 15,
    completedLessons: 6,
    estimatedTime: "1.2 hrs",
    difficulty: "Intermediate",
    category: "Strategy",
    lastAccessed: "1 day ago",
    nextLesson: "Asset Allocation Strategies"
  },
  {
    id: 3,
    title: "Risk Management",
    description: "Identify and mitigate investment risks",
    progress: 90,
    totalLessons: 10,
    completedLessons: 9,
    estimatedTime: "20 min",
    difficulty: "Intermediate",
    category: "Risk",
    lastAccessed: "3 hours ago",
    nextLesson: "Advanced Hedging Techniques"
  },
  {
    id: 4,
    title: "Market Analysis",
    description: "Technical and fundamental analysis techniques",
    progress: 15,
    totalLessons: 18,
    completedLessons: 3,
    estimatedTime: "2.5 hrs",
    difficulty: "Advanced",
    category: "Analysis",
    lastAccessed: "1 week ago",
    nextLesson: "Chart Pattern Recognition"
  }
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "Beginner": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    case "Intermediate": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "Advanced": return "bg-red-500/20 text-red-400 border-red-500/30";
    default: return "bg-slate-500/20 text-slate-400 border-slate-500/30";
  }
};

// Neon progress bar component
const NeonProgressBar = ({ progress }: { progress: number }) => {
  return (
    <div className="relative w-full h-2 bg-slate-800 rounded-full overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-full" />
      
      {/* Progress fill with animated gradient */}
      <motion.div
        className="absolute top-0 left-0 h-full rounded-full"
        style={{
          background: "linear-gradient(90deg, #16a34a, #06b6d4, #16a34a)",
          backgroundSize: "200% 100%",
          width: `${progress}%`,
          boxShadow: "0 0 10px rgba(22, 163, 74, 0.5)"
        }}
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        {/* Animated shimmer effect */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)",
            animation: "shimmer 2s infinite linear"
          }}
        />
      </motion.div>
      
      {/* Glow effect */}
      <div 
        className="absolute top-0 left-0 h-full rounded-full blur-sm"
        style={{
          background: "linear-gradient(90deg, #16a34a, #06b6d4)",
          width: `${progress}%`,
          opacity: 0.6
        }}
      />
    </div>
  );
};

export const LearningPathsCard = () => {
  const [hoveredPath, setHoveredPath] = useState<number | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl">
        {/* Neon glow border */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 via-cyan-400/20 to-emerald-400/20 rounded-lg blur-sm" />
        <div className="absolute inset-[1px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-lg" />
        
        <CardHeader className="relative pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <BookOpen className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-white">Learning Paths</CardTitle>
                <p className="text-slate-400 text-sm">Structured courses to boost your investment knowledge</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-semibold">Level 7</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative space-y-4">
          {learningPaths.map((path, index) => (
            <motion.div
              key={path.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative p-5 rounded-lg bg-slate-800/40 border border-slate-700/30 hover:border-emerald-500/30 hover:bg-slate-700/40 transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setHoveredPath(path.id)}
              onMouseLeave={() => setHoveredPath(null)}
            >
              {/* Hover glow effect */}
              <div className={`absolute inset-0 rounded-lg bg-gradient-to-r from-emerald-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              
              <div className="relative">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-white font-bold text-lg group-hover:text-emerald-100 transition-colors">
                        {path.title}
                      </h4>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getDifficultyColor(path.difficulty)}`}
                      >
                        {path.difficulty}
                      </Badge>
                    </div>
                    <p className="text-slate-400 text-sm mb-3">
                      {path.description}
                    </p>
                  </div>

                  {/* Completion status */}
                  {path.progress === 100 ? (
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">Complete</span>
                    </div>
                  ) : (
                    <div className="text-right">
                      <div className="text-emerald-400 font-bold text-xl">{path.progress}%</div>
                      <div className="text-slate-500 text-xs">complete</div>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-400 text-sm">
                      {path.completedLessons}/{path.totalLessons} lessons
                    </span>
                    <span className="text-slate-400 text-sm flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {path.estimatedTime} remaining
                    </span>
                  </div>
                  <NeonProgressBar progress={path.progress} />
                </div>

                {/* Next Lesson & Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-slate-300 text-sm">
                      <span className="text-slate-500">Next: </span>
                      {path.nextLesson}
                    </p>
                    <p className="text-slate-500 text-xs mt-1">
                      Last accessed {path.lastAccessed}
                    </p>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button 
                      size="sm"
                      className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40 transition-all"
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Continue Learning
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>

                {/* Achievement indicator */}
                {path.progress > 80 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center"
                  >
                    <Star className="w-3 h-3 text-yellow-900" />
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}

          {/* Footer Stats */}
          <div className="mt-6 pt-4 border-t border-slate-700/30">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-emerald-400 text-2xl font-bold">24</div>
                <div className="text-slate-400 text-sm">Lessons Completed</div>
              </div>
              <div>
                <div className="text-cyan-400 text-2xl font-bold">8.5h</div>
                <div className="text-slate-400 text-sm">Learning Time</div>
              </div>
              <div>
                <div className="text-purple-400 text-2xl font-bold">3</div>
                <div className="text-slate-400 text-sm">Certificates Earned</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CSS for shimmer animation */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </motion.div>
  );
};