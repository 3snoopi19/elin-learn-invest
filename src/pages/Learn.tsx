import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  BookOpen, Clock, Trophy, Play, CheckCircle, Video, Headphones, 
  Loader2, Sparkles, Plus, Award, Brain, Mic, PenTool, ArrowLeft,
  Volume2, GraduationCap
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { PageLoadingState } from "@/components/ui/PageLoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { useCourses } from "@/hooks/useCourses";
import { CourseVideoHeader } from "@/components/learn/CourseVideoHeader";
import { DynamicLessonView } from "@/components/learn/DynamicLessonView";
import { toast } from "sonner";

const getDifficultyColor = (level: string) => {
  switch (level?.toLowerCase()) {
    case 'beginner': return 'bg-success/10 text-success border-success/20';
    case 'intermediate': return 'bg-primary/10 text-primary border-primary/20';
    case 'advanced': return 'bg-warning/10 text-warning border-warning/20';
    default: return 'bg-muted text-muted-foreground border-border';
  }
};

const Learn = () => {
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
      toast.success('Course generated with AI audio, video & quizzes!');
    }
  };

  const handleStartLesson = (lessonId: string, courseTitle: string, moduleTitle: string, courseId: string) => {
    setViewingLesson({ lessonId, courseTitle, moduleTitle, courseId });
  };

  const handleCompleteLesson = async (lessonId: string): Promise<boolean> => {
    if (!viewingLesson) return false;
    return await markLessonComplete(lessonId, viewingLesson.courseId);
  };

  // Calculate overall progress
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

  // If viewing a lesson, show the lesson view
  if (viewingLesson) {
    return (
      <div className="px-4 md:px-8 py-4 md:py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setViewingLesson(null)}
            className="mb-4 text-text-body hover:text-text-heading mobile-button"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Learning
          </Button>
          <div className="mobile-caption text-text-muted mb-2">
            {viewingLesson.courseTitle} • {viewingLesson.moduleTitle}
          </div>
        </div>
        <DynamicLessonView
          lessonId={viewingLesson.lessonId}
          courseTitle={viewingLesson.courseTitle}
          moduleTitle={viewingLesson.moduleTitle}
          onBack={() => setViewingLesson(null)}
          onComplete={handleCompleteLesson}
          getLessonContent={getLessonContent}
          isComplete={isLessonComplete(viewingLesson.lessonId)}
        />
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 py-4 md:py-8">
        {/* Hero Section */}
        <div className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20">
              <Brain className="w-8 h-8 text-violet-500" />
            </div>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent px-2">
            AI-Powered Learning
          </h1>
          <div className="flex items-center justify-center gap-2 mb-3">
            <Badge variant="outline" className="bg-gradient-to-r from-violet-50 to-purple-50 text-violet-700 border-violet-200 text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              ELIN Learning Engine
            </Badge>
          </div>
          <p className="text-sm md:text-lg text-text-secondary mb-6 max-w-2xl mx-auto px-4">
            Learn finance your way with AI-generated audio lessons, interactive videos, quizzes, and personalized education paths
          </p>
          
          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 px-2">
            <Badge className="bg-violet-500/10 text-violet-600 border-violet-500/30 py-1.5 px-3">
              <Volume2 className="w-3 h-3 mr-1.5" />
              AI Audio Lessons
            </Badge>
            <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/30 py-1.5 px-3">
              <Video className="w-3 h-3 mr-1.5" />
              Video Explainers
            </Badge>
            <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/30 py-1.5 px-3">
              <PenTool className="w-3 h-3 mr-1.5" />
              Interactive Quizzes
            </Badge>
            <Badge className="bg-green-500/10 text-green-600 border-green-500/30 py-1.5 px-3">
              <GraduationCap className="w-3 h-3 mr-1.5" />
              Personalized Path
            </Badge>
          </div>
        </div>

        {/* Generate New Course */}
        <Card className="mb-6 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-blue-500/10 border-violet-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-violet-500" />
              Generate Your Personal Course
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="What do you want to learn? (e.g., Options Trading, Bitcoin)"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && handleGenerateCourse()}
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
                className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Generate
                  </>
                )}
              </Button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              AI will create a complete course with audio narration, video slides, quizzes, and study materials
            </p>
          </CardContent>
        </Card>

        {/* Progress Overview */}
        {courses.length > 0 && (
          <Card className="mb-6 bg-gradient-to-r from-primary/5 to-success/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{overallProgress.totalCourses}</div>
                  <div className="text-xs text-muted-foreground">Courses</div>
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
                  <div className="text-2xl font-bold text-foreground">
                    {overallProgress.completedLessons}/{overallProgress.totalLessons}
                  </div>
                  <div className="text-xs text-muted-foreground">Lessons</div>
                </div>
              </div>
              
              {overallProgress.totalLessons > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-primary" />
                      Overall Progress
                    </span>
                    <span className="font-medium text-primary">
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
        )}

        {/* Loading State */}
        {isLoading && (
          <PageLoadingState message="Loading your courses…" />
        )}

        {/* Empty State */}
        {!isLoading && courses.length === 0 && (
          <Card className="border-dashed border-2">
            <CardContent className="py-0">
              <EmptyState
                icon={BookOpen}
                title="No courses yet"
                description="Generate your first AI-powered course above. ELIN will create personalized content with audio, video, and quizzes."
              />
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
                <Card className="overflow-hidden border-2 hover:border-violet-500/30 transition-all">
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
                          <Badge variant="outline" className="text-xs bg-violet-500/10 text-violet-600">
                            <Sparkles className="w-3 h-3 mr-1" />
                            AI Generated
                          </Badge>
                        </div>
                        <CardTitle className="text-xl mb-2">{course.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{course.description}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedCourse(expandedCourse === course.id ? null : course.id)}
                        className="shrink-0"
                      >
                        <Video className={cn(
                          "w-5 h-5 transition-colors",
                          expandedCourse === course.id ? "text-violet-500" : "text-muted-foreground"
                        )} />
                      </Button>
                    </div>

                    {/* Course Features */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge variant="secondary" className="text-xs">
                        <Headphones className="w-3 h-3 mr-1" />
                        Audio
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        <Video className="w-3 h-3 mr-1" />
                        Video
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        <PenTool className="w-3 h-3 mr-1" />
                        Quiz
                      </Badge>
                    </div>

                    {/* Progress */}
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>{completedLessons}/{totalLessons} lessons completed</span>
                        <span className="font-medium text-violet-500">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {/* Modules Accordion */}
                    <Accordion type="single" collapsible className="w-full">
                      {course.modules.map((module) => (
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
                                        <Play className="w-5 h-5 text-violet-500" />
                                      )}
                                      <div>
                                        <div className="font-medium text-sm">{lesson.title}</div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                          <Clock className="w-3 h-3" />
                                          {lesson.duration_minutes} min
                                          <span className="flex items-center gap-1">
                                            <Headphones className="w-3 h-3" />
                                            <Video className="w-3 h-3" />
                                            <PenTool className="w-3 h-3" />
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <Button 
                                      size="sm" 
                                      variant={complete ? "outline" : "default"}
                                      className={!complete ? "bg-violet-500 hover:bg-violet-600" : ""}
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

        {/* Bottom CTA */}
        {courses.length > 0 && (
          <Card className="mt-8 bg-gradient-to-r from-violet-500/10 to-purple-500/10 border-violet-500/20">
            <CardContent className="py-6 text-center">
              <Award className="w-8 h-8 text-violet-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Keep Learning!</h3>
              <p className="text-sm text-muted-foreground">
                Generate more courses to expand your financial knowledge
              </p>
            </CardContent>
          </Card>
        )}
      </div>
  );
};

export default Learn;
