import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Target,
  ArrowRight,
  TrendingUp,
  Calendar,
  Percent,
  DollarSign,
  Edit,
  Trash2,
  Play
} from 'lucide-react';
import { toast } from 'sonner';

interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit';
  balance: number;
  institution: string;
}

interface Rule {
  id: string;
  type: 'percentage' | 'fixed' | 'conditional';
  name: string;
  description: string;
  config: {
    percentage?: number;
    amount?: number;
    targetAccount?: string;
    sourceAccount?: string;
    condition?: string;
    daysBeforeDue?: number;
  };
  enabled: boolean;
}

interface SmartRulesManagerProps {
  accounts: Account[];
  rules: Rule[];
  onRulesChange: (rules: Rule[]) => void;
  onSimulate: () => void;
  simulation: any;
}

export const SmartRulesManager: React.FC<SmartRulesManagerProps> = ({
  accounts,
  rules,
  onRulesChange,
  onSimulate,
  simulation,
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newRule, setNewRule] = useState({
    type: 'percentage',
    name: '',
    sourceAccount: '',
    targetAccount: '',
    percentage: 20,
    amount: 100,
    condition: 'paycheck',
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(amount));
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const handleAddRule = () => {
    const rule: Rule = {
      id: `rule_${Date.now()}`,
      type: newRule.type as 'percentage' | 'fixed' | 'conditional',
      name: newRule.name,
      description: generateRuleDescription(newRule),
      config: {
        sourceAccount: newRule.sourceAccount,
        targetAccount: newRule.targetAccount,
        ...(newRule.type === 'percentage' ? { percentage: newRule.percentage } : { amount: newRule.amount }),
      },
      enabled: true,
    };

    onRulesChange([...rules, rule]);
    setIsAddDialogOpen(false);
    setNewRule({
      type: 'percentage',
      name: '',
      sourceAccount: '',
      targetAccount: '',
      percentage: 20,
      amount: 100,
      condition: 'paycheck',
    });
    toast.success('Smart rule added successfully!');
  };

  const generateRuleDescription = (rule: any) => {
    const sourceAccount = accounts.find(a => a.id === rule.sourceAccount)?.name || 'Account';
    const targetAccount = accounts.find(a => a.id === rule.targetAccount)?.name || 'Account';
    
    if (rule.type === 'percentage') {
      return `Transfer ${rule.percentage}% from ${sourceAccount} to ${targetAccount}`;
    } else {
      return `Transfer $${rule.amount} from ${sourceAccount} to ${targetAccount}`;
    }
  };

  const handleDeleteRule = (ruleId: string) => {
    onRulesChange(rules.filter(rule => rule.id !== ruleId));
    toast.success('Rule deleted successfully!');
  };

  const toggleRuleEnabled = (ruleId: string) => {
    onRulesChange(rules.map(rule => 
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  const getRuleIcon = (type: string) => {
    switch (type) {
      case 'percentage':
        return <Percent className="h-4 w-4" />;
      case 'fixed':
        return <DollarSign className="h-4 w-4" />;
      case 'conditional':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Smart Rules
          </CardTitle>
          <CardDescription>
            Create automated rules to optimize your money flow
          </CardDescription>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create Smart Rule</DialogTitle>
              <DialogDescription>
                Set up an automated rule to manage your money flow.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="rule-name">Rule Name</Label>
                <Input
                  id="rule-name"
                  placeholder="e.g., Save for emergency fund"
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="rule-type">Rule Type</Label>
                <Select value={newRule.type} onValueChange={(value) => setNewRule({ ...newRule, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage Transfer</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="source-account">From Account</Label>
                  <Select value={newRule.sourceAccount} onValueChange={(value) => setNewRule({ ...newRule, sourceAccount: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="target-account">To Account</Label>
                  <Select value={newRule.targetAccount} onValueChange={(value) => setNewRule({ ...newRule, targetAccount: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {newRule.type === 'percentage' ? (
                <div className="grid gap-2">
                  <Label htmlFor="percentage">Percentage (%)</Label>
                  <Input
                    id="percentage"
                    type="number"
                    min="1"
                    max="100"
                    value={newRule.percentage}
                    onChange={(e) => setNewRule({ ...newRule, percentage: parseInt(e.target.value) || 0 })}
                  />
                </div>
              ) : (
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="1"
                    value={newRule.amount}
                    onChange={(e) => setNewRule({ ...newRule, amount: parseInt(e.target.value) || 0 })}
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddRule}
                disabled={!newRule.name || !newRule.sourceAccount || !newRule.targetAccount}
              >
                Create Rule
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 mb-6">
          {rules.map((rule) => (
            <div key={rule.id} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-muted">
                    {getRuleIcon(rule.type)}
                  </div>
                  <div>
                    <h3 className="font-medium">{rule.name}</h3>
                    <p className="text-sm text-muted-foreground">{rule.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={rule.enabled ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => toggleRuleEnabled(rule.id)}
                  >
                    {rule.enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDeleteRule(rule.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          {rules.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No smart rules created yet</p>
              <p className="text-sm">Add your first rule to automate your money flow</p>
            </div>
          )}
        </div>

        <Separator className="mb-6" />

        <div className="flex justify-center">
          <Button onClick={onSimulate} className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Run Simulation
          </Button>
        </div>

        {simulation && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Simulation Results</h3>
            </div>
            
            <div className="grid gap-4">
              <div className="p-4 border rounded-lg bg-muted/50">
                <h4 className="font-medium mb-3">Projected Account Balances (30 days)</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Checking</p>
                    <p className="font-medium text-lg">{formatCurrency(simulation.projectedBalances.checking)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Savings</p>
                    <p className="font-medium text-lg text-green-600">{formatCurrency(simulation.projectedBalances.savings)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Credit Card</p>
                    <p className="font-medium text-lg text-red-600">{formatCurrency(simulation.projectedBalances.credit)}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Suggested Moves</h4>
                {simulation.suggestedMoves.map((move: any, index: number) => (
                  <div key={index} className="p-4 border rounded-lg bg-muted/50 mb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{formatDate(move.date)}: Move {formatCurrency(move.amount)}</p>
                        <p className="text-sm text-muted-foreground">To {move.target}</p>
                        <p className="text-xs text-muted-foreground mt-1">{move.rationale}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};