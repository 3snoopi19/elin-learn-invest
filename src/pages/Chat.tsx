import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import { Send, Bot, AlertCircle, BookOpen, Sparkles, Settings2, Volume2, VolumeX, Globe, Mic, MicOff, Loader2, DollarSign, Rocket, FileText, Copy, Check } from "lucide-react";
import { COMPLIANCE_DISCLAIMER } from "@/lib/compliance";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { sanitizeChatInput } from "@/lib/validation";

// Enhanced chat components
import { ChatMessage } from "@/components/chat/ChatMessage";
import { QuickReplyButtons } from "@/components/chat/QuickReplyButtons";
import { LearningModeSelector } from "@/components/chat/LearningModeSelector";
import { ProgressTracker } from "@/components/chat/ProgressTracker";
import { PersonalizationPanel } from "@/components/chat/PersonalizationPanel";
import { VoiceInterface, VoiceInterfaceHandle } from "@/components/chat/VoiceInterface";
import { RoastButton } from "@/components/gamification/RoastButton";

// Types and hooks
import { Message, ChartData, QuizQuestion } from "@/types/chat";
import { useLearningProgress } from "@/hooks/useLearningProgress";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

// Streaming chat URL
const CHAT_URL = `https://hyilgirnewnwtthbvbqn.supabase.co/functions/v1/chat-with-elin`;
const TTS_URL = `https://hyilgirnewnwtthbvbqn.supabase.co/functions/v1/elin-tts`;
const SEARCH_URL = `https://hyilgirnewnwtthbvbqn.supabase.co/functions/v1/elin-web-search`;

type PersonaMode = 'financial' | 'mentor';

const Chat = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { progress, settings, updateProgress, updateSettings, incrementProgress, updateStreak } = useLearningProgress();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentMode, setCurrentMode] = useState<string>('ask-anything');
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [showProgress, setShowProgress] = useState(false);
  const [showPersonalization, setShowPersonalization] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [isVoiceMessage, setIsVoiceMessage] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [personaMode, setPersonaMode] = useState<PersonaMode>('financial');
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [copiedScript, setCopiedScript] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const voiceInterfaceRef = useRef<VoiceInterfaceHandle>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    // Initial greeting message based on persona
    if (user && messages.length === 0) {
      const greeting = getGreetingMessage();
      setMessages([greeting]);
      updateStreak();
    }
  }, [user, messages.length, updateStreak, personaMode]);

  const getGreetingMessage = (): Message => {
    const firstName = user?.user_metadata?.first_name || 'there';
    
    if (personaMode === 'mentor') {
      return {
        id: '1',
        content: `Hey ${firstName}! 🚀 I'm ELIN in **Success Mentor Mode**!\n\nI'm here to help you level up your career and life. Think of me as your personal coach for professional growth.\n\n🎯 **How I Can Help You:**\n• Craft the perfect ask for a raise or promotion\n• Negotiate salary, rent, or contracts\n• Overcome procrastination and build better habits\n• Prepare for difficult conversations\n• Create actionable step-by-step plans\n\n📝 **Pro Tip:** Click "Generate Script" to get copy/paste messages for negotiations!\n\nWhat challenge can I help you tackle today?`,
        sender: 'elin',
        timestamp: new Date(),
        hasDisclaimer: false
      };
    }
    
    return {
      id: '1',
      content: `Hi ${firstName}! 👋 I'm ELIN, your Enhanced Learning Investment Navigator - now in **🔥 GOD MODE**!\n\nI'm operating with advanced reasoning capabilities, deep market knowledge, and comprehensive investment education expertise.\n\n🧠 **My God Mode Capabilities:**\n• Deep expertise across stocks, bonds, ETFs, crypto, options, forex, and more\n• Technical & fundamental analysis explanations\n• Portfolio theory and risk management strategies\n• Economic analysis and market psychology insights\n• Tax-advantaged investing strategies\n\n🎯 **What I can help you with:**\n• Answer complex finance questions with step-by-step reasoning\n• Guide you through structured lessons at any level\n• Create interactive quizzes and real-world scenarios\n• Show visual charts and explain market concepts\n• Track your learning progress\n\n**Important:** I provide educational information only and cannot give personalized investment advice. For specific recommendations, please consult with a licensed financial advisor.\n\nLet's supercharge your investment knowledge! What would you like to learn about?`,
      sender: 'elin',
      timestamp: new Date(),
      hasDisclaimer: true
    };
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handlePersonaSwitch = (isMentor: boolean) => {
    const newMode = isMentor ? 'mentor' : 'financial';
    setPersonaMode(newMode);
    setMessages([]);
    setShowQuickReplies(true);
    
    toast({
      title: isMentor ? "🚀 Success Mentor Mode" : "💰 Financial Analyst Mode",
      description: isMentor 
        ? "Ready to help with career, habits, and life success!"
        : "Ready to educate on investing and finance!",
    });
  };

  // Helper function to generate credit card payment responses
  const generateCreditCardResponse = (userMessage: string): { 
    response: string; 
    hasDisclaimer: boolean;
    chartData?: ChartData;
    chartTitle?: string;
    quiz?: QuizQuestion;
  } => {
    const mockCardData = {
      cardName: "Chase Sapphire Reserve",
      currentBalance: 2847.32,
      minimumPayment: 75.00,
      statementBalance: 2650.00,
      dueDate: "2025-01-15",
      interestRate: 22.99
    };

    const interestCharges = mockCardData.statementBalance * (mockCardData.interestRate / 100 / 12);
    
    let response = "";
    
    if (userMessage.toLowerCase().includes('avoid interest')) {
      response = `💳 **To avoid interest charges, you should pay:** $${mockCardData.statementBalance.toFixed(2)} (your statement balance)\n\n`;
      response += `📊 **Your Credit Card Breakdown:**\n`;
      response += `• Current Balance: $${mockCardData.currentBalance.toFixed(2)}\n`;
      response += `• Statement Balance: $${mockCardData.statementBalance.toFixed(2)}\n`;
      response += `• Minimum Payment: $${mockCardData.minimumPayment.toFixed(2)}\n`;
      response += `• Due Date: ${new Date(mockCardData.dueDate).toLocaleDateString()}\n\n`;
      response += `💡 **AI recommendation:** Pay the full statement balance of $${mockCardData.statementBalance.toFixed(2)} to avoid the $${interestCharges.toFixed(2)} interest charge and maintain good credit health.\n\n`;
      response += `⚠️ **Important:** Paying only the minimum ($${mockCardData.minimumPayment.toFixed(2)}) will result in interest charges and extend your payoff time significantly.`;
    } else if (userMessage.toLowerCase().includes('minimum payment')) {
      response = `📋 **Your minimum payment is:** $${mockCardData.minimumPayment.toFixed(2)}\n\n`;
      response += `⚠️ **Risk Warning:** Paying only the minimum will cost you $${interestCharges.toFixed(2)} in interest this month and significantly extend your payoff time.\n\n`;
      response += `✅ **Better Options:**\n`;
      response += `• Pay statement balance ($${mockCardData.statementBalance.toFixed(2)}) = No interest\n`;
      response += `• Pay more than minimum = Save on interest & improve credit score\n`;
      response += `• Set up autopay for statement balance = Never miss payments`;
    } else {
      response = `💳 **Credit Card Payment Strategy:**\n\n`;
      response += `🎯 **Always aim to pay your statement balance** ($${mockCardData.statementBalance.toFixed(2)}) to avoid interest charges.\n\n`;
      response += `📈 **Payment Priority:**\n`;
      response += `1. **Best:** Statement balance = $${mockCardData.statementBalance.toFixed(2)} (no interest)\n`;
      response += `2. **Good:** More than minimum payment\n`;
      response += `3. **Minimum:** $${mockCardData.minimumPayment.toFixed(2)} (avoid late fees but pay interest)\n\n`;
      response += `💰 **This month's interest cost if you pay minimum:** $${interestCharges.toFixed(2)}\n\n`;
      response += `📱 **Pro tip:** Set up autopay for the statement balance to never worry about interest or late fees!`;
    }

    return {
      response: response,
      hasDisclaimer: false
    };
  };

  // Web search function
  const performWebSearch = async (query: string, searchType: string = 'general'): Promise<string | null> => {
    try {
      setIsSearching(true);
      const { data, error } = await supabase.functions.invoke('elin-web-search', {
        body: { query, searchType }
      });
      
      if (error) throw error;
      return data?.result || null;
    } catch (error) {
      console.error('Web search error:', error);
      return null;
    } finally {
      setIsSearching(false);
    }
  };

  // Text-to-speech function
  const speakText = async (text: string) => {
    if (!voiceEnabled) return;
    
    try {
      setIsSpeaking(true);
      
      const cleanText = text
        .replace(/[*#`_~]/g, '')
        .replace(/\n+/g, '. ')
        .replace(/•/g, '')
        .replace(/📋|📊|📈|💡|🎯|⚠️|🔥|🧠|💳|✅|❌|🌟|👋|---/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 800);

      if (!cleanText) return;

      const response = await fetch(TTS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({ text: cleanText }),
      });

      if (!response.ok) throw new Error('TTS failed');

      const data = await response.json();
      if (data.audio) {
        const audioUrl = `data:audio/mpeg;base64,${data.audio}`;
        audioRef.current = new Audio(audioUrl);
        audioRef.current.onended = () => setIsSpeaking(false);
        await audioRef.current.play();
      }
    } catch (error) {
      console.error('TTS error:', error);
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeaking(false);
  };

  // Streaming chat function
  const streamChat = async (
    userMessage: string,
    conversationHistory: { role: string; content: string }[],
    searchContext?: string | null
  ): Promise<string> => {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;

    const response = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        message: userMessage,
        conversationHistory,
        stream: true,
        searchContext,
        persona: personaMode
      }),
    });

    if (!response.ok || !response.body) {
      throw new Error('Stream failed');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = '';
    let fullResponse = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (line.startsWith(':') || line.trim() === '') continue;
        if (!line.startsWith('data: ')) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            fullResponse += content;
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.sender === 'elin') {
                return prev.map((m, i) => 
                  i === prev.length - 1 ? { ...m, content: fullResponse } : m
                );
              }
              return prev;
            });
          }
        } catch {
          // Continue on parse error
        }
      }
    }

    return fullResponse;
  };

  // Generate Script function
  const handleGenerateScript = async () => {
    const lastUserMessage = [...messages].reverse().find(m => m.sender === 'user');
    if (!lastUserMessage) {
      toast({
        title: "No Context",
        description: "Ask me about a situation first, then I can generate a script for it.",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingScript(true);
    
    const scriptPrompt = `Based on the user's request: "${lastUserMessage.content}"

Generate a ready-to-use script (text message, email, or conversation script) that they can copy and paste. Format it as:

📝 **Your Script:**
---
[The actual script they can copy/paste - be specific, professional but friendly]
---

💡 **Pro Tips:**
• [Tip 1 for delivering this effectively]
• [Tip 2]

Make the script natural, confident, and tailored to their specific situation.`;

    await handleSendMessage(scriptPrompt, 'script');
    setIsGeneratingScript(false);
  };

  // Copy script to clipboard
  const handleCopyScript = (content: string) => {
    const scriptMatch = content.match(/---\n([\s\S]*?)\n---/);
    const scriptText = scriptMatch ? scriptMatch[1].trim() : content;
    
    navigator.clipboard.writeText(scriptText);
    setCopiedScript(content);
    
    toast({
      title: "📋 Copied!",
      description: "Script copied to clipboard. Paste it anywhere!",
    });
    
    setTimeout(() => setCopiedScript(null), 3000);
  };

  const callELINAPI = async (userMessage: string, messageType?: string): Promise<{ 
    response: string; 
    hasDisclaimer: boolean;
    chartData?: ChartData;
    chartTitle?: string;
    quiz?: QuizQuestion;
  }> => {
    try {
      // Only check credit card keywords in financial mode
      if (personaMode === 'financial') {
        const creditCardKeywords = ['credit card', 'payment', 'minimum payment', 'avoid interest', 'card balance', 'pay off card', 'statement balance'];
        const isCreditCardQuery = creditCardKeywords.some(keyword => 
          userMessage.toLowerCase().includes(keyword.toLowerCase())
        );

        if (isCreditCardQuery) {
          return generateCreditCardResponse(userMessage);
        }
      }

      // Check if we need web search (only for financial mode)
      const searchKeywords = ['current', 'today', 'latest', 'news', 'price', 'market now', 'what is happening', 'recent'];
      const needsSearch = personaMode === 'financial' && searchKeywords.some(keyword => 
        userMessage.toLowerCase().includes(keyword.toLowerCase())
      );

      let searchContext: string | null = null;
      if (needsSearch) {
        const searchType = userMessage.toLowerCase().includes('news') ? 'news' : 
                          userMessage.toLowerCase().includes('stock') ? 'stock' : 'market';
        searchContext = await performWebSearch(userMessage, searchType);
      }

      // Enhanced prompt with context
      const enhancedPrompt = `
        User Level: ${settings.level}
        Explanation Style: ${settings.explanationStyle}
        Learning Mode: ${currentMode}
        Message Type: ${messageType || 'question'}
        Persona Mode: ${personaMode}
        Preferred Topics: ${settings.preferredTopics.join(', ')}
        
        User Message: ${userMessage}
        
        ${personaMode === 'mentor' ? `
        You are a Success Mentor. Focus on:
        - Career advancement and salary negotiation
        - Productivity and habit building
        - Communication and negotiation skills
        - Personal development and growth
        - Provide actionable, bulleted checklists
        - Be encouraging but practical
        ` : `
        Please respond according to the user's preferences. 
        ${settings.explanationStyle === 'simple' ? 'Use simple, easy-to-understand language.' : ''}
        ${settings.explanationStyle === 'technical' ? 'Include technical details and precise terminology.' : ''}
        `}
        ${messageType === 'quiz' ? 'Create an interactive quiz question about the topic.' : ''}
        ${messageType === 'visual' ? 'Explain how this could be visualized in a chart or graph.' : ''}
        ${messageType === 'script' ? 'Generate a copy/paste ready script as requested.' : ''}
      `;

      // Build conversation history
      const conversationHistory = messages
        .filter(msg => msg.content && msg.sender)
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.content
        }));

      setIsStreaming(true);
      
      // Add placeholder message for streaming
      const placeholderId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: placeholderId,
        content: '',
        sender: 'elin',
        timestamp: new Date(),
        hasDisclaimer: personaMode === 'financial'
      }]);

      const fullResponse = await streamChat(enhancedPrompt, conversationHistory, searchContext);
      
      // Add disclaimer only for financial mode
      const hasInvestmentContent = personaMode === 'financial' && /invest|stock|bond|portfolio|market|trading|financial|money|fund|ETF|401k|IRA|retirement|crypto/i.test(fullResponse);
      const finalResponse = hasInvestmentContent 
        ? `${fullResponse}\n\n---\n📋 **Educational Disclaimer**: This information is for educational purposes only. Always consult a financial advisor.`
        : fullResponse;

      // Update final message
      setMessages(prev => prev.map((m, i) => 
        i === prev.length - 1 ? { ...m, content: finalResponse, hasDisclaimer: hasInvestmentContent } : m
      ));

      setIsStreaming(false);

      // Handle additional content
      let additionalContent = {};
      
      if (messageType === 'visual' && userMessage.toLowerCase().includes('chart')) {
        additionalContent = {
          chartData: {
            type: 'line' as const,
            data: [
              { month: 'Jan', value: 100 },
              { month: 'Feb', value: 120 },
              { month: 'Mar', value: 110 },
              { month: 'Apr', value: 140 },
              { month: 'May', value: 160 },
              { month: 'Jun', value: 180 }
            ],
            xKey: 'month',
            yKey: 'value'
          },
          chartTitle: 'Sample Investment Growth Over Time'
        };
      }
      
      if (messageType === 'quiz') {
        additionalContent = {
          quiz: {
            id: `quiz-${Date.now()}`,
            question: "What is the main benefit of diversification in a portfolio?",
            options: [
              "Higher guaranteed returns",
              "Reduced overall risk through spreading investments",
              "Lower fees and taxes",
              "Faster portfolio growth"
            ],
            correctAnswer: 1,
            explanation: "Diversification helps reduce risk by spreading investments across different assets."
          }
        };
      }
      
      return { response: finalResponse, hasDisclaimer: hasInvestmentContent, ...additionalContent };
    } catch (error) {
      console.error('ELIN API error:', error);
      setIsStreaming(false);
      toast({
        title: "Message didn't send",
        description: "Please try again in a moment.",
        variant: "destructive"
      });
      
      return {
        response: "I'm experiencing connection issues. Please try again in a moment.",
        hasDisclaimer: false
      };
    }
  };

  const handleSendMessage = async (messageText?: string, messageType?: string, fromVoice?: boolean) => {
    const textToSend = messageText || inputValue.trim();
    if (!textToSend || isStreaming) return;

    const sanitizedInput = sanitizeChatInput(textToSend);
    
    if (!sanitizedInput) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid message.",
        variant: "destructive"
      });
      return;
    }

    // Track if this is a voice message for auto-speak response
    const wasVoiceMessage = fromVoice || isVoiceMessage;
    setIsVoiceMessage(false);

    const userMessage: Message = {
      id: Date.now().toString(),
      content: sanitizedInput,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setShowQuickReplies(false);

    const aiResponse = await callELINAPI(sanitizedInput, messageType);
    
    setIsTyping(false);
    setShowQuickReplies(true);
    
    // Auto-speak response if it was a voice message and not muted
    if (wasVoiceMessage && !voiceMuted && aiResponse.response && voiceInterfaceRef.current) {
      await voiceInterfaceRef.current.speakText(aiResponse.response);
    }
    
    if (messageType === 'lesson') incrementProgress('lessons');
    if (messageType === 'quiz') incrementProgress('quizzes');
    if (messageType === 'scenario') incrementProgress('scenarios');
  };

  const handleVoiceInput = (text: string) => {
    setIsVoiceMessage(true);
    handleSendMessage(text, undefined, true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleModeSelect = (mode: string, prompt: string) => {
    setCurrentMode(mode);
    handleSendMessage(prompt, 'lesson');
  };

  const handleQuickReply = (message: string, type?: string) => {
    handleSendMessage(message, type);
  };

  const handleQuizAnswer = (questionId: string, answer: string) => {
    incrementProgress('quizzes');
    
    toast({
      title: "Answer Recorded",
      description: "Great job! Keep learning.",
    });
  };

  // Quick prompts for mentor mode
  const mentorQuickPrompts = [
    { label: "How to ask for a raise", message: "How do I ask my boss for a raise? Give me a step-by-step plan." },
    { label: "Stop procrastinating", message: "How do I stop procrastinating and get things done?" },
    { label: "Negotiate rent", message: "I need to negotiate my rent with my landlord. Help me prepare." },
    { label: "Salary negotiation", message: "I have a job offer. How do I negotiate a higher salary?" },
  ];

  if (loading) {
    return <LoadingScreen message="Loading chat..." showLogo={true} />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="px-4 md:px-8 py-4 md:py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Persona Toggle */}
        <div className="mb-4 md:mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="relative">
                  <Bot className="h-6 w-6 md:h-8 md:w-8 text-education" />
                  <Sparkles className="h-3 w-3 md:h-4 md:w-4 text-education absolute -top-1 -right-1" />
                </div>
                <div>
                  <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-education to-primary bg-clip-text text-transparent">
                    ELIN {personaMode === 'mentor' ? 'Success Mentor' : 'Learning Assistant'}
                  </h1>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {personaMode === 'mentor' 
                      ? 'Career & Life Success Coach • AI-Powered Guidance'
                      : 'Enhanced Learning Investment Navigator • AI-Powered Education'
                    }
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              {/* Persona Toggle */}
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border">
                <span className={`text-sm font-medium transition-colors ${personaMode === 'financial' ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                  💰 Financial
                </span>
                <Switch
                  checked={personaMode === 'mentor'}
                  onCheckedChange={handlePersonaSwitch}
                  className="data-[state=checked]:bg-purple-500"
                />
                <span className={`text-sm font-medium transition-colors ${personaMode === 'mentor' ? 'text-purple-600' : 'text-muted-foreground'}`}>
                  🚀 Mentor
                </span>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowProgress(!showProgress)}
                className="gap-2 mobile-button"
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Progress</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowPersonalization(!showPersonalization)}
                className="gap-2 mobile-button"
              >
                <Settings2 className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Persistent AI disclosure – always visible, non-dismissible */}
        <div className="flex items-center gap-2 rounded-md border border-border/40 bg-muted/30 px-3 py-1.5 mb-4">
          <Bot className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            ELIN is an artificial intelligence. For education only — not financial advice.
          </p>
        </div>

        <div className="mobile-grid gap-4 md:gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <ProgressTracker 
              progress={progress}
              isVisible={showProgress}
              onToggle={() => setShowProgress(!showProgress)}
            />
            
            <PersonalizationPanel 
              settings={settings}
              onSettingsUpdate={updateSettings}
              isVisible={showPersonalization}
              onToggle={() => setShowPersonalization(!showPersonalization)}
            />

            <Alert className="border-warning/20 bg-warning/5">
              <AlertCircle className="h-4 w-4 text-warning" />
              <AlertDescription className="text-xs">
                <strong>{personaMode === 'mentor' ? 'Guidance Only:' : 'Educational Only:'}</strong> {
                  personaMode === 'mentor' 
                    ? 'I provide general guidance. For legal, medical, or professional advice, consult appropriate experts.'
                    : COMPLIANCE_DISCLAIMER
                }
              </AlertDescription>
            </Alert>

            {/* Mentor Mode Quick Prompts */}
            {personaMode === 'mentor' && (
              <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Rocket className="w-4 h-4 text-purple-500" />
                    Quick Topics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {mentorQuickPrompts.map((prompt, idx) => (
                    <Button
                      key={idx}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-xs h-auto py-2 hover:bg-purple-500/10"
                      onClick={() => handleSendMessage(prompt.message)}
                    >
                      {prompt.label}
                    </Button>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            {/* Learning Mode Selector - only in financial mode */}
            {personaMode === 'financial' && messages.length <= 1 && (
              <div className="mb-4 md:mb-6">
                <h3 className="text-base md:text-lg font-medium mb-4">Choose Your Learning Mode</h3>
                <LearningModeSelector 
                  onModeSelect={handleModeSelect}
                  currentMode={currentMode}
                />
              </div>
            )}

            {/* Chat Container */}
            <Card className="flex-1 mobile-card">
              <CardHeader className="pb-3 md:pb-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {personaMode === 'mentor' ? (
                      <Rocket className="h-4 w-4 md:h-5 md:w-5 text-purple-500" />
                    ) : (
                      <BookOpen className="h-4 w-4 md:h-5 md:w-5 text-education" />
                    )}
                    <span className="text-sm md:text-base">
                      {personaMode === 'mentor' ? 'Success Coaching Chat' : 'Interactive Learning Chat'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Voice Mute Toggle */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setVoiceMuted(!voiceMuted)}
                      className={`gap-1 text-xs ${voiceMuted ? 'text-muted-foreground' : 'text-primary'}`}
                      title={voiceMuted ? "Unmute ELIN's voice" : "Mute ELIN's voice"}
                    >
                      {voiceMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      <span className="hidden sm:inline">{voiceMuted ? 'Unmuted' : 'Voice On'}</span>
                    </Button>

                    {/* Generate Script Button - only in mentor mode */}
                    {personaMode === 'mentor' && messages.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleGenerateScript}
                        disabled={isGeneratingScript || isStreaming}
                        className="gap-1 text-xs border-purple-500/30 hover:bg-purple-500/10"
                      >
                        {isGeneratingScript ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <FileText className="w-3 h-3" />
                        )}
                        Generate Script
                      </Button>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Mode: <span className={`capitalize font-medium ${personaMode === 'mentor' ? 'text-purple-500' : 'text-education'}`}>
                        {personaMode === 'mentor' ? 'Success Mentor' : currentMode.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4">
                {/* Messages */}
                <div className="min-h-[400px] md:min-h-[500px] max-h-[500px] md:max-h-[600px] overflow-y-auto space-y-4 md:space-y-6 p-3 md:p-4 bg-gradient-to-b from-muted/10 to-muted/5 rounded-lg">
                  {messages.map((message) => (
                    <div key={message.id} className="relative group">
                      <ChatMessage 
                        message={message} 
                        onQuizAnswer={handleQuizAnswer}
                      />
                      {/* Copy Script Button for script responses */}
                      {message.sender === 'elin' && message.content.includes('---') && personaMode === 'mentor' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity gap-1"
                          onClick={() => handleCopyScript(message.content)}
                        >
                          {copiedScript === message.content ? (
                            <>
                              <Check className="w-3 h-3 text-green-500" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              Copy Script
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex gap-2 md:gap-3 max-w-[85%]">
                      <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center ${
                        personaMode === 'mentor' 
                          ? 'bg-gradient-to-br from-purple-500 to-purple-600' 
                          : 'bg-gradient-to-br from-education to-education/80'
                      }`}>
                        <Bot className="w-3 h-3 md:w-4 md:h-4 text-white" />
                      </div>
                      <div className="bg-card border border-border/50 rounded-2xl rounded-bl-sm p-3 md:p-4 shadow-sm">
                        <div className="flex space-x-1">
                          <div className={`w-2 h-2 rounded-full animate-bounce ${personaMode === 'mentor' ? 'bg-purple-500' : 'bg-education'}`}></div>
                          <div className={`w-2 h-2 rounded-full animate-bounce ${personaMode === 'mentor' ? 'bg-purple-500' : 'bg-education'}`} style={{ animationDelay: '0.1s' }}></div>
                          <div className={`w-2 h-2 rounded-full animate-bounce ${personaMode === 'mentor' ? 'bg-purple-500' : 'bg-education'}`} style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          ELIN is {personaMode === 'mentor' ? 'crafting your advice' : 'thinking'}...
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Reply Buttons */}
                <QuickReplyButtons 
                  onQuickReply={handleQuickReply}
                  isVisible={showQuickReplies && !isTyping && messages.length > 1}
                />

                {/* Voice Interface and Input */}
                <div className="space-y-3 p-3 md:p-4 border-t border-border/30 sticky bottom-0 bg-card/95 backdrop-blur-md">
                  <VoiceInterface 
                    ref={voiceInterfaceRef}
                    onVoiceInput={handleVoiceInput}
                    isListening={isTyping || isStreaming}
                    voiceMuted={voiceMuted}
                    onMuteChange={setVoiceMuted}
                  />
                  
                  <div className="flex items-center gap-2">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={personaMode === 'mentor' 
                        ? "Ask about career, habits, or negotiation..."
                        : "Ask about investing or request a lesson..."
                      }
                      className="flex-1 bg-background border-border/50 focus:border-education focus:ring-education text-base min-h-[44px]"
                      maxLength={2000}
                      aria-label="Type your message to ELIN"
                      inputMode="text"
                      enterKeyHint="send"
                    />
                    <Button 
                      onClick={() => handleSendMessage()} 
                      disabled={!inputValue.trim() || isTyping}
                      aria-label="Send message"
                      className={`min-w-[44px] min-h-[44px] h-11 w-11 ${
                        personaMode === 'mentor' 
                          ? 'bg-purple-500 hover:bg-purple-600' 
                          : 'bg-education hover:bg-education/90'
                      }`}
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
