import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Settings as SettingsIcon, User, Bell, Shield, Trash2, Download, RefreshCw } from "lucide-react";
import { NotificationSettings } from "@/components/notifications/NotificationSettings";
import { toast } from "sonner";

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("account");

  const handleExportData = () => {
    toast.success("Data export initiated. You'll receive an email when ready.");
  };

  const handleDeleteAccount = () => {
    toast.error("Account deletion requires contacting support for security.");
  };

  const handleResetProgress = () => {
    toast.success("Learning progress has been reset.");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <SettingsIcon className="h-8 w-8 text-primary" />
            Account Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your account preferences and learning settings
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Account
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Data
            </TabsTrigger>
          </TabsList>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Your basic account information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-foreground font-medium">{user?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                    <p className="text-foreground font-medium">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p className="text-foreground font-medium">
                      {user?.user_metadata?.first_name} {user?.user_metadata?.last_name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Plan</label>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Free Trial</Badge>
                      <span className="text-sm text-muted-foreground">5 days remaining</span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <Button variant="outline" disabled>
                    Edit Profile (Coming Soon)
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Learning Preferences</CardTitle>
                <CardDescription>
                  Customize your learning experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Difficulty Level</label>
                    <p className="text-foreground font-medium">Beginner</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Learning Goal</label>
                    <p className="text-foreground font-medium">Build portfolio knowledge</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Time Commitment</label>
                    <p className="text-foreground font-medium">30 minutes/day</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Preferred Topics</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <Badge variant="outline">Stocks</Badge>
                      <Badge variant="outline">ETFs</Badge>
                      <Badge variant="outline">Risk Management</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={handleResetProgress}
                    className="gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reset Learning Progress
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <NotificationSettings />
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>
                  Control how your data is used and shared
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <h4 className="font-medium">Data Collection</h4>
                      <p className="text-sm text-muted-foreground">
                        We collect minimal data to improve your learning experience
                      </p>
                    </div>
                    <Badge variant="secondary">Essential Only</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <h4 className="font-medium">Analytics</h4>
                      <p className="text-sm text-muted-foreground">
                        Help us improve ELIN with anonymized usage data
                      </p>
                    </div>
                    <Badge variant="secondary">Enabled</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <h4 className="font-medium">Marketing Communications</h4>
                      <p className="text-sm text-muted-foreground">
                        Receive updates about new features and courses
                      </p>
                    </div>
                    <Badge variant="outline">Disabled</Badge>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-4">
                    Read our <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a> and{" "}
                    <a href="/terms" className="text-primary hover:underline">Terms of Service</a> for more details.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>
                  Export or delete your account data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue/10 border border-blue-200 dark:border-blue/20 rounded-lg">
                    <h4 className="font-medium mb-2">Export Your Data</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Download a copy of all your learning progress, preferences, and account data.
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={handleExportData}
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Request Data Export
                    </Button>
                  </div>
                  
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <h4 className="font-medium mb-2 text-destructive">Delete Account</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <Button 
                      variant="destructive" 
                      onClick={handleDeleteAccount}
                      className="gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Settings;