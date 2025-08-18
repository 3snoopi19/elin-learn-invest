import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, HelpCircle } from "lucide-react";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface ChatQuizProps {
  quiz: QuizQuestion;
  onAnswer?: (questionId: string, answer: string) => void;
  messageId: string;
}

export const ChatQuiz = ({ quiz, onAnswer, messageId }: ChatQuizProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;
    
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    // Trigger callback if provided
    onAnswer?.(quiz.id, quiz.options[answerIndex]);
  };

  const isCorrect = selectedAnswer === quiz.correctAnswer;

  return (
    <div className="bg-card/30 border border-border/20 rounded-lg p-4 mt-2">
      <div className="flex items-start gap-2 mb-3">
        <HelpCircle className="w-4 h-4 text-education mt-0.5 flex-shrink-0" />
        <h4 className="text-sm font-medium text-foreground">{quiz.question}</h4>
      </div>
      
      <div className="space-y-2 mb-3">
        {quiz.options.map((option, index) => {
          let buttonVariant: "outline" | "default" | "secondary" = "outline";
          let className = "w-full text-left justify-start h-auto py-2 px-3 text-sm";
          
          if (showResult) {
            if (index === quiz.correctAnswer) {
              buttonVariant = "default";
              className += " bg-success hover:bg-success text-white border-success";
            } else if (index === selectedAnswer && selectedAnswer !== quiz.correctAnswer) {
              buttonVariant = "secondary";
              className += " bg-destructive/10 hover:bg-destructive/10 text-destructive border-destructive/30";
            } else {
              className += " opacity-60";
            }
          }
          
          return (
            <Button
              key={index}
              variant={buttonVariant}
              onClick={() => handleAnswerSelect(index)}
              className={className}
              disabled={showResult}
            >
              <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium mr-3 flex-shrink-0">
                {String.fromCharCode(65 + index)}
              </span>
              <span className="text-wrap">{option}</span>
              {showResult && index === quiz.correctAnswer && (
                <CheckCircle className="w-4 h-4 ml-auto flex-shrink-0" />
              )}
              {showResult && index === selectedAnswer && selectedAnswer !== quiz.correctAnswer && (
                <XCircle className="w-4 h-4 ml-auto flex-shrink-0" />
              )}
            </Button>
          );
        })}
      </div>
      
      {showResult && (
        <div className="space-y-2">
          <Badge 
            variant={isCorrect ? "default" : "secondary"}
            className={isCorrect ? "bg-success hover:bg-success" : "bg-destructive/10 text-destructive"}
          >
            {isCorrect ? "Correct!" : "Incorrect"}
          </Badge>
          <p className="text-xs text-muted-foreground bg-muted/30 rounded p-2">
            <strong>Explanation:</strong> {quiz.explanation}
          </p>
        </div>
      )}
    </div>
  );
};