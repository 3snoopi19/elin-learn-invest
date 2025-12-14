import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Presentation, Loader2, Sparkles, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DynamicSlideshow, Slide } from './DynamicSlideshow';

interface CourseVideoHeaderProps {
  courseTitle: string;
  courseDescription: string;
  onSlideshowGenerated?: () => void;
}

// Sample Bitcoin Basics slides for testing
const BITCOIN_BASICS_SLIDES: Slide[] = [
  {
    title: "What is Bitcoin?",
    bulletPoints: [
      "Bitcoin is a decentralized digital currency created in 2009 by Satoshi Nakamoto",
      "It operates on a peer-to-peer network without any central authority",
      "Transactions are verified by network nodes through cryptography"
    ],
    icon: "DollarSign"
  },
  {
    title: "How Bitcoin Works",
    bulletPoints: [
      "Bitcoin uses blockchain technology to record all transactions",
      "Miners validate transactions and add them to the blockchain",
      "New bitcoins are created as rewards for mining"
    ],
    icon: "TrendingUp"
  },
  {
    title: "Bitcoin Wallets",
    bulletPoints: [
      "A wallet stores your private keys to access your bitcoin",
      "Hot wallets are connected to the internet for easy access",
      "Cold wallets are offline storage for maximum security"
    ],
    icon: "Wallet"
  },
  {
    title: "Investment Considerations",
    bulletPoints: [
      "Bitcoin is highly volatile - prices can swing dramatically",
      "Only invest what you can afford to lose",
      "Dollar-cost averaging can help reduce timing risk"
    ],
    icon: "Shield"
  },
  {
    title: "Getting Started",
    bulletPoints: [
      "Choose a reputable exchange to buy your first bitcoin",
      "Set up two-factor authentication for security",
      "Consider moving to a personal wallet for long-term holding"
    ],
    icon: "Target"
  }
];

export const CourseVideoHeader = ({
  courseTitle,
  courseDescription,
  onSlideshowGenerated
}: CourseVideoHeaderProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [slides, setSlides] = useState<Slide[] | null>(null);
  const [showSlideshow, setShowSlideshow] = useState(false);

  const generateSlides = async () => {
    setIsGenerating(true);
    try {
      toast.info('Generating slideshow content with AI...');
      
      // Use AI to generate slides
      const { data, error } = await supabase.functions.invoke('chat-with-elin', {
        body: { 
          message: `Generate a JSON array of 5 educational slides for a course introduction about "${courseTitle}". 
          
          Each slide should have:
          - title: A short, engaging title (max 6 words)
          - bulletPoints: Array of exactly 3 bullet points (each 10-20 words)
          - icon: One of these icon names: BookOpen, TrendingUp, DollarSign, PieChart, BarChart3, Wallet, Target, Shield, Lightbulb, CheckCircle, AlertCircle, Info, Star

          Return ONLY the JSON array, no markdown, no explanation. Example format:
          [{"title":"...", "bulletPoints":["...","...","..."], "icon":"BookOpen"}]`
        }
      });

      if (error) throw error;

      // Parse the response
      let parsedSlides: Slide[];
      try {
        const responseText = data.response?.replace(/```json\n?|\n?```/g, '').trim();
        parsedSlides = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse AI response, using fallback slides');
        // Fallback to generic slides
        parsedSlides = [
          {
            title: `Welcome to ${courseTitle}`,
            bulletPoints: [
              "Learn essential concepts to master this topic",
              "Practical examples and real-world applications",
              "Build your knowledge step by step"
            ],
            icon: "BookOpen"
          },
          {
            title: "Key Concepts",
            bulletPoints: [
              "Understanding the fundamentals is crucial for success",
              "We'll break down complex ideas into simple terms",
              "Each lesson builds on the previous one"
            ],
            icon: "Lightbulb"
          },
          {
            title: "What You'll Learn",
            bulletPoints: [
              "Core principles and terminology",
              "Practical strategies you can apply immediately",
              "Common pitfalls and how to avoid them"
            ],
            icon: "Target"
          },
          {
            title: "Your Learning Journey",
            bulletPoints: [
              "Interactive lessons with audio explanations",
              "Progress tracking to monitor your advancement",
              "Quizzes to test your understanding"
            ],
            icon: "TrendingUp"
          },
          {
            title: "Let's Get Started!",
            bulletPoints: [
              "Take your time with each lesson",
              "Review concepts as needed",
              "Ready to begin your learning journey?"
            ],
            icon: "Star"
          }
        ];
      }

      setSlides(parsedSlides);
      setShowSlideshow(true);
      onSlideshowGenerated?.();
      toast.success('Slideshow generated!');
    } catch (error) {
      console.error('Error generating slides:', error);
      toast.error('Failed to generate slideshow. Using sample content.');
      // Use fallback slides on error
      setSlides(BITCOIN_BASICS_SLIDES);
      setShowSlideshow(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const testBitcoinSlideshow = () => {
    setSlides(BITCOIN_BASICS_SLIDES);
    setShowSlideshow(true);
    toast.success('Bitcoin Basics slideshow loaded!');
  };

  // Show the slideshow if generated
  if (showSlideshow && slides) {
    return (
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSlideshow(false)}
          className="absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm"
        >
          Close
        </Button>
        <DynamicSlideshow
          slides={slides}
          lessonTitle={courseTitle}
          onComplete={() => setShowSlideshow(false)}
        />
      </div>
    );
  }

  return (
    <Card className="overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-slate-700">
      <CardContent className="p-0">
        <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-violet-900/50 via-purple-900/50 to-slate-900 relative">
          {/* Animated Background */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          <div className="relative z-10 text-center px-6">
            <div className="w-20 h-20 rounded-full bg-violet-500/20 border-2 border-violet-500/50 flex items-center justify-center mx-auto mb-6">
              <Presentation className="w-10 h-10 text-violet-400" />
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-2">{courseTitle}</h3>
            <p className="text-slate-300 mb-6 max-w-lg mx-auto text-sm">{courseDescription}</p>
            
            <div className="flex items-center justify-center gap-3 mb-4">
              <Badge variant="outline" className="text-violet-300 border-violet-500/50 bg-violet-500/10">
                <Sparkles className="w-3 h-3 mr-1" />
                AI-Powered Slides
              </Badge>
              <Badge variant="outline" className="text-purple-300 border-purple-500/50 bg-purple-500/10">
                <Play className="w-3 h-3 mr-1" />
                Course Intro
              </Badge>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                onClick={generateSlides}
                disabled={isGenerating}
                className="bg-violet-500 hover:bg-violet-600 text-white px-8"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Presentation className="w-5 h-5 mr-2" />
                    Generate Slideshow
                  </>
                )}
              </Button>

              <Button
                onClick={testBitcoinSlideshow}
                variant="outline"
                className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
                size="lg"
              >
                <Zap className="w-5 h-5 mr-2" />
                Test Bitcoin Basics
              </Button>
            </div>

            <p className="text-xs text-slate-400 mt-4">
              Animated slideshow with text-to-speech narration
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
