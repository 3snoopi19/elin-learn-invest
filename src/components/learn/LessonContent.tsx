import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Play, FileText, PenTool, Target, Clock, BookOpen } from "lucide-react";
import { useState } from "react";

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'article' | 'quiz' | 'interactive';
  duration: string;
  completed: boolean;
  content: any;
}

interface LessonContentProps {
  lesson: Lesson;
  onComplete: (lessonId: string) => void;
  onNext: () => void;
}

export const LessonContent = ({ lesson, onComplete, onNext }: LessonContentProps) => {
  const [currentQuizAnswer, setCurrentQuizAnswer] = useState<string>("");
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video": return Play;
      case "article": return FileText;
      case "quiz": return PenTool;
      case "interactive": return Target;
      default: return BookOpen;
    }
  };

  const handleQuizSubmit = (questionIndex: number, selectedAnswer: string) => {
    const isCorrect = selectedAnswer === lesson.content.questions[questionIndex].correct;
    if (isCorrect) {
      setQuizScore(prev => prev + 1);
    }
    setShowQuizResult(true);
  };

  const renderVideoContent = () => (
    <div className="space-y-6">
      <div className="aspect-video bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 rounded-lg flex items-center justify-center border-2 border-primary/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
        <div className="text-center z-10">
          <div className="relative mb-4">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center animate-bounce">
              <Play className="h-10 w-10 text-primary ml-1" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-primary mb-2">{lesson.title}</h3>
          <div className="flex items-center justify-center gap-2 text-primary/70 mb-3">
            <Clock className="h-4 w-4" />
            <span className="font-medium">{lesson.duration}</span>
          </div>
          <div className="text-sm text-muted-foreground max-w-md mx-auto">
            <p className="mb-2">🎥 Professional video content</p>
            <p className="text-xs">High-quality educational material coming soon</p>
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
        <h3 className="text-xl font-semibold mb-4 text-blue-900 dark:text-blue-100">📚 Course Content</h3>
        <p className="text-blue-800 dark:text-blue-200 mb-4 leading-relaxed">{lesson.content.summary}</p>
        
        <h4 className="text-lg font-medium mb-3 text-blue-900 dark:text-blue-100">🎯 What You'll Learn:</h4>
        <div className="grid gap-3">
          {lesson.content.keyPoints?.map((point: string, index: number) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-blue-200/50 dark:border-blue-700/50">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
              <span className="text-blue-900 dark:text-blue-100">{point}</span>
            </div>
          ))}
        </div>
      </div>

      <Card className="border-orange-200 dark:border-orange-800 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <h4 className="text-lg font-semibold text-orange-900 dark:text-orange-100">Quick Study Guide</h4>
          </div>
          <div className="space-y-3 text-orange-800 dark:text-orange-200">
            <p>• Take notes on the key concepts presented</p>
            <p>• Consider how this applies to your investment goals</p>
            <p>• Review the summary points after completing the lesson</p>
            <p>• Practice with the interactive exercises when available</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderArticleContent = () => (
    <div className="prose max-w-none">
      <h2>{lesson.title}</h2>
      {lesson.content.sections?.map((section: any, index: number) => (
        <div key={index}>
          <h3>{section.title}</h3>
          <p>{section.content}</p>
          {section.example && (
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500 my-4">
              <h4 className="text-blue-800 font-semibold">Example:</h4>
              <p className="text-blue-700">{section.example}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderQuizContent = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">{lesson.title}</h2>
        <p className="text-muted-foreground">Test your knowledge with this quiz</p>
      </div>
      
      {lesson.content.questions?.map((question: any, index: number) => (
        <Card key={index} className="border-2">
          <CardHeader>
            <CardTitle className="text-lg">Question {index + 1}</CardTitle>
            <p>{question.question}</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {question.options.map((option: string, optionIndex: number) => (
              <Button
                key={optionIndex}
                variant="outline"
                className="w-full text-left justify-start h-auto p-4"
                onClick={() => {
                  setCurrentQuizAnswer(option);
                  handleQuizSubmit(index, option);
                }}
              >
                {option}
              </Button>
            ))}
            {showQuizResult && currentQuizAnswer && (
              <div className={`p-4 rounded-lg ${currentQuizAnswer === question.correct ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {currentQuizAnswer === question.correct ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    <span>Correct! {question.explanation}</span>
                  </div>
                ) : (
                  <span>Incorrect. The correct answer is: {question.correct}. {question.explanation}</span>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderInteractiveContent = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{lesson.title}</h2>
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle>Interactive Exercise: {lesson.content.exerciseTitle}</CardTitle>
          <p className="text-muted-foreground">{lesson.content.description}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {lesson.content.steps?.map((step: any, index: number) => (
            <div key={index} className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Step {index + 1}: {step.title}</h4>
              <p className="mb-3">{step.instruction}</p>
              {step.input && (
                <div className="bg-gray-50 p-3 rounded border">
                  <label className="block text-sm font-medium mb-1">{step.input.label}</label>
                  <input 
                    type="text" 
                    placeholder={step.input.placeholder}
                    className="w-full p-2 border rounded"
                  />
                </div>
              )}
            </div>
          ))}
          <Button className="w-full">Complete Exercise</Button>
        </CardContent>
      </Card>
    </div>
  );

  const IconComponent = getTypeIcon(lesson.type);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <IconComponent className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{lesson.title}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{lesson.duration}</span>
              <Badge variant="outline" className="capitalize">{lesson.type}</Badge>
            </div>
          </div>
        </div>
        {lesson.completed && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm font-medium">Completed</span>
          </div>
        )}
      </div>

      <Card className="mb-6">
        <CardContent className="p-8">
          {lesson.type === 'video' && renderVideoContent()}
          {lesson.type === 'article' && renderArticleContent()}
          {lesson.type === 'quiz' && renderQuizContent()}
          {lesson.type === 'interactive' && renderInteractiveContent()}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline">Previous Lesson</Button>
        <div className="flex gap-2">
          {!lesson.completed && (
            <Button onClick={() => onComplete(lesson.id)}>
              Mark as Complete
            </Button>
          )}
          <Button onClick={onNext}>Next Lesson</Button>
        </div>
      </div>
    </div>
  );
};