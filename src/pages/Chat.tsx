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

  const simulateELINResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Check for advice-seeking patterns
    if (lowerMessage.includes('should i buy') || lowerMessage.includes('recommend') || lowerMessage.includes('invest in')) {
      return "I understand you're looking for investment guidance, but I can't provide personalized investment advice. Instead, let me share some general educational considerations:\n\n**For investment decisions, consider:**\n- Your risk tolerance and time horizon\n- Diversification across asset classes\n- Fee structures and expense ratios\n- Your overall investment goals\n\n**I'd recommend:**\n- Speaking with a licensed financial advisor for personalized recommendations\n- Researching the investment fundamentals\n- Understanding the risks involved\n\nIs there a specific educational topic about investing I can help explain instead?";
    }
    
    // ETF questions
    if (lowerMessage.includes('etf') || lowerMessage.includes('exchange traded fund')) {
      return "Great question about ETFs! An Exchange Traded Fund (ETF) is an investment fund that trades on stock exchanges like individual stocks.\n\n**Key characteristics of ETFs:**\n- **Diversification**: Own many securities in one fund\n- **Lower fees**: Generally cheaper than mutual funds\n- **Liquidity**: Trade during market hours\n- **Transparency**: Holdings disclosed daily\n\n**Common types:**\n- Index ETFs (track market indices like S&P 500)\n- Sector ETFs (focus on specific industries)\n- Bond ETFs (fixed income securities)\n- International ETFs (foreign markets)\n\n**Educational considerations:**\n- Compare expense ratios between similar ETFs\n- Understand what index or strategy the ETF follows\n- Consider your asset allocation goals\n\nWould you like me to explain any specific aspect of ETFs in more detail?";
    }
    
    // 10-K filing questions
    if (lowerMessage.includes('10-k') || lowerMessage.includes('filing') || lowerMessage.includes('sec')) {
      return "SEC filings are treasure troves of company information! A 10-K is a comprehensive annual report that public companies must file.\n\n**Key sections to focus on:**\n- **Business Overview**: What the company does\n- **Risk Factors**: Potential challenges and threats\n- **MD&A**: Management's discussion of financial performance\n- **Financial Statements**: Balance sheet, income statement, cash flow\n\n**Educational approach to reading 10-Ks:**\n1. Start with the business description\n2. Review recent risk factors\n3. Look at revenue trends over 3-5 years\n4. Check debt levels and cash position\n\n**Pro tip**: Don't try to read everything at once. Focus on sections relevant to your learning goals.\n\nWould you like me to walk you through how to find and navigate a specific company's 10-K filing?";
    }
    
    // Risk tolerance questions
    if (lowerMessage.includes('risk') && (lowerMessage.includes('tolerance') || lowerMessage.includes('profile'))) {
      return "Understanding your risk tolerance is crucial for investment education!\n\n**Risk tolerance factors:**\n- **Time horizon**: Longer = potentially more risk capacity\n- **Financial situation**: Emergency fund, income stability\n- **Emotional comfort**: How do you react to market volatility?\n- **Investment goals**: Growth vs. income vs. preservation\n\n**Educational exercise:**\nImagine your investment drops 20% in a month. Would you:\n- Feel sick and want to sell everything?\n- Feel uncomfortable but hold steady?\n- See it as a buying opportunity?\n\nYour honest reaction helps gauge your risk tolerance.\n\n**Remember**: Risk tolerance can change over time based on life circumstances, so it's worth reassessing periodically.\n\nWould you like to explore how different asset classes typically behave during market volatility?";
    }
    
    // Default educational response
    return "That's an interesting question! I'd love to help you learn more about that topic.\n\nSome areas I can help you explore:\n- **Investment basics**: Stocks, bonds, ETFs, mutual funds\n- **Financial concepts**: Diversification, risk, compound interest\n- **SEC filings**: How to read and understand company reports\n- **Market fundamentals**: P/E ratios, market cap, sectors\n- **Fee awareness**: Expense ratios, trading costs\n\nCould you be more specific about what you'd like to learn? I'm here to help make complex investment concepts clear and understandable!";
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const rawResponse = simulateELINResponse(userMessage.content);
      const validation = validateAIResponse(rawResponse);
      
      const elinMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: validation.modifiedResponse || rawResponse,
        sender: 'elin',
        timestamp: new Date(),
        hasDisclaimer: true
      };

      setMessages(prev => [...prev, elinMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
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
                onKeyPress={handleKeyPress}
                placeholder="Ask me about investing concepts, ETFs, risk tolerance, SEC filings..."
                className="flex-1"
              />
              <Button onClick={handleSendMessage} disabled={!inputValue.trim() || isTyping}>
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