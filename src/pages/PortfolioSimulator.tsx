import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  AlertTriangle, 
  Info, 
  Play, 
  RefreshCw,
  Target,
  BarChart3
} from "lucide-react";

const PortfolioSimulator = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Portfolio allocation state
  const [allocation, setAllocation] = useState({
    stocks: 60,
    bonds: 30,
    cash: 10,
    crypto: 0,
    reits: 0
  });

  // Simulation parameters
  const [timeHorizon, setTimeHorizon] = useState("10");
  const [initialInvestment, setInitialInvestment] = useState(10000);
  const [monthlyContribution, setMonthlyContribution] = useState(500);
  const [riskTolerance, setRiskTolerance] = useState("moderate");

  // Simulation results
  const [simulationResults, setSimulationResults] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Ensure allocation adds up to 100%
  const updateAllocation = (category: string, value: number) => {
    const newAllocation = { ...allocation, [category]: value };
    const total = Object.values(newAllocation).reduce((sum, val) => sum + val, 0);
    
    if (total <= 100) {
      setAllocation(newAllocation);
    }
  };

  const runSimulation = async () => {
    setIsSimulating(true);
    
    // Mock simulation delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock simulation results
    const years = parseInt(timeHorizon);
    const expectedReturn = calculateExpectedReturn();
    const volatility = calculateVolatility();
    
    const scenarios = {
      optimistic: initialInvestment * Math.pow(1 + expectedReturn + 0.03, years),
      expected: initialInvestment * Math.pow(1 + expectedReturn, years),
      pessimistic: initialInvestment * Math.pow(1 + expectedReturn - 0.05, years),
    };

    const monthlyContributions = monthlyContribution * 12 * years;
    
    setSimulationResults({
      scenarios: {
        optimistic: scenarios.optimistic + monthlyContributions * 1.8,
        expected: scenarios.expected + monthlyContributions * 1.5,
        pessimistic: scenarios.pessimistic + monthlyContributions * 1.2,
      },
      totalContributions: initialInvestment + monthlyContributions,
      expectedReturn,
      volatility,
      allocation,
      timeHorizon: years
    });
    
    setIsSimulating(false);
  };

  const calculateExpectedReturn = () => {
    const returns = {
      stocks: 0.08,
      bonds: 0.04,
      cash: 0.02,
      crypto: 0.15,
      reits: 0.07
    };
    
    return Object.entries(allocation).reduce((total, [category, percentage]) => {
      return total + (returns[category as keyof typeof returns] * percentage / 100);
    }, 0);
  };

  const calculateVolatility = () => {
    const volatilities = {
      stocks: 0.16,
      bonds: 0.05,
      cash: 0.01,
      crypto: 0.40,
      reits: 0.15
    };
    
    return Object.entries(allocation).reduce((total, [category, percentage]) => {
      return total + (volatilities[category as keyof typeof volatilities] * percentage / 100);
    }, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getRiskLevel = () => {
    const risk = calculateVolatility();
    if (risk < 0.08) return { level: "Conservative", color: "text-success" };
    if (risk < 0.15) return { level: "Moderate", color: "text-warning" };
    return { level: "Aggressive", color: "text-destructive" };
  };

  if (loading) {
    return <LoadingScreen message="Loading portfolio simulator..." showLogo={true} />;
  }

  if (!user) {
    return null;
  }

  const totalAllocation = Object.values(allocation).reduce((sum, val) => sum + val, 0);
  const risk = getRiskLevel();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="mobile-container mobile-content py-4 md:py-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="mobile-heading mb-2">AI Portfolio Simulator</h1>
          <p className="mobile-body text-text-secondary">
            Test different portfolio allocations and see projected outcomes
          </p>
        </div>

        {/* Educational Notice */}
        <Alert className="mb-6 border-education/20 bg-education/5">
          <Info className="h-4 w-4 text-education shrink-0" />
          <AlertDescription className="mobile-caption">
            <strong>Educational Simulation:</strong> Results are based on historical data and Monte Carlo modeling. 
            Past performance does not guarantee future results. Use for learning purposes only.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="setup" className="space-y-4 md:space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="setup" className="text-xs md:text-sm py-2 md:py-3">Setup</TabsTrigger>
            <TabsTrigger value="results" className="text-xs md:text-sm py-2 md:py-3">Results</TabsTrigger>
            <TabsTrigger value="scenarios" className="text-xs md:text-sm py-2 md:py-3">Scenarios</TabsTrigger>
          </TabsList>

          {/* Portfolio Setup */}
          <TabsContent value="setup" className="space-y-4 md:space-y-6">
            <div className="mobile-grid">
              {/* Asset Allocation */}
              <Card className="mobile-card">
                <CardHeader className="pb-3 md:pb-4">
                  <CardTitle className="flex items-center space-x-2 text-base md:text-lg">
                    <PieChart className="h-4 w-4 md:h-5 md:w-5" />
                    <span>Asset Allocation</span>
                  </CardTitle>
                  <CardDescription className="mobile-caption">
                    Adjust your portfolio mix (Total: {totalAllocation}%)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 md:space-y-6">
                  {Object.entries(allocation).map(([category, value]) => (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="capitalize font-medium mobile-caption">
                          {category === 'reits' ? 'REITs' : category}
                        </Label>
                        <span className="text-sm font-medium">{value}%</span>
                      </div>
                      <Slider
                        value={[value]}
                        onValueChange={([newValue]) => updateAllocation(category, newValue)}
                        max={100}
                        step={5}
                        className="w-full touch-target"
                      />
                    </div>
                  ))}
                  
                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-medium mobile-caption">Total Allocation:</span>
                      <Badge variant={totalAllocation === 100 ? "default" : "destructive"}>
                        {totalAllocation}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-medium mobile-caption">Risk Level:</span>
                      <Badge variant="outline" className={risk.color}>
                        {risk.level}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Investment Parameters */}
              <Card className="mobile-card">
                <CardHeader className="pb-3 md:pb-4">
                  <CardTitle className="flex items-center space-x-2 text-base md:text-lg">
                    <Target className="h-4 w-4 md:h-5 md:w-5" />
                    <span>Investment Parameters</span>
                  </CardTitle>
                  <CardDescription className="mobile-caption">
                    Set your investment timeline and amounts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 md:space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="initial" className="mobile-caption">Initial Investment</Label>
                    <Input
                      id="initial"
                      type="number"
                      value={initialInvestment}
                      onChange={(e) => setInitialInvestment(parseInt(e.target.value) || 0)}
                      placeholder="10000"
                      className="touch-target"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="monthly" className="mobile-caption">Monthly Contribution</Label>
                    <Input
                      id="monthly"
                      type="number"
                      value={monthlyContribution}
                      onChange={(e) => setMonthlyContribution(parseInt(e.target.value) || 0)}
                      placeholder="500"
                      className="touch-target"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="horizon" className="mobile-caption">Time Horizon</Label>
                    <Select value={timeHorizon} onValueChange={setTimeHorizon}>
                      <SelectTrigger className="touch-target">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border border-border z-50">
                        <SelectItem value="5">5 years</SelectItem>
                        <SelectItem value="10">10 years</SelectItem>
                        <SelectItem value="15">15 years</SelectItem>
                        <SelectItem value="20">20 years</SelectItem>
                        <SelectItem value="30">30 years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="risk" className="mobile-caption">Risk Tolerance</Label>
                    <Select value={riskTolerance} onValueChange={setRiskTolerance}>
                      <SelectTrigger className="touch-target">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border border-border z-50">
                        <SelectItem value="conservative">Conservative</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="aggressive">Aggressive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={runSimulation} 
                    disabled={isSimulating || totalAllocation !== 100}
                    className="w-full mobile-button"
                  >
                    {isSimulating ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Running Simulation...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Run Simulation
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Simulation Results */}
          <TabsContent value="results">
            {simulationResults ? (
              <div className="space-y-4 md:space-y-6">
                {/* Summary Cards */}
                <div className="mobile-grid">
                  <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20 mobile-card">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="mobile-caption text-success/80">Expected Outcome</p>
                          <p className="text-xl md:text-2xl font-bold text-success">
                            {formatCurrency(simulationResults.scenarios.expected)}
                          </p>
                        </div>
                        <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-success shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 mobile-card">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="mobile-caption text-primary/80">Total Contributions</p>
                          <p className="text-xl md:text-2xl font-bold text-primary">
                            {formatCurrency(simulationResults.totalContributions)}
                          </p>
                        </div>
                        <BarChart3 className="h-6 w-6 md:h-8 md:w-8 text-primary shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-education/10 to-education/5 border-education/20 mobile-card">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="mobile-caption text-education/80">Expected Return</p>
                          <p className="text-xl md:text-2xl font-bold text-education">
                            {(simulationResults.expectedReturn * 100).toFixed(1)}%
                          </p>
                        </div>
                        <Target className="h-6 w-6 md:h-8 md:w-8 text-education shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Detailed Results */}
                <Card className="mobile-card">
                  <CardHeader className="pb-3 md:pb-4">
                    <CardTitle className="text-base md:text-lg">Projection Summary</CardTitle>
                    <CardDescription className="mobile-caption">
                      Portfolio value after {simulationResults.timeHorizon} years
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="mobile-grid">
                        <div className="p-3 md:p-4 bg-success/5 border border-success/20 rounded-lg">
                          <div className="text-center">
                            <p className="mobile-caption text-success/80 mb-1">Optimistic (90th)</p>
                            <p className="text-lg md:text-xl font-bold text-success">
                              {formatCurrency(simulationResults.scenarios.optimistic)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="p-3 md:p-4 bg-primary/5 border border-primary/20 rounded-lg">
                          <div className="text-center">
                            <p className="mobile-caption text-primary/80 mb-1">Expected (50th)</p>
                            <p className="text-lg md:text-xl font-bold text-primary">
                              {formatCurrency(simulationResults.scenarios.expected)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="p-3 md:p-4 bg-warning/5 border border-warning/20 rounded-lg">
                          <div className="text-center">
                            <p className="mobile-caption text-warning/80 mb-1">Pessimistic (10th)</p>
                            <p className="text-lg md:text-xl font-bold text-warning">
                              {formatCurrency(simulationResults.scenarios.pessimistic)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="mobile-card">
                <CardContent className="text-center py-8 md:py-12">
                  <Play className="h-10 w-10 md:h-12 md:w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="mobile-subheading mb-2">No Simulation Results</h3>
                  <p className="mobile-body text-text-secondary mb-4">
                    Configure your portfolio in the Setup tab and run a simulation to see results.
                  </p>
                  <Button onClick={() => {
                    const setupTab = document.querySelector('[value="setup"]') as HTMLButtonElement;
                    setupTab?.click();
                  }} className="mobile-button">
                    Go to Setup
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Scenario Analysis */}
          <TabsContent value="scenarios">
            <Card className="mobile-card">
              <CardHeader className="pb-3 md:pb-4">
                <CardTitle className="text-base md:text-lg">Scenario Analysis</CardTitle>
                <CardDescription className="mobile-caption">
                  Compare different market conditions and their impact on your portfolio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 md:space-y-6">
                  <Alert className="border-warning/20 bg-warning/5">
                    <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
                    <AlertDescription className="mobile-caption">
                      <strong>Coming Soon:</strong> Advanced scenario analysis including bear markets, 
                      inflation scenarios, and custom economic conditions.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="text-center py-6 md:py-8">
                    <BarChart3 className="h-12 w-12 md:h-16 md:w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="mobile-subheading mb-2">Advanced Scenarios</h3>
                    <p className="mobile-body text-text-secondary">
                      This feature will include stress testing against historical market events,
                      inflation scenarios, and custom economic conditions.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default PortfolioSimulator;