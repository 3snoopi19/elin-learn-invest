import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, BarChart3, Target, AlertTriangle, CheckCircle, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface PortfolioData {
  current: {
    stocks: number;
    bonds: number;
    reits: number;
    international: number;
    expectedReturn: number;
    risk: number;
  };
  optimized: {
    stocks: number;
    bonds: number;
    reits: number;
    international: number;
    expectedReturn: number;
    risk: number;
  };
  improvementPotential: {
    returnIncrease: number;
    riskReduction: number;
    sharpeRatio: number;
  };
}

const OptimizationChart = ({ data, type }: { data: any; type: 'current' | 'optimized' }) => {
  const chartData = [
    { name: 'Stocks', value: data.stocks, color: '#16a34a' },
    { name: 'Bonds', value: data.bonds, color: '#3b82f6' },
    { name: 'REITs', value: data.reits, color: '#f59e0b' },
    { name: 'International', value: data.international, color: '#8b5cf6' }
  ];

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-text-heading mb-2">
        {type === 'current' ? 'Current Allocation' : 'Optimized Allocation'}
      </div>
      {chartData.map((item) => (
        <div key={item.name} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-text-body">{item.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-20 bg-muted rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all duration-500"
                style={{ 
                  width: `${item.value}%`, 
                  backgroundColor: item.color 
                }}
              />
            </div>
            <span className="text-sm font-medium text-text-heading w-8">{item.value}%</span>
          </div>
        </div>
      ))}
    </div>
  );
};

const PortfolioOptimizationCard = () => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  const [portfolioData] = useState<PortfolioData>({
    current: {
      stocks: 65,
      bonds: 25,
      reits: 5,
      international: 5,
      expectedReturn: 7.2,
      risk: 12.8
    },
    optimized: {
      stocks: 58,
      bonds: 22,
      reits: 12,
      international: 8,
      expectedReturn: 8.1,
      risk: 11.2
    },
    improvementPotential: {
      returnIncrease: 0.9,
      riskReduction: 1.6,
      sharpeRatio: 0.42
    }
  });

  const runOptimization = async () => {
    setIsOptimizing(true);
    toast.info('Running portfolio optimization analysis...');
    
    // Simulate optimization process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsOptimizing(false);
    toast.success('Portfolio optimization complete! Review recommendations below.');
  };

  const applyOptimization = () => {
    toast.success('Optimization applied! Your portfolio will be rebalanced within 24 hours.');
  };

  const improvements = [
    {
      metric: 'Expected Return',
      current: `${portfolioData.current.expectedReturn}%`,
      optimized: `${portfolioData.optimized.expectedReturn}%`,
      improvement: `+${portfolioData.improvementPotential.returnIncrease}%`,
      positive: true
    },
    {
      metric: 'Portfolio Risk',
      current: `${portfolioData.current.risk}%`,
      optimized: `${portfolioData.optimized.risk}%`,
      improvement: `-${portfolioData.improvementPotential.riskReduction}%`,
      positive: true
    },
    {
      metric: 'Sharpe Ratio',
      current: '0.56',
      optimized: '0.98',
      improvement: `+${portfolioData.improvementPotential.sharpeRatio}`,
      positive: true
    }
  ];

  return (
    <Card className="bg-card border-border h-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-text-heading">Portfolio Optimization</CardTitle>
              <p className="text-sm text-text-muted">AI-powered allocation analysis</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            <Zap className="w-3 h-3 mr-1" />
            AI Powered
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Detailed Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4 mt-4">
            {/* Key Metrics */}
            <div className="bg-background-subtle rounded-lg p-4">
              <h4 className="font-medium text-text-heading mb-3">Optimization Potential</h4>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <TrendingUp className="w-5 h-5 mx-auto text-success mb-1" />
                  <div className="text-lg font-bold text-success">+{portfolioData.improvementPotential.returnIncrease}%</div>
                  <div className="text-xs text-text-muted">Return Boost</div>
                </div>
                <div className="text-center">
                  <Target className="w-5 h-5 mx-auto text-primary mb-1" />
                  <div className="text-lg font-bold text-primary">-{portfolioData.improvementPotential.riskReduction}%</div>
                  <div className="text-xs text-text-muted">Risk Reduction</div>
                </div>
                <div className="text-center">
                  <CheckCircle className="w-5 h-5 mx-auto text-secondary mb-1" />
                  <div className="text-lg font-bold text-secondary">+{portfolioData.improvementPotential.sharpeRatio}</div>
                  <div className="text-xs text-text-muted">Sharpe Ratio</div>
                </div>
              </div>

              <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-warning">Recommendation</div>
                    <div className="text-xs text-text-secondary mt-1">
                      Increase REIT allocation to 12% and international exposure to 8% for better diversification.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <Button 
                onClick={runOptimization} 
                className="w-full" 
                disabled={isOptimizing}
              >
                {isOptimizing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Run Optimization Analysis
                  </>
                )}
              </Button>
              
              <Button variant="outline" onClick={applyOptimization} className="w-full">
                <CheckCircle className="w-4 h-4 mr-2" />
                Apply Recommended Changes
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4 mt-4">
            {/* Side by Side Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-background-subtle rounded-lg p-4">
                <OptimizationChart data={portfolioData.current} type="current" />
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Expected Return:</span>
                    <span className="font-medium text-text-heading">{portfolioData.current.expectedReturn}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Risk Level:</span>
                    <span className="font-medium text-text-heading">{portfolioData.current.risk}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <OptimizationChart data={portfolioData.optimized} type="optimized" />
                <div className="mt-3 pt-3 border-t border-primary/20">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Expected Return:</span>
                    <span className="font-medium text-success">{portfolioData.optimized.expectedReturn}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Risk Level:</span>
                    <span className="font-medium text-primary">{portfolioData.optimized.risk}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Improvements */}
            <div className="space-y-3">
              <h4 className="font-medium text-text-heading">Performance Improvements</h4>
              {improvements.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-background-subtle rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium text-text-heading">{item.metric}</div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-text-muted">{item.current}</span>
                    <span className="text-text-muted">→</span>
                    <span className="font-medium text-text-heading">{item.optimized}</span>
                    <Badge variant={item.positive ? "default" : "destructive"} className="text-xs">
                      {item.improvement}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PortfolioOptimizationCard;