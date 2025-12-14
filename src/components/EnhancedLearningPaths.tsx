import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Bookmark, BookmarkCheck, Play, CheckCircle, Clock, Target, Star, Award, TrendingUp, BookOpen, Users, DollarSign, Plus, Video, Headphones, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useCourses } from "@/hooks/useCourses";
import { CourseVideoHeader } from "./learn/CourseVideoHeader";
import { DynamicLessonView } from "./learn/DynamicLessonView";
import { toast } from "sonner";

const getDifficultyColor = (level: string) => {
  switch (level?.toLowerCase()) {
    case 'beginner': return 'bg-success/10 text-success border-success/20';
    case 'intermediate': return 'bg-primary/10 text-primary border-primary/20';
    case 'advanced': return 'bg-warning/10 text-warning border-warning/20';
    default: return 'bg-muted text-muted-foreground border-border';
  }
};

export const EnhancedLearningPaths = () => {
  const { 
    courses, 
    isLoading, 
    isGenerating, 
    generateCourse, 
    getLessonContent,
    markLessonComplete,
    isLessonComplete,
    getCourseProgress 
  } = useCourses();

  const [newTopic, setNewTopic] = useState('');
  const [newLevel, setNewLevel] = useState('beginner');
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [viewingLesson, setViewingLesson] = useState<{
    lessonId: string;
    courseTitle: string;
    moduleTitle: string;
    courseId: string;
  } | null>(null);

  const handleGenerateCourse = async () => {
    if (!newTopic.trim()) {
      toast.error('Please enter a topic');
      return;
    }
    
    const courseId = await generateCourse(newTopic, newLevel);
    if (courseId) {
      setNewTopic('');
      toast.success('Course generated! Media assets are being created...');
    }
  };

  const handleStartLesson = (lessonId: string, courseTitle: string, moduleTitle: string, courseId: string) => {
    setViewingLesson({ lessonId, courseTitle, moduleTitle, courseId });
  };

  const handleCompleteLesson = async (lessonId: string): Promise<boolean> => {
    if (!viewingLesson) return false;
    return await markLessonComplete(lessonId, viewingLesson.courseId);
  };

  // If viewing a lesson, show the lesson view
  if (viewingLesson) {
    return (
      <DynamicLessonView
        lessonId={viewingLesson.lessonId}
        courseTitle={viewingLesson.courseTitle}
        moduleTitle={viewingLesson.moduleTitle}
        onBack={() => setViewingLesson(null)}
        onComplete={handleCompleteLesson}
        getLessonContent={getLessonContent}
        isComplete={isLessonComplete(viewingLesson.lessonId)}
      />
    );
  }

  const overallProgress = {
    totalCourses: courses.length,
    inProgress: courses.filter(c => getCourseProgress(c.id) > 0 && getCourseProgress(c.id) < 100).length,
    completed: courses.filter(c => getCourseProgress(c.id) === 100).length,
    totalLessons: courses.reduce((sum, c) => sum + c.modules.reduce((ms, m) => ms + m.lessons.length, 0), 0),
    completedLessons: courses.reduce((sum, c) => 
      sum + c.modules.reduce((ms, m) => 
        ms + m.lessons.filter(l => isLessonComplete(l.id)).length, 0
      ), 0
    )
  };

  return (
    <div className="space-y-6">
      {/* Generate New Course */}
      <Card className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 border-violet-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-500" />
            Generate AI-Powered Course
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Enter a topic (e.g., Stock Market Basics, Options Trading)"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              className="flex-1"
            />
            <Select value={newLevel} onValueChange={setNewLevel}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={handleGenerateCourse}
              disabled={isGenerating || !newTopic.trim()}
              className="bg-violet-500 hover:bg-violet-600"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Generate Course
                </>
              )}
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs bg-violet-500/10 text-violet-500 border-violet-500/30">
              <Video className="w-3 h-3 mr-1" />
              HeyGen Avatar Video
            </Badge>
            <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-500 border-purple-500/30">
              <Headphones className="w-3 h-3 mr-1" />
              ElevenLabs Audio
            </Badge>
            <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-500 border-blue-500/30">
              <BookOpen className="w-3 h-3 mr-1" />
              DeepSeek AI Content
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Progress Overview */}
      <Card className="bg-gradient-to-r from-primary/10 to-success/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Your Learning Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{overallProgress.totalCourses}</div>
              <div className="text-xs text-muted-foreground">Total Courses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">{overallProgress.inProgress}</div>
              <div className="text-xs text-muted-foreground">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{overallProgress.completed}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{overallProgress.completedLessons}/{overallProgress.totalLessons}</div>
              <div className="text-xs text-muted-foreground">Lessons Done</div>
            </div>
          </div>
          
          {overallProgress.totalLessons > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round((overallProgress.completedLessons / overallProgress.totalLessons) * 100)}%
                </span>
              </div>
              <Progress 
                value={(overallProgress.completedLessons / overallProgress.totalLessons) * 100} 
                className="h-2"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading courses...</span>
        </div>
      )}

      {/* Courses List */}
      {!isLoading && courses.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No courses yet</h3>
            <p className="text-muted-foreground mb-4">
              Generate your first AI-powered course above to get started!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Course Cards */}
      <div className="space-y-6">
        {courses.map((course, index) => {
          const progress = getCourseProgress(course.id);
          const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
          const completedLessons = course.modules.reduce((acc, m) => 
            acc + m.lessons.filter(l => isLessonComplete(l.id)).length, 0
          );

          return (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden border-2 hover:border-primary/30 transition-all">
                {/* Video Header */}
                {expandedCourse === course.id && (
                  <CourseVideoHeader
                    courseTitle={course.title}
                    courseDescription={course.description || ''}
                  />
                )}

                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getDifficultyColor(course.level)} variant="outline">
                          {course.level}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {course.topic}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl mb-2">{course.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{course.description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedCourse(expandedCourse === course.id ? null : course.id)}
                    >
                      <Video className={cn(
                        "w-5 h-5 transition-colors",
                        expandedCourse === course.id ? "text-violet-500" : "text-muted-foreground"
                      )} />
                    </Button>
                  </div>

                  {/* Progress */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>{completedLessons}/{totalLessons} lessons completed</span>
                      <span className="font-medium text-primary">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {/* Modules Accordion */}
                  <Accordion type="single" collapsible className="w-full">
                    {course.modules.map((module, moduleIndex) => (
                      <AccordionItem key={module.id} value={module.id}>
                        <AccordionTrigger className="text-left hover:no-underline">
                          <div className="flex items-center justify-between w-full pr-4">
                            <span className="font-medium">{module.title}</span>
                            <Badge variant="secondary" className="text-xs">
                              {module.lessons.filter(l => isLessonComplete(l.id)).length}/{module.lessons.length}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 pl-2">
                            {module.lessons.map((lesson) => {
                              const complete = isLessonComplete(lesson.id);
                              return (
                                <div
                                  key={lesson.id}
                                  className={cn(
                                    "flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer",
                                    complete 
                                      ? "bg-success/5 border-success/20" 
                                      : "hover:bg-muted/50 border-border"
                                  )}
                                  onClick={() => handleStartLesson(lesson.id, course.title, module.title, course.id)}
                                >
                                  <div className="flex items-center gap-3">
                                    {complete ? (
                                      <CheckCircle className="w-5 h-5 text-success" />
                                    ) : (
                                      <Play className="w-5 h-5 text-primary" />
                                    )}
                                    <div>
                                      <div className="font-medium text-sm">{lesson.title}</div>
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Clock className="w-3 h-3" />
                                        {lesson.duration_minutes} min
                                        <Badge variant="outline" className="text-xs">
                                          <Headphones className="w-3 h-3 mr-1" />
                                          Audio
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                  <Button 
                                    size="sm" 
                                    variant={complete ? "outline" : "default"}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStartLesson(lesson.id, course.title, module.title, course.id);
                                    }}
                                  >
                                    {complete ? 'Review' : 'Start'}
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
