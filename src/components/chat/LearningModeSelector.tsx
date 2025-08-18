import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  GraduationCap, 
  Brain, 
  TrendingUp,
  BookOpen,
  Target,
  Zap
} from "lucide-react";

interface LearningMode {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  badge?: string;
}

interface LearningModeSelectorProps {
  onModeSelect: (mode: string, prompt: string) => void;
  currentMode?: string;
}

const learningModes: LearningMode[] = [
  {
    id: "ask-anything",
    title: "Ask Anything",
    description: "Get clear, beginner-friendly answers to any finance question",
    icon: MessageCircle,
    color: "text-primary",
    badge: "Popular"
  },
  {
    id: "guided-lesson",
    title: "Guided Lessons",
    description: "Step-by-step learning on specific investment topics",
    icon: GraduationCap,
    color: "text-education",
    badge: "Structured"
  },
  {
    id: "quiz-practice",
    title: "Quiz & Practice",
    description: "Test your knowledge with interactive quizzes",
    icon: Brain,
    color: "text-success"
  },
  {
    id: "scenarios",
    title: "Real Scenarios",
    description: "Practice with real-world investment situations",
    icon: Target,
    color: "text-warning"
  },
  {
    id: "portfolio-analysis",
    title: "Portfolio Focus",
    description: "Learn through portfolio examples and analysis",
    icon: TrendingUp,
    color: "text-chart-1"
  },
  {
    id: "quick-concepts",
    title: "Quick Concepts",
    description: "Bite-sized explanations of key terms and ideas",
    icon: Zap,
    color: "text-chart-2"
  }
];

const modePrompts = {
  "ask-anything": "I'm ready to answer any questions you have about investing, finance, or the markets. What would you like to know?",
  "guided-lesson": "Let's start a guided lesson! What topic would you like to learn about? I can teach you about:\n\n• Stocks and stock analysis\n• Bonds and fixed income\n• ETFs and mutual funds\n• Risk management\n• Portfolio diversification\n• Financial planning basics\n\nJust let me know what interests you most!",
  "quiz-practice": "Great choice! I'll create interactive quizzes to test your knowledge. What level are you at?\n\n• Beginner (just starting out)\n• Intermediate (some experience)\n• Advanced (experienced investor)\n\nOr tell me a specific topic you'd like to be quizzed on!",
  "scenarios": "Perfect! I'll give you real-world investment scenarios to work through. These help you apply theory to practice. What type of scenario interests you?\n\n• First-time investor decisions\n• Portfolio rebalancing\n• Market volatility responses\n• Retirement planning\n• Risk assessment situations",
  "portfolio-analysis": "Excellent! Let's focus on portfolio concepts. I can help you understand:\n\n• Asset allocation strategies\n• Diversification principles\n• Risk-return analysis\n• Portfolio performance metrics\n• Rebalancing techniques\n\nWhat aspect of portfolio management would you like to explore?",
  "quick-concepts": "Perfect for quick learning! I'll explain investment concepts in simple, digestible chunks. What would you like a quick explanation of?\n\n• Basic terms (P/E ratio, dividend yield, etc.)\n• Investment types\n• Market mechanics\n• Financial metrics\n\nOr just ask about any term you've heard but want to understand better!"
};

export const LearningModeSelector = ({ onModeSelect, currentMode }: LearningModeSelectorProps) => {
  const handleModeSelect = (modeId: string) => {
    const prompt = modePrompts[modeId as keyof typeof modePrompts];
    onModeSelect(modeId, prompt);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
      {learningModes.map((mode) => {
        const Icon = mode.icon;
        const isActive = currentMode === mode.id;
        
        return (
          <Card 
            key={mode.id} 
            className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 ${
              isActive ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-accent/50'
            }`}
            onClick={() => handleModeSelect(mode.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-accent/20 ${mode.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-sm text-foreground truncate">
                      {mode.title}
                    </h3>
                    {mode.badge && (
                      <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                        {mode.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {mode.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};