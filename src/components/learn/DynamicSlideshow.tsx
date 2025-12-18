import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, Pause, ChevronLeft, ChevronRight, Volume2, VolumeX, 
  RotateCcw, Maximize2, BookOpen, TrendingUp, DollarSign, 
  PieChart, BarChart3, Wallet, Target, Shield, Lightbulb,
  CheckCircle, AlertCircle, Info, Star, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Slide {
  title: string;
  bulletPoints: string[];
  icon: string;
  speakerNotes?: string;
}

interface DynamicSlideshowProps {
  slides: Slide[];
  lessonTitle: string;
  onComplete: () => void;
  autoPlayAudio?: boolean;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen, TrendingUp, DollarSign, PieChart, BarChart3, 
  Wallet, Target, Shield, Lightbulb, CheckCircle, 
  AlertCircle, Info, Star
};

export const DynamicSlideshow = ({ 
  slides, 
  lessonTitle, 
  onComplete,
  autoPlayAudio = false 
}: DynamicSlideshowProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCache = useRef<Map<number, string>>(new Map());

  const currentSlideData = slides[currentSlide];
  const progress = ((currentSlide + 1) / slides.length) * 100;

  // Get icon component
  const IconComponent = iconMap[currentSlideData?.icon] || BookOpen;

  // Stop current audio
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsSpeaking(false);
  }, []);

  // Generate and play audio using ElevenLabs
  const speakText = useCallback(async (text: string, slideIndex: number) => {
    if (!audioEnabled) return;

    stopAudio();
    
    // Check cache first
    const cachedAudio = audioCache.current.get(slideIndex);
    if (cachedAudio) {
      const audio = new Audio(cachedAudio);
      audioRef.current = audio;
      
      audio.onplay = () => setIsSpeaking(true);
      audio.onended = () => {
        setIsSpeaking(false);
        if (isPlaying && slideIndex < slides.length - 1) {
          setTimeout(() => setCurrentSlide(prev => prev + 1), 500);
        } else if (isPlaying && slideIndex === slides.length - 1) {
          setIsPlaying(false);
        }
      };
      audio.onerror = () => setIsSpeaking(false);
      
      await audio.play();
      return;
    }

    setIsLoadingAudio(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elin-tts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate audio');
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      if (data.audio) {
        const audioUrl = `data:audio/mpeg;base64,${data.audio}`;
        audioCache.current.set(slideIndex, audioUrl);
        
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        
        audio.onplay = () => setIsSpeaking(true);
        audio.onended = () => {
          setIsSpeaking(false);
          if (isPlaying && slideIndex < slides.length - 1) {
            setTimeout(() => setCurrentSlide(prev => prev + 1), 500);
          } else if (isPlaying && slideIndex === slides.length - 1) {
            setIsPlaying(false);
          }
        };
        audio.onerror = () => {
          setIsSpeaking(false);
          toast.error('Audio playback failed');
        };

        await audio.play();
      }
    } catch (error) {
      console.error('ElevenLabs TTS error:', error);
      toast.error('Voice generation unavailable');
      setIsSpeaking(false);
    } finally {
      setIsLoadingAudio(false);
    }
  }, [audioEnabled, isPlaying, slides.length, stopAudio]);

  // Speak current slide content
  const speakCurrentSlide = useCallback(() => {
    if (!currentSlideData) return;
    
    const slideText = `${currentSlideData.title}. ${currentSlideData.bulletPoints.join('. ')}`;
    speakText(slideText, currentSlide);
  }, [currentSlideData, currentSlide, speakText]);

  // Handle slide change
  useEffect(() => {
    if ((isPlaying || autoPlayAudio) && audioEnabled) {
      speakCurrentSlide();
    }
  }, [currentSlide, isPlaying, speakCurrentSlide, audioEnabled, autoPlayAudio]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [stopAudio]);

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
      stopAudio();
    } else {
      setIsPlaying(true);
      speakCurrentSlide();
    }
  };

  const handlePrevSlide = () => {
    stopAudio();
    setCurrentSlide(prev => Math.max(0, prev - 1));
  };

  const handleNextSlide = () => {
    stopAudio();
    if (currentSlide === slides.length - 1) {
      onComplete();
    } else {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const handleRestart = () => {
    stopAudio();
    setCurrentSlide(0);
    setIsPlaying(false);
  };

  const toggleAudio = () => {
    if (audioEnabled) {
      stopAudio();
    }
    setAudioEnabled(!audioEnabled);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!isFullscreen) {
      containerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  if (!slides.length) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No slides available</p>
      </Card>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Main Slide Display */}
      <Card className="overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700">
        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-primary border-primary/50">
              Slide {currentSlide + 1} of {slides.length}
            </Badge>
            <span className="text-sm text-slate-400">{lessonTitle}</span>
          </div>
          <div className="flex items-center gap-2">
            {isLoadingAudio && (
              <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30">
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Loading voice...
              </Badge>
            )}
            {isSpeaking && !isLoadingAudio && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 animate-pulse">
                <Volume2 className="w-3 h-3 mr-1" />
                ElevenLabs AI
              </Badge>
            )}
          </div>
        </div>

        {/* Slide Content */}
        <CardContent className="p-0">
          <div className="aspect-video flex items-center justify-center p-8 md:p-12 min-h-[300px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-3xl"
              >
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                    <IconComponent className="w-8 h-8 text-primary" />
                  </div>
                </div>

                {/* Title */}
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-2xl md:text-3xl font-bold text-white text-center mb-8"
                >
                  {currentSlideData.title}
                </motion.h2>

                {/* Bullet Points */}
                <div className="space-y-4">
                  {currentSlideData.bulletPoints.map((point, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      className="flex items-start gap-3 bg-white/5 rounded-lg p-4 border border-white/10"
                    >
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-primary text-sm font-medium">{index + 1}</span>
                      </div>
                      <p className="text-slate-200 text-lg leading-relaxed">{point}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </CardContent>

        {/* Progress Bar */}
        <div className="px-4">
          <Progress value={progress} className="h-1 bg-slate-700" />
        </div>

        {/* Controls */}
        <div className="p-4 border-t border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRestart}
              className="text-slate-400 hover:text-white hover:bg-slate-700"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleAudio}
              className="text-slate-400 hover:text-white hover:bg-slate-700"
            >
              {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevSlide}
              disabled={currentSlide === 0}
              className="text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            
            <Button
              onClick={handlePlayPause}
              className={`px-6 ${isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'}`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Play
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextSlide}
              className="text-slate-400 hover:text-white hover:bg-slate-700"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="text-slate-400 hover:text-white hover:bg-slate-700"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      {/* Slide Thumbnails */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        {slides.map((slide, index) => (
          <button
            key={index}
            onClick={() => {
              stopAudio();
              setCurrentSlide(index);
            }}
            className={`flex-shrink-0 w-24 h-16 rounded-lg border-2 transition-all p-2 ${
              index === currentSlide 
                ? 'border-primary bg-primary/10' 
                : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
            }`}
          >
            <div className="text-[10px] text-slate-400 truncate">{slide.title}</div>
          </button>
        ))}
      </div>
    </div>
  );
};
