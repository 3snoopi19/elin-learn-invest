import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { 
  Settings, 
  User, 
  GraduationCap, 
  Brain, 
  Volume2,
  Lightbulb,
  BookOpen,
  TrendingUp
} from "lucide-react";

interface PersonalizationSettings {
  level: 'beginner' | 'intermediate' | 'advanced';
  explanationStyle: 'simple' | 'detailed' | 'technical';
  preferredTopics: string[];
  learningPace: number; // 1-5 scale
  voiceEnabled: boolean;
}

interface PersonalizationPanelProps {
  settings: PersonalizationSettings;
  onSettingsUpdate: (settings: PersonalizationSettings) => void;
  isVisible: boolean;
  onToggle: () => void;
}

const topics = [
  { id: 'stocks', label: 'Stocks', icon: TrendingUp },
  { id: 'bonds', label: 'Bonds', icon: BookOpen },
  { id: 'etfs', label: 'ETFs', icon: Lightbulb },
  { id: 'options', label: 'Options', icon: Brain },
  { id: 'portfolio', label: 'Portfolio Management', icon: User },
  { id: 'analysis', label: 'Financial Analysis', icon: GraduationCap }
];

export const PersonalizationPanel = ({ 
  settings, 
  onSettingsUpdate, 
  isVisible, 
  onToggle 
}: PersonalizationPanelProps) => {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSettingChange = (key: keyof PersonalizationSettings, value: any) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onSettingsUpdate(newSettings);
  };

  const toggleTopic = (topicId: string) => {
    const currentTopics = localSettings.preferredTopics;
    const newTopics = currentTopics.includes(topicId)
      ? currentTopics.filter(t => t !== topicId)
      : [...currentTopics, topicId];
    
    handleSettingChange('preferredTopics', newTopics);
  };

  if (!isVisible) {
    return (
      <Card className="mb-4 cursor-pointer hover:bg-accent/50 transition-colors" onClick={onToggle}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              <span className="font-medium text-sm">Personalize Learning</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {localSettings.level}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Learning Preferences
          </CardTitle>
          <button 
            onClick={onToggle}
            className="text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            Hide
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Experience Level */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            Experience Level
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
              <Button
                key={level}
                variant={localSettings.level === level ? "default" : "outline"}
                size="sm"
                onClick={() => handleSettingChange('level', level)}
                className="capitalize"
              >
                {level}
              </Button>
            ))}
          </div>
        </div>

        {/* Explanation Style */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Explanation Style
          </h4>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={localSettings.explanationStyle === 'simple' ? "default" : "outline"}
              size="sm"
              onClick={() => handleSettingChange('explanationStyle', 'simple')}
            >
              Simple
            </Button>
            <Button
              variant={localSettings.explanationStyle === 'detailed' ? "default" : "outline"}
              size="sm"
              onClick={() => handleSettingChange('explanationStyle', 'detailed')}
            >
              Detailed
            </Button>
            <Button
              variant={localSettings.explanationStyle === 'technical' ? "default" : "outline"}
              size="sm"
              onClick={() => handleSettingChange('explanationStyle', 'technical')}
            >
              Technical
            </Button>
          </div>
        </div>

        {/* Learning Pace */}
        <div>
          <h4 className="text-sm font-medium mb-3">Learning Pace</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Slow & Thorough</span>
              <span>Fast & Efficient</span>
            </div>
            <Slider
              value={[localSettings.learningPace]}
              onValueChange={(value) => handleSettingChange('learningPace', value[0])}
              max={5}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="text-center">
              <Badge variant="secondary" className="text-xs">
                Pace: {localSettings.learningPace}/5
              </Badge>
            </div>
          </div>
        </div>

        {/* Preferred Topics */}
        <div>
          <h4 className="text-sm font-medium mb-3">Preferred Topics</h4>
          <div className="grid grid-cols-2 gap-2">
            {topics.map((topic) => {
              const Icon = topic.icon;
              const isSelected = localSettings.preferredTopics.includes(topic.id);
              
              return (
                <Button
                  key={topic.id}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleTopic(topic.id)}
                  className="justify-start text-xs"
                >
                  <Icon className="w-3 h-3 mr-2" />
                  {topic.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Voice Settings */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Volume2 className="w-4 h-4" />
            Voice Features
          </h4>
          <Button
            variant={localSettings.voiceEnabled ? "default" : "outline"}
            size="sm"
            onClick={() => handleSettingChange('voiceEnabled', !localSettings.voiceEnabled)}
            className="w-full"
          >
            {localSettings.voiceEnabled ? 'Voice Enabled' : 'Voice Disabled'}
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Enable voice responses for a more interactive experience
          </p>
        </div>
      </CardContent>
    </Card>
  );
};