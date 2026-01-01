import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, Flame, Gift, BookOpen, ShoppingBag, Dumbbell, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";

interface Habit {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const dailyHabits: Habit[] = [
  { 
    id: "read", 
    label: "Read for 30m", 
    icon: <BookOpen className="w-4 h-4" />,
    color: "from-blue-500/20 to-blue-500/10"
  },
  { 
    id: "no-impulse", 
    label: "No Impulse Buys", 
    icon: <ShoppingBag className="w-4 h-4" />,
    color: "from-emerald-500/20 to-emerald-500/10"
  },
  { 
    id: "exercise", 
    label: "Exercise", 
    icon: <Dumbbell className="w-4 h-4" />,
    color: "from-orange-500/20 to-orange-500/10"
  },
];

interface HabitStackCardProps {
  animationDelay?: number;
}

export const HabitStackCard = ({ animationDelay = 0 }: HabitStackCardProps) => {
  const [completedHabits, setCompletedHabits] = useState<Set<string>>(new Set());
  const [showReward, setShowReward] = useState(false);
  const [streak, setStreak] = useState(0);
  const { toast } = useToast();

  // Load from localStorage on mount
  useEffect(() => {
    const today = new Date().toDateString();
    const saved = localStorage.getItem('habitStack');
    
    if (saved) {
      const data = JSON.parse(saved);
      if (data.date === today) {
        setCompletedHabits(new Set(data.completed));
        setShowReward(data.completed.length === dailyHabits.length);
      } else {
        // New day - reset and increment streak if yesterday was complete
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (data.date === yesterday.toDateString() && data.completed.length === dailyHabits.length) {
          setStreak((data.streak || 0) + 1);
          localStorage.setItem('habitStack', JSON.stringify({ 
            date: today, 
            completed: [], 
            streak: (data.streak || 0) + 1 
          }));
        } else {
          setStreak(0);
          localStorage.setItem('habitStack', JSON.stringify({ date: today, completed: [], streak: 0 }));
        }
      }
      setStreak(data.streak || 0);
    }
  }, []);

  // Save to localStorage when habits change
  useEffect(() => {
    const today = new Date().toDateString();
    const data = { 
      date: today, 
      completed: Array.from(completedHabits),
      streak 
    };
    localStorage.setItem('habitStack', JSON.stringify(data));
  }, [completedHabits, streak]);

  const toggleHabit = (habitId: string) => {
    const newCompleted = new Set(completedHabits);
    
    if (newCompleted.has(habitId)) {
      newCompleted.delete(habitId);
      setShowReward(false);
    } else {
      newCompleted.add(habitId);
      
      // Check if all habits completed
      if (newCompleted.size === dailyHabits.length) {
        setShowReward(true);
        triggerRewardCelebration();
      }
    }
    
    setCompletedHabits(newCompleted);
  };

  const triggerRewardCelebration = () => {
    // Confetti celebration
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#F59E0B', '#8B5CF6']
      });
    }
    
    toast({
      title: "🎉 Habit Stack Complete!",
      description: "You've earned $10 of guilt-free spending today!",
    });
  };

  const completionPercentage = (completedHabits.size / dailyHabits.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: animationDelay }}
    >
      <Card className="overflow-hidden border-border/50 bg-gradient-to-br from-card via-card to-muted/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Flame className="w-4 h-4 text-primary" />
              </div>
              <span className="text-base font-semibold">Daily Habits</span>
            </div>
            {streak > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                <Flame className="w-3 h-3 text-amber-500" />
                <span className="text-xs font-medium text-amber-600 dark:text-amber-400">{streak} day streak</span>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div className="relative h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>

          {/* Habits List */}
          <div className="space-y-2">
            {dailyHabits.map((habit) => {
              const isCompleted = completedHabits.has(habit.id);
              
              return (
                <motion.button
                  key={habit.id}
                  onClick={() => toggleHabit(habit.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all border ${
                    isCompleted 
                      ? 'bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border-emerald-500/30' 
                      : `bg-gradient-to-r ${habit.color} border-border/50 hover:border-primary/30`
                  }`}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    animate={isCompleted ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground" />
                    )}
                  </motion.div>
                  
                  <div className={`p-1.5 rounded-md ${isCompleted ? 'bg-emerald-500/20' : 'bg-background/50'}`}>
                    {habit.icon}
                  </div>
                  
                  <span className={`text-sm font-medium flex-1 text-left ${
                    isCompleted ? 'text-emerald-600 dark:text-emerald-400 line-through' : 'text-foreground'
                  }`}>
                    {habit.label}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Reward Section */}
          <AnimatePresence>
            {showReward && (
              <motion.div
                initial={{ opacity: 0, y: 10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-purple-500/20 border border-amber-500/30 relative overflow-hidden">
                  {/* Sparkle decorations */}
                  <Sparkles className="absolute top-2 right-2 w-4 h-4 text-amber-500 animate-pulse" />
                  <Sparkles className="absolute bottom-2 left-2 w-3 h-3 text-purple-500 animate-pulse" />
                  
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-amber-500/20 border border-amber-500/30">
                      <Gift className="w-5 h-5 text-amber-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">
                        🎉 Reward Unlocked!
                      </p>
                      <p className="text-xs text-muted-foreground">
                        You've earned <span className="text-emerald-500 font-bold">$10</span> of guilt-free spending today!
                      </p>
                    </div>
                  </div>
                  
                  <p className="mt-3 text-xs text-center text-muted-foreground italic">
                    "Discipline = Freedom" — Your daily habits fund your future
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Motivation Text */}
          {!showReward && completedHabits.size > 0 && (
            <p className="text-xs text-center text-muted-foreground">
              {dailyHabits.length - completedHabits.size} more to unlock your reward!
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
