import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Clock, CheckCircle, BookOpen, Sparkles, Play, Pause, Presentation, Headphones, Volume2, Loader2 } from 'lucide-react';
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
  
  // Audio state
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      const content = await getLessonContent(lessonId);
      setLesson(content);
      setIsLoading(false);
    };
    fetchContent();
  }, [lessonId, getLessonContent]);

  // Audio player setup
  useEffect(() => {
    if (audioUrl) {
      audioRef.current = new Audio(audioUrl);
      
      audioRef.current.addEventListener('timeupdate', () => {
        if (audioRef.current) {
          const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
          setAudioProgress(progress);
        }
      });
      
      audioRef.current.addEventListener('ended', () => {
        setIsPlayingAudio(false);
        setAudioProgress(0);
      });
      
      audioRef.current.addEventListener('error', (e) => {
        console.error('Audio playback error:', e);
        setIsPlayingAudio(false);
        toast.error('Failed to play audio');
      });
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [audioUrl]);

  // Generate ElevenLabs audio
  const generateAudio = async () => {
    if (!lesson?.content) {
      toast.error('No content available to generate audio');
      return;
    }

    setIsGeneratingAudio(true);
    try {
      // Strip markdown for cleaner speech
      const cleanText = lesson.content
        .replace(/#{1,6}\s/g, '')
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/`/g, '')
        .replace(/>/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .slice(0, 5000); // ElevenLabs limit

      const { data, error } = await supabase.functions.invoke('generate-audio-lesson', {
        body: { text: cleanText }
      });

      if (error) throw error;
      
      if (data.audio) {
        // Convert base64 to blob URL
        const binaryString = atob(data.audio);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'audio/mpeg' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        toast.success('High-quality audio generated!');
      }
    } catch (error) {
      console.error('Error generating audio:', error);
      toast.error('Failed to generate audio. Please try again.');
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const toggleAudioPlayback = () => {
    if (!audioRef.current) return;
    
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play();
      setIsPlayingAudio(true);
    }
  };

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

  const handleComplete = async () => {
    setIsCompleting(true);
    await onComplete(lessonId);
    setIsCompleting(false);
  };

  const handleSlideshowComplete = () => {
    toast.success('Slideshow complete!');
    setViewMode('read');
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

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
                AI Learning Experience
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
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
          {/* ElevenLabs Audio Player */}
          <Card className="mb-4 border-violet-500/20 bg-gradient-to-r from-violet-500/5 to-purple-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isPlayingAudio ? 'bg-violet-500 animate-pulse' : 'bg-violet-500/20'}`}>
                    <Headphones className={`w-6 h-6 ${isPlayingAudio ? 'text-white' : 'text-violet-500'}`} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-heading flex items-center gap-2">
                      Professional Audio
                      <Badge variant="outline" className="text-xs bg-violet-500/10 text-violet-500 border-violet-500/30">
                        ElevenLabs
                      </Badge>
                    </h4>
                    <p className="text-sm text-text-muted">
                      {audioUrl ? 'High-quality AI voiceover ready' : 'Generate studio-quality narration'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {!audioUrl ? (
                    <Button
                      onClick={generateAudio}
                      disabled={isGeneratingAudio}
                      className="bg-violet-500 hover:bg-violet-600"
                    >
                      {isGeneratingAudio ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4 mr-2" />
                          Generate Audio
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={toggleAudioPlayback}
                      className={isPlayingAudio ? 'bg-red-500 hover:bg-red-600' : 'bg-violet-500 hover:bg-violet-600'}
                    >
                      {isPlayingAudio ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Listen
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Audio Progress */}
              {audioUrl && (
                <div className="mt-4">
                  <Progress value={audioProgress} className="h-1 bg-violet-500/20" />
                </div>
              )}
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
                  p: ({ children }) => <p className="text-text-body mb-5 leading-loose">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc pl-6 mb-5 space-y-3">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-6 mb-5 space-y-3">{children}</ol>,
                  li: ({ children }) => <li className="text-text-body leading-relaxed">{children}</li>,
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

      {/* Actions - Stacked vertically on mobile, horizontal on desktop */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center pb-8 mb-safe">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="w-full sm:w-auto order-2 sm:order-1"
        >
          Previous Lesson
        </Button>
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-2 order-1 sm:order-2">
          <Button 
            onClick={onBack}
            className="w-full sm:w-auto"
          >
            Next Lesson
          </Button>
          {!isComplete && (
            <Button 
              onClick={handleComplete}
              disabled={isCompleting}
              className="bg-success hover:bg-success/90 w-full sm:w-auto"
            >
              {isCompleting ? 'Saving...' : 'Mark as Complete'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
