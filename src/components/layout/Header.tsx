import { Button } from "@/components/ui/button";
import { ElinLogo } from "@/components/ui/ElinLogo";
import { MarketTicker } from "@/components/MarketTicker";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut, User, Menu, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

export const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const NavigationLinks = () => (
    <>
      <Button 
        variant="ghost" 
        onClick={() => navigate('/dashboard')}
        className="text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors"
        aria-label="Go to Dashboard"
      >
        Dashboard
      </Button>
      <Button 
        variant="ghost" 
        onClick={() => navigate('/chat')}
        className="text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors"
        aria-label="Chat with ELIN AI Mentor"
      >
        ELIN Mentor
      </Button>
      <Button 
        variant="ghost" 
        onClick={() => navigate('/filings')}
        className="text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors"
        aria-label="Browse SEC Filings"
      >
        Filings
      </Button>
      <Button 
        variant="ghost" 
        onClick={() => navigate('/portfolio')}
        className="text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors"
        aria-label="Portfolio Tracker"
      >
        Portfolio
      </Button>
      <Button 
        variant="ghost" 
        onClick={() => navigate('/router')}
        className="text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors"
        aria-label="Money Flow Router"
      >
        Router
      </Button>
      <Button 
        variant="ghost" 
        onClick={() => navigate('/resources')}
        className="text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors"
        aria-label="Financial Resources"
      >
        Resources
      </Button>
    </>
  );

  return (
    <>
      {/* Market Ticker - Hidden on mobile for better UX */}
      <div className="hidden md:block">
        <MarketTicker />
      </div>
      
      {/* Header - Hidden on mobile to maximize content space */}
      <header className="hidden md:block sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80">
      
        <div className="container mx-auto px-4 h-14 md:h-16 flex items-center justify-between max-w-7xl">
          {/* Logo - Responsive sizing */}
          <div 
            className="flex items-center cursor-pointer flex-shrink-0" 
            onClick={() => navigate('/')}
            role="button"
            aria-label="Go to Home"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                navigate('/');
              }
            }}
          >
            <ElinLogo 
              size="sm" 
              showSubtitle={false}
              glowIntensity="subtle"
              className="transition-all duration-300 hover:scale-105"
            />
          </div>

          {/* Desktop Navigation - Only show on large screens */}
          {user && (
            <nav className="hidden xl:flex items-center space-x-1 flex-1 justify-center" role="navigation" aria-label="Main navigation">
              <NavigationLinks />
            </nav>
          )}

          {/* User Menu / Auth - Responsive */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Theme Toggle with Animation */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="min-h-[44px] min-w-[44px] relative overflow-hidden group"
              aria-label="Toggle theme"
            >
              <div className="relative w-5 h-5">
                <Sun className={`h-5 w-5 absolute inset-0 transition-all duration-500 ease-out ${
                  theme === "dark" 
                    ? "rotate-0 scale-100 opacity-100" 
                    : "rotate-90 scale-0 opacity-0"
                }`} />
                <Moon className={`h-5 w-5 absolute inset-0 transition-all duration-500 ease-out ${
                  theme === "dark" 
                    ? "-rotate-90 scale-0 opacity-0" 
                    : "rotate-0 scale-100 opacity-100"
                }`} />
              </div>
              <span className="absolute inset-0 rounded-md bg-primary/10 scale-0 group-hover:scale-100 transition-transform duration-300" />
            </Button>
            
            {user ? (
              <>
                {/* Mobile Menu - Tablet/Medium screens */}
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="xl:hidden min-h-[44px] min-w-[44px]" aria-label="Open menu">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                    <SheetContent side="right" className="w-72 bg-background border-border">
                       <div className="flex flex-col space-y-4 mt-8">
                         <div className="px-4 py-3 border-b border-border">
                           <p className="text-sm font-medium text-text-heading">
                             {user.user_metadata?.first_name || 'User'}
                           </p>
                           <p className="text-xs text-text-secondary">
                             {user.email}
                           </p>
                         </div>
                       
                       {/* Show navigation links on tablet/small desktop */}
                       <div className="xl:hidden space-y-2 px-2">
                         <NavigationLinks />
                       </div>
                       
                       <div className="border-t border-border pt-4 px-2">
                         <Button variant="ghost" onClick={() => {
                           navigate('/settings');
                           setMobileMenuOpen(false);
                         }} className="w-full justify-start min-h-[44px]" aria-label="Settings">
                           <User className="h-4 w-4 mr-2" />
                           Settings
                         </Button>
                         <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 min-h-[44px]" aria-label="Sign out">
                           <LogOut className="h-4 w-4 mr-2" />
                           Sign Out
                         </Button>
                       </div>
                     </div>
                   </SheetContent>
                </Sheet>

                {/* Desktop User Menu - Only on extra large screens */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="hidden xl:flex min-h-[44px] min-w-[44px]" aria-label="User menu">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-popover border border-border shadow-lg backdrop-blur-sm">
                    <DropdownMenuItem onClick={() => navigate('/settings')} className="hover:bg-muted/80 focus:bg-muted/80 min-h-[44px]">
                      <User className="h-4 w-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="hover:bg-destructive/10 focus:bg-destructive/10 text-destructive min-h-[44px]">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" onClick={() => navigate('/auth')} className="text-text-body hover:text-text-heading text-sm px-3 min-h-[44px]">
                  Sign In
                </Button>
                <Button onClick={() => navigate('/auth?mode=signup')} className="bg-primary hover:bg-primary-hover text-primary-foreground text-sm px-4 min-h-[44px]">
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};