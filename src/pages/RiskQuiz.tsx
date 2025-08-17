import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Shield, TrendingUp, Target, Trophy, Info, CheckCircle } from "lucide-react";

interface Question {
  id: number;
  question: string;
  options: {
    text: string;
    score: number;
  }[];
}

interface RiskProfile {
  type: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  allocation: {
    stocks: number;
    bonds: number;
    cash: number;
  };
  characteristics: string[];
}

const questions: Question[] = [
  {
    id: 1,
    question: "How would you describe your investment experience?",
    options: [
      { text: "I'm completely new to investing", score: 1 },
      { text: "I have some basic knowledge", score: 2 },
      { text: "I'm moderately experienced", score: 3 },
      { text: "I'm very experienced with investments", score: 4 }
    ]
  },
  {
    id: 2,
    question: "If your portfolio lost 20% in value over 6 months, what would you do?",
    options: [
      { text: "Sell everything immediately to prevent further losses", score: 1 },
      { text: "Sell some investments and move to safer options", score: 2 },
      { text: "Hold steady and wait for recovery", score: 3 },
      { text: "Buy more while prices are low", score: 4 }
    ]
  },
  {
    id: 3,
    question: "What's your primary investment goal?",
    options: [
      { text: "Preserve my money with minimal risk", score: 1 },
      { text: "Generate steady income with some growth", score: 2 },
      { text: "Build wealth over time with moderate risk", score: 3 },
      { text: "Maximize growth potential regardless of volatility", score: 4 }
    ]
  },
  {
    id: 4,
    question: "What's your investment time horizon?",
    options: [
      { text: "Less than 2 years", score: 1 },
      { text: "2-5 years", score: 2 },
      { text: "5-10 years", score: 3 },
      { text: "More than 10 years", score: 4 }
    ]
  },
  {
    id: 5,
    question: "How important is it to have quick access to your invested money?",
    options: [
      { text: "Very important - I need access anytime", score: 1 },
      { text: "Somewhat important - within a few months", score: 2 },
      { text: "Not very important - I can wait a year or more", score: 3 },
      { text: "Not important - I won't need it for many years", score: 4 }
    ]
  },
  {
    id: 6,
    question: "Which statement best describes your comfort with market volatility?",
    options: [
      { text: "I prefer stable, predictable returns", score: 1 },
      { text: "I can handle small fluctuations", score: 2 },
      { text: "I'm comfortable with moderate ups and downs", score: 3 },
      { text: "I embrace volatility as an opportunity", score: 4 }
    ]
  },
  {
    id: 7,
    question: "What percentage of your monthly income can you afford to invest?",
    options: [
      { text: "Less than 5%", score: 1 },
      { text: "5-10%", score: 2 },
      { text: "10-20%", score: 3 },
      { text: "More than 20%", score: 4 }
    ]
  }
];

const riskProfiles: Record<string, RiskProfile> = {
  cautious: {
    type: "cautious",
    title: "Cautious Planner",
    description: "You prioritize capital preservation and prefer steady, predictable returns over high growth potential.",
    icon: Shield,
    color: "text-blue-600",
    allocation: { stocks: 30, bonds: 60, cash: 10 },
    characteristics: [
      "Prefers stable investments",
      "Values capital preservation",
      "Comfortable with lower returns for security",
      "Ideal for short-term goals"
    ]
  },
  balanced: {
    type: "balanced",
    title: "Balanced Investor",
    description: "You seek a good balance between growth potential and risk management, perfect for long-term wealth building.",
    icon: Target,
    color: "text-green-600",
    allocation: { stocks: 60, bonds: 35, cash: 5 },
    characteristics: [
      "Balances growth and stability",
      "Comfortable with moderate volatility",
      "Long-term focused approach",
      "Diversified across asset classes"
    ]
  },
  bold: {
    type: "bold",
    title: "Bold Explorer",
    description: "You're comfortable with higher risk in pursuit of greater rewards and have a long investment horizon.",
    icon: Trophy,
    color: "text-orange-600",
    allocation: { stocks: 85, bonds: 10, cash: 5 },
    characteristics: [
      "Embraces market volatility",
      "Focuses on long-term growth",
      "Willing to take calculated risks",
      "Seeks maximum growth potential"
    ]
  }
};

const RiskQuiz = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [result, setResult] = useState<RiskProfile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const calculateRiskProfile = (totalScore: number): RiskProfile => {
    if (totalScore <= 14) return riskProfiles.cautious;
    if (totalScore <= 21) return riskProfiles.balanced;
    return riskProfiles.bold;
  };

  const handleAnswer = (score: number) => {
    const newAnswers = [...answers, score];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Quiz completed
      const totalScore = newAnswers.reduce((sum, answer) => sum + answer, 0);
      const profile = calculateRiskProfile(totalScore);
      setResult(profile);
      setIsCompleted(true);
    }
  };

  const saveResults = async () => {
    if (!result || !user) return;

    setIsSubmitting(true);
    try {
      const totalScore = answers.reduce((sum, answer) => sum + answer, 0);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          risk_profile: result.type,
          risk_score: totalScore,
          quiz_completed_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Profile Updated!",
        description: "Your risk profile has been saved successfully.",
      });

      // Navigate to dashboard with success message
      navigate('/dashboard?quiz_completed=true');
    } catch (error) {
      console.error('Error saving quiz results:', error);
      toast({
        title: "Error",
        description: "Failed to save your results. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setIsCompleted(false);
    setResult(null);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {!isCompleted ? (
          <>
            {/* Quiz Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-4">Discover Your Investment Personality</h1>
              <p className="text-lg text-muted-foreground mb-6">
                Answer 7 quick questions to get your personalized risk profile and investment recommendations.
              </p>
              
              <div className="space-y-2">
                <Progress value={(currentQuestion / questions.length) * 100} className="w-full" />
                <p className="text-sm text-muted-foreground">
                  Question {currentQuestion + 1} of {questions.length}
                </p>
              </div>
            </div>

            {/* Current Question */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-xl">
                  {questions[currentQuestion].question}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {questions[currentQuestion].options.map((option, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full text-left justify-start h-auto p-4 hover:bg-primary/5"
                    onClick={() => handleAnswer(option.score)}
                  >
                    {option.text}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Progress Info */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                There are no right or wrong answers. Choose the option that best reflects your comfort level and investment goals.
              </AlertDescription>
            </Alert>
          </>
        ) : (
          /* Results */
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
              <h1 className="text-3xl font-bold mb-2">Quiz Complete!</h1>
              <p className="text-lg text-muted-foreground">
                Here's your personalized investment personality
              </p>
            </div>

            {result && (
              <>
                {/* Risk Profile Badge */}
                <Card className="text-center">
                  <CardHeader>
                    <div className="flex justify-center mb-4">
                      <div className={`p-4 rounded-full bg-primary/10 ${result.color}`}>
                        <result.icon className="h-12 w-12" />
                      </div>
                    </div>
                    <CardTitle className="text-2xl">{result.title}</CardTitle>
                    <CardDescription className="text-base">
                      {result.description}
                    </CardDescription>
                  </CardHeader>
                </Card>

                {/* Characteristics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Your Investment Characteristics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {result.characteristics.map((characteristic, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-success" />
                          <span>{characteristic}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recommended Allocation */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recommended Portfolio Allocation</CardTitle>
                    <CardDescription>
                      Based on your risk profile, here's a suggested asset allocation
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Stocks (Growth)</span>
                        <Badge variant="secondary">{result.allocation.stocks}%</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Bonds (Stability)</span>
                        <Badge variant="secondary">{result.allocation.bonds}%</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Cash (Liquidity)</span>
                        <Badge variant="secondary">{result.allocation.cash}%</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button 
                    onClick={saveResults} 
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? "Saving..." : "Save My Profile"}
                  </Button>
                  <Button variant="outline" onClick={resetQuiz}>
                    Retake Quiz
                  </Button>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Remember:</strong> This is educational guidance only. 
                    Your risk profile will help personalize your ELIN experience, 
                    but always consult a financial advisor for personalized investment advice.
                  </AlertDescription>
                </Alert>
              </>
            )}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default RiskQuiz;