import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, BookOpen, TrendingUp, PieChart, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: any;
  content: string;
  features: string[];
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 1,
    title: "Welcome to ELIN",
    description: "Your AI-powered investment learning companion",
    icon: BookOpen,
    content: "ELIN is designed to help you learn investing through interactive lessons, personalized guidance, and real-world simulations. Start your journey to financial literacy today!",
    features: [
      "AI-powered personalized learning paths",
      "Interactive lessons and quizzes", 
      "Safe simulation environment",
      "Progress tracking and achievements"
    ]
  },
  {
    id: 2,
    title: "Simulate Investments",
    description: "Practice with virtual portfolios and scenarios",
    icon: TrendingUp,
    content: "Test different investment strategies using our Portfolio Simulator. Experiment with various market scenarios and see how different allocations perform over time - all without risking real money.",
    features: [
      "Portfolio scenario testing",
      "Market condition simulations",
      "Risk assessment tools",
      "Performance projections"
    ]
  },
  {
    id: 3,
    title: "Track & Learn",
    description: "Monitor your learning progress and portfolio knowledge",
    icon: PieChart,
    content: "Use our Portfolio Tracker to understand diversification, analyze your holdings, and get educational insights. Track your learning progress with badges and achievements as you master new concepts.",
    features: [
      "Educational portfolio analysis",
      "Diversification insights",
      "Learning progress tracking",
      "Achievement badges and milestones"
    ]
  }
];

interface OnboardingCarouselProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const OnboardingCarousel = ({ isOpen, onClose, onComplete }: OnboardingCarouselProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const currentStepData = onboardingSteps[currentStep];
  const IconComponent = currentStepData?.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>ELIN Onboarding</DialogTitle>
        </DialogHeader>
        
        <div className="relative">
          {/* Progress indicators */}
          <div className="flex justify-center gap-2 p-4 bg-muted/50">
            {onboardingSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  index === currentStep ? 'bg-primary' : 
                  index < currentStep ? 'bg-success' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-0 shadow-none">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
                    <IconComponent className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-foreground">
                    {currentStepData.title}
                  </CardTitle>
                  <CardDescription className="text-lg text-muted-foreground">
                    {currentStepData.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <p className="text-center text-foreground leading-relaxed">
                    {currentStepData.content}
                  </p>

                  {/* Feature list */}
                  <div className="space-y-3">
                    {currentStepData.features.map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                      >
                        <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Navigation buttons */}
                  <div className="flex justify-between items-center pt-4">
                    <div className="flex items-center gap-2">
                      {currentStep > 0 && (
                        <Button variant="outline" onClick={handlePrev} size="sm">
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Previous
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="ghost" onClick={handleSkip} size="sm" className="text-muted-foreground">
                        Skip Tour
                      </Button>
                      <Button onClick={handleNext} size="sm" className="bg-primary hover:bg-primary-hover">
                        {currentStep === onboardingSteps.length - 1 ? (
                          'Get Started'
                        ) : (
                          <>
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};