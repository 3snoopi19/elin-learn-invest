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
      <main className="mobile-container mobile-content py-4 md:py-8 max-w-4xl mx-auto pb-32 md:pb-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2">
            <SettingsIcon className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            Account Settings
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage your account preferences and learning settings
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto gap-1">
            <TabsTrigger value="account" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm py-2 md:py-3">
              <User className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Account</span>
              <span className="sm:hidden">Acct</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm py-2 md:py-3">
              <Bell className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Notifications</span>
              <span className="sm:hidden">Notif</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm py-2 md:py-3">
              <Shield className="h-3 w-3 md:h-4 md:w-4" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm py-2 md:py-3">
              <Download className="h-3 w-3 md:h-4 md:w-4" />
              Data
            </TabsTrigger>
          </TabsList>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-4 md:space-y-6">
            <Card className="mobile-card">
              <CardHeader className="pb-3 md:pb-4">
                <CardTitle className="text-base md:text-lg">Profile Information</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Your basic account information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="text-xs md:text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-foreground font-medium text-sm md:text-base break-all">{user?.email}</p>
                  </div>
                  <div>
                    <label className="text-xs md:text-sm font-medium text-muted-foreground">Member Since</label>
                    <p className="text-foreground font-medium text-sm md:text-base">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs md:text-sm font-medium text-muted-foreground">Name</label>
                    <p className="text-foreground font-medium text-sm md:text-base">
                      {user?.user_metadata?.first_name} {user?.user_metadata?.last_name}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs md:text-sm font-medium text-muted-foreground">Plan</label>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="text-xs">Free Trial</Badge>
                      <span className="text-xs md:text-sm text-muted-foreground">5 days remaining</span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <Button variant="outline" disabled className="mobile-button w-full sm:w-auto">
                    Edit Profile (Coming Soon)
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="mobile-card">
              <CardHeader className="pb-3 md:pb-4">
                <CardTitle className="text-base md:text-lg">Learning Preferences</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Customize your learning experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="text-xs md:text-sm font-medium text-muted-foreground">Difficulty Level</label>
                    <p className="text-foreground font-medium text-sm md:text-base">Beginner</p>
                  </div>
                  <div>
                    <label className="text-xs md:text-sm font-medium text-muted-foreground">Learning Goal</label>
                    <p className="text-foreground font-medium text-sm md:text-base">Build portfolio knowledge</p>
                  </div>
                  <div>
                    <label className="text-xs md:text-sm font-medium text-muted-foreground">Time Commitment</label>
                    <p className="text-foreground font-medium text-sm md:text-base">30 minutes/day</p>
                  </div>
                  <div>
                    <label className="text-xs md:text-sm font-medium text-muted-foreground">Preferred Topics</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <Badge variant="outline" className="text-xs">Stocks</Badge>
                      <Badge variant="outline" className="text-xs">ETFs</Badge>
                      <Badge variant="outline" className="text-xs">Risk</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={handleResetProgress}
                    className="gap-2 mobile-button w-full sm:w-auto"
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
          <TabsContent value="privacy" className="space-y-4 md:space-y-6">
            <Card className="mobile-card">
              <CardHeader className="pb-3 md:pb-4">
                <CardTitle className="text-base md:text-lg">Privacy Settings</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Control how your data is used and shared
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-6">
                <div className="space-y-3 md:space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 md:p-4 bg-muted/50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm md:text-base">Data Collection</h4>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        We collect minimal data to improve your learning experience
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs w-fit shrink-0">Essential Only</Badge>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 md:p-4 bg-muted/50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm md:text-base">Analytics</h4>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        Help us improve ELIN with anonymized usage data
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs w-fit shrink-0">Enabled</Badge>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 md:p-4 bg-muted/50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm md:text-base">Marketing Communications</h4>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        Receive updates about new features and courses
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs w-fit shrink-0">Disabled</Badge>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Read our <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a> and{" "}
                    <a href="/terms" className="text-primary hover:underline">Terms of Service</a> for more details.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data" className="space-y-4 md:space-y-6">
            <Card className="mobile-card">
              <CardHeader className="pb-3 md:pb-4">
                <CardTitle className="text-base md:text-lg">Data Management</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Export or delete your account data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-6">
                <div className="space-y-3 md:space-y-4">
                  <div className="p-3 md:p-4 bg-blue-50 dark:bg-blue/10 border border-blue-200 dark:border-blue/20 rounded-lg">
                    <h4 className="font-medium mb-2 text-sm md:text-base">Export Your Data</h4>
                    <p className="text-xs md:text-sm text-muted-foreground mb-3">
                      Download a copy of all your learning progress, preferences, and account data.
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={handleExportData}
                      className="gap-2 mobile-button w-full sm:w-auto"
                    >
                      <Download className="h-4 w-4" />
                      Request Data Export
                    </Button>
                  </div>
                  
                  <div className="p-3 md:p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <h4 className="font-medium mb-2 text-destructive text-sm md:text-base">Delete Account</h4>
                    <p className="text-xs md:text-sm text-muted-foreground mb-3">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <Button 
                      variant="destructive" 
                      onClick={handleDeleteAccount}
                      className="gap-2 mobile-button w-full sm:w-auto"
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