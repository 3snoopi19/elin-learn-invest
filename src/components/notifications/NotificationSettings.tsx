import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Mail, Smartphone, Calendar, TrendingUp, BookOpen } from "lucide-react";
import { toast } from "sonner";

interface NotificationPreferences {
  email: {
    weeklyPortfolioReview: boolean;
    monthlyLearningProgress: boolean;
    marketUpdates: boolean;
    newLessons: boolean;
    reminders: boolean;
  };
  frequency: {
    portfolioReview: 'weekly' | 'biweekly' | 'monthly';
    learningReminder: 'daily' | 'weekly' | 'never';
  };
  enabled: boolean;
}

export const NotificationSettings = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: {
      weeklyPortfolioReview: true,
      monthlyLearningProgress: true,
      marketUpdates: false,
      newLessons: true,
      reminders: true,
    },
    frequency: {
      portfolioReview: 'weekly',
      learningReminder: 'weekly',
    },
    enabled: true,
  });

  const updatePreference = (category: keyof NotificationPreferences['email'], value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      email: {
        ...prev.email,
        [category]: value
      }
    }));
  };

  const updateFrequency = (type: keyof NotificationPreferences['frequency'], value: string) => {
    setPreferences(prev => ({
      ...prev,
      frequency: {
        ...prev.frequency,
        [type]: value
      }
    }));
  };

  const handleSave = () => {
    // In a real app, this would save to the backend
    toast.success("Notification preferences saved!");
  };

  const scheduleReminder = () => {
    toast.success("Portfolio review reminder scheduled!");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Manage how and when you receive updates from ELIN
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Master toggle */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-primary" />
              <div>
                <Label htmlFor="notifications-enabled" className="text-base font-medium">
                  Enable Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive all notifications and reminders
                </p>
              </div>
            </div>
            <Switch
              id="notifications-enabled"
              checked={preferences.enabled}
              onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, enabled: checked }))}
            />
          </div>

          {preferences.enabled && (
            <>
              {/* Email notifications */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-medium">
                  <Mail className="h-5 w-5 text-primary" />
                  Email Notifications
                </div>
                
                <div className="space-y-4 pl-7">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="portfolio-review">Portfolio Review Summary</Label>
                      <p className="text-sm text-muted-foreground">
                        Get a summary of your portfolio performance and educational insights
                      </p>
                    </div>
                    <Switch
                      id="portfolio-review"
                      checked={preferences.email.weeklyPortfolioReview}
                      onCheckedChange={(checked) => updatePreference('weeklyPortfolioReview', checked)}
                    />
                  </div>

                  {preferences.email.weeklyPortfolioReview && (
                    <div className="flex items-center gap-4 pl-4">
                      <Label className="text-sm">Frequency:</Label>
                      <Select
                        value={preferences.frequency.portfolioReview}
                        onValueChange={(value: any) => updateFrequency('portfolioReview', value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="biweekly">Bi-weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="learning-progress">Learning Progress Report</Label>
                      <p className="text-sm text-muted-foreground">
                        Monthly summary of lessons completed and achievements earned
                      </p>
                    </div>
                    <Switch
                      id="learning-progress"
                      checked={preferences.email.monthlyLearningProgress}
                      onCheckedChange={(checked) => updatePreference('monthlyLearningProgress', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="market-updates">Market Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Educational market insights and analysis
                      </p>
                    </div>
                    <Switch
                      id="market-updates"
                      checked={preferences.email.marketUpdates}
                      onCheckedChange={(checked) => updatePreference('marketUpdates', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="new-lessons">New Lessons Available</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when new course content is published
                      </p>
                    </div>
                    <Switch
                      id="new-lessons"
                      checked={preferences.email.newLessons}
                      onCheckedChange={(checked) => updatePreference('newLessons', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="reminders">Learning Reminders</Label>
                      <p className="text-sm text-muted-foreground">
                        Gentle reminders to continue your learning journey
                      </p>
                    </div>
                    <Switch
                      id="reminders"
                      checked={preferences.email.reminders}
                      onCheckedChange={(checked) => updatePreference('reminders', checked)}
                    />
                  </div>

                  {preferences.email.reminders && (
                    <div className="flex items-center gap-4 pl-4">
                      <Label className="text-sm">Frequency:</Label>
                      <Select
                        value={preferences.frequency.learningReminder}
                        onValueChange={(value: any) => updateFrequency('learningReminder', value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="never">Never</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick actions */}
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-lg font-medium">
                  <Calendar className="h-5 w-5 text-primary" />
                  Quick Actions
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    onClick={scheduleReminder}
                    className="flex items-center gap-2 justify-center"
                  >
                    <TrendingUp className="h-4 w-4" />
                    Schedule Portfolio Review
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => toast.success("Learning reminder set for tomorrow!")}
                    className="flex items-center gap-2 justify-center"
                  >
                    <BookOpen className="h-4 w-4" />
                    Set Learning Reminder
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Save button */}
          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} className="bg-primary hover:bg-primary-hover">
              Save Preferences
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};