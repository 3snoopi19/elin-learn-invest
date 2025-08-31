import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Settings, Target, Percent, DollarSign, Calendar } from "lucide-react";
import { toast } from "sonner";

interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit';
  balance: number;
  institution: string;
}

interface AutomationBuilderProps {
  accounts: Account[];
  onSave?: (automation: any) => void;
}

interface AutomationRule {
  id?: string;
  name: string;
  type: 'percentage' | 'fixed_amount' | 'threshold';
  trigger: string;
  sourceAccount: string;
  targetAccount: string;
  amount?: number;
  percentage?: number;
  threshold?: number;
  frequency: 'immediate' | 'daily' | 'weekly' | 'monthly';
  enabled: boolean;
}

export const AutomationBuilder = ({ accounts, onSave }: AutomationBuilderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [rule, setRule] = useState<AutomationRule>({
    name: '',
    type: 'percentage',
    trigger: 'salary_deposit',
    sourceAccount: '',
    targetAccount: '',
    frequency: 'immediate',
    enabled: true
  });

  const automationTemplates = [
    {
      id: 'emergency_savings',
      name: 'Emergency Fund Builder',
      description: 'Save 20% of paycheck to emergency fund',
      icon: <Target className="w-5 h-5" />,
      template: {
        type: 'percentage',
        trigger: 'salary_deposit',
        percentage: 20,
        frequency: 'immediate'
      }
    },
    {
      id: 'bill_payment',
      name: 'Auto Bill Payment',
      description: 'Pay fixed amount to credit card',
      icon: <Calendar className="w-5 h-5" />,
      template: {
        type: 'fixed_amount',
        trigger: 'monthly_schedule',
        amount: 200,
        frequency: 'monthly'
      }
    },
    {
      id: 'investment_transfer',
      name: 'Investment Transfer',
      description: 'Transfer excess funds to investment account',
      icon: <DollarSign className="w-5 h-5" />,
      template: {
        type: 'threshold',
        trigger: 'balance_threshold',
        threshold: 5000,
        frequency: 'daily'
      }
    }
  ];

  const handleTemplateSelect = (template: any) => {
    setRule(prev => ({
      ...prev,
      ...template.template,
      name: template.name
    }));
    setCurrentStep(2);
  };

  const handleSave = () => {
    if (!rule.name || !rule.sourceAccount || !rule.targetAccount) {
      toast.error("Please fill in all required fields");
      return;
    }

    const automation = {
      ...rule,
      id: Date.now().toString(),
      createdAt: new Date()
    };

    onSave?.(automation);
    toast.success(`Automation "${rule.name}" created successfully!`);
    setIsOpen(false);
    setCurrentStep(1);
    setRule({
      name: '',
      type: 'percentage',
      trigger: 'salary_deposit',
      sourceAccount: '',
      targetAccount: '',
      frequency: 'immediate',
      enabled: true
    });
  };

  const getAccountDisplayName = (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId);
    return account ? `${account.name} (${account.institution})` : '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="mobile-button bg-primary hover:bg-primary-hover text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          New Automation
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Create Money Flow Automation
          </DialogTitle>
        </DialogHeader>

        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Choose a Template</h3>
              <div className="grid gap-4">
                {automationTemplates.map((template) => (
                  <Card 
                    key={template.id}
                    className="cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-3 text-base">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                          {template.icon}
                        </div>
                        {template.name}
                      </CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>

            <div className="text-center">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(2)}
                className="mobile-button"
              >
                Or create custom automation
              </Button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="automation-name">Automation Name</Label>
                <Input
                  id="automation-name"
                  value={rule.name}
                  onChange={(e) => setRule(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Emergency Fund Saver"
                  className="mobile-text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="trigger">Trigger</Label>
                  <Select value={rule.trigger} onValueChange={(value) => setRule(prev => ({ ...prev, trigger: value }))}>
                    <SelectTrigger className="mobile-button">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="salary_deposit">When salary is deposited</SelectItem>
                      <SelectItem value="balance_threshold">When balance reaches threshold</SelectItem>
                      <SelectItem value="monthly_schedule">Monthly schedule</SelectItem>
                      <SelectItem value="weekly_schedule">Weekly schedule</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="type">Action Type</Label>
                  <Select value={rule.type} onValueChange={(value: any) => setRule(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger className="mobile-button">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Transfer percentage</SelectItem>
                      <SelectItem value="fixed_amount">Transfer fixed amount</SelectItem>
                      <SelectItem value="threshold">Transfer excess above threshold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {rule.type === 'percentage' && (
                <div>
                  <Label htmlFor="percentage">Percentage (%)</Label>
                  <Input
                    id="percentage"
                    type="number"
                    value={rule.percentage || ''}
                    onChange={(e) => setRule(prev => ({ ...prev, percentage: Number(e.target.value) }))}
                    placeholder="20"
                    min="1"
                    max="100"
                    className="mobile-text-sm"
                  />
                </div>
              )}

              {rule.type === 'fixed_amount' && (
                <div>
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={rule.amount || ''}
                    onChange={(e) => setRule(prev => ({ ...prev, amount: Number(e.target.value) }))}
                    placeholder="500"
                    min="1"
                    className="mobile-text-sm"
                  />
                </div>
              )}

              {rule.type === 'threshold' && (
                <div>
                  <Label htmlFor="threshold">Balance Threshold ($)</Label>
                  <Input
                    id="threshold"
                    type="number"
                    value={rule.threshold || ''}
                    onChange={(e) => setRule(prev => ({ ...prev, threshold: Number(e.target.value) }))}
                    placeholder="5000"
                    min="1"
                    className="mobile-text-sm"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="source">From Account</Label>
                  <Select value={rule.sourceAccount} onValueChange={(value) => setRule(prev => ({ ...prev, sourceAccount: value }))}>
                    <SelectTrigger className="mobile-button">
                      <SelectValue placeholder="Select source account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name} - {account.institution}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="target">To Account</Label>
                  <Select value={rule.targetAccount} onValueChange={(value) => setRule(prev => ({ ...prev, targetAccount: value }))}>
                    <SelectTrigger className="mobile-button">
                      <SelectValue placeholder="Select target account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.filter(acc => acc.id !== rule.sourceAccount).map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name} - {account.institution}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="frequency">Frequency</Label>
                <Select value={rule.frequency} onValueChange={(value: any) => setRule(prev => ({ ...prev, frequency: value }))}>
                  <SelectTrigger className="mobile-button">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Preview */}
            <Card className="bg-muted/20">
              <CardHeader>
                <CardTitle className="text-sm">Automation Preview</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span>{rule.name || 'Unnamed automation'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">When:</span>
                    <span>{rule.trigger.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Action:</span>
                    <span>
                      Transfer {rule.type === 'percentage' ? `${rule.percentage}%` : 
                               rule.type === 'fixed_amount' ? `$${rule.amount}` : 
                               'excess funds'} from {getAccountDisplayName(rule.sourceAccount)} to {getAccountDisplayName(rule.targetAccount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Frequency:</span>
                    <span>{rule.frequency}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setCurrentStep(1)} className="mobile-button">
                Back
              </Button>
              <Button onClick={handleSave} className="mobile-button">
                Create Automation
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};