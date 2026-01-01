import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Sparkles, Loader2, Brain, Zap, Trophy, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface WisdomSummary {
  id: string;
  title: string;
  author: string;
  category: "finance" | "habits" | "mindset" | "productivity";
  color: string;
  emoji: string;
  defaultTakeaways: {
    mindset: string;
    action: string;
    result: string;
  };
}

const wisdomSummaries: WisdomSummary[] = [
  {
    id: "psychology-of-money",
    title: "The Psychology of Money",
    author: "Morgan Housel",
    category: "finance",
    color: "from-emerald-500/20 to-teal-500/20",
    emoji: "🧠",
    defaultTakeaways: {
      mindset: "Wealth is what you don't see—it's money not spent on stuff.",
      action: "Save money without a specific goal. Flexibility is its own reward.",
      result: "Financial freedom and peace of mind, regardless of income level."
    }
  },
  {
    id: "atomic-habits",
    title: "Atomic Habits",
    author: "James Clear",
    category: "habits",
    color: "from-blue-500/20 to-indigo-500/20",
    emoji: "⚛️",
    defaultTakeaways: {
      mindset: "You don't rise to your goals, you fall to the level of your systems.",
      action: "Make good habits obvious, attractive, easy, and satisfying.",
      result: "1% better every day compounds to 37x improvement in one year."
    }
  },
  {
    id: "rich-dad-poor-dad",
    title: "Rich Dad Poor Dad",
    author: "Robert Kiyosaki",
    category: "finance",
    color: "from-amber-500/20 to-orange-500/20",
    emoji: "💰",
    defaultTakeaways: {
      mindset: "The rich buy assets, the poor buy liabilities they think are assets.",
      action: "Focus on acquiring income-generating assets, not status symbols.",
      result: "Passive income that eventually exceeds your expenses equals freedom."
    }
  },
  {
    id: "thinking-fast-slow",
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    category: "mindset",
    color: "from-purple-500/20 to-pink-500/20",
    emoji: "🎯",
    defaultTakeaways: {
      mindset: "Your brain has two systems: fast intuition and slow analysis.",
      action: "Pause before big financial decisions to engage your analytical brain.",
      result: "Fewer emotional mistakes and better long-term investment returns."
    }
  },
  {
    id: "4-hour-workweek",
    title: "The 4-Hour Workweek",
    author: "Tim Ferriss",
    category: "productivity",
    color: "from-rose-500/20 to-red-500/20",
    emoji: "⏰",
    defaultTakeaways: {
      mindset: "Being busy is a form of laziness—it avoids the few critical tasks.",
      action: "Apply 80/20 to eliminate time-wasters and automate repetitive work.",
      result: "More time for what matters while income becomes location-independent."
    }
  },
  {
    id: "millionaire-next-door",
    title: "The Millionaire Next Door",
    author: "Thomas Stanley",
    category: "finance",
    color: "from-green-500/20 to-lime-500/20",
    emoji: "🏠",
    defaultTakeaways: {
      mindset: "Most millionaires live below their means and avoid flashy spending.",
      action: "Track your net worth, not your income. Budget like your wealth depends on it.",
      result: "Steady wealth accumulation that outlasts high-income, high-spending peers."
    }
  }
];

const categoryColors: Record<string, string> = {
  finance: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
  habits: "bg-blue-500/20 text-blue-700 dark:text-blue-300",
  mindset: "bg-purple-500/20 text-purple-700 dark:text-purple-300",
  productivity: "bg-orange-500/20 text-orange-700 dark:text-orange-300"
};

export const WisdomLibrary = () => {
  const [expandedBook, setExpandedBook] = useState<string | null>(null);
  const [aiTakeaways, setAiTakeaways] = useState<{ mindset: string; action: string; result: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generateTakeaways = async (book: WisdomSummary) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('explain-term', {
        body: { 
          term: book.title, 
          definition: `A book by ${book.author} about ${book.category}`,
          mode: "book-summary"
        }
      });

      if (error) throw error;

      if (data?.explanation) {
        // Parse the AI response for structured takeaways
        const text = data.explanation;
        const mindsetMatch = text.match(/mindset[:\s]*([^.]+\.)/i);
        const actionMatch = text.match(/action[:\s]*([^.]+\.)/i);
        const resultMatch = text.match(/result[:\s]*([^.]+\.)/i);
        
        setAiTakeaways({
          mindset: mindsetMatch?.[1] || book.defaultTakeaways.mindset,
          action: actionMatch?.[1] || book.defaultTakeaways.action,
          result: resultMatch?.[1] || book.defaultTakeaways.result
        });
      } else {
        setAiTakeaways(book.defaultTakeaways);
      }
    } catch (error) {
      console.error('Book summary error:', error);
      setAiTakeaways(book.defaultTakeaways);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookClick = (book: WisdomSummary) => {
    if (expandedBook === book.id) {
      setExpandedBook(null);
      setAiTakeaways(null);
    } else {
      setExpandedBook(book.id);
      setAiTakeaways(book.defaultTakeaways);
      generateTakeaways(book);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <BookOpen className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">5-Minute Wisdom</h2>
          <p className="text-sm text-muted-foreground">Key insights from transformative books</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {wisdomSummaries.map((book, index) => (
          <motion.div
            key={book.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card 
              className={`cursor-pointer transition-all hover:shadow-lg bg-gradient-to-br ${book.color} border-border/50 ${
                expandedBook === book.id ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => handleBookClick(book)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{book.emoji}</span>
                    <div>
                      <h3 className="font-semibold text-foreground">{book.title}</h3>
                      <p className="text-sm text-muted-foreground">{book.author}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs ${categoryColors[book.category]}`}>
                      {book.category}
                    </Badge>
                    {expandedBook === book.id ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {expandedBook === book.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-border/50"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="w-5 h-5 animate-spin text-primary mr-2" />
                          <span className="text-sm text-muted-foreground">Generating summary...</span>
                        </div>
                      ) : aiTakeaways ? (
                        <div className="space-y-3">
                          <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                            <Brain className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-1">
                                The Mindset
                              </p>
                              <p className="text-sm text-foreground">{aiTakeaways.mindset}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <Zap className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">
                                The Action
                              </p>
                              <p className="text-sm text-foreground">{aiTakeaways.action}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                            <Trophy className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-1">
                                The Result
                              </p>
                              <p className="text-sm text-foreground">{aiTakeaways.result}</p>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
