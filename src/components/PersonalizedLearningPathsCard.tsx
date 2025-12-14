import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Brain, Trophy, CheckCircle, Clock, Star, Target, TrendingUp, Play, Headphones, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useLearningProgress } from '@/hooks/useLearningProgress';
import { notebookLMService, NotebookLMContent } from '@/services/notebookLM';

interface LearningModule {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeEstimate: string;
  progress: number;
  isCompleted: boolean;
  isRecommended: boolean;
  skillsGained: string[];
  nextAction: string;
}

interface WeakArea {
  topic: string;
  score: number;
  recommendedModules: string[];
  priority: 'high' | 'medium' | 'low';
}

const PersonalizedLearningPathsCard = () => {
  const { progress, settings, incrementProgress } = useLearningProgress();
  const [activeTab, setActiveTab] = useState('recommended');
  const [notebookLMContent, setNotebookLMContent] = useState<NotebookLMContent[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  useEffect(() => {
    const generateNotebookLMContent = async () => {
      setIsGenerating(true);
      try {
        const content = await Promise.all([
          notebookLMService.generateLearningContent('Portfolio Management', progress.level),
          notebookLMService.generateLearningContent('Risk Analysis', progress.level),
          notebookLMService.generateLearningContent('Market Analysis', progress.level)
        ]);
        setNotebookLMContent(content);
      } catch (error) {
        console.error('Error generating NotebookLM content:', error);
      } finally {
        setIsGenerating(false);
      }
    };
    
    generateNotebookLMContent();
  }, [progress.level]);

  const [learningModules] = useState<LearningModule[]>([
    {
      id: 'portfolio-basics',
      title: 'Portfolio Diversification (NotebookLM)',
      description: 'AI-generated learning content from NotebookLM: Master portfolio fundamentals with personalized insights',
      difficulty: 'beginner',
      timeEstimate: '15 min',
      progress: 80,
      isCompleted: false,
      isRecommended: true,
      skillsGained: ['Risk Management', 'Asset Allocation'],
      nextAction: 'Complete Quiz'
    },
    {
      id: 'options-trading',
      title: 'Options Trading Strategies (NotebookLM)',
      description: 'AI-curated advanced strategies from NotebookLM: Options trading and risk hedging with personalized study guides',
      difficulty: 'advanced',
      timeEstimate: '45 min',
      progress: 0,
      isCompleted: false,
      isRecommended: true,
      skillsGained: ['Options', 'Hedging', 'Advanced Trading'],
      nextAction: 'Start Learning'
    },
    {
      id: 'etf-analysis',
      title: 'ETF Analysis & Selection (NotebookLM)',
      description: 'NotebookLM-powered analysis: Research and select the best ETFs with AI-generated insights and audio summaries',
      difficulty: 'intermediate',
      timeEstimate: '25 min',
      progress: 100,
      isCompleted: true,
      isRecommended: false,
      skillsGained: ['ETF Research', 'Fund Analysis'],
      nextAction: 'Review & Practice'
    },
    {
      id: 'risk-assessment',
      title: 'Personal Risk Assessment (NotebookLM)',
      description: 'AI-personalized content: Understanding your risk tolerance and investment psychology with NotebookLM insights',
      difficulty: 'beginner',
      timeEstimate: '20 min',
      progress: 60,
      isCompleted: false,
      isRecommended: true,
      skillsGained: ['Risk Psychology', 'Self Assessment'],
      nextAction: 'Continue Module'
    }
  ]);

  const [weakAreas] = useState<WeakArea[]>([
    {
      topic: 'Technical Analysis',
      score: 45,
      recommendedModules: ['chart-patterns', 'indicators'],
      priority: 'high'
    },
    {
      topic: 'Bond Investments',
      score: 62,
      recommendedModules: ['bond-basics', 'yield-analysis'],
      priority: 'medium'
    },
    {
      topic: 'Tax Strategies',
      score: 71,
      recommendedModules: ['tax-efficient-investing'],
      priority: 'low'
    }
  ]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-success';
      case 'intermediate': return 'text-warning';
      case 'advanced': return 'text-destructive';
      default: return 'text-text-muted';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const startModule = (moduleId: string) => {
    const module = learningModules.find(m => m.id === moduleId);
    if (module) {
      incrementProgress('lessons');
      toast.success(`Starting "${module.title}" module`);
    }
  };

  const completeModule = (moduleId: string) => {
    incrementProgress('lessons');
    toast.success('Module completed! Great job!');
  };

  const recommendedModules = learningModules.filter(m => m.isRecommended);
  const inProgressModules = learningModules.filter(m => m.progress > 0 && !m.isCompleted);
  const completedModules = learningModules.filter(m => m.isCompleted);

  return (
    <Card className="bg-card border-border h-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-text-heading flex items-center gap-2">
                Personalized Learning
                <Badge variant="outline" className="text-xs bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 border-purple-200">
                  <Sparkles className="w-3 h-3 mr-1" />
                  NotebookLM
                </Badge>
              </CardTitle>
              <p className="text-sm text-text-muted">AI-curated educational content powered by NotebookLM</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            <Trophy className="w-3 h-3 mr-1" />
            Level {progress.level === 'beginner' ? '1' : progress.level === 'intermediate' ? '2' : '3'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Learning Progress Overview */}
        <div className="bg-background-subtle rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-text-heading">Learning Progress</h4>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-warning" />
              <span className="text-sm font-medium text-text-heading">{progress.streak} day streak</span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-lg font-bold text-primary">{progress.lessonsCompleted}</div>
              <div className="text-xs text-text-muted">Lessons</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-secondary">{progress.quizzesCompleted}</div>
              <div className="text-xs text-text-muted">Quizzes</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-success">{progress.totalLearningTime}</div>
              <div className="text-xs text-text-muted">Minutes</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Overall Progress</span>
              <span className="font-medium text-text-heading">73%</span>
            </div>
            <Progress value={73} className="h-2" />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recommended">For You</TabsTrigger>
            <TabsTrigger value="progress">In Progress</TabsTrigger>
            <TabsTrigger value="weaknesses">Weak Areas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="recommended" className="space-y-3 mt-4">
            {isGenerating && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 dark:border-purple-400"></div>
                  <div>
                    <h5 className="font-medium text-purple-800 dark:text-purple-200">Generating Personalized Content</h5>
                    <p className="text-sm text-purple-600 dark:text-purple-400">NotebookLM is creating custom learning materials for you...</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* NotebookLM Generated Content Section */}
            {notebookLMContent.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <h4 className="font-medium text-text-heading">AI-Generated Study Materials</h4>
                </div>
                <div className="grid gap-3">
                  {notebookLMContent.map((content) => (
                    <div key={content.id} className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h5 className="font-medium text-purple-800 dark:text-purple-200 flex items-center gap-2">
                            {content.title}
                            <Badge variant="outline" className="text-xs bg-white dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 border-purple-300 dark:border-purple-700">
                              NotebookLM
                            </Badge>
                          </h5>
                          <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">{content.summary}</p>
                        </div>
                        <Badge variant="outline" className={`text-xs ${getDifficultyColor(content.difficulty)}`}>
                          {content.difficulty}
                        </Badge>
                      </div>
                      
                       <div className="flex items-center gap-4 mb-3">
                         <div className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400">
                           <Clock className="w-3 h-3" />
                           {content.estimatedReadTime}
                         </div>
                         <div className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400">
                           <Headphones className="w-3 h-3" />
                           Audio Summary
                         </div>
                         {content.videoExplainer && (
                           <div className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400">
                             <Play className="w-3 h-3" />
                             Video ({content.videoExplainer.duration})
                           </div>
                         )}
                         <div className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400">
                           <Target className="w-3 h-3" />
                           {content.keyInsights.length} insights
                         </div>
                       </div>

                       {content.videoExplainer && (
                         <div className="mb-3 p-3 bg-white/70 dark:bg-slate-800/70 rounded-lg border border-purple-200 dark:border-purple-800">
                           <div className="flex items-center justify-between mb-2">
                             <div className="flex items-center gap-2">
                               <Play className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                               <span className="font-medium text-purple-800 dark:text-purple-200">Video Chapters</span>
                             </div>
                             <span className="text-sm text-purple-600 dark:text-purple-400">{content.videoExplainer.duration}</span>
                           </div>
                           <div className="space-y-1">
                             {content.videoExplainer.chapters.slice(0, 3).map((chapter, idx) => (
                               <div key={idx} className="flex items-center gap-3 text-sm">
                                 <span className="text-purple-500 dark:text-purple-400 font-mono text-xs">{chapter.timestamp}</span>
                                 <span className="text-purple-700 dark:text-purple-300">{chapter.title}</span>
                               </div>
                             ))}
                           </div>
                         </div>
                       )}

                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {content.keyInsights.slice(0, 2).map((insight, index) => (
                            <Badge key={index} variant="secondary" className="text-xs bg-white dark:bg-purple-900/50 text-purple-600 dark:text-purple-300">
                              {insight.substring(0, 20)}...
                            </Badge>
                          ))}
                        </div>
                         <div className="flex gap-2">
                           <Button size="sm" variant="outline" className="text-purple-600 dark:text-purple-400 border-purple-300 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/30">
                             <Headphones className="w-3 h-3 mr-1" />
                             Audio
                           </Button>
                           {content.videoExplainer && (
                             <Button size="sm" variant="outline" className="text-purple-600 dark:text-purple-400 border-purple-300 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/30">
                               <Play className="w-3 h-3 mr-1" />
                               Video
                             </Button>
                           )}
                           <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                             <BookOpen className="w-3 h-3 mr-1" />
                             Start
                           </Button>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {recommendedModules.map((module) => (
              <div key={module.id} className="bg-background-subtle rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h5 className="font-medium text-text-heading flex items-center gap-2">
                      {module.title}
                      {module.title.includes('NotebookLM') && (
                        <Badge variant="outline" className="text-xs bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 border-purple-200">
                          <Sparkles className="w-3 h-3 mr-1" />
                          AI
                        </Badge>
                      )}
                    </h5>
                    <p className="text-sm text-text-secondary mt-1">{module.description}</p>
                  </div>
                  <Badge variant="outline" className={`text-xs ${getDifficultyColor(module.difficulty)}`}>
                    {module.difficulty}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-1 text-xs text-text-muted">
                    <Clock className="w-3 h-3" />
                    {module.timeEstimate}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-text-muted">
                    <Target className="w-3 h-3" />
                    {module.skillsGained.length} skills
                  </div>
                </div>

                {module.progress > 0 && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-text-secondary">Progress</span>
                      <span className="text-text-heading">{module.progress}%</span>
                    </div>
                    <Progress value={module.progress} className="h-1" />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {module.skillsGained.slice(0, 2).map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    {module.title.includes('NotebookLM') && (
                      <Button size="sm" variant="outline" className="text-purple-600 border-purple-300 hover:bg-purple-50">
                        <Headphones className="w-3 h-3 mr-1" />
                        Audio
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant={module.progress > 0 ? "default" : "outline"}
                      onClick={() => module.progress > 0 ? completeModule(module.id) : startModule(module.id)}
                    >
                      {module.progress > 0 ? (
                        <>
                          <Play className="w-3 h-3 mr-1" />
                          Continue
                        </>
                      ) : (
                        <>
                          <BookOpen className="w-3 h-3 mr-1" />
                          Start
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="progress" className="space-y-3 mt-4">
            {inProgressModules.length > 0 ? (
              inProgressModules.map((module) => (
                <div key={module.id} className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h5 className="font-medium text-text-heading">{module.title}</h5>
                      <p className="text-sm text-text-secondary mt-1">{module.nextAction}</p>
                    </div>
                    <Badge variant="default" className="text-xs">
                      {module.progress}%
                    </Badge>
                  </div>
                  
                  <Progress value={module.progress} className="mb-3 h-2" />
                  
                  <Button size="sm" onClick={() => completeModule(module.id)}>
                    <Play className="w-3 h-3 mr-1" />
                    Continue Learning
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 mx-auto text-text-muted mb-3" />
                <p className="text-text-secondary">No modules in progress</p>
                <p className="text-sm text-text-muted">Start a recommended module to begin learning</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="weaknesses" className="space-y-3 mt-4">
            <div className="mb-4">
              <h4 className="font-medium text-text-heading mb-2">Knowledge Assessment</h4>
              <p className="text-sm text-text-secondary">Based on your quiz results and interaction patterns</p>
            </div>
            
            {weakAreas.map((area, index) => (
              <div key={index} className="bg-background-subtle rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium text-text-heading">{area.topic}</h5>
                  <Badge variant={getPriorityColor(area.priority)} className="text-xs">
                    {area.priority} priority
                  </Badge>
                </div>
                
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-text-secondary">Knowledge Score</span>
                      <span className="text-text-heading">{area.score}%</span>
                    </div>
                    <Progress value={area.score} className="h-2" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">
                    {area.recommendedModules.length} recommended modules
                  </span>
                  <Button size="sm" variant="outline">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Improve
                  </Button>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PersonalizedLearningPathsCard;