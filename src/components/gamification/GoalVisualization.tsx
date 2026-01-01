import { useState } from "react";
import { motion } from "framer-motion";
import { Plane, MapPin, Sparkles, Target, Home, Car, GraduationCap, Palmtree } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Goal {
  id: string;
  name: string;
  icon: "trip" | "home" | "car" | "education" | "emergency";
  target: number;
  current: number;
  destination?: string;
}

interface GoalVisualizationProps {
  goals?: Goal[];
  animationDelay?: number;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  trip: Plane,
  home: Home,
  car: Car,
  education: GraduationCap,
  emergency: Target,
};

const defaultGoals: Goal[] = [
  { id: "1", name: "Dream Vacation", icon: "trip", target: 5000, current: 3200, destination: "Bali 🌴" },
  { id: "2", name: "Emergency Fund", icon: "emergency", target: 10000, current: 7500 },
  { id: "3", name: "New Car", icon: "car", target: 25000, current: 8000 },
];

export const GoalVisualization = ({ 
  goals = defaultGoals,
  animationDelay = 0 
}: GoalVisualizationProps) => {
  const [activeGoal, setActiveGoal] = useState(0);
  
  const goal = goals[activeGoal];
  const progress = (goal.current / goal.target) * 100;
  const Icon = iconMap[goal.icon];

  const milestones = [0, 25, 50, 75, 100];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: animationDelay }}
    >
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-card to-card/80">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
            transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
            className="absolute inset-0 opacity-10 bg-gradient-to-br from-primary via-transparent to-secondary bg-[length:400%_400%]"
          />
          {goal.icon === "trip" && (
            <>
              <motion.div
                animate={{ x: [0, 100, 0] }}
                transition={{ duration: 15, repeat: Infinity }}
                className="absolute top-4 left-10 w-16 h-8 bg-white/5 rounded-full blur-sm"
              />
              <motion.div
                animate={{ x: [0, -80, 0] }}
                transition={{ duration: 12, repeat: Infinity }}
                className="absolute top-12 right-20 w-12 h-6 bg-white/5 rounded-full blur-sm"
              />
            </>
          )}
        </div>

        <CardHeader className="relative z-10 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Goal Progress
            </CardTitle>
            
            <div className="flex gap-1">
              {goals.map((g, i) => {
                const GIcon = iconMap[g.icon];
                return (
                  <motion.button
                    key={g.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveGoal(i)}
                    className={`p-2 rounded-lg transition-colors ${
                      i === activeGoal 
                        ? "bg-primary/20 text-primary" 
                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <GIcon className="w-4 h-4" />
                  </motion.button>
                );
              })}
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-text-heading">{goal.name}</h3>
              {goal.destination && (
                <p className="text-sm text-text-secondary">Destination: {goal.destination}</p>
              )}
            </div>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
              {progress.toFixed(0)}% Complete
            </Badge>
          </div>

          <div className="relative py-8">
            <div className="absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 bg-muted/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.5, delay: animationDelay + 0.3, ease: "easeOut" }}
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-secondary rounded-full"
              >
                <motion.div
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                />
              </motion.div>
            </div>

            {milestones.map((milestone, i) => (
              <motion.div
                key={milestone}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: animationDelay + 0.5 + i * 0.1 }}
                className="absolute top-1/2 -translate-y-1/2"
                style={{ left: `${milestone}%`, transform: `translateX(-50%) translateY(-50%)` }}
              >
                <div className={`w-4 h-4 rounded-full border-2 transition-colors ${
                  progress >= milestone 
                    ? "bg-primary border-primary" 
                    : "bg-muted border-muted-foreground/30"
                }`}>
                  {progress >= milestone && i > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 0.5, delay: animationDelay + 0.8 + i * 0.1 }}
                      className="absolute inset-0 bg-primary/30 rounded-full"
                    />
                  )}
                </div>
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
                  {milestone === 0 ? "Start" : milestone === 100 ? "Goal!" : `${milestone}%`}
                </span>
              </motion.div>
            ))}

            <motion.div
              initial={{ left: 0 }}
              animate={{ left: `${Math.min(progress, 95)}%` }}
              transition={{ duration: 1.5, delay: animationDelay + 0.5, ease: "easeOut" }}
              className="absolute top-1/2 -translate-y-1/2"
              style={{ transform: `translateX(-50%) translateY(-50%)` }}
            >
              <motion.div
                animate={{ 
                  y: goal.icon === "trip" ? [0, -8, 0] : [0, -3, 0],
                  rotate: goal.icon === "trip" ? [0, 5, 0, -5, 0] : 0
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="relative"
              >
                <div className="absolute inset-0 bg-primary/30 rounded-full blur-md scale-150" />
                <div className="relative bg-gradient-to-br from-primary to-secondary p-2 rounded-full shadow-lg">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                
                {goal.icon === "trip" && (
                  <motion.div
                    animate={{ opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="absolute -left-4 top-1/2 -translate-y-1/2 w-4 h-0.5 bg-gradient-to-l from-primary/50 to-transparent"
                  />
                )}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: animationDelay + 0.8, type: "spring" }}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2"
            >
              <motion.div
                animate={{ scale: progress >= 100 ? [1, 1.2, 1] : 1 }}
                transition={{ duration: 0.5, repeat: progress >= 100 ? Infinity : 0, repeatDelay: 1 }}
              >
                <div className={`p-2 rounded-full ${progress >= 100 ? "bg-success" : "bg-muted"}`}>
                  {goal.icon === "trip" ? (
                    <Palmtree className={`w-5 h-5 ${progress >= 100 ? "text-white" : "text-muted-foreground"}`} />
                  ) : (
                    <MapPin className={`w-5 h-5 ${progress >= 100 ? "text-white" : "text-muted-foreground"}`} />
                  )}
                </div>
              </motion.div>
            </motion.div>
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
            <div>
              <p className="text-xs text-text-secondary">Saved so far</p>
              <p className="text-xl font-bold text-text-heading">
                ${goal.current.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-text-secondary">Goal</p>
              <p className="text-xl font-bold text-primary">
                ${goal.target.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="mt-3 p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">
                ${(goal.target - goal.current).toLocaleString()} to go
              </span>
              <span className="text-sm font-medium text-primary">
                ~{Math.ceil((goal.target - goal.current) / 500)} months at $500/mo
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
