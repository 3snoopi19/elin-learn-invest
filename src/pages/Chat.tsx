import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { Send, Bot, User, AlertCircle, BookOpen } from "lucide-react";
import { COMPLIANCE_DISCLAIMER, validateAIResponse } from "@/lib/compliance";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { sanitizeChatInput } from "@/lib/validation";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'elin';
  timestamp: Date;
  hasDisclaimer?: boolean;
}

const Chat = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
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
        content: `Hi ${user.user_metadata?.first_name || 'there'}! I'm ELIN, your empathetic AI investment mentor. I'm here to help you learn about investing concepts, understand financial terms, and explore SEC filings.\n\n**Important:** I provide educational information only and cannot give personalized investment advice. For specific investment recommendations, please consult with a licensed financial advisor.\n\nWhat would you like to learn about today?`,
        sender: 'elin',
        timestamp: new Date(),
        hasDisclaimer: true
      };
      setMessages([greeting]);
    }
  }, [user, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const callELINAPI = async (userMessage: string): Promise<{ response: string; hasDisclaimer: boolean }> => {
    try {
      const { data, error } = await supabase.functions.invoke('chat-with-elin', {
        body: { message: userMessage }
      });

      if (error) {
        console.error('ELIN API error details:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error calling ELIN API:', error);
      toast({
        title: "Connection Error",
        description: "ELIN is temporarily unavailable. This might be due to API configuration. Please try again later.",
        variant: "destructive"
      });
      
      // Improved fallback response
      return {
        response: "I'm currently experiencing connection issues. This might be due to API configuration that needs to be set up. In the meantime, you can explore our Learn section for comprehensive investment education resources, or try the Portfolio Tracker to practice with investment concepts.",
        hasDisclaimer: false
      };
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Sanitize input to prevent injection attempts
    const sanitizedInput = sanitizeChatInput(inputValue.trim());
    
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

    // Get AI response
    const aiResponse = await callELINAPI(sanitizedInput);
    
    const elinMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: aiResponse.response,
      sender: 'elin',
      timestamp: new Date(),
      hasDisclaimer: aiResponse.hasDisclaimer
    };

    setMessages(prev => [...prev, elinMessage]);
    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <Bot className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Chat with ELIN</h1>
          </div>
          <p className="text-muted-foreground">
            Your empathetic AI investment mentor - here to help you learn, not to give advice
          </p>
        </div>

        {/* Compliance Notice */}
        <Alert className="mb-6 border-warning/20 bg-warning/5">
          <AlertCircle className="h-4 w-4 text-warning" />
          <AlertDescription>
            <strong>Educational Only:</strong> {COMPLIANCE_DISCLAIMER}
          </AlertDescription>
        </Alert>

        {/* Chat Container */}
        <Card className="flex-1 mb-4">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Investment Learning Chat</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Messages */}
            <div className="h-96 overflow-y-auto space-y-4 mb-4 p-4 bg-muted/20 rounded-lg">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex space-x-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.sender === 'user' ? 'bg-primary' : 'bg-education'
                    }`}>
                      {message.sender === 'user' ? (
                        <User className="h-4 w-4 text-primary-foreground" />
                      ) : (
                        <Bot className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div className={`rounded-lg p-3 ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card border'
                    }`}>
                      <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                      <div className="text-xs opacity-70 mt-2">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      {message.hasDisclaimer && message.sender === 'elin' && (
                        <Badge variant="outline" className="mt-2 text-xs">
                          Educational Content
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex space-x-2 max-w-[80%]">
                    <div className="w-8 h-8 rounded-full bg-education flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-card border rounded-lg p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask me about investing concepts, ETFs, risk tolerance, SEC filings..."
                className="flex-1"
                maxLength={2000}
                aria-label="Type your message to ELIN"
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!inputValue.trim() || isTyping}
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default Chat;