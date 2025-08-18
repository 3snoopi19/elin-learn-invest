import { useState, useEffect } from 'react';
import { ProgressData, PersonalizationSettings } from '@/types/chat';

const defaultProgress: ProgressData = {
  lessonsCompleted: 3,
  quizzesCompleted: 2,
  scenariosCompleted: 1,
  totalLearningTime: 45,
  level: 'beginner',
  badges: [],
  streak: 2
};

const defaultSettings: PersonalizationSettings = {
  level: 'beginner',
  explanationStyle: 'simple',
  preferredTopics: ['stocks', 'portfolio'],
  learningPace: 3,
  voiceEnabled: false
};

export const useLearningProgress = () => {
  const [progress, setProgress] = useState<ProgressData>(defaultProgress);
  const [settings, setSettings] = useState<PersonalizationSettings>(defaultSettings);

  // Load from localStorage on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem('elin-progress');
    const savedSettings = localStorage.getItem('elin-settings');
    
    if (savedProgress) {
      try {
        setProgress(JSON.parse(savedProgress));
      } catch (error) {
        console.error('Error loading progress:', error);
      }
    }
    
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem('elin-progress', JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    localStorage.setItem('elin-settings', JSON.stringify(settings));
  }, [settings]);

  const updateProgress = (updates: Partial<ProgressData>) => {
    setProgress(prev => ({ ...prev, ...updates }));
  };

  const updateSettings = (newSettings: PersonalizationSettings) => {
    setSettings(newSettings);
  };

  const incrementProgress = (type: 'lessons' | 'quizzes' | 'scenarios') => {
    setProgress(prev => ({
      ...prev,
      [`${type}Completed`]: prev[`${type}Completed` as keyof ProgressData] as number + 1,
      totalLearningTime: prev.totalLearningTime + 5
    }));
  };

  const updateStreak = () => {
    const lastActivity = localStorage.getItem('elin-last-activity');
    const today = new Date().toDateString();
    
    if (lastActivity !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastActivity === yesterday.toDateString()) {
        // Consecutive day - increment streak
        setProgress(prev => ({ ...prev, streak: prev.streak + 1 }));
      } else if (!lastActivity || lastActivity !== today) {
        // New streak or broken streak
        setProgress(prev => ({ ...prev, streak: 1 }));
      }
      
      localStorage.setItem('elin-last-activity', today);
    }
  };

  return {
    progress,
    settings,
    updateProgress,
    updateSettings,
    incrementProgress,
    updateStreak
  };
};