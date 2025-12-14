import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Lesson {
  id: string;
  title: string;
  content_markdown: string | null;
  content_type: string;
  duration_minutes: number;
  order_index: number;
  is_generated: boolean;
}

interface Module {
  id: string;
  title: string;
  description: string | null;
  order_index: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  description: string | null;
  topic: string;
  level: string;
  estimated_duration: string | null;
  is_published: boolean;
  modules: Module[];
}

interface UserProgress {
  lesson_id: string;
  course_id: string;
  completed_at: string | null;
  progress_percent: number;
}

export const useCourses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      
      // Fetch courses with modules and lessons
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select(`
          *,
          modules:modules(
            *,
            lessons:lessons(*)
          )
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (coursesError) {
        console.error('Error fetching courses:', coursesError);
        return;
      }

      // Sort modules and lessons by order_index
      const sortedCourses = (coursesData || []).map(course => ({
        ...course,
        modules: (course.modules || [])
          .sort((a: Module, b: Module) => a.order_index - b.order_index)
          .map((module: Module) => ({
            ...module,
            lessons: (module.lessons || []).sort((a: Lesson, b: Lesson) => a.order_index - b.order_index)
          }))
      }));

      setCourses(sortedCourses);

      // Fetch user progress if logged in
      if (user) {
        const { data: progressData, error: progressError } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id);

        if (!progressError && progressData) {
          setUserProgress(progressData);
        }
      }
    } catch (error) {
      console.error('Error in fetchCourses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateCourse = async (topic: string, level: string = 'beginner') => {
    if (!user) {
      toast.error('Please sign in to generate courses');
      return null;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-course', {
        body: { topic, level }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      toast.success(`Course "${data.title}" generated successfully!`);
      await fetchCourses(); // Refresh courses list
      return data.courseId;
    } catch (error) {
      console.error('Error generating course:', error);
      toast.error('Failed to generate course. Please try again.');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const getLessonContent = async (lessonId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('get-lesson-content', {
        body: { lessonId }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      return data.lesson;
    } catch (error) {
      console.error('Error fetching lesson content:', error);
      toast.error('Failed to load lesson content');
      return null;
    }
  };

  const markLessonComplete = async (lessonId: string, courseId: string) => {
    if (!user) {
      toast.error('Please sign in to track progress');
      return false;
    }

    try {
      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          course_id: courseId,
          completed_at: new Date().toISOString(),
          progress_percent: 100,
          last_accessed_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,lesson_id'
        });

      if (error) {
        throw error;
      }

      // Update local state
      setUserProgress(prev => {
        const existing = prev.find(p => p.lesson_id === lessonId);
        if (existing) {
          return prev.map(p => 
            p.lesson_id === lessonId 
              ? { ...p, completed_at: new Date().toISOString(), progress_percent: 100 }
              : p
          );
        }
        return [...prev, {
          lesson_id: lessonId,
          course_id: courseId,
          completed_at: new Date().toISOString(),
          progress_percent: 100
        }];
      });

      toast.success('Lesson marked as complete!');
      return true;
    } catch (error) {
      console.error('Error marking lesson complete:', error);
      toast.error('Failed to update progress');
      return false;
    }
  };

  const isLessonComplete = (lessonId: string): boolean => {
    return userProgress.some(p => p.lesson_id === lessonId && p.completed_at);
  };

  const getCourseProgress = (courseId: string): number => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return 0;

    const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
    if (totalLessons === 0) return 0;

    const completedLessons = course.modules.reduce((acc, m) => 
      acc + m.lessons.filter(l => isLessonComplete(l.id)).length, 0
    );

    return Math.round((completedLessons / totalLessons) * 100);
  };

  useEffect(() => {
    fetchCourses();
  }, [user]);

  return {
    courses,
    userProgress,
    isLoading,
    isGenerating,
    fetchCourses,
    generateCourse,
    getLessonContent,
    markLessonComplete,
    isLessonComplete,
    getCourseProgress
  };
};
