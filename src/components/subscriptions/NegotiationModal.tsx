import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Gavel, Copy, Check, Mail, Phone, Scale, 
  FileText, AlertTriangle, Loader2, X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

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
  raw_content?: string;
}

interface NegotiationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: NegotiationData | null;
  isLoading: boolean;
  error: string | null;
}

export function NegotiationModal({ 
  open, 
  onOpenChange, 
  data, 
  isLoading, 
  error 
}: NegotiationModalProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  const handleCopyEmail = async () => {
    if (!data?.cancellation_email) return;
    
    const emailText = `Subject: ${data.cancellation_email.subject}\n\n${data.cancellation_email.body}`;
    await navigator.clipboard.writeText(emailText);
    setCopiedEmail(true);
    toast.success('Email copied to clipboard!');
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopyScript = async () => {
    if (!data?.negotiation_script?.full_script) return;
    
    await navigator.clipboard.writeText(data.negotiation_script.full_script);
    setCopiedScript(true);
    toast.success('Phone script copied to clipboard!');
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden bg-[#faf8f5]">
        {/* Legal Brief Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <Gavel className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-serif text-white">
                Legal Action Brief
              </DialogTitle>
              <DialogDescription className="text-slate-300">
                {data?.subscription_name ? `vs. ${data.provider_name}` : 'Generating...'}
              </DialogDescription>
            </div>
          </div>
          {data && (
            <div className="flex items-center gap-2 mt-4">
              <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                <Scale className="w-3 h-3 mr-1" />
                Consumer Protection
              </Badge>
              <Badge variant="outline" className="bg-red-500/20 text-red-200 border-red-400/30">
                ${data.current_cost.toFixed(2)}/mo at stake
              </Badge>
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-16 px-6"
            >
              <div className="relative mb-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary"
                />
                <Gavel className="absolute inset-0 m-auto w-6 h-6 text-primary" />
              </div>
              <p className="text-lg font-semibold text-text-heading mb-2">
                Consulting AI Lawyer...
              </p>
              <p className="text-text-secondary text-center max-w-sm">
                Researching applicable laws and crafting your legal documents
              </p>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-16 px-6"
            >
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <X className="w-8 h-8 text-destructive" />
              </div>
              <p className="text-lg font-semibold text-destructive mb-2">
                Failed to Generate
              </p>
              <p className="text-text-secondary text-center max-w-sm mb-4">
                {error}
              </p>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </motion.div>
          )}

          {!isLoading && !error && data && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Tabs defaultValue="email" className="w-full">
                <div className="px-6 pt-4 border-b border-border bg-white">
                  <TabsList className="w-full grid grid-cols-2 h-12">
                    <TabsTrigger value="email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Cancellation Email
                    </TabsTrigger>
                    <TabsTrigger value="script" className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone Script
                    </TabsTrigger>
                  </TabsList>
                </div>

                <ScrollArea className="h-[50vh]">
                  <TabsContent value="email" className="p-6 pt-4 m-0">
                    {data.cancellation_email ? (
                      <div className="space-y-4">
                        {/* Email Subject */}
                        <div className="p-4 bg-white rounded-lg border border-border shadow-sm">
                          <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Subject</p>
                          <p className="font-mono text-sm font-semibold text-text-heading">
                            {data.cancellation_email.subject}
                          </p>
                        </div>

                        {/* Email Body */}
                        <div className="p-6 bg-white rounded-lg border border-border shadow-sm">
                          <p className="text-xs text-text-muted uppercase tracking-wider mb-3">Email Body</p>
                          <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap text-text-body">
                            {data.cancellation_email.body}
                          </div>
                        </div>

                        {/* Copy Button */}
                        <Button 
                          size="lg" 
                          className="w-full bg-primary hover:bg-primary-hover"
                          onClick={handleCopyEmail}
                        >
                          {copiedEmail ? (
                            <>
                              <Check className="w-5 h-5 mr-2" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-5 h-5 mr-2" />
                              Copy Email to Clipboard
                            </>
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-text-muted">
                        No email content available
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="script" className="p-6 pt-4 m-0">
                    {data.negotiation_script ? (
                      <div className="space-y-4">
                        {/* Quick Tips */}
                        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-semibold text-amber-800 text-sm">Before You Call</p>
                              <p className="text-xs text-amber-700 mt-1">
                                Note: Mentioning call recording may vary by state law. Check your state's consent requirements.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Opening */}
                        <div className="p-4 bg-white rounded-lg border border-border shadow-sm">
                          <p className="text-xs text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1">
                            <FileText className="w-3 h-3" /> Opening Statement
                          </p>
                          <p className="font-mono text-sm text-text-body">
                            {data.negotiation_script.opening}
                          </p>
                        </div>

                        {/* Key Points */}
                        <div className="p-4 bg-white rounded-lg border border-border shadow-sm">
                          <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Key Talking Points</p>
                          <ul className="space-y-2">
                            {data.negotiation_script.key_points.map((point, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-text-body">
                                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-xs font-bold">
                                  {idx + 1}
                                </span>
                                <span className="font-mono">{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Competitor Mentions */}
                        {data.negotiation_script.competitor_mentions?.length > 0 && (
                          <div className="p-4 bg-white rounded-lg border border-border shadow-sm">
                            <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Competitor Pricing to Cite</p>
                            <ul className="space-y-1">
                              {data.negotiation_script.competitor_mentions.map((mention, idx) => (
                                <li key={idx} className="text-sm font-mono text-text-body">
                                  • {mention}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Escalation Phrases */}
                        {data.negotiation_script.escalation_phrases?.length > 0 && (
                          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                            <p className="text-xs text-red-800 uppercase tracking-wider mb-2 font-semibold">
                              Escalation Phrases
                            </p>
                            <ul className="space-y-1">
                              {data.negotiation_script.escalation_phrases.map((phrase, idx) => (
                                <li key={idx} className="text-sm font-mono text-red-900">
                                  "{phrase}"
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Closing Ultimatum */}
                        <div className="p-4 bg-slate-800 rounded-lg text-white">
                          <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Final Ultimatum</p>
                          <p className="font-mono text-sm">
                            "{data.negotiation_script.closing_ultimatum}"
                          </p>
                        </div>

                        {/* Copy Full Script Button */}
                        <Button 
                          size="lg" 
                          className="w-full bg-primary hover:bg-primary-hover"
                          onClick={handleCopyScript}
                        >
                          {copiedScript ? (
                            <>
                              <Check className="w-5 h-5 mr-2" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-5 h-5 mr-2" />
                              Copy Full Script to Clipboard
                            </>
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-text-muted">
                        No script content available
                      </div>
                    )}
                  </TabsContent>
                </ScrollArea>

                {/* Legal References Footer */}
                {data.legal_references && data.legal_references.length > 0 && (
                  <div className="p-4 bg-slate-100 border-t border-border">
                    <p className="text-xs text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Scale className="w-3 h-3" /> Legal References Cited
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {data.legal_references.slice(0, 5).map((ref, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs bg-white">
                          {ref.split(':')[0]}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
