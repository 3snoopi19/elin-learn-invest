import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { BottomNavigation } from "@/components/mobile/BottomNavigation";
import { FloatingChatButton } from "@/components/ui/FloatingChatButton";
import { AccessibilityWrapper } from "@/components/ui/AccessibilityWrapper";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import Filings from "./pages/Filings";
import Portfolio from "./pages/Portfolio";
import PortfolioSimulator from "./pages/PortfolioSimulator";
import Learn from "./pages/Learn";
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
import MoneyFlowPage from "./pages/MoneyFlow";
import Router from "./pages/Router";
import ProMode from "./pages/ProMode";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <BrowserRouter>
          <AccessibilityWrapper>
            <div className="relative min-h-screen bg-background">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/filings" element={<Filings />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/portfolio-simulator" element={<PortfolioSimulator />} />
                <Route path="/learn" element={<Learn />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/about" element={<About />} />
                <Route path="/ai-policy" element={<AIPolicy />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/sources" element={<Sources />} />
                <Route path="/onboarding" element={<OnboardingQuiz />} />
                <Route path="/risk-quiz" element={<RiskQuiz />} />
                <Route path="/investor-profile" element={<InvestorProfile />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/pro-mode" element={<ProMode />} />
                <Route path="/credit-coach" element={<CreditCoachV2 />} />
                <Route path="/money-flow" element={<MoneyFlowPage />} />
                <Route path="/router" element={<Router />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              {/* Mobile Bottom Navigation */}
              <BottomNavigation />
              {/* Floating Chat Button */}
              <FloatingChatButton />
              <Toaster />
              <Sonner />
            </div>
          </AccessibilityWrapper>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
