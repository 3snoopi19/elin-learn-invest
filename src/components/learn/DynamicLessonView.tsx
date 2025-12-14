import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Clock, CheckCircle, BookOpen, Sparkles, Play, Volume2, Pause, Presentation } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { DynamicSlideshow, Slide } from './DynamicSlideshow';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSlides, setIsLoadingSlides] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [viewMode, setViewMode] = useState<'read' | 'slideshow'>('read');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      const content = await getLessonContent(lessonId);
      setLesson(content);
      setIsLoading(false);
    };
    fetchContent();
  }, [lessonId, getLessonContent]);

  // Generate slides for slideshow mode
  const generateSlides = async () => {
    setIsLoadingSlides(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-lesson-content', {
        body: { lessonId, generateSlides: true }
      });

      if (error) throw error;
      
      if (data.slides && data.slides.length > 0) {
        setSlides(data.slides);
        setViewMode('slideshow');
        toast.success('Slides generated! Click Play to start the presentation.');
      }
    } catch (error) {
      console.error('Error generating slides:', error);
      toast.error('Failed to generate slides. Please try again.');
    } finally {
      setIsLoadingSlides(false);
    }
  };

  // Text-to-speech for reading mode
  const speakContent = useCallback(() => {
    if (!lesson?.content || !('speechSynthesis' in window)) {
      toast.error('Speech synthesis not supported in your browser');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPlaying(false);
      return;
    }

    // Strip markdown for cleaner speech
    const cleanText = lesson.content
      .replace(/#{1,6}\s/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/`/g, '')
      .replace(/>/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.9;
    utterance.pitch = 1;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel')
    ) || voices.find(v => v.lang.startsWith('en'));
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPlaying(true);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPlaying(false);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPlaying(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [lesson?.content, isSpeaking]);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleComplete = async () => {
    setIsCompleting(true);
    await onComplete(lessonId);
    setIsCompleting(false);
  };

  const handleSlideshowComplete = () => {
    toast.success('Slideshow complete!');
    setViewMode('read');
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
        <div className="flex items-center justify-between flex-wrap gap-2">
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

      {/* View Mode Controls */}
      <Card className="mb-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-text-heading flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                AI Video Learning
              </h3>
              <p className="text-sm text-text-muted">Choose how you want to experience this lesson</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant={viewMode === 'read' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('read')}
                className="flex-1 sm:flex-initial"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Read
              </Button>
              <Button
                variant={viewMode === 'slideshow' ? 'default' : 'outline'}
                size="sm"
                onClick={() => slides.length > 0 ? setViewMode('slideshow') : generateSlides()}
                disabled={isLoadingSlides}
                className="flex-1 sm:flex-initial"
              >
                {isLoadingSlides ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Presentation className="w-4 h-4 mr-2" />
                    {slides.length > 0 ? 'Slideshow' : 'Start Lesson'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {viewMode === 'slideshow' && slides.length > 0 ? (
        <DynamicSlideshow
          slides={slides}
          lessonTitle={lesson.title}
          onComplete={handleSlideshowComplete}
          autoPlayAudio={true}
        />
      ) : (
        <>
          {/* Audio Controls for Read Mode */}
          <Card className="mb-4 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSpeaking ? 'bg-primary animate-pulse' : 'bg-primary/20'}`}>
                    <Volume2 className={`w-5 h-5 ${isSpeaking ? 'text-primary-foreground' : 'text-primary'}`} />
                  </div>
                  <div>
                    <h4 className="font-medium text-text-heading">Listen to Lesson</h4>
                    <p className="text-sm text-text-muted">
                      {isSpeaking ? 'Reading aloud...' : 'Use text-to-speech to hear this lesson'}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={speakContent}
                  variant={isSpeaking ? 'destructive' : 'default'}
                  size="sm"
                >
                  {isSpeaking ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Play Audio
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Reading Content */}
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
        </>
      )}

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
