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
      <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
        <div className="text-center text-white">
          <Play className="h-16 w-16 mx-auto mb-4 opacity-75" />
          <p className="text-lg font-medium">{lesson.title}</p>
          <p className="text-sm opacity-75">Duration: {lesson.duration}</p>
        </div>
      </div>
      <div className="prose max-w-none">
        <h3>Video Summary</h3>
        <p>{lesson.content.summary}</p>
        <h4>Key Learning Points:</h4>
        <ul>
          {lesson.content.keyPoints?.map((point: string, index: number) => (
            <li key={index}>{point}</li>
          ))}
        </ul>
      </div>
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