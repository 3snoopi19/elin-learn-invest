import { Button } from "@/components/ui/button";
import { 
  HelpCircle, 
  BarChart3, 
  Brain, 
  Lightbulb, 
  TrendingUp, 
  Calculator,
  BookOpen,
  Target
} from "lucide-react";

interface QuickReplyButtonsProps {
  onQuickReply: (message: string, type?: string) => void;
  isVisible: boolean;
}

const quickReplies = [
  {
    label: "Explain with example",
    message: "Can you explain that with a simple example?",
    icon: Lightbulb,
    type: "clarification"
  },
  {
    label: "Show me a chart",
    message: "Can you show me a visual chart or graph to illustrate this concept?",
    icon: BarChart3,
    type: "visual"
  },
  {
    label: "Give me a quiz",
    message: "I'd like to test my understanding with a quick quiz",
    icon: Brain,
    type: "quiz"
  },
  {
    label: "Real-world scenario",
    message: "Can you give me a real-world investment scenario to practice?",
    icon: Target,
    type: "scenario"
  },
  {
    label: "Start a lesson",
    message: "I'd like to start a guided lesson on a new topic",
    icon: BookOpen,
    type: "lesson"
  },
  {
    label: "Portfolio example",
    message: "Show me how this applies to portfolio management",
    icon: TrendingUp,
    type: "portfolio"
  }
];

export const QuickReplyButtons = ({ onQuickReply, isVisible }: QuickReplyButtonsProps) => {
  if (!isVisible) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4 animate-in fade-in duration-300">
      {quickReplies.map((reply, index) => {
        const Icon = reply.icon;
        return (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onQuickReply(reply.message, reply.type)}
            className="text-xs h-8 px-3 bg-card hover:bg-accent hover:text-accent-foreground border-border/50 transition-all duration-200 hover:scale-105"
          >
            <Icon className="w-3 h-3 mr-1.5" />
            {reply.label}
          </Button>
        );
      })}
    </div>
  );
};