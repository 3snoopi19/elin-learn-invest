import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bot, Target, TrendingUp, PieChart, Download, FileText, RefreshCw, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface RoboAdvisorData {
  riskProfile: string;
  goals: string[];
  timeHorizon: string;
  investmentAmount: number;
  recommendedPortfolio: {
    stocks: number;
    bonds: number;
    reits: number;
    commodities: number;
  };
  expectedReturn: number;
  projectedValue: number;
}

const AutomatedInvestingCard = () => {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState({
    riskProfile: '',
    goals: [] as string[],
    timeHorizon: '',
    investmentAmount: 10000
  });
  const [roboData] = useState<RoboAdvisorData>({
    riskProfile: 'moderate',
    goals: ['retirement', 'wealth-building'],
    timeHorizon: '10+ years',
    investmentAmount: 50000,
    recommendedPortfolio: {
      stocks: 70,
      bonds: 20,
      reits: 8,
      commodities: 2
    },
    expectedReturn: 8.2,
    projectedValue: 108400
  });

  const handleGoalToggle = (goal: string) => {
    setWizardData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal) 
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const completeWizard = () => {
    toast.success('Portfolio recommendation generated!');
    setIsWizardOpen(false);
    setCurrentStep(1);
  };

  const exportToPDF = () => {
    toast.success('Exporting portfolio recommendation to PDF...');
  };

  const exportToCSV = () => {
    toast.success('Exporting data to CSV...');
  };

  const triggerRebalance = () => {
    toast.success('Auto-rebalancing triggered! Portfolio will be optimized within 24 hours.');
  };

  const renderWizardStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-text-body">What's your risk tolerance?</Label>
              <Select value={wizardData.riskProfile} onValueChange={(value) => 
                setWizardData(prev => ({ ...prev, riskProfile: value }))
              }>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select risk profile" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conservative">Conservative - Capital preservation</SelectItem>
                  <SelectItem value="moderate">Moderate - Balanced growth</SelectItem>
                  <SelectItem value="aggressive">Aggressive - Maximum growth</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-text-body">Investment Goals (select all that apply)</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {['retirement', 'wealth-building', 'house-purchase', 'education', 'emergency-fund', 'passive-income'].map(goal => (
                  <Button
                    key={goal}
                    variant={wizardData.goals.includes(goal) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleGoalToggle(goal)}
                    className="justify-start"
                  >
                    <CheckCircle className={`w-3 h-3 mr-2 ${wizardData.goals.includes(goal) ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                    {goal.replace('-', ' ').toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-text-body">Investment Timeline</Label>
              <Select value={wizardData.timeHorizon} onValueChange={(value) => 
                setWizardData(prev => ({ ...prev, timeHorizon: value }))
              }>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select time horizon" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-3 years">1-3 years - Short term</SelectItem>
                  <SelectItem value="3-7 years">3-7 years - Medium term</SelectItem>
                  <SelectItem value="7-15 years">7-15 years - Long term</SelectItem>
                  <SelectItem value="15+ years">15+ years - Very long term</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium text-text-body">Initial Investment Amount</Label>
              <Input
                type="number"
                value={wizardData.investmentAmount}
                onChange={(e) => setWizardData(prev => ({ ...prev, investmentAmount: Number(e.target.value) }))}
                className="mt-2"
                placeholder="10000"
              />
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Bot className="w-12 h-12 mx-auto text-primary mb-4" />
              <h4 className="text-lg font-semibold text-text-heading mb-2">Recommended Portfolio</h4>
              <p className="text-sm text-text-secondary">Based on your {wizardData.riskProfile} risk profile</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-card rounded-lg">
                <div className="text-2xl font-bold text-primary">70%</div>
                <div className="text-xs text-text-muted">Stocks</div>
              </div>
              <div className="text-center p-3 bg-card rounded-lg">
                <div className="text-2xl font-bold text-secondary">20%</div>
                <div className="text-xs text-text-muted">Bonds</div>
              </div>
              <div className="text-center p-3 bg-card rounded-lg">
                <div className="text-2xl font-bold text-warning">8%</div>
                <div className="text-xs text-text-muted">REITs</div>
              </div>
              <div className="text-center p-3 bg-card rounded-lg">
                <div className="text-2xl font-bold text-success">2%</div>
                <div className="text-xs text-text-muted">Commodities</div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-sm text-text-secondary">Expected Annual Return</div>
              <div className="text-2xl font-bold text-success">8.2%</div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Card className="bg-card border-border h-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-text-heading">Robo-Advisor</CardTitle>
              <p className="text-sm text-text-muted">Automated portfolio management</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            <RefreshCw className="w-3 h-3 mr-1" />
            Auto-Rebalancing
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Portfolio Status */}
        <div className="bg-background-subtle rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-text-heading">Current Portfolio</h4>
            <Badge variant="secondary" className="text-xs">
              {roboData.riskProfile.toUpperCase()}
            </Badge>
          </div>
          
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="text-center">
              <div className="text-lg font-bold text-primary">{roboData.recommendedPortfolio.stocks}%</div>
              <div className="text-xs text-text-muted">Stocks</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-secondary">{roboData.recommendedPortfolio.bonds}%</div>
              <div className="text-xs text-text-muted">Bonds</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-warning">{roboData.recommendedPortfolio.reits}%</div>
              <div className="text-xs text-text-muted">REITs</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-success">{roboData.recommendedPortfolio.commodities}%</div>
              <div className="text-xs text-text-muted">Commodities</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Expected Return:</span>
            <span className="font-medium text-success">{roboData.expectedReturn}% annually</span>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <Target className="w-6 h-6 mx-auto text-primary mb-2" />
            <div className="text-sm text-text-secondary">Portfolio Value</div>
            <div className="text-lg font-bold text-text-heading">${roboData.projectedValue.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <TrendingUp className="w-6 h-6 mx-auto text-success mb-2" />
            <div className="text-sm text-text-secondary">Next Rebalance</div>
            <div className="text-lg font-bold text-text-heading">15 days</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
            <DialogTrigger asChild>
              <Button variant="default" className="w-full">
                <Bot className="w-4 h-4 mr-2" />
                Setup New Portfolio
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Robo-Advisor Setup - Step {currentStep} of 4</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                <Progress value={(currentStep / 4) * 100} className="w-full" />
                
                {renderWizardStep()}
                
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                  >
                    Previous
                  </Button>
                  {currentStep === 4 ? (
                    <Button onClick={completeWizard}>
                      Generate Portfolio
                    </Button>
                  ) : (
                    <Button onClick={nextStep}>
                      Next
                    </Button>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" size="sm" onClick={triggerRebalance}>
              <RefreshCw className="w-3 h-3 mr-1" />
              Rebalance
            </Button>
            <Button variant="outline" size="sm" onClick={exportToPDF}>
              <FileText className="w-3 h-3 mr-1" />
              PDF
            </Button>
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="w-3 h-3 mr-1" />
              CSV
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AutomatedInvestingCard;