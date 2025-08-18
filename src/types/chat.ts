export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'elin';
  timestamp: Date;
  hasDisclaimer?: boolean;
  type?: 'message' | 'lesson' | 'quiz' | 'achievement' | 'scenario';
  chartData?: ChartData;
  chartTitle?: string;
  quiz?: QuizQuestion;
}

export interface ChartData {
  type: 'line' | 'bar' | 'pie';
  data: Array<Record<string, any>>;
  xKey?: string;
  yKey?: string;
  nameKey?: string;
  valueKey?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface PersonalizationSettings {
  level: 'beginner' | 'intermediate' | 'advanced';
  explanationStyle: 'simple' | 'detailed' | 'technical';
  preferredTopics: string[];
  learningPace: number; // 1-5 scale
  voiceEnabled: boolean;
}

export interface ProgressData {
  lessonsCompleted: number;
  quizzesCompleted: number;
  scenariosCompleted: number;
  totalLearningTime: number; // in minutes
  level: 'beginner' | 'intermediate' | 'advanced';
  badges: Array<{
    id: string;
    name: string;
    description: string;
    earned: boolean;
    icon: any;
  }>;
  streak: number; // days
}