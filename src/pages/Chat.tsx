import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { Send, Bot, AlertCircle, BookOpen, Sparkles, Settings2 } from "lucide-react";
import { COMPLIANCE_DISCLAIMER } from "@/lib/compliance";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { sanitizeChatInput } from "@/lib/validation";

// Enhanced chat components
import { ChatMessage } from "@/components/chat/ChatMessage";
import { QuickReplyButtons } from "@/components/chat/QuickReplyButtons";
import { LearningModeSelector } from "@/components/chat/LearningModeSelector";
import { ProgressTracker } from "@/components/chat/ProgressTracker";
import { PersonalizationPanel } from "@/components/chat/PersonalizationPanel";
import { VoiceInterface } from "@/components/chat/VoiceInterface";

// Types and hooks
import { Message, ChartData, QuizQuestion } from "@/types/chat";
import { useLearningProgress } from "@/hooks/useLearningProgress";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

const Chat = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { progress, settings, updateProgress, updateSettings, incrementProgress, updateStreak } = useLearningProgress();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentMode, setCurrentMode] = useState<string>('ask-anything');
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [showProgress, setShowProgress] = useState(false);
  const [showPersonalization, setShowPersonalization] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    // Initial greeting message
    if (user && messages.length === 0) {
      const greeting: Message = {
        id: '1',
        content: `Hi ${user.user_metadata?.first_name || 'there'}! 👋 I'm ELIN, your Enhanced Learning Investment Navigator.\n\nI'm here to provide you with an interactive, personalized learning experience about investing. Whether you're a complete beginner or looking to deepen your knowledge, I can adapt to your learning style and pace.\n\n🎯 **What I can help you with:**\n• Answer any finance questions with clear explanations\n• Guide you through structured lessons\n• Create interactive quizzes and scenarios\n• Show visual charts and examples\n• Track your learning progress\n• **Credit card payment optimization** - Ask me "How much should I pay to avoid interest?"\n\n**Important:** I provide educational information only and cannot give personalized investment advice. For specific investment recommendations, please consult with a licensed financial advisor.\n\nChoose a learning mode below or just ask me anything!`,
        sender: 'elin',
        timestamp: new Date(),
        hasDisclaimer: true
      };
      setMessages([greeting]);
      
      // Update activity streak
      updateStreak();
    }
  }, [user, messages.length, updateStreak]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
      // General credit card guidance
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

  const callELINAPI = async (userMessage: string, messageType?: string): Promise<{ 
    response: string; 
    hasDisclaimer: boolean;
    chartData?: ChartData;
    chartTitle?: string;
    quiz?: QuizQuestion;
  }> => {
    try {
      // Check for credit card payment questions
      const creditCardKeywords = ['credit card', 'payment', 'minimum payment', 'avoid interest', 'card balance', 'pay off card', 'statement balance'];
      const isCreditCardQuery = creditCardKeywords.some(keyword => 
        userMessage.toLowerCase().includes(keyword.toLowerCase())
      );

      if (isCreditCardQuery) {
        // Provide credit card payment guidance
        return generateCreditCardResponse(userMessage);
      }

      // Enhanced prompt with context
      const enhancedPrompt = `
        User Level: ${settings.level}
        Explanation Style: ${settings.explanationStyle}
        Learning Mode: ${currentMode}
        Message Type: ${messageType || 'question'}
        Preferred Topics: ${settings.preferredTopics.join(', ')}
        
        User Message: ${userMessage}
        
        Please respond according to the user's preferences. 
        ${settings.explanationStyle === 'simple' ? 'Use simple, easy-to-understand language.' : ''}
        ${settings.explanationStyle === 'technical' ? 'Include technical details and precise terminology.' : ''}
        ${messageType === 'quiz' ? 'Create an interactive quiz question about the topic.' : ''}
        ${messageType === 'visual' ? 'Explain how this could be visualized in a chart or graph.' : ''}
      `;

      const { data, error } = await supabase.functions.invoke('chat-with-elin', {
        body: { message: enhancedPrompt }
      });

      if (error) {
        console.error('ELIN API error details:', error);
        throw error;
      }
      
      // Check if we should generate additional content based on message type
      let additionalContent = {};
      
      if (messageType === 'visual' && userMessage.toLowerCase().includes('chart')) {
        // Generate sample chart data for demonstration
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
        // Generate a sample quiz
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
            explanation: "Diversification helps reduce risk by spreading investments across different assets, sectors, or regions, so that poor performance in one area doesn't significantly impact the entire portfolio."
          }
        };
      }
      
      return { ...data, ...additionalContent };
    } catch (error) {
      console.error('Error calling ELIN API:', error);
      toast({
        title: "Connection Error",
        description: "ELIN is temporarily unavailable. Please try again later.",
        variant: "destructive"
      });
      
      return {
        response: "I'm currently experiencing connection issues. In the meantime, you can explore our Learn section for comprehensive investment education resources, or try the Portfolio Tracker to practice with investment concepts.",
        hasDisclaimer: false
      };
    }
  };

  const handleSendMessage = async (messageText?: string, messageType?: string) => {
    const textToSend = messageText || inputValue.trim();
    if (!textToSend) return;

    // Sanitize input to prevent injection attempts
    const sanitizedInput = sanitizeChatInput(textToSend);
    
    if (!sanitizedInput) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid message.",
        variant: "destructive"
      });
      return;
    }

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

    // Get AI response with enhanced context
    const aiResponse = await callELINAPI(sanitizedInput, messageType);
    
    const elinMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: aiResponse.response,
      sender: 'elin',
      timestamp: new Date(),
      hasDisclaimer: aiResponse.hasDisclaimer,
      type: messageType === 'quiz' ? 'quiz' : 'message',
      chartData: aiResponse.chartData,
      chartTitle: aiResponse.chartTitle,
      quiz: aiResponse.quiz
    };

    setMessages(prev => [...prev, elinMessage]);
    setIsTyping(false);
    setShowQuickReplies(true);
    
    // Speak the response if voice is enabled
    if (window.elinSpeak && settings.voiceEnabled) {
      // Clean the response text for speech
      const cleanText = aiResponse.response
        .replace(/[*#`]/g, '') // Remove markdown characters
        .replace(/\n+/g, '. ') // Replace line breaks with periods
        .replace(/•/g, '') // Remove bullet points
        .substring(0, 300); // Limit length for speech
      
      setTimeout(() => {
        window.elinSpeak?.(cleanText);
      }, 500);
    }
    
    // Update learning progress
    if (messageType === 'lesson') incrementProgress('lessons');
    if (messageType === 'quiz') incrementProgress('quizzes');
    if (messageType === 'scenario') incrementProgress('scenarios');
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
    // Track quiz completion
    incrementProgress('quizzes');
    
    toast({
      title: "Answer Recorded",
      description: "Great job! Keep learning.",
    });
  };

  if (loading) {
    return <LoadingScreen message="Loading chat..." showLogo={true} />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 mobile-container mobile-content">
        {/* Header - Mobile optimized */}
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
                    ELIN Learning Assistant
                  </h1>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Enhanced Learning Investment Navigator • AI-Powered Education
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
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

        <div className="mobile-grid gap-4 md:gap-6">
          {/* Sidebar - Collapsible on mobile */}
          <div className="lg:col-span-1 space-y-4">
            {/* Progress Tracker */}
            <ProgressTracker 
              progress={progress}
              isVisible={showProgress}
              onToggle={() => setShowProgress(!showProgress)}
            />
            
            {/* Personalization Panel */}
            <PersonalizationPanel 
              settings={settings}
              onSettingsUpdate={updateSettings}
              isVisible={showPersonalization}
              onToggle={() => setShowPersonalization(!showPersonalization)}
            />

            {/* Compliance Notice - Compact on mobile */}
            <Alert className="border-warning/20 bg-warning/5">
              <AlertCircle className="h-4 w-4 text-warning" />
              <AlertDescription className="text-xs">
                <strong>Educational Only:</strong> {COMPLIANCE_DISCLAIMER}
              </AlertDescription>
            </Alert>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            {/* Learning Mode Selector */}
            {messages.length <= 1 && (
              <div className="mb-4 md:mb-6">
                <h3 className="text-base md:text-lg font-medium mb-4">Choose Your Learning Mode</h3>
                <LearningModeSelector 
                  onModeSelect={handleModeSelect}
                  currentMode={currentMode}
                />
              </div>
            )}

            {/* Chat Container - Mobile optimized */}
            <Card className="flex-1 mobile-card">
              <CardHeader className="pb-3 md:pb-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 md:h-5 md:w-5 text-education" />
                    <span className="text-sm md:text-base">Interactive Learning Chat</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Mode: <span className="capitalize text-education font-medium">{currentMode.replace('-', ' ')}</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4">
                {/* Messages - Mobile optimized scrolling */}
                <div className="min-h-[400px] md:min-h-[500px] max-h-[500px] md:max-h-[600px] overflow-y-auto space-y-4 md:space-y-6 p-3 md:p-4 bg-gradient-to-b from-muted/10 to-muted/5 rounded-lg">
                  {messages.map((message) => (
                    <ChatMessage 
                      key={message.id} 
                      message={message} 
                      onQuizAnswer={handleQuizAnswer}
                    />
                  ))}
                  
                  {isTyping && (
                    <div className="flex gap-2 md:gap-3 max-w-[85%]">
                      <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-education to-education/80 flex items-center justify-center">
                        <Bot className="w-3 h-3 md:w-4 md:h-4 text-white" />
                      </div>
                      <div className="bg-card border border-border/50 rounded-2xl rounded-bl-sm p-3 md:p-4 shadow-sm">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-education rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-education rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-education rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">ELIN is thinking...</div>
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

                {/* Voice Interface and Input - Mobile optimized */}
                <div className="space-y-2 md:space-y-3 p-3 md:p-4 border-t border-border/30">
                  <VoiceInterface 
                    onVoiceInput={(text) => handleSendMessage(text)}
                    isListening={isTyping}
                  />
                  
                  <div className="flex space-x-2">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask about investing or request a lesson..."
                      className="flex-1 bg-background border-border/50 focus:border-education focus:ring-education text-sm md:text-base"
                      maxLength={2000}
                      aria-label="Type your message to ELIN"
                    />
                    <Button 
                      onClick={() => handleSendMessage()} 
                      disabled={!inputValue.trim() || isTyping}
                      aria-label="Send message"
                      className="bg-education hover:bg-education/90 mobile-button min-w-[44px]"
                      size="sm"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Chat;