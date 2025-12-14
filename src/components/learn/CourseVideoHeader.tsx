import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Video, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CourseVideoHeaderProps {
  courseTitle: string;
  courseDescription: string;
  videoUrl?: string | null;
  onVideoGenerated?: (videoUrl: string) => void;
}

export const CourseVideoHeader = ({
  courseTitle,
  courseDescription,
  videoUrl: initialVideoUrl,
  onVideoGenerated
}: CourseVideoHeaderProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl);
  const [isPlaying, setIsPlaying] = useState(false);

  const generateIntroScript = async () => {
    // Use DeepSeek to generate a professional intro script
    const { data, error } = await supabase.functions.invoke('chat-with-elin', {
      body: { 
        message: `Generate a short, engaging 30-second video script for a course introduction. The course is "${courseTitle}". Description: ${courseDescription}. 
        
        Requirements:
        - Keep it under 100 words
        - Start with a warm greeting
        - Mention what students will learn
        - End with an encouraging call to action
        - Be professional but friendly
        - Do NOT include any disclaimers or markdown formatting
        
        Just output the script text, nothing else.`
      }
    });

    if (error) throw error;
    return data.response?.replace(/\*\*/g, '').replace(/📋.*$/s, '').trim() || 
      `Welcome to ${courseTitle}! In this course, you'll master essential investment concepts that will transform how you approach the financial markets. Whether you're just starting out or looking to refine your skills, this course has something for everyone. Let's begin your journey to financial literacy!`;
  };

  const generateVideo = async () => {
    setIsGenerating(true);
    try {
      toast.info('Generating intro script with AI...');
      const script = await generateIntroScript();
      
      toast.info('Creating HeyGen avatar video... This may take a few minutes.');
      
      const { data, error } = await supabase.functions.invoke('generate-intro-video', {
        body: { 
          script,
          title: courseTitle
        }
      });

      if (error) throw error;

      if (data.status === 'completed' && data.videoUrl) {
        setVideoUrl(data.videoUrl);
        onVideoGenerated?.(data.videoUrl);
        toast.success('Course intro video generated!');
      } else if (data.status === 'processing') {
        toast.info('Video is still processing. Check back in a few minutes.');
      }
    } catch (error) {
      console.error('Error generating video:', error);
      toast.error('Failed to generate video. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-slate-700">
      <CardContent className="p-0">
        {videoUrl ? (
          <div className="relative aspect-video">
            <video
              src={videoUrl}
              controls
              className="w-full h-full object-cover"
              poster={`https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1280&h=720&fit=crop`}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            <div className="absolute top-4 left-4">
              <Badge className="bg-violet-500/80 text-white border-violet-400/50">
                <Video className="w-3 h-3 mr-1" />
                AI Avatar Introduction
              </Badge>
            </div>
          </div>
        ) : (
          <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-violet-900/50 via-purple-900/50 to-slate-900 relative">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <div className="relative z-10 text-center px-6">
              <div className="w-20 h-20 rounded-full bg-violet-500/20 border-2 border-violet-500/50 flex items-center justify-center mx-auto mb-6">
                <Video className="w-10 h-10 text-violet-400" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-2">{courseTitle}</h3>
              <p className="text-slate-300 mb-6 max-w-lg mx-auto text-sm">{courseDescription}</p>
              
              <div className="flex items-center justify-center gap-3 mb-4">
                <Badge variant="outline" className="text-violet-300 border-violet-500/50 bg-violet-500/10">
                  <Sparkles className="w-3 h-3 mr-1" />
                  HeyGen AI Avatar
                </Badge>
                <Badge variant="outline" className="text-purple-300 border-purple-500/50 bg-purple-500/10">
                  <Play className="w-3 h-3 mr-1" />
                  Course Trailer
                </Badge>
              </div>

              <Button
                onClick={generateVideo}
                disabled={isGenerating}
                className="bg-violet-500 hover:bg-violet-600 text-white px-8"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating Video...
                  </>
                ) : (
                  <>
                    <Video className="w-5 h-5 mr-2" />
                    Generate Course Intro
                  </>
                )}
              </Button>

              <p className="text-xs text-slate-400 mt-4">
                Powered by HeyGen AI Avatar Technology
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
