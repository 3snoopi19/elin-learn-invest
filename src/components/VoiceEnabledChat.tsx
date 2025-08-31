import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Volume2, VolumeX, Send, Bot, User, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'elin';
  timestamp: Date;
  isVoice?: boolean;
}

interface VoiceSettings {
  voiceEnabled: boolean;
  autoSpeak: boolean;
  speechRate: number;
  speechVolume: number;
}

export const VoiceEnabledChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    voiceEnabled: false,
    autoSpeak: true,
    speechRate: 1.0,
    speechVolume: 0.8
  });
  const [audioLevel, setAudioLevel] = useState(0);
  const [transcript, setTranscript] = useState('');

  const { toast } = useToast();
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize speech recognition and synthesis
  useEffect(() => {
    // Speech Recognition Setup
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          handleVoiceInput(finalTranscript);
          setTranscript('');
        } else {
          setTranscript(interimTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Voice Error",
          description: "Could not process voice input. Please try again.",
          variant: "destructive"
        });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    // Speech Synthesis Setup
    synthRef.current = window.speechSynthesis;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [toast]);

  // Audio level monitoring
  const startAudioMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      
      const updateAudioLevel = () => {
        if (analyserRef.current && isListening) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(average);
          requestAnimationFrame(updateAudioLevel);
        }
      };
      
      updateAudioLevel();
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Microphone Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  // Voice input handling
  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      setTranscript('');
      recognitionRef.current.start();
      startAudioMonitoring();
      
      toast({
        title: "Voice Activated",
        description: "Listening... Speak now!"
      });
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      setIsListening(false);
      recognitionRef.current.stop();
      setAudioLevel(0);
    }
  };

  const handleVoiceInput = (text: string) => {
    stopListening();
    handleSendMessage(text, true);
  };

  // Text-to-speech
  const speakText = (text: string) => {
    if (synthRef.current && voiceSettings.voiceEnabled) {
      setIsSpeaking(true);
      
      // Clean text for speech
      const cleanText = text
        .replace(/[*#`]/g, '')
        .replace(/\n+/g, '. ')
        .replace(/•/g, '')
        .substring(0, 500);

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = voiceSettings.speechRate;
      utterance.volume = voiceSettings.speechVolume;
      
      // Try to use a natural voice
      const voices = synthRef.current.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Neural') || 
        voice.name.includes('Enhanced') ||
        voice.name.includes('Premium')
      ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      synthRef.current.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  // Send message function
  const handleSendMessage = async (messageText?: string, isVoiceMessage = false) => {
    const textToSend = messageText || inputValue.trim();
    if (!textToSend) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: textToSend,
      sender: 'user',
      timestamp: new Date(),
      isVoice: isVoiceMessage
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat-with-elin', {
        body: { message: textToSend }
      });

      if (error) throw error;

      const elinMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        sender: 'elin',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, elinMessage]);
      
      // Auto-speak response if enabled
      if (voiceSettings.voiceEnabled && voiceSettings.autoSpeak) {
        setTimeout(() => speakText(data.response), 500);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get response from ELIN",
        variant: "destructive"
      });
    } finally {
      setIsTyping(false);
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      const greeting: Message = {
        id: '1',
        content: "Hi! I'm ELIN with enhanced voice capabilities. You can type or speak to me - I'll respond with both text and voice! Ask me about investing, credit cards, or any financial topics.",
        sender: 'elin',
        timestamp: new Date()
      };
      setMessages([greeting]);
    }
  }, [messages.length]);

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-6 h-6 text-primary" />
              Voice-Enabled ELIN Chat
            </CardTitle>
            
            <div className="flex items-center gap-2">
              {/* Voice Settings */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setVoiceSettings(prev => ({ ...prev, voiceEnabled: !prev.voiceEnabled }))}
                className={voiceSettings.voiceEnabled ? "bg-primary/10 border-primary" : ""}
              >
                {voiceSettings.voiceEnabled ? (
                  <Volume2 className="w-4 h-4 text-primary" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </Button>

              {/* Voice Status */}
              {isListening && (
                <Badge variant="default" className="animate-pulse">
                  Listening...
                </Badge>
              )}
              
              {isSpeaking && (
                <Badge variant="secondary" className="animate-pulse">
                  Speaking...
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        {/* Messages Area */}
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {message.sender === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                    <span className="text-xs opacity-70">
                      {message.sender === 'user' ? 'You' : 'ELIN'}
                    </span>
                    {message.isVoice && (
                      <Badge variant="secondary" className="text-xs">
                        Voice
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <div className="text-xs opacity-50 mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-muted p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Live Transcript */}
          {transcript && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-end"
            >
              <div className="max-w-[70%] p-3 rounded-lg bg-primary/20 border border-primary/30">
                <div className="text-xs text-primary mb-1">Speaking...</div>
                <p className="text-sm italic">{transcript}</p>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </CardContent>

        {/* Input Area */}
        <div className="border-t p-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message or use voice..."
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                className="pr-12"
              />
            </div>

            {/* Voice Button */}
            <Button
              variant={isListening ? "default" : "outline"}
              size="sm"
              onMouseDown={startListening}
              onMouseUp={stopListening}
              onTouchStart={startListening}
              onTouchEnd={stopListening}
              className={`relative ${isListening ? "bg-destructive hover:bg-destructive/90" : ""}`}
            >
              {isListening ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
              
              {/* Audio Level Visualizer */}
              {isListening && (
                <div 
                  className="absolute inset-0 bg-red-500/20 rounded animate-pulse"
                  style={{ 
                    opacity: Math.min(audioLevel / 100, 1),
                    transform: `scale(${1 + (audioLevel / 200)})` 
                  }}
                />
              )}
            </Button>

            {/* Send Button */}
            <Button 
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim()}
              size="sm"
            >
              <Send className="w-4 h-4" />
            </Button>

            {/* Stop Speaking Button */}
            {isSpeaking && (
              <Button
                variant="outline"
                size="sm"
                onClick={stopSpeaking}
                className="text-destructive border-destructive"
              >
                <VolumeX className="w-4 h-4" />
              </Button>
            )}
          </div>
          
          <div className="text-xs text-muted-foreground mt-2 flex items-center justify-between">
            <span>Hold the mic button to speak, or type your message</span>
            <div className="flex items-center gap-2">
              {voiceSettings.voiceEnabled && (
                <Badge variant="default" className="text-xs bg-success/20 text-success border-success/30">
                  Voice Output: ON
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};