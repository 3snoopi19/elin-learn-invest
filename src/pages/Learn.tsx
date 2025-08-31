import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, Clock, Trophy, TrendingUp, Shield, DollarSign, BarChart3, Target, Play, FileText, Download, CheckCircle, Video, PenTool, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { LessonContent } from "@/components/learn/LessonContent";
import { LearningPathsCard } from "@/components/LearningPathsCard";
import { EnhancedLearningPaths } from "@/components/EnhancedLearningPaths";
import { courseContent } from "@/data/courseContent";

const Learn = () => {
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [viewingLesson, setViewingLesson] = useState<any>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  
  const learningPaths = [
    {
      id: 1,
      title: "Investment Fundamentals",
      description: "Master the basics of investing, from stocks and bonds to portfolio theory",
      level: "Beginner",
      duration: "4 weeks",
      modules: 8,
      progress: 25,
      icon: BookOpen,
      topics: ["Stock Market Basics", "Bond Fundamentals", "Risk & Return", "Diversification"],
      totalLessons: 6,
      completedLessons: 2
    },
    {
      id: 2,
      title: "Financial Statement Analysis",
      description: "Learn to read and analyze company financial statements like a pro",
      level: "Intermediate",
      duration: "6 weeks",
      modules: 12,
      progress: 15,
      icon: BarChart3,
      topics: ["Income Statements", "Balance Sheets", "Cash Flow", "Ratio Analysis"],
      totalLessons: 8,
      completedLessons: 1
    },
    {
      id: 3,
      title: "Portfolio Management",
      description: "Build and manage diversified investment portfolios effectively",
      level: "Intermediate",
      duration: "5 weeks",
      modules: 10,
      progress: 60,
      icon: Target,
      topics: ["Asset Allocation", "Rebalancing", "Risk Management", "Performance Tracking"],
      totalLessons: 10,
      completedLessons: 6
    },
    {
      id: 4,
      title: "Advanced Trading Strategies",
      description: "Explore sophisticated trading techniques and market timing",
      level: "Advanced",
      duration: "8 weeks",
      modules: 16,
      progress: 10,
      icon: TrendingUp,
      topics: ["Technical Analysis", "Options Trading", "Market Psychology", "Advanced Strategies"],
      totalLessons: 16,
      completedLessons: 1
    },
    {
      id: 5,
      title: "Risk Management & Compliance",
      description: "Understand regulatory frameworks and risk mitigation strategies",
      level: "Intermediate",
      duration: "4 weeks",
      modules: 8,
      progress: 0,
      icon: Shield,
      topics: ["Regulatory Compliance", "Risk Assessment", "Legal Frameworks", "Ethics"],
      totalLessons: 8,
      completedLessons: 0
    },
    {
      id: 6,
      title: "Alternative Investments",
      description: "Explore REITs, commodities, crypto, and other alternative assets",
      level: "Advanced",
      duration: "6 weeks",
      modules: 12,
      progress: 0,
      icon: DollarSign,
      topics: ["REITs", "Commodities", "Cryptocurrency", "Private Equity"],
      totalLessons: 12,
      completedLessons: 0
    }
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner": return "bg-success/10 text-success border-success/20";
      case "Intermediate": return "bg-education/10 text-education border-education/20";
      case "Advanced": return "bg-warning/10 text-warning border-warning/20";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "video": return Video;
      case "article": return FileText;
      case "quiz": return PenTool;
      case "interactive": return Target;
      default: return BookOpen;
    }
  };

  const findFirstIncompleteLesson = (courseId: number) => {
    const course = courseContent[courseId as keyof typeof courseContent];
    if (!course) return null;
    
    for (let moduleIndex = 0; moduleIndex < course.modules.length; moduleIndex++) {
      const module = course.modules[moduleIndex];
      for (let lessonIndex = 0; lessonIndex < module.lessons.length; lessonIndex++) {
        const lesson = module.lessons[lessonIndex];
        if (!lesson.completed) {
          return { moduleIndex, lessonIndex };
        }
      }
    }
    return null;
  };

  const handleLessonClick = (courseId: number, moduleIndex: number, lessonIndex: number) => {
    const course = learningPaths.find(p => p.id === courseId);
    if (course && courseContent[courseId as keyof typeof courseContent]) {
      const moduleData = courseContent[courseId as keyof typeof courseContent].modules[moduleIndex];
      const lessonData = moduleData?.lessons[lessonIndex];
      if (lessonData) {
        setViewingLesson({
          ...lessonData,
          courseTitle: course.title,
          moduleTitle: moduleData.title
        });
      }
    }
  };

  const handleCompleteLesson = (lessonId: string) => {
    setCompletedLessons(prev => new Set([...prev, lessonId]));
  };

  const handleNextLesson = () => {
    // Logic to navigate to next lesson
    setViewingLesson(null);
  };

  // If viewing a lesson, show the lesson content
  if (viewingLesson) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => setViewingLesson(null)}
              className="mb-4 text-text-body hover:text-text-heading"
              aria-label={`Back to ${viewingLesson.courseTitle} course overview`}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to {viewingLesson.courseTitle}
            </Button>
            <div className="text-sm text-text-muted mb-2">
              {viewingLesson.courseTitle} • {viewingLesson.moduleTitle}
            </div>
          </div>
          <LessonContent 
            lesson={viewingLesson}
            onComplete={handleCompleteLesson}
            onNext={handleNextLesson}
          />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Learning Paths
          </h1>
          <p className="text-xl text-text-secondary mb-6 max-w-2xl mx-auto">
            Master investing with our comprehensive, structured learning paths designed for every skill level
          </p>
          <div className="flex justify-center gap-4 text-sm text-text-muted">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" />
              <span>Expert-curated content</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span>Self-paced learning</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <span>Interactive modules</span>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Course Overview</TabsTrigger>
            <TabsTrigger value="enhanced">Enhanced Paths</TabsTrigger>
            <TabsTrigger value="materials">Study Materials</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Learning Paths Grid - Mobile optimized */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {learningPaths.map((path) => {
                const IconComponent = path.icon;
                return (
                  <Card key={path.id} className="group hover:shadow-lg transition-all duration-300 bg-card border border-border hover:border-primary/20 mobile-card">
                    <CardHeader className="pb-4 mobile-padding">
                      <div className="flex items-start justify-between mb-2">
                        <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <IconComponent className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                        </div>
                        <Badge className={`${getLevelColor(path.level)} border text-xs`}>
                          {path.level}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg md:text-xl text-text-heading group-hover:text-primary transition-colors font-bold">
                        {path.title}
                      </CardTitle>
                      <CardDescription className="text-sm leading-relaxed text-text-secondary">
                        {path.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4 mobile-padding">
                      {/* Course Stats */}
                      <div className="flex justify-between text-sm text-text-muted">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {path.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          {path.modules} modules
                        </span>
                      </div>

                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-text-body">
                          <span>Progress</span>
                          <span className="text-primary font-medium">{path.progress}%</span>
                        </div>
                        <Progress value={path.progress} className="h-2" />
                      </div>

                      {/* Topics */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-text-body">Key Topics:</h4>
                        <div className="flex flex-wrap gap-1">
                          {path.topics.slice(0, 3).map((topic, index) => (
                            <Badge key={index} variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20 hover:bg-primary/10">
                              {topic}
                            </Badge>
                          ))}
                          {path.topics.length > 3 && (
                            <Badge variant="outline" className="text-xs bg-muted text-text-muted">
                              +{path.topics.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons - Mobile Stacked */}
                      <div className="space-y-2 pt-2">
                        <Button 
                          className="w-full bg-primary hover:bg-primary-hover text-primary-foreground font-medium mobile-button" 
                          onClick={() => {
                            if (path.progress > 0) {
                              // Find the first incomplete lesson for "Continue Learning"
                              const firstIncompleteLesson = findFirstIncompleteLesson(path.id);
                              if (firstIncompleteLesson) {
                                handleLessonClick(path.id, firstIncompleteLesson.moduleIndex, firstIncompleteLesson.lessonIndex);
                              }
                            } else {
                              // Start from the beginning
                              if (courseContent[path.id as keyof typeof courseContent]?.modules?.[0]?.lessons?.[0]) {
                                handleLessonClick(path.id, 0, 0);
                              }
                            }
                          }}
                          aria-label={`${path.progress > 0 ? 'Continue' : 'Start'} ${path.title} course`}
                        >
                          {path.progress > 0 ? `Continue Learning (${path.progress}%)` : "Start Course"}
                        </Button>
                        <div className="grid grid-cols-2 gap-2">
                          <Button 
                            className="border-primary text-primary hover:bg-primary/10 mobile-button" 
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedCourse(selectedCourse === path.id ? null : path.id)}
                            aria-label={`View all lessons for ${path.title}`}
                          >
                            <BookOpen className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">View All</span>
                            <span className="sm:hidden">Lessons</span>
                          </Button>
                          <Button 
                            className="border-primary text-primary hover:bg-primary/10 mobile-button" 
                            variant="outline"
                            size="sm"
                            aria-label={`Download syllabus for ${path.title}`}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Download</span>
                            <span className="sm:hidden">PDF</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="enhanced" className="space-y-6">
            <EnhancedLearningPaths />
          </TabsContent>

          <TabsContent value="materials" className="space-y-6">
            {/* Detailed Course Materials */}
            <div className="grid lg:grid-cols-2 gap-6">
              {learningPaths.map((path) => {
                const IconComponent = path.icon;
                return (
                  <Card key={`material-${path.id}`} className="border-2">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-text-heading">{path.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getLevelColor(path.level)}>
                              {path.level}
                            </Badge>
                            <span className="text-sm text-text-muted">{path.duration}</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <Accordion type="single" collapsible className="w-full">
                        {courseContent[path.id as keyof typeof courseContent]?.modules?.map((module, moduleIndex) => (
                          <AccordionItem key={moduleIndex} value={`module-${moduleIndex}`}>
                            <AccordionTrigger className="text-left">
                              <div className="flex items-center justify-between w-full pr-4">
                                <span className="font-medium text-text-heading">{module.title}</span>
                                <span className="text-sm text-text-muted">
                                  {module.lessons.length} lessons
                                </span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-3 pt-2">
                                {module.lessons.map((lesson, lessonIndex) => {
                                  const IconComponent = getContentTypeIcon(lesson.type);
                                  return (
                                    <div key={lessonIndex} className="flex items-center justify-between p-3 rounded-lg border bg-muted/50 hover:bg-muted/80 transition-colors">
                                      <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2">
                                          {lesson.completed ? (
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                          ) : (
                                            <IconComponent className="h-4 w-4 text-muted-foreground" />
                                          )}
                                        </div>
                                        <div>
                                          <p className="font-medium text-sm text-text-body">{lesson.title}</p>
                                          <div className="flex items-center gap-2 text-xs text-text-muted">
                                            <span className="capitalize">{lesson.type}</span>
                                            <span>•</span>
                                            <span>{lesson.duration}</span>
                                          </div>
                                        </div>
                                      </div>
                                       <Button 
                                         size="sm" 
                                         variant={lesson.completed ? "outline" : "default"}
                                         className={`text-xs ${lesson.completed ? 'border-primary text-primary hover:bg-primary/10' : 'bg-primary hover:bg-primary-hover'}`}
                                         onClick={() => handleLessonClick(path.id, moduleIndex, lessonIndex)}
                                       >
                                         {lesson.completed ? "Review" : "Start"}
                                       </Button>
                                    </div>
                                  );
                                })}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        )) || (
                          <div className="text-center py-8 text-muted-foreground">
                            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium mb-2">Course Content Coming Soon</p>
                            <p className="text-sm">
                              {path.totalLessons} lessons • {path.completedLessons}/{path.totalLessons} completed
                            </p>
                          </div>
                        )}
                      </Accordion>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to Begin Your Journey?</CardTitle>
              <CardDescription className="text-base">
                Start with our Investment Fundamentals course and build your knowledge step by step
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="lg" className="bg-primary hover:bg-primary-hover text-primary-foreground">
                Get Started Today
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Learn;