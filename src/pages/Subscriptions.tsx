import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { 
  Repeat, DollarSign, Calendar, AlertTriangle, Sparkles, 
  Mail, Phone, MessageSquare, Copy, Check, X, TrendingDown,
  Loader2, Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Subscription {
  id: string;
  serviceName: string;
  logoEmoji: string;
  monthlyCost: number;
  annualCost: number;
  category: string;
  nextBillingDate: Date;
  status: 'active' | 'cancelled' | 'paused';
  usageLevel: 'high' | 'medium' | 'low' | 'unused';
  aiSuggestion?: string;
}

const mockSubscriptions: Subscription[] = [
  { id: '1', serviceName: 'Netflix', logoEmoji: '🎬', monthlyCost: 15.99, annualCost: 191.88, category: 'Entertainment', nextBillingDate: new Date('2026-01-15'), status: 'active', usageLevel: 'high' },
  { id: '2', serviceName: 'Spotify', logoEmoji: '🎵', monthlyCost: 10.99, annualCost: 131.88, category: 'Entertainment', nextBillingDate: new Date('2026-01-08'), status: 'active', usageLevel: 'high' },
  { id: '3', serviceName: 'Disney+', logoEmoji: '✨', monthlyCost: 13.99, annualCost: 167.88, category: 'Entertainment', nextBillingDate: new Date('2026-01-20'), status: 'active', usageLevel: 'medium', aiSuggestion: 'Bundle with Hulu to save $5.98/mo' },
  { id: '4', serviceName: 'Hulu', logoEmoji: '📺', monthlyCost: 17.99, annualCost: 215.88, category: 'Entertainment', nextBillingDate: new Date('2026-01-22'), status: 'active', usageLevel: 'low', aiSuggestion: 'Low usage detected - consider cancelling' },
  { id: '5', serviceName: 'Gym Membership', logoEmoji: '💪', monthlyCost: 49.99, annualCost: 599.88, category: 'Health', nextBillingDate: new Date('2026-01-05'), status: 'active', usageLevel: 'low', aiSuggestion: 'Only 2 visits last month. Try negotiating a lower rate.' },
  { id: '6', serviceName: 'Amazon Prime', logoEmoji: '📦', monthlyCost: 14.99, annualCost: 179.88, category: 'Shopping', nextBillingDate: new Date('2026-02-01'), status: 'active', usageLevel: 'high' },
  { id: '7', serviceName: 'iCloud+', logoEmoji: '☁️', monthlyCost: 2.99, annualCost: 35.88, category: 'Storage', nextBillingDate: new Date('2026-01-12'), status: 'active', usageLevel: 'high' },
  { id: '8', serviceName: 'Adobe Creative', logoEmoji: '🎨', monthlyCost: 54.99, annualCost: 659.88, category: 'Productivity', nextBillingDate: new Date('2026-01-18'), status: 'active', usageLevel: 'medium', aiSuggestion: 'Cheaper alternatives exist for casual use' },
];

const usageBadgeStyles = {
  high: 'bg-success/10 text-success border-success/30',
  medium: 'bg-warning/10 text-warning border-warning/30',
  low: 'bg-destructive/10 text-destructive border-destructive/30',
  unused: 'bg-muted text-muted-foreground border-muted',
};

const Subscriptions = () => {
  const [subscriptions] = useState<Subscription[]>(mockSubscriptions);
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [negotiatorOpen, setNegotiatorOpen] = useState(false);
  const [negotiatorMode, setNegotiatorMode] = useState<'cancel' | 'negotiate'>('cancel');
  const [generatedScript, setGeneratedScript] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const totalMonthly = subscriptions.filter(s => s.status === 'active').reduce((sum, s) => sum + s.monthlyCost, 0);
  const totalAnnual = subscriptions.filter(s => s.status === 'active').reduce((sum, s) => sum + s.annualCost, 0);
  const potentialSavings = subscriptions.filter(s => s.usageLevel === 'low' || s.usageLevel === 'unused').reduce((sum, s) => sum + s.monthlyCost, 0);

  const handleOpenNegotiator = async (sub: Subscription, mode: 'cancel' | 'negotiate') => {
    setSelectedSub(sub);
    setNegotiatorMode(mode);
    setNegotiatorOpen(true);
    setGeneratedScript('');
    setIsGenerating(true);

    try {
      const prompt = mode === 'cancel'
        ? `Generate a polite but firm cancellation email for my ${sub.serviceName} subscription that costs $${sub.monthlyCost}/month. Include: 1) A clear subject line 2) A professional greeting 3) Statement that I want to cancel 4) Request for confirmation 5) Professional closing. Keep it concise.`
        : `Generate a negotiation script for calling ${sub.serviceName} customer service to negotiate a lower rate on my $${sub.monthlyCost}/month subscription. Include: 1) Opening statement 2) Key talking points (loyal customer, found cheaper alternatives, considering cancellation) 3) Target price suggestion 4) Fallback options 5) Polite closing. Make it conversational.`;

      const { data, error } = await supabase.functions.invoke('chat-with-elin', {
        body: { 
          message: prompt,
          conversationHistory: [],
          stream: false 
        }
      });

      if (error) throw error;

      // Clean up the response (remove educational disclaimer if present)
      let script = data.response || 'Unable to generate script. Please try again.';
      const disclaimerIndex = script.indexOf('\n\n---\n📋');
      if (disclaimerIndex > 0) {
        script = script.substring(0, disclaimerIndex);
      }

      setGeneratedScript(script);
    } catch (error) {
      console.error('Error generating script:', error);
      setGeneratedScript('Failed to generate script. Please try again.');
      toast.error('Failed to generate script');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedScript);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="mobile-content mobile-container py-6 md:py-10 pb-32 md:pb-8">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-text-heading mb-2">
            Subscription Manager
          </h1>
          <p className="text-text-secondary text-lg">
            AI-powered insights to help you save money on recurring payments
          </p>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="professional-card">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-muted">Monthly Cost</p>
                    <p className="text-3xl font-bold text-text-heading">${totalMonthly.toFixed(2)}</p>
                    <p className="text-xs text-text-secondary">${totalAnnual.toFixed(2)}/year</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="professional-card">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-muted">Active Subscriptions</p>
                    <p className="text-3xl font-bold text-text-heading">{subscriptions.filter(s => s.status === 'active').length}</p>
                    <p className="text-xs text-text-secondary">{subscriptions.filter(s => s.usageLevel === 'low').length} low usage</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                    <Repeat className="w-6 h-6 text-secondary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="professional-card bg-gradient-to-br from-success/10 to-success/5 border-success/20">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-success">Potential Savings</p>
                    <p className="text-3xl font-bold text-success">${potentialSavings.toFixed(2)}/mo</p>
                    <p className="text-xs text-success/80">${(potentialSavings * 12).toFixed(2)}/year</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
                    <TrendingDown className="w-6 h-6 text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Subscriptions List */}
        <Card className="professional-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-text-heading flex items-center gap-2">
                <Repeat className="w-5 h-5 text-primary" />
                Your Subscriptions
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                Sorted by cost
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="max-h-[600px]">
              <div className="divide-y divide-border">
                {subscriptions
                  .sort((a, b) => b.monthlyCost - a.monthlyCost)
                  .map((sub, index) => (
                    <motion.div
                      key={sub.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center text-2xl shadow-sm flex-shrink-0">
                            {sub.logoEmoji}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-text-heading">{sub.serviceName}</span>
                              <Badge variant="outline" className={`text-xs ${usageBadgeStyles[sub.usageLevel]}`}>
                                {sub.usageLevel} usage
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-text-muted mt-0.5">
                              <span>{sub.category}</span>
                              <span>•</span>
                              <Calendar className="w-3 h-3" />
                              <span>Renews {sub.nextBillingDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            </div>
                            {sub.aiSuggestion && (
                              <div className="flex items-center gap-1.5 mt-2 text-xs text-primary">
                                <Sparkles className="w-3 h-3" />
                                {sub.aiSuggestion}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 flex-shrink-0">
                          <div className="text-right">
                            <div className="text-lg font-bold text-text-heading">${sub.monthlyCost}</div>
                            <div className="text-xs text-text-muted">/month</div>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs border-primary/30 text-primary hover:bg-primary/10"
                              onClick={() => handleOpenNegotiator(sub, 'negotiate')}
                            >
                              <Phone className="w-3 h-3 mr-1" />
                              Negotiate
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs border-destructive/30 text-destructive hover:bg-destructive/10"
                              onClick={() => handleOpenNegotiator(sub, 'cancel')}
                            >
                              <X className="w-3 h-3 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </main>

      {/* AI Negotiator Dialog */}
      <Dialog open={negotiatorOpen} onOpenChange={setNegotiatorOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              AI {negotiatorMode === 'cancel' ? 'Cancellation' : 'Negotiation'} Assistant
            </DialogTitle>
            <DialogDescription>
              {selectedSub && (
                <span>
                  {negotiatorMode === 'cancel' 
                    ? `Draft a cancellation email for ${selectedSub.serviceName}` 
                    : `Negotiation script for ${selectedSub.serviceName} ($${selectedSub.monthlyCost}/mo)`
                  }
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-auto py-4">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
                <p className="text-sm text-text-muted">ELIN is crafting your {negotiatorMode === 'cancel' ? 'cancellation email' : 'negotiation script'}...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  {negotiatorMode === 'cancel' ? (
                    <Mail className="w-4 h-4 text-primary" />
                  ) : (
                    <MessageSquare className="w-4 h-4 text-primary" />
                  )}
                  <span className="text-sm font-medium text-text-heading">
                    {negotiatorMode === 'cancel' ? 'Email Draft' : 'Phone Script'}
                  </span>
                </div>
                <Textarea
                  value={generatedScript}
                  onChange={(e) => setGeneratedScript(e.target.value)}
                  className="min-h-[300px] font-mono text-sm leading-relaxed"
                  placeholder="Your script will appear here..."
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-text-muted">
                    Feel free to edit the script before copying
                  </p>
                  <Button
                    size="sm"
                    onClick={handleCopy}
                    disabled={!generatedScript}
                    className="bg-primary hover:bg-primary-hover"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1" />
                        Copy to Clipboard
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Tips */}
          {!isGenerating && selectedSub && (
            <div className="border-t border-border pt-4 mt-4">
              <h4 className="text-sm font-medium text-text-heading mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                AI Tips for {selectedSub.serviceName}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {negotiatorMode === 'cancel' ? (
                  <>
                    <div className="p-2 rounded bg-muted/50">💡 Many services offer retention discounts when you try to cancel</div>
                    <div className="p-2 rounded bg-muted/50">📅 Cancel 1-2 days before billing to avoid charges</div>
                  </>
                ) : (
                  <>
                    <div className="p-2 rounded bg-muted/50">💰 Mention competitor prices: Netflix Basic is $6.99, Peacock is $5.99</div>
                    <div className="p-2 rounded bg-muted/50">🎯 Target 20-30% discount as a reasonable ask</div>
                    <div className="p-2 rounded bg-muted/50">⏰ Best time to call: Tuesday-Thursday 10am-2pm</div>
                    <div className="p-2 rounded bg-muted/50">🔄 Ask for "retention department" for better deals</div>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Subscriptions;
