-- Add progress tracking to profiles table
ALTER TABLE public.profiles 
ADD COLUMN lessons_completed INTEGER DEFAULT 0,
ADD COLUMN total_lessons INTEGER DEFAULT 0,
ADD COLUMN achievements TEXT[] DEFAULT '{}',
ADD COLUMN last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create achievements table
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL,
  points INTEGER DEFAULT 0,
  unlock_criteria JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on achievements table
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to achievements
CREATE POLICY "Achievements are viewable by everyone" 
ON public.achievements 
FOR SELECT 
USING (true);

-- Insert default achievements
INSERT INTO public.achievements (name, title, description, icon, category, points, unlock_criteria) VALUES
('first_lesson', 'Learning Begins', 'Complete your first lesson', 'BookOpen', 'learning', 10, '{"lessons_completed": 1}'),
('risk_profiled', 'Know Thyself', 'Complete the Risk Personality Quiz', 'Shield', 'assessment', 25, '{"risk_quiz_completed": true}'),
('streak_3', 'Getting Started', 'Learn for 3 consecutive days', 'Flame', 'engagement', 15, '{"consecutive_days": 3}'),
('lessons_10', 'Knowledge Seeker', 'Complete 10 lessons', 'GraduationCap', 'learning', 50, '{"lessons_completed": 10}'),
('portfolio_diversified', 'Diversification Master', 'Complete all portfolio lessons', 'PieChart', 'portfolio', 75, '{"portfolio_lessons_completed": true}'),
('risk_mastered', 'Risk Expert', 'Complete all risk management lessons', 'Target', 'risk', 75, '{"risk_lessons_completed": true}'),
('market_analyst', 'Market Analyst', 'Complete all market analysis lessons', 'TrendingUp', 'analysis', 100, '{"analysis_lessons_completed": true}'),
('elin_graduate', 'ELIN Graduate', 'Complete all available lessons', 'Trophy', 'mastery', 200, '{"all_lessons_completed": true});

-- Create user_achievements table to track which achievements users have unlocked
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_name TEXT NOT NULL REFERENCES public.achievements(name) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  points_earned INTEGER DEFAULT 0,
  UNIQUE(user_id, achievement_name)
);

-- Enable RLS on user_achievements table
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Create policies for user_achievements
CREATE POLICY "Users can view their own achievements" 
ON public.user_achievements 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements" 
ON public.user_achievements 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create lesson_progress table to track individual lesson completion
CREATE TABLE public.lesson_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  score INTEGER,
  time_spent INTEGER, -- in seconds
  UNIQUE(user_id, lesson_id)
);

-- Enable RLS on lesson_progress table
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for lesson_progress
CREATE POLICY "Users can view their own lesson progress" 
ON public.lesson_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lesson progress" 
ON public.lesson_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lesson progress" 
ON public.lesson_progress 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to update progress when lesson is completed
CREATE OR REPLACE FUNCTION public.update_user_progress()
RETURNS TRIGGER AS $$
DECLARE
  total_lessons_count INTEGER;
  completed_lessons_count INTEGER;
  new_achievements TEXT[];
BEGIN
  -- Update last activity
  UPDATE public.profiles 
  SET last_activity_at = now()
  WHERE user_id = NEW.user_id;
  
  -- Count total completed lessons for this user
  SELECT COUNT(*) INTO completed_lessons_count
  FROM public.lesson_progress 
  WHERE user_id = NEW.user_id;
  
  -- Update lessons completed count (assuming total lessons is 50 for now)
  UPDATE public.profiles 
  SET lessons_completed = completed_lessons_count,
      total_lessons = 50
  WHERE user_id = NEW.user_id;
  
  -- Check for new achievements
  -- First lesson achievement
  IF completed_lessons_count = 1 THEN
    INSERT INTO public.user_achievements (user_id, achievement_name, points_earned)
    VALUES (NEW.user_id, 'first_lesson', 10)
    ON CONFLICT (user_id, achievement_name) DO NOTHING;
  END IF;
  
  -- 10 lessons achievement
  IF completed_lessons_count = 10 THEN
    INSERT INTO public.user_achievements (user_id, achievement_name, points_earned)
    VALUES (NEW.user_id, 'lessons_10', 50)
    ON CONFLICT (user_id, achievement_name) DO NOTHING;
  END IF;
  
  -- All lessons completed achievement
  IF completed_lessons_count >= 50 THEN
    INSERT INTO public.user_achievements (user_id, achievement_name, points_earned)
    VALUES (NEW.user_id, 'elin_graduate', 200)
    ON CONFLICT (user_id, achievement_name) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for lesson completion
CREATE TRIGGER on_lesson_completed
  AFTER INSERT ON public.lesson_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_user_progress();