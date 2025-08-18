import { Message } from "@/types/chat";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bot, User, Lightbulb, BookOpen, Trophy } from "lucide-react";
import { ChatChart } from "./ChatChart";
import { ChatQuiz } from "./ChatQuiz";
import { formatDistanceToNow } from "date-fns";

interface ChatMessageProps {
  message: Message;
  onQuizAnswer?: (questionId: string, answer: string) => void;
}

export const ChatMessage = ({ message, onQuizAnswer }: ChatMessageProps) => {
  const isUser = message.sender === 'user';
  const isElin = message.sender === 'elin';

  return (
    <div className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <Avatar className={`w-8 h-8 flex-shrink-0 ${isUser ? 'ml-2' : 'mr-2'}`}>
        <AvatarFallback className={`text-xs font-medium ${
          isUser 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-gradient-to-br from-education to-education/80 text-white'
        }`}>
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </AvatarFallback>
      </Avatar>

      {/* Message Content */}
      <div className={`flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Message Bubble */}
        <div className={`rounded-2xl px-4 py-3 max-w-full break-words ${
          isUser 
            ? 'bg-primary text-primary-foreground rounded-br-sm' 
            : 'bg-card border border-border/50 rounded-bl-sm shadow-sm'
        }`}>
          {/* Content */}
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </div>

          {/* Chart Rendering */}
          {message.chartData && (
            <div className="mt-3">
              <ChatChart data={message.chartData} title={message.chartTitle} />
            </div>
          )}

          {/* Quiz Rendering */}
          {message.quiz && (
            <div className="mt-3">
              <ChatQuiz 
                quiz={message.quiz} 
                onAnswer={onQuizAnswer}
                messageId={message.id}
              />
            </div>
          )}

          {/* Badges */}
          <div className="flex flex-wrap gap-1 mt-2">
            {message.hasDisclaimer && (
              <Badge variant="outline" className="text-xs">
                <Lightbulb className="w-3 h-3 mr-1" />
                Educational Content
              </Badge>
            )}
            {message.type === 'lesson' && (
              <Badge variant="secondary" className="text-xs">
                <BookOpen className="w-3 h-3 mr-1" />
                Lesson
              </Badge>
            )}
            {message.type === 'achievement' && (
              <Badge variant="default" className="text-xs bg-success">
                <Trophy className="w-3 h-3 mr-1" />
                Achievement
              </Badge>
            )}
          </div>
        </div>

        {/* Timestamp */}
        <div className={`text-xs text-muted-foreground px-1 ${
          isUser ? 'text-right' : 'text-left'
        }`}>
          {formatDistanceToNow(message.timestamp, { addSuffix: true })}
        </div>
      </div>
    </div>
  );
};