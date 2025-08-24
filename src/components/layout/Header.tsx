import { Button } from "@/components/ui/button";
import { ElinLogo } from "@/components/ui/ElinLogo";
import { MarketTicker } from "@/components/MarketTicker";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut, User, Menu } from "lucide-react";
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
        onClick={() => navigate('/learn')}
        className="text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors"
        aria-label="Learning Paths"
      >
        Learn
      </Button>
    </>
  );

  return (
    <>
      {/* Market Ticker */}
      <MarketTicker />
      
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer" 
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
              size="md" 
              showSubtitle={true}
              glowIntensity="subtle"
              className="transition-all duration-300 hover:scale-105"
            />
          </div>

          {/* Desktop Navigation */}
          {user && (
            <nav className="hidden md:flex items-center space-x-1" role="navigation" aria-label="Main navigation">
              <NavigationLinks />
            </nav>
          )}

          {/* User Menu / Auth */}
          <div className="flex items-center space-x-2">
            {user ? (
              <>
                {/* Mobile Menu */}
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open mobile menu">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-64">
                    <div className="flex flex-col space-y-2 mt-8">
                      <NavigationLinks />
                      <Button variant="ghost" onClick={() => navigate('/settings')} aria-label="Settings">
                        Settings
                      </Button>
                      <Button variant="ghost" onClick={handleSignOut} aria-label="Sign out">
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Desktop User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="hidden md:flex" aria-label="User menu">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => navigate('/settings')}>
                      <User className="h-4 w-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" onClick={() => navigate('/auth')} className="text-text-body hover:text-text-heading">
                  Sign In
                </Button>
                <Button onClick={() => navigate('/auth?mode=signup')} className="bg-primary hover:bg-primary-hover text-primary-foreground">
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