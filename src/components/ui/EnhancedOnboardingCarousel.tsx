import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { 
  TrendingUp, 
  Bot, 
  PieChart, 
  Building2, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight,
  X,
  CheckCircle,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  gradient: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to ELIN',
    description: 'Your AI-powered investment learning companion is here to guide your financial journey.',
    icon: <Sparkles className="w-8 h-8" />,
    features: [
      'Personalized investment guidance',
      'Interactive learning modules',
      'Real-time market insights',
      'Portfolio simulation tools'
    ],
    gradient: 'from-primary/20 to-primary/5'
  },
  {
    id: 'portfolio',
    title: 'Portfolio Simulator',
    description: 'Test investment strategies risk-free with our advanced portfolio simulation engine.',
    icon: <TrendingUp className="w-8 h-8" />,
    features: [
      'Backtest investment strategies',
      'Risk analysis and optimization',
      'Performance tracking',
      'What-if scenarios'
    ],
    gradient: 'from-success/20 to-success/5'
  },
  {
    id: 'money-flow',
    title: 'Money Flow Visualization',
    description: 'See exactly how your money moves between accounts, income sources, and expenses.',
    icon: <Building2 className="w-8 h-8" />,
    features: [
      'Interactive flow diagrams',
      'Account synchronization',
      'Smart automation rules',
      'Cash flow optimization'
    ],
    gradient: 'from-secondary/20 to-secondary/5'
  },
  {
    id: 'learning',
    title: 'Learning Paths',
    description: 'Structured courses designed to take you from beginner to advanced investor.',
    icon: <BookOpen className="w-8 h-8" />,
    features: [
      'Beginner to advanced courses',
      'Interactive quizzes',
      'Progress tracking',
      'Certificates and achievements'
    ],
    gradient: 'from-education/20 to-education/5'
  },
  {
    id: 'elin-chat',
    title: 'Chat with ELIN',
    description: 'Get instant, personalized investment advice from our AI mentor anytime.',
    icon: <Bot className="w-8 h-8" />,
    features: [
      'Voice-enabled conversations',
      'Market analysis on demand',
      'Personalized recommendations',
      'Quick financial explanations'
    ],
    gradient: 'from-accent/20 to-accent/5'
  }
];

interface EnhancedOnboardingCarouselProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const EnhancedOnboardingCarousel = ({ 
  isOpen, 
  onClose, 
  onComplete 
}: EnhancedOnboardingCarouselProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const currentStepData = onboardingSteps[currentStep];
  const progressPercent = ((currentStep + 1) / onboardingSteps.length) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg mx-auto p-0 bg-transparent border-0 shadow-none">
        <Card className="professional-card w-full overflow-hidden">
          {/* Progress Header */}
          <div className="p-4 border-b border-border/30">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-text-heading">
                Getting Started ({currentStep + 1}/{onboardingSteps.length})
              </div>
              <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <Progress value={progressPercent} className="h-1" />
          </div>

          <CardContent className="p-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className={`p-6 bg-gradient-to-br ${currentStepData.gradient} min-h-[400px] flex flex-col`}
              >
                {/* Icon and Title */}
                <div className="text-center mb-6">
                  <div className="mx-auto mb-4 p-4 bg-card/80 rounded-2xl w-fit shadow-lg">
                    {currentStepData.icon}
                  </div>
                  <h2 className="text-2xl font-bold text-text-heading mb-2">
                    {currentStepData.title}
                  </h2>
                  <p className="text-text-muted leading-relaxed">
                    {currentStepData.description}
                  </p>
                </div>

                {/* Features List */}
                <div className="flex-1">
                  <div className="space-y-3">
                    {currentStepData.features.map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 + 0.2 }}
                        className="flex items-center gap-3 p-3 bg-card/60 rounded-lg backdrop-blur-sm border border-border/30"
                      >
                        <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                        <span className="text-text-body font-medium">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between pt-6 mt-auto">
                  <div className="flex gap-2">
                    {currentStep > 0 && (
                      <Button 
                        variant="outline" 
                        onClick={handlePrevious}
                        className="mobile-button"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Previous
                      </Button>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      onClick={handleSkip}
                      className="text-text-muted hover:text-text-body"
                    >
                      Skip Tour
                    </Button>
                    <Button 
                      onClick={handleNext}
                      className="mobile-button bg-primary hover:bg-primary-hover"
                    >
                      {currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}
                      {currentStep < onboardingSteps.length - 1 && (
                        <ChevronRight className="w-4 h-4 ml-1" />
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};