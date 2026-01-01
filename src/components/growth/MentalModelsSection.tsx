import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, Sparkles, Loader2, Lightbulb, Target, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MentalModel {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  shortDesc: string;
}

const mentalModels: MentalModel[] = [
  {
    id: "opportunity-cost",
    title: "Opportunity Cost",
    icon: <Target className="w-6 h-6" />,
    color: "from-blue-500/20 to-cyan-500/20",
    shortDesc: "Every choice has a hidden price"
  },
  {
    id: "pareto-principle",
    title: "The Pareto Principle (80/20 Rule)",
    icon: <TrendingUp className="w-6 h-6" />,
    color: "from-emerald-500/20 to-green-500/20",
    shortDesc: "Focus on the vital few, not the trivial many"
  },
  {
    id: "compound-habits",
    title: "Compound Habits",
    icon: <Lightbulb className="w-6 h-6" />,
    color: "from-amber-500/20 to-orange-500/20",
    shortDesc: "Small actions, exponential results"
  },
  {
    id: "sunk-cost-fallacy",
    title: "Sunk Cost Fallacy",
    icon: <Brain className="w-6 h-6" />,
    color: "from-purple-500/20 to-pink-500/20",
    shortDesc: "Don't throw good money after bad"
  },
  {
    id: "margin-of-safety",
    title: "Margin of Safety",
    icon: <Target className="w-6 h-6" />,
    color: "from-rose-500/20 to-red-500/20",
    shortDesc: "Build buffers for the unexpected"
  },
  {
    id: "delayed-gratification",
    title: "Delayed Gratification",
    icon: <TrendingUp className="w-6 h-6" />,
    color: "from-indigo-500/20 to-violet-500/20",
    shortDesc: "Future rewards beat instant pleasure"
  }
];

export const MentalModelsSection = () => {
  const [expandedModel, setExpandedModel] = useState<string | null>(null);
  const [aiExplanation, setAiExplanation] = useState<{ money: string; life: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generateExplanation = async (model: MentalModel) => {
    setIsLoading(true);
    setAiExplanation(null);

    try {
      const { data, error } = await supabase.functions.invoke('explain-term', {
        body: { 
          term: model.title, 
          definition: model.shortDesc,
          mode: "mental-model"
        }
      });

      if (error) throw error;

      if (data?.explanation) {
        // Parse the AI response to extract money and life applications
        const explanation = data.explanation;
        const parts = explanation.split(/\*\*Life:\*\*/i);
        const moneyPart = parts[0]?.replace(/\*\*Money:\*\*/i, '').trim() || explanation;
        const lifePart = parts[1]?.trim() || "This principle helps you make better decisions in all areas of life.";
        
        setAiExplanation({
          money: moneyPart,
          life: lifePart
        });
      }
    } catch (error) {
      console.error('Mental model explanation error:', error);
      // Fallback explanations
      const fallbacks: Record<string, { money: string; life: string }> = {
        "opportunity-cost": {
          money: "Every dollar you spend on coffee is a dollar that could have grown in your investment account.",
          life: "Every hour spent scrolling social media is an hour not spent learning a new skill or building relationships."
        },
        "pareto-principle": {
          money: "80% of your wealth often comes from 20% of your investments or income sources.",
          life: "80% of your happiness often comes from 20% of your activities and relationships."
        },
        "compound-habits": {
          money: "Saving just $10/day grows to over $100,000 in 20 years with compound interest.",
          life: "Reading 20 pages daily means 30+ books per year, transforming your knowledge over time."
        },
        "sunk-cost-fallacy": {
          money: "Holding a losing stock just because you paid more for it is a trap—sell based on future potential.",
          life: "Staying in a bad relationship because of the time invested leads to more wasted time."
        },
        "margin-of-safety": {
          money: "Keep 3-6 months of expenses saved so one emergency doesn't derail your finances.",
          life: "Leave extra time for important meetings so traffic doesn't make you late and stressed."
        },
        "delayed-gratification": {
          money: "Skipping the new iPhone today means an extra $1,000 invested for your future.",
          life: "Studying hard now means better career options and more freedom later."
        }
      };
      
      setAiExplanation(fallbacks[model.id] || {
        money: "This principle applies to how you manage and grow your money.",
        life: "This principle helps you make better decisions in all areas of life."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = (model: MentalModel) => {
    if (expandedModel === model.id) {
      setExpandedModel(null);
      setAiExplanation(null);
    } else {
      setExpandedModel(model.id);
      generateExplanation(model);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <Brain className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Mental Models</h2>
          <p className="text-sm text-muted-foreground">Success frameworks for money & life</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mentalModels.map((model, index) => (
          <motion.div
            key={model.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card 
              className={`cursor-pointer transition-all hover:shadow-lg bg-gradient-to-br ${model.color} border-border/50 ${
                expandedModel === model.id ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => handleCardClick(model)}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-background/80 text-primary">
                    {model.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{model.title}</h3>
                    <p className="text-sm text-muted-foreground">{model.shortDesc}</p>
                  </div>
                </div>

                {expandedModel === model.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 pt-4 border-t border-border/50"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-5 h-5 animate-spin text-primary mr-2" />
                        <span className="text-sm text-muted-foreground">Generating insights...</span>
                      </div>
                    ) : aiExplanation ? (
                      <div className="space-y-3">
                        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-1">
                            💰 Money Application
                          </p>
                          <p className="text-sm text-foreground">{aiExplanation.money}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                          <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">
                            🌟 Life Application
                          </p>
                          <p className="text-sm text-foreground">{aiExplanation.life}</p>
                        </div>
                      </div>
                    ) : null}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
