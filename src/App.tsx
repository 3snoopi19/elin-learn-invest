import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "next-themes";
import { FloatingChatButton } from "@/components/ui/FloatingChatButton";
import { AccessibilityWrapper } from "@/components/ui/AccessibilityWrapper";
import { useIsMobile } from "@/hooks/use-mobile";
import { MainLayout } from "@/components/layout/MainLayout";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import Filings from "./pages/Filings";
import Portfolio from "./pages/Portfolio";
import PortfolioSimulator from "./pages/PortfolioSimulator";
import Learn from "./pages/Learn";
import Resources from "./pages/Resources";
import Settings from "./pages/Settings";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import AIPolicy from "./pages/AIPolicy";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Sources from "./pages/Sources";
import OnboardingQuiz from "./pages/OnboardingQuiz";
import RiskQuiz from "./pages/RiskQuiz";
import InvestorProfile from "./pages/InvestorProfile";
import PaymentSuccess from "./pages/PaymentSuccess";
import CreditCoachV2 from "./pages/CreditCoachV2";
import MarketDashboard from "./pages/MarketDashboard";
import Subscriptions from "./pages/Subscriptions";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const isMobile = useIsMobile();

  return (
    <div className="relative min-h-screen bg-background">
      <Routes>
        {/* Public pages without MainLayout */}
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/about" element={<About />} />
        <Route path="/ai-policy" element={<AIPolicy />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/sources" element={<Sources />} />
        <Route path="/onboarding" element={<OnboardingQuiz />} />
        
        {/* Authenticated pages with MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/filings" element={<Filings />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/portfolio-simulator" element={<PortfolioSimulator />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/risk-quiz" element={<RiskQuiz />} />
          <Route path="/investor-profile" element={<InvestorProfile />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/credit-coach" element={<CreditCoachV2 />} />
          <Route path="/market-dashboard" element={<MarketDashboard />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
        </Route>
        
        {/* Catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      {/* Desktop Floating Chat Button - only show on desktop */}
      {!isMobile && <FloatingChatButton />}
      
      <Toaster />
      <Sonner />
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <TooltipProvider>
        <AuthProvider>
          <BrowserRouter>
            <AccessibilityWrapper>
              <AppContent />
            </AccessibilityWrapper>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
