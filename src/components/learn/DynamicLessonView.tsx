import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Clock, CheckCircle, BookOpen, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface DynamicLessonViewProps {
  lessonId: string;
  courseTitle: string;
  moduleTitle: string;
  onBack: () => void;
  onComplete: (lessonId: string) => Promise<boolean>;
  getLessonContent: (lessonId: string) => Promise<any>;
  isComplete: boolean;
}

export const DynamicLessonView = ({
  lessonId,
  courseTitle,
  moduleTitle,
  onBack,
  onComplete,
  getLessonContent,
  isComplete
}: DynamicLessonViewProps) => {
  const [lesson, setLesson] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      const content = await getLessonContent(lessonId);
      setLesson(content);
      setIsLoading(false);
    };
    fetchContent();
  }, [lessonId, getLessonContent]);

  const handleComplete = async () => {
    setIsCompleting(true);
    await onComplete(lessonId);
    setIsCompleting(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Course
          </Button>
          <Skeleton className="h-4 w-48 mb-2" />
          <Skeleton className="h-8 w-96" />
        </div>
        <Card>
          <CardContent className="p-8 space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium mb-2">Lesson not found</h3>
        <Button onClick={onBack}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="mb-4 text-text-body hover:text-text-heading"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Course
        </Button>
        <div className="text-sm text-text-muted mb-2">
          {courseTitle} • {moduleTitle}
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-text-heading">{lesson.title}</h1>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              AI Generated
            </Badge>
            {isComplete && (
              <Badge className="bg-success/10 text-success border-success/20">
                <CheckCircle className="w-3 h-3 mr-1" />
                Completed
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2 text-sm text-text-muted">
          <Clock className="h-4 w-4" />
          <span>{lesson.duration_minutes || 5} min read</span>
        </div>
      </div>

      {/* Content */}
      <Card className="mb-6 mobile-card">
        <CardContent className="p-6 md:p-8 prose prose-slate dark:prose-invert max-w-none">
          <ReactMarkdown
            components={{
              h1: ({ children }) => <h1 className="text-2xl font-bold text-text-heading mb-4">{children}</h1>,
              h2: ({ children }) => <h2 className="text-xl font-semibold text-text-heading mt-6 mb-3">{children}</h2>,
              h3: ({ children }) => <h3 className="text-lg font-medium text-text-heading mt-4 mb-2">{children}</h3>,
              p: ({ children }) => <p className="text-text-body mb-4 leading-relaxed">{children}</p>,
              ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>,
              li: ({ children }) => <li className="text-text-body">{children}</li>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-primary pl-4 py-2 my-4 bg-primary/5 rounded-r-lg">
                  {children}
                </blockquote>
              ),
              strong: ({ children }) => <strong className="font-semibold text-text-emphasis">{children}</strong>,
            }}
          >
            {lesson.content || 'Content is being generated...'}
          </ReactMarkdown>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={onBack}>
          Previous Lesson
        </Button>
        <div className="flex gap-2">
          {!isComplete && (
            <Button 
              onClick={handleComplete}
              disabled={isCompleting}
              className="bg-success hover:bg-success/90"
            >
              {isCompleting ? 'Saving...' : 'Mark as Complete'}
            </Button>
          )}
          <Button onClick={onBack}>
            Next Lesson
          </Button>
        </div>
      </div>
    </div>
  );
};
