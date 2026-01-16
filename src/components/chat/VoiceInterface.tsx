import { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Volume2, VolumeX, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

const TTS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elin-tts`;

interface VoiceInterfaceProps {
  onVoiceInput: (text: string) => void;
  isListening?: boolean;
  className?: string;
  voiceMuted?: boolean;
  onMuteChange?: (muted: boolean) => void;
}

export interface VoiceInterfaceHandle {
  speakText: (text: string) => Promise<void>;
  stopSpeaking: () => void;
  isSpeaking: boolean;
}

export const VoiceInterface = forwardRef<VoiceInterfaceHandle, VoiceInterfaceProps>(
  ({ onVoiceInput, isListening = false, className, voiceMuted = false, onMuteChange }, ref) => {
    const { toast } = useToast();
    const [isRecording, setIsRecording] = useState(false);
    const [audioLevel, setAudioLevel] = useState(0);
    const [transcript, setTranscript] = useState("");
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isLoadingTTS, setIsLoadingTTS] = useState(false);
    
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const recognitionRef = useRef<any>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize speech recognition
    useEffect(() => {
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const transcriptText = result[0].transcript;
            if (result.isFinal) {
              finalTranscript += transcriptText;
            } else {
              interimTranscript += transcriptText;
            }
          }

          setTranscript(interimTranscript || finalTranscript);

          // Clear previous silence timeout
          if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
          }

          if (finalTranscript) {
            // Auto-submit after a short pause
            silenceTimeoutRef.current = setTimeout(() => {
              onVoiceInput(finalTranscript.trim());
              setTranscript("");
              stopRecording();
            }, 1500);
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          if (event.error !== 'no-speech') {
            setIsRecording(false);
            toast({
              title: "Voice Recognition Error",
              description: event.error === 'not-allowed' 
                ? "Microphone access denied. Please enable it in your browser settings."
                : "Unable to process voice input. Please try again.",
              variant: "destructive"
            });
          }
        };

        recognitionRef.current.onend = () => {
          // Only stop if not manually continuing
          if (isRecording) {
            try {
              recognitionRef.current?.start();
            } catch (e) {
              setIsRecording(false);
            }
          }
        };
      }

      return () => {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }
      };
    }, [onVoiceInput, toast]);

    // Audio level monitoring
    const startAudioMonitoring = async () => {
      try {
        streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContextRef.current = new AudioContext();
        analyserRef.current = audioContextRef.current.createAnalyser();
        const source = audioContextRef.current.createMediaStreamSource(streamRef.current);
        source.connect(analyserRef.current);
        
        analyserRef.current.fftSize = 256;
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const updateAudioLevel = () => {
          if (analyserRef.current && isRecording) {
            analyserRef.current.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((a, b) => a + b) / bufferLength;
            setAudioLevel(average / 255 * 100);
            animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
          }
        };
        
        updateAudioLevel();
      } catch (error) {
        console.error('Error accessing microphone:', error);
        toast({
          title: "Microphone Error",
          description: "Unable to access your microphone. Please check permissions.",
          variant: "destructive"
        });
      }
    };

    const startRecording = async () => {
      if (!recognitionRef.current) {
        toast({
          title: "Voice Recognition Unavailable",
          description: "Your browser doesn't support voice recognition. Try Chrome or Edge.",
          variant: "destructive"
        });
        return;
      }

      // Stop any ongoing TTS
      stopSpeaking();

      try {
        setIsRecording(true);
        setTranscript("");
        recognitionRef.current.start();
        await startAudioMonitoring();
        
        toast({
          title: "🎤 Listening...",
          description: "Speak now. I'll send when you pause.",
        });
      } catch (error) {
        console.error('Error starting recording:', error);
        setIsRecording(false);
        toast({
          title: "Recording Error",
          description: "Unable to start recording. Please check your microphone permissions.",
          variant: "destructive"
        });
      }
    };

    const stopRecording = useCallback(() => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      setIsRecording(false);
      setAudioLevel(0);
    }, []);

    // TTS using the elin-tts edge function
    const speakText = useCallback(async (text: string) => {
      if (voiceMuted || !text.trim()) return;
      
      try {
        setIsLoadingTTS(true);
        
        // Clean the text for TTS
        const cleanText = text
          .replace(/[*#`_~]/g, '')
          .replace(/\n+/g, '. ')
          .replace(/•/g, '')
          .replace(/📋|📊|📈|💡|🎯|⚠️|🔥|🧠|💳|✅|❌|🌟|👋|🚀|📝|🎤|---/g, '')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 1000);

        if (!cleanText) return;

        const session = await supabase.auth.getSession();
        const token = session.data.session?.access_token;

        const response = await fetch(TTS_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ text: cleanText }),
        });

        if (!response.ok) {
          throw new Error('TTS request failed');
        }

        const data = await response.json();
        
        if (data.audio) {
          const audioUrl = `data:audio/mpeg;base64,${data.audio}`;
          
          // Stop any currently playing audio
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
          }
          
          audioRef.current = new Audio(audioUrl);
          audioRef.current.onplay = () => setIsSpeaking(true);
          audioRef.current.onended = () => setIsSpeaking(false);
          audioRef.current.onerror = () => setIsSpeaking(false);
          
          await audioRef.current.play();
        }
      } catch (error) {
        console.error('TTS error:', error);
        setIsSpeaking(false);
      } finally {
        setIsLoadingTTS(false);
      }
    }, [voiceMuted]);

    const stopSpeaking = useCallback(() => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsSpeaking(false);
    }, []);

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      speakText,
      stopSpeaking,
      isSpeaking,
    }), [speakText, stopSpeaking, isSpeaking]);

    return (
      <div className={cn("flex items-center justify-between gap-3", className)}>
        <div className="flex items-center gap-3">
          {/* Main Voice Input Button */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant={isRecording ? "destructive" : "default"}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isListening}
              className={cn(
                "relative min-w-[56px] min-h-[56px] w-14 h-14 rounded-full shadow-lg transition-all",
                isRecording 
                  ? "bg-red-500 hover:bg-red-600 shadow-red-500/30" 
                  : "bg-primary hover:bg-primary/90"
              )}
              aria-label={isRecording ? "Stop recording" : "Start voice input"}
            >
              <AnimatePresence mode="wait">
                {isRecording ? (
                  <motion.div
                    key="recording"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex items-center justify-center"
                  >
                    <Square className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex items-center justify-center"
                  >
                    <Mic className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Pulsing ring when recording */}
              {isRecording && (
                <>
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-red-400"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.8, 0.2, 0.8],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full bg-red-500/20"
                    animate={{
                      scale: 1 + (audioLevel / 100) * 0.4,
                    }}
                    transition={{ duration: 0.05 }}
                  />
                </>
              )}
            </Button>
          </motion.div>

          {/* Mute/Unmute Toggle */}
          <Button
            variant="outline"
            onClick={() => onMuteChange?.(!voiceMuted)}
            className={cn(
              "min-w-[44px] min-h-[44px] w-11 h-11 rounded-full transition-all",
              voiceMuted 
                ? "border-muted-foreground/50 text-muted-foreground" 
                : "border-primary text-primary hover:bg-primary/10"
            )}
            aria-label={voiceMuted ? "Unmute ELIN's voice" : "Mute ELIN's voice"}
          >
            {voiceMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </Button>

          {/* Speaking/Loading Indicator */}
          <AnimatePresence>
            {(isSpeaking || isLoadingTTS) && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2 text-primary"
              >
                {isLoadingTTS ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                  >
                    <Volume2 className="w-5 h-5" />
                  </motion.div>
                )}
                <span className="text-sm hidden sm:inline">
                  {isLoadingTTS ? "Loading..." : "Speaking..."}
                </span>
                {isSpeaking && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={stopSpeaking}
                    className="h-8 w-8 p-0"
                    aria-label="Stop speaking"
                  >
                    <Square className="w-4 h-4" />
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Live transcript preview */}
        <AnimatePresence>
          {transcript && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex-1 bg-primary/10 border border-primary/20 rounded-lg px-3 py-2 text-sm text-primary max-w-[300px] truncate"
            >
              <span className="opacity-60">Hearing: </span>"{transcript}"
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recording visualization */}
        <AnimatePresence>
          {isRecording && !transcript && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 bg-red-500 rounded-full"
                    animate={{
                      height: [8, 16 + (audioLevel / 100) * 24, 8],
                    }}
                    transition={{
                      duration: 0.4,
                      repeat: Infinity,
                      repeatType: "reverse",
                      delay: i * 0.08,
                    }}
                  />
                ))}
              </div>
              <span className="text-sm text-red-500 font-medium hidden sm:inline animate-pulse">
                Listening...
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

VoiceInterface.displayName = "VoiceInterface";

// Extend window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
