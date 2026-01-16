import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Progress } from '@/components/ui/progress';
import { 
  Scan, DollarSign, AlertTriangle, Sparkles, 
  Phone, X, TrendingDown, Check, Crown, Zap,
  Bot, Shield, Clock, ArrowRight, Loader2, Wifi, Dumbbell, Film, Gavel
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { ScenarioPlanner } from '@/components/finance/ScenarioPlanner';
import { NegotiationModal } from '@/components/subscriptions/NegotiationModal';
import { supabase } from '@/integrations/supabase/client';

interface NegotiationData {
  subscription_name: string;
  provider_name: string;
  current_cost: number;
  cancellation_email?: {
    subject: string;
    body: string;
  };
  negotiation_script?: {
    opening: string;
    key_points: string[];
    competitor_mentions: string[];
    escalation_phrases: string[];
    closing_ultimatum: string;
    full_script: string;
  };
  legal_references?: string[];
}

interface DetectedIssue {
  id: string;
  type: 'unused' | 'duplicate' | 'negotiable';
  serviceName: string;
  logoEmoji: string;
  monthlyCost: number;
  potentialSavings: number;
  description: string;
  action: 'cancel' | 'refund' | 'negotiate';
  successRate?: number;
}

const detectedIssues: DetectedIssue[] = [
  {
    id: '1',
    type: 'unused',
    serviceName: 'Planet Fitness',
    logoEmoji: '💪',
    monthlyCost: 49.99,
    potentialSavings: 49.99,
    description: 'Only 2 check-ins in the last 3 months',
    action: 'cancel',
  },
  {
    id: '2',
    type: 'duplicate',
    serviceName: 'Netflix',
    logoEmoji: '🎬',
    monthlyCost: 15.99,
    potentialSavings: 15.99,
    description: 'Duplicate charge detected on Dec 15',
    action: 'refund',
  },
  {
    id: '3',
    type: 'negotiable',
    serviceName: 'Comcast Internet',
    logoEmoji: '📡',
    monthlyCost: 89.99,
    potentialSavings: 25.00,
    description: 'Rate increased 18% since signup',
    action: 'negotiate',
    successRate: 85,
  },
];

const issueIcons = {
  unused: Dumbbell,
  duplicate: Film,
  negotiable: Wifi,
};

const issueColors = {
  unused: 'from-destructive/20 to-destructive/5 border-destructive/30',
  duplicate: 'from-warning/20 to-warning/5 border-warning/30',
  negotiable: 'from-primary/20 to-primary/5 border-primary/30',
};

const actionLabels = {
  cancel: 'Cancel for Me',
  refund: 'Get Refund',
  negotiate: 'Negotiate Rate',
};

const Subscriptions = () => {
  const [scanPhase, setScanPhase] = useState<'idle' | 'scanning' | 'complete'>('idle');
  const [scanProgress, setScanProgress] = useState(0);
  const [scanningText, setScanningText] = useState('Connecting to accounts...');
  const [revealedIssues, setRevealedIssues] = useState<string[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<DetectedIssue | null>(null);
  const [negotiateDialogOpen, setNegotiateDialogOpen] = useState(false);
  const [premiumSheetOpen, setPremiumSheetOpen] = useState(false);
  const [isNegotiating, setIsNegotiating] = useState(false);
  const [negotiationStep, setNegotiationStep] = useState(0);
  
  // Subscription Assassin state
  const [assassinModalOpen, setAssassinModalOpen] = useState(false);
  const [assassinLoading, setAssassinLoading] = useState(false);
  const [assassinError, setAssassinError] = useState<string | null>(null);
  const [negotiationData, setNegotiationData] = useState<NegotiationData | null>(null);

  // Start scanning animation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setScanPhase('scanning');
      startScanAnimation();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const startScanAnimation = () => {
    const scanTexts = [
      'Connecting to accounts...',
      'Analyzing 12 months of transactions...',
      'Cross-referencing subscription databases...',
      'Detecting billing patterns...',
      'Identifying savings opportunities...',
    ];

    let progress = 0;
    let textIndex = 0;

    const progressInterval = setInterval(() => {
      progress += 2;
      setScanProgress(progress);

      if (progress >= 20 && textIndex === 0) {
        setScanningText(scanTexts[1]);
        textIndex = 1;
      } else if (progress >= 40 && textIndex === 1) {
        setScanningText(scanTexts[2]);
        textIndex = 2;
      } else if (progress >= 60 && textIndex === 2) {
        setScanningText(scanTexts[3]);
        textIndex = 3;
      } else if (progress >= 80 && textIndex === 3) {
        setScanningText(scanTexts[4]);
        textIndex = 4;
      }

      if (progress >= 100) {
        clearInterval(progressInterval);
        setScanPhase('complete');
        revealIssuesSequentially();
      }
    }, 50);
  };

  const revealIssuesSequentially = () => {
    detectedIssues.forEach((issue, index) => {
      setTimeout(() => {
        setRevealedIssues(prev => [...prev, issue.id]);
      }, 300 * (index + 1));
    });
  };

  const handleActionClick = (issue: DetectedIssue) => {
    setSelectedIssue(issue);
    if (issue.action === 'negotiate') {
      setNegotiateDialogOpen(true);
      setNegotiationStep(0);
    } else {
      // Show premium sheet for cancel/refund actions
      setPremiumSheetOpen(true);
    }
  };

  const handleGenerateNegotiation = async (issue: DetectedIssue) => {
    setSelectedIssue(issue);
    setAssassinModalOpen(true);
    setAssassinLoading(true);
    setAssassinError(null);
    setNegotiationData(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-negotiation-script', {
        body: {
          subscription_name: issue.serviceName,
          current_cost: issue.monthlyCost,
          provider_name: issue.serviceName, // Using service name as provider
          contract_type: 'monthly'
        }
      });

      if (error) {
        console.error('Error generating negotiation script:', error);
        setAssassinError(error.message || 'Failed to generate negotiation script');
        return;
      }

      if (data?.error) {
        setAssassinError(data.error);
        return;
      }

      setNegotiationData(data);
    } catch (err) {
      console.error('Unexpected error:', err);
      setAssassinError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setAssassinLoading(false);
    }
  };

  const handleProceedNegotiation = () => {
    setIsNegotiating(true);
    setNegotiationStep(1);
    
    // Simulate negotiation steps
    setTimeout(() => setNegotiationStep(2), 2000);
    setTimeout(() => {
      setNegotiationStep(3);
      setIsNegotiating(false);
      // After showing success, open premium sheet
      setTimeout(() => {
        setNegotiateDialogOpen(false);
        setPremiumSheetOpen(true);
      }, 2000);
    }, 4000);
  };

  const totalSavings = detectedIssues.reduce((sum, i) => sum + i.potentialSavings, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="mobile-content mobile-container py-6 md:py-10 pb-32 md:pb-8">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/30 px-4 py-1.5">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            AI-Powered Analysis
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-text-heading mb-2">
            AI Action Center
          </h1>
          <p className="text-text-secondary text-lg max-w-xl mx-auto">
            ELIN scans your finances to find wasted money and takes action for you
          </p>
        </motion.div>

        {/* Waste Scanner */}
        <AnimatePresence mode="wait">
          {scanPhase !== 'complete' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-8"
            >
              <Card className="professional-card overflow-hidden border-primary/30">
                <CardContent className="p-8">
                  <div className="flex flex-col items-center text-center">
                    {/* Scanning Animation */}
                    <div className="relative mb-6">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-24 h-24 rounded-full border-4 border-primary/30 border-t-primary"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Scan className="w-10 h-10 text-primary" />
                      </div>
                    </div>

                    <h3 className="text-xl font-semibold text-text-heading mb-2">
                      {scanPhase === 'idle' ? 'Initializing...' : 'Scanning Your Finances'}
                    </h3>
                    <p className="text-text-secondary mb-4">
                      {scanningText}
                    </p>

                    <div className="w-full max-w-md">
                      <Progress value={scanProgress} className="h-2 mb-2" />
                      <div className="flex justify-between text-xs text-text-muted">
                        <span>Analyzing transactions</span>
                        <span>{scanProgress}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Summary */}
        <AnimatePresence>
          {scanPhase === 'complete' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Card className="professional-card bg-gradient-to-br from-success/10 to-success/5 border-success/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-success/20 flex items-center justify-center">
                        <TrendingDown className="w-7 h-7 text-success" />
                      </div>
                      <div>
                        <p className="text-sm text-success font-medium">Potential Monthly Savings</p>
                        <p className="text-4xl font-bold text-success">${totalSavings.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-text-heading">{detectedIssues.length}</p>
                        <p className="text-sm text-text-muted">Issues Found</p>
                      </div>
                      <Badge className="bg-primary text-white border-0 px-4 py-2">
                        <Sparkles className="w-4 h-4 mr-1" />
                        AI Analyzed
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Detected Issues Cards */}
        <div className="space-y-4">
          <AnimatePresence>
            {detectedIssues.map((issue, index) => {
              const isRevealed = revealedIssues.includes(issue.id);
              const Icon = issueIcons[issue.type];

              return (
                <motion.div
                  key={issue.id}
                  initial={{ opacity: 0, x: -50, height: 0 }}
                  animate={isRevealed ? { opacity: 1, x: 0, height: 'auto' } : {}}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  {isRevealed && (
                    <Card className={`professional-card bg-gradient-to-br ${issueColors[issue.type]} border overflow-hidden`}>
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                          {/* Left Section - Service Info */}
                          <div className="flex-1 p-6">
                            <div className="flex items-start gap-4">
                              <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center text-3xl shadow-lg">
                                {issue.logoEmoji}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${
                                      issue.type === 'unused' ? 'bg-destructive/10 text-destructive border-destructive/30' :
                                      issue.type === 'duplicate' ? 'bg-warning/10 text-warning border-warning/30' :
                                      'bg-primary/10 text-primary border-primary/30'
                                    }`}
                                  >
                                    <Icon className="w-3 h-3 mr-1" />
                                    {issue.type === 'unused' ? 'Unused' : issue.type === 'duplicate' ? 'Duplicate' : 'Negotiable'}
                                  </Badge>
                                </div>
                                <h3 className="text-xl font-bold text-text-heading mb-1">
                                  {issue.serviceName}
                                </h3>
                                <p className="text-text-secondary text-sm mb-3">
                                  {issue.description}
                                </p>
                                <div className="flex items-center gap-4 text-sm">
                                  <span className="text-text-muted">
                                    Current: <span className="font-semibold text-text-heading">${issue.monthlyCost}/mo</span>
                                  </span>
                                  <span className="text-success font-semibold">
                                    Save ${issue.potentialSavings}/mo
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Right Section - Action */}
                          <div className="flex flex-col justify-center items-stretch p-6 bg-card/50 border-t md:border-t-0 md:border-l border-border/50 min-w-[220px]">
                            {issue.successRate && (
                              <div className="text-center mb-3">
                                <div className="text-2xl font-bold text-primary">{issue.successRate}%</div>
                                <div className="text-xs text-text-muted">Success Rate</div>
                              </div>
                            )}
                            <Button
                              size="lg"
                              onClick={() => handleActionClick(issue)}
                              className={`w-full font-semibold ${
                                issue.action === 'negotiate' 
                                  ? 'bg-primary hover:bg-primary-hover' 
                                  : issue.action === 'refund'
                                  ? 'bg-warning hover:bg-warning/90 text-warning-foreground'
                                  : 'bg-destructive hover:bg-destructive/90'
                              }`}
                            >
                              {issue.action === 'negotiate' && <Phone className="w-4 h-4 mr-2" />}
                              {issue.action === 'cancel' && <X className="w-4 h-4 mr-2" />}
                              {issue.action === 'refund' && <DollarSign className="w-4 h-4 mr-2" />}
                              {actionLabels[issue.action]}
                            </Button>
                            
                            {/* Subscription Assassin Button */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleGenerateNegotiation(issue)}
                              className="w-full mt-2 border-slate-600 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                            >
                              <Gavel className="w-4 h-4 mr-2" />
                              Generate Cancellation
                            </Button>
                            
                            <p className="text-xs text-text-muted text-center mt-2">
                              {issue.action === 'negotiate' ? 'ELIN calls for you' : 'We handle everything'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Scenario Planner - Can I Afford It? */}
        {scanPhase === 'complete' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <ScenarioPlanner />
          </motion.div>
        )}

        {/* Hidden while scanning */}
        {scanPhase !== 'complete' && (
          <div className="text-center py-12 text-text-muted">
            <p className="text-sm">Scanning your financial history...</p>
          </div>
        )}
      </main>

      {/* Negotiate Dialog */}
      <Dialog open={negotiateDialogOpen} onOpenChange={setNegotiateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              AI Negotiation Assistant
            </DialogTitle>
            <DialogDescription>
              {selectedIssue && `Negotiating your ${selectedIssue.serviceName} bill`}
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            {negotiationStep === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="flex items-start gap-4 p-4 rounded-xl bg-primary/10 border border-primary/20">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-text-heading mb-2">ELIN</p>
                    <p className="text-text-body leading-relaxed">
                      I can call {selectedIssue?.serviceName} for you and negotiate a lower rate. Based on similar cases, 
                      I have an <span className="font-bold text-primary">{selectedIssue?.successRate}% success rate</span> and 
                      typically save customers <span className="font-bold text-success">${selectedIssue?.potentialSavings}/month</span>.
                    </p>
                    <p className="text-text-body mt-3">
                      Ready to proceed?
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setNegotiateDialogOpen(false)}
                  >
                    Not Now
                  </Button>
                  <Button
                    onClick={handleProceedNegotiation}
                    className="bg-primary hover:bg-primary-hover"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Yes, Call Them
                  </Button>
                </div>
              </motion.div>
            )}

            {negotiationStep >= 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {/* Step 1: Dialing */}
                <div className={`flex items-center gap-3 p-3 rounded-lg ${negotiationStep >= 1 ? 'bg-muted' : 'opacity-50'}`}>
                  {negotiationStep === 1 && isNegotiating ? (
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  ) : (
                    <Check className="w-5 h-5 text-success" />
                  )}
                  <span className="text-sm">Connecting to {selectedIssue?.serviceName}...</span>
                </div>

                {/* Step 2: On hold */}
                <div className={`flex items-center gap-3 p-3 rounded-lg ${negotiationStep >= 2 ? 'bg-muted' : 'opacity-50'}`}>
                  {negotiationStep === 2 && isNegotiating ? (
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  ) : negotiationStep > 2 ? (
                    <Check className="w-5 h-5 text-success" />
                  ) : (
                    <Clock className="w-5 h-5 text-text-muted" />
                  )}
                  <span className="text-sm">Speaking with retention department...</span>
                </div>

                {/* Step 3: Success */}
                {negotiationStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-success/10 border border-success/30 text-center"
                  >
                    <Check className="w-10 h-10 text-success mx-auto mb-2" />
                    <p className="font-semibold text-success text-lg">Negotiation Ready!</p>
                    <p className="text-sm text-text-secondary mt-1">
                      Unlock ELIN Premium to complete this negotiation
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Premium Upsell Sheet */}
      <Sheet open={premiumSheetOpen} onOpenChange={setPremiumSheetOpen}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
          <div className="max-w-lg mx-auto py-6">
            <SheetHeader className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <SheetTitle className="text-2xl font-bold">
                ELIN Premium
              </SheetTitle>
              <SheetDescription className="text-base">
                Let ELIN handle the hard work while you save money
              </SheetDescription>
            </SheetHeader>

            {/* Features */}
            <div className="space-y-4 mb-8">
              {[
                { icon: Phone, title: 'We Wait on Hold', desc: 'ELIN calls companies and negotiates for you' },
                { icon: Zap, title: 'Automated Savings', desc: 'Continuously scans and cancels unused subscriptions' },
                { icon: Shield, title: 'Refund Recovery', desc: 'Detects duplicate charges and gets your money back' },
                { icon: Bot, title: 'Unlimited AI Plans', desc: 'Personalized financial optimization strategies' },
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start gap-4 p-4 rounded-xl bg-muted/50"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-heading">{feature.title}</h4>
                    <p className="text-sm text-text-secondary">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pricing */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/30 mb-6">
              <div className="flex items-baseline justify-center gap-1 mb-2">
                <span className="text-4xl font-bold text-text-heading">$9.99</span>
                <span className="text-text-muted">/month</span>
              </div>
              <p className="text-center text-sm text-text-secondary">
                Average members save <span className="font-semibold text-success">$240/year</span>
              </p>
            </div>

            {/* CTA */}
            <Button
              size="lg"
              className="w-full bg-primary hover:bg-primary-hover text-lg py-6 shadow-lg shadow-primary/30"
              onClick={() => {
                toast.success('Premium coming soon!');
                setPremiumSheetOpen(false);
              }}
            >
              Start 7-Day Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <p className="text-center text-xs text-text-muted mt-3">
              Cancel anytime. No commitment required.
            </p>
          </div>
        </SheetContent>
      </Sheet>

      {/* Subscription Assassin Modal */}
      <NegotiationModal
        open={assassinModalOpen}
        onOpenChange={setAssassinModalOpen}
        data={negotiationData}
        isLoading={assassinLoading}
        error={assassinError}
      />

      <Footer />
    </div>
  );
};

export default Subscriptions;
