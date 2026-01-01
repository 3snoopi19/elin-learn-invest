import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Volume2, VolumeX, ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, Calendar, Lightbulb, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useDailyBriefingData } from "@/hooks/useDailyBriefingData";
import { Skeleton } from "@/components/ui/skeleton";

interface DailyBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DailyBriefingModal({ isOpen, onClose }: DailyBriefingModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const briefingData = useDailyBriefingData();

  const isUnderBudget = briefingData.yesterdaySpent <= briefingData.dailyBudget;
  const totalUpcomingBills = briefingData.upcomingBills.reduce((sum, bill) => sum + bill.amount, 0);

  // Fallback data if no real data available
  const displayData = {
    yesterdaySpent: briefingData.yesterdaySpent || 42,
    dailyBudget: briefingData.dailyBudget,
    upcomingBills: briefingData.upcomingBills.length > 0 
      ? briefingData.upcomingBills 
      : [
          { name: "Netflix", amount: 15.99, daysUntil: 2, logo: "🎬" },
          { name: "Electric Bill", amount: 89.50, daysUntil: 3, logo: "⚡" },
        ],
    opportunity: briefingData.opportunity,
    checkingBalance: briefingData.checkingBalance || 1200,
  };

  const slides = [
    {
      id: 1,
      title: "Yesterday's Spend",
      bgGradient: isUnderBudget 
        ? "from-emerald-500/20 via-emerald-600/10 to-background" 
        : "from-red-500/20 via-red-600/10 to-background",
      audioText: `Yesterday's spending recap. You spent $${displayData.yesterdaySpent} yesterday. ${isUnderBudget ? `Great job! You stayed under your $${displayData.dailyBudget} daily budget.` : `Heads up, you went over your $${displayData.dailyBudget} daily budget.`}`,
      content: (
        <div className="flex flex-col items-center justify-center h-full space-y-6">
          {briefingData.isLoading ? (
            <div className="space-y-4 w-full flex flex-col items-center">
              <Skeleton className="w-20 h-20 rounded-full" />
              <Skeleton className="w-32 h-12" />
              <Skeleton className="w-48 h-8" />
            </div>
          ) : (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className={`p-4 rounded-full ${isUnderBudget ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}
              >
                {isUnderBudget ? <CheckCircle2 className="w-12 h-12" /> : <AlertTriangle className="w-12 h-12" />}
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center space-y-2"
              >
                <p className="text-lg text-muted-foreground">You spent</p>
                <p className="text-5xl font-bold text-foreground">
                  ${displayData.yesterdaySpent.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </p>
                <p className="text-lg text-muted-foreground">yesterday</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  isUnderBudget 
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                }`}
              >
                {isUnderBudget 
                  ? `✓ Great job! Under $${displayData.dailyBudget} budget` 
                  : `⚠ High spend detected`}
              </motion.div>
            </>
          )}
        </div>
      ),
    },
    {
      id: 2,
      title: "Coming Up",
      bgGradient: "from-amber-500/20 via-orange-600/10 to-background",
      audioText: displayData.upcomingBills.length > 0 
        ? `Coming up this week. ${displayData.upcomingBills.map(bill => `${bill.name}, $${bill.amount}, due in ${bill.daysUntil} days`).join('. ')}. Total of $${totalUpcomingBills.toFixed(2)} due soon.`
        : "No bills due in the next 3 days. You're all clear!",
      content: (
        <div className="flex flex-col items-center justify-center h-full space-y-6">
          {briefingData.isLoading ? (
            <div className="space-y-4 w-full max-w-xs">
              <Skeleton className="w-20 h-20 rounded-full mx-auto" />
              <Skeleton className="w-full h-16 rounded-xl" />
              <Skeleton className="w-full h-16 rounded-xl" />
            </div>
          ) : (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="p-4 rounded-full bg-amber-500/20 text-amber-400"
              >
                <Calendar className="w-12 h-12" />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <p className="text-lg text-muted-foreground mb-4">
                  {displayData.upcomingBills.length > 0 
                    ? "Bills due in the next 3 days:" 
                    : "No bills due soon!"}
                </p>
              </motion.div>

              <div className="space-y-3 w-full max-w-xs">
                {displayData.upcomingBills.map((bill, index) => (
                  <motion.div
                    key={bill.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.15 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                        <span className="text-lg">{bill.logo || "📋"}</span>
                      </div>
                      <div>
                        <span className="font-medium text-foreground block">{bill.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {bill.daysUntil === 0 ? "Due today" : bill.daysUntil === 1 ? "Due tomorrow" : `In ${bill.daysUntil} days`}
                        </span>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-foreground">
                      ${bill.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </motion.div>
                ))}
              </div>

              {displayData.upcomingBills.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="px-4 py-2 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-sm font-medium"
                >
                  Total: ${totalUpcomingBills.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} due soon
                </motion.div>
              )}
            </>
          )}
        </div>
      ),
    },
    {
      id: 3,
      title: "AI Opportunity",
      bgGradient: "from-primary/20 via-primary/10 to-background",
      audioText: `Here's a tip for you. ${displayData.opportunity.description} ${displayData.opportunity.action}. ${displayData.opportunity.savings > 0 ? `That's an extra $${displayData.opportunity.savings.toFixed(2)} per month.` : ""}`,
      content: (
        <div className="flex flex-col items-center justify-center h-full space-y-6">
          {briefingData.isLoading ? (
            <div className="space-y-4 w-full max-w-xs flex flex-col items-center">
              <Skeleton className="w-20 h-20 rounded-full" />
              <Skeleton className="w-48 h-6" />
              <Skeleton className="w-64 h-24 rounded-2xl" />
              <Skeleton className="w-32 h-10 rounded-lg" />
            </div>
          ) : (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="p-4 rounded-full bg-primary/20 text-primary"
              >
                <Lightbulb className="w-12 h-12" />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center space-y-2 px-4"
              >
                <p className="text-sm text-primary font-medium uppercase tracking-wide">
                  {displayData.opportunity.title}
                </p>
                <p className="text-lg text-muted-foreground">
                  {displayData.opportunity.description}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="p-4 rounded-2xl bg-primary/10 border border-primary/30 max-w-xs text-center"
              >
                <p className="text-foreground font-medium mb-2">
                  {displayData.opportunity.action}
                </p>
                {displayData.opportunity.savings > 0 && (
                  <>
                    <p className="text-2xl font-bold text-primary">
                      +${displayData.opportunity.savings.toFixed(2)}/mo
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">potential earnings</p>
                  </>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Button 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6"
                  onClick={() => {
                    toast({
                      title: "🎯 Goal Saved!",
                      description: "We'll remind you to take action on this opportunity.",
                    });
                  }}
                >
                  Set This Goal
                </Button>
              </motion.div>
            </>
          )}
        </div>
      ),
    },
  ];

  const SLIDE_DURATION = 5000; // 5 seconds per slide

  // Auto-advance slides
  useEffect(() => {
    if (!isOpen || isPaused || briefingData.isLoading) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentSlide < slides.length - 1) {
            setCurrentSlide((s) => s + 1);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return prev + (100 / (SLIDE_DURATION / 100));
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen, isPaused, currentSlide, slides.length, onClose, briefingData.isLoading]);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setCurrentSlide(0);
      setProgress(0);
      setIsPaused(false);
    } else {
      // Stop audio when modal closes
      if (currentAudio) {
        currentAudio.pause();
        setCurrentAudio(null);
        setIsPlaying(false);
      }
    }
  }, [isOpen]);

  // Stop audio when slide changes
  useEffect(() => {
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
      setIsPlaying(false);
    }
  }, [currentSlide]);

  const playAudio = useCallback(async () => {
    if (audioLoading) return;
    
    // If already playing, stop
    if (isPlaying && currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
      setIsPlaying(false);
      setIsPaused(false);
      return;
    }

    setAudioLoading(true);
    setIsPaused(true);

    try {
      const { data, error } = await supabase.functions.invoke('elin-tts', {
        body: { text: slides[currentSlide].audioText }
      });

      if (error) throw error;

      if (data?.audio) {
        const audioUrl = `data:audio/mpeg;base64,${data.audio}`;
        const audio = new Audio(audioUrl);
        
        audio.onended = () => {
          setIsPlaying(false);
          setCurrentAudio(null);
          setIsPaused(false);
        };

        audio.onerror = () => {
          toast({
            variant: "destructive",
            title: "Audio Error",
            description: "Failed to play audio briefing.",
          });
          setIsPlaying(false);
          setCurrentAudio(null);
          setIsPaused(false);
        };

        await audio.play();
        setCurrentAudio(audio);
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('TTS error:', error);
      toast({
        variant: "destructive",
        title: "Voice Unavailable",
        description: "ELIN's voice is temporarily unavailable.",
      });
      setIsPaused(false);
    } finally {
      setAudioLoading(false);
    }
  }, [currentSlide, slides, isPlaying, currentAudio, audioLoading, toast]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setProgress(0);
  };

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      goToSlide(currentSlide + 1);
    } else {
      onClose();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      goToSlide(currentSlide - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-sm h-[600px] mx-4 rounded-3xl overflow-hidden bg-card border border-border shadow-2xl"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => !isPlaying && setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => !isPlaying && setIsPaused(false)}
        >
          {/* Background Gradient */}
          <div className={`absolute inset-0 bg-gradient-to-b ${slides[currentSlide].bgGradient}`} />

          {/* Progress Bars */}
          <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
            {slides.map((_, index) => (
              <div key={index} className="flex-1 h-1 rounded-full bg-white/20 overflow-hidden">
                <motion.div
                  className="h-full bg-white rounded-full"
                  initial={{ width: 0 }}
                  animate={{
                    width: index < currentSlide ? "100%" : index === currentSlide ? `${progress}%` : "0%",
                  }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            ))}
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-10 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Audio Button */}
          <button
            onClick={playAudio}
            disabled={audioLoading || briefingData.isLoading}
            className="absolute top-10 left-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {audioLoading ? (
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            ) : isPlaying ? (
              <VolumeX className="w-5 h-5 text-white" />
            ) : (
              <Volume2 className="w-5 h-5 text-white" />
            )}
            <span className="text-white text-xs font-medium pr-1">
              {audioLoading ? "Loading..." : isPlaying ? "Stop" : "Play"}
            </span>
          </button>

          {/* Slide Title */}
          <div className="absolute top-20 left-0 right-0 text-center z-10">
            <p className="text-sm text-white/70 font-medium uppercase tracking-widest">
              {slides[currentSlide].title}
            </p>
          </div>

          {/* Slide Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="relative h-full pt-28 pb-20 px-6"
            >
              {slides[currentSlide].content}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed z-10"
            disabled={currentSlide === 0}
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>

          {/* Slide Dots */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlide ? "bg-white w-6" : "bg-white/40 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
