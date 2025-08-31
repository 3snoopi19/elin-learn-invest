import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Lightbulb, 
  TrendingUp, 
  PieChart, 
  CreditCard, 
  Building2, 
  Sparkles,
  MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface QuickPrompt {
  id: string;
  text: string;
  category: string;
  icon: React.ReactNode;
  color: string;
}

const quickPrompts: QuickPrompt[] = [
  {
    id: '1',
    text: "What's a REIT?",
    category: "Real Estate",
    icon: <Building2 className="w-4 h-4" />,
    color: "bg-primary/10 text-primary border-primary/30"
  },
  {
    id: '2', 
    text: "Explain bonds vs stocks",
    category: "Basics",
    icon: <TrendingUp className="w-4 h-4" />,
    color: "bg-success/10 text-success border-success/30"
  },
  {
    id: '3',
    text: "How do I diversify my portfolio?",
    category: "Portfolio",
    icon: <PieChart className="w-4 h-4" />,
    color: "bg-secondary/10 text-secondary border-secondary/30"
  },
  {
    id: '4',
    text: "Should I pay off credit cards first?",
    category: "Debt",
    icon: <CreditCard className="w-4 h-4" />,
    color: "bg-warning/10 text-warning border-warning/30"
  },
  {
    id: '5',
    text: "What's an expense ratio?",
    category: "ETFs",
    icon: <Lightbulb className="w-4 h-4" />,
    color: "bg-education/10 text-education border-education/30"
  },
  {
    id: '6',
    text: "How much should I invest monthly?",
    category: "Planning",
    icon: <Sparkles className="w-4 h-4" />,
    color: "bg-accent/10 text-accent border-accent/30"
  }
];

interface QuickPromptsPanelProps {
  onPromptSelect: (prompt: string) => void;
  isVisible: boolean;
}

export const QuickPromptsPanel = ({ onPromptSelect, isVisible }: QuickPromptsPanelProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Basics', 'Portfolio', 'Real Estate', 'Debt', 'ETFs', 'Planning'];
  
  const filteredPrompts = selectedCategory === 'All' 
    ? quickPrompts 
    : quickPrompts.filter(prompt => prompt.category === selectedCategory);

  const handlePromptClick = (prompt: QuickPrompt) => {
    onPromptSelect(prompt.text);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="professional-card mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-text-heading">
                <MessageSquare className="w-4 h-4 text-primary" />
                Quick Questions
                <Badge variant="secondary" className="text-xs">
                  New to investing?
                </Badge>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="h-7 text-xs px-3"
                  >
                    {category}
                  </Button>
                ))}
              </div>

              {/* Quick Prompts Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredPrompts.map((prompt, index) => (
                  <motion.button
                    key={prompt.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handlePromptClick(prompt)}
                    className={`
                      flex items-center gap-2 p-3 rounded-lg border text-left 
                      hover:shadow-md transition-all duration-200 
                      touch-target mobile-button
                      ${prompt.color}
                    `}
                  >
                    {prompt.icon}
                    <span className="text-sm font-medium flex-1">
                      {prompt.text}
                    </span>
                  </motion.button>
                ))}
              </div>

              {/* Help Text */}
              <div className="text-center pt-2 border-t border-border/30">
                <p className="text-text-muted text-xs">
                  Click any question to start learning, or ask your own!
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};