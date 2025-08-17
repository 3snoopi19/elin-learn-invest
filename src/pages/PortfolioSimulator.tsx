import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from "recharts";
import { TrendingUp, TrendingDown, AlertTriangle, Target, Brain, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface PortfolioAllocation {
  stocks: number;
  bonds: number;
  crypto: number;
  reits: number;
  commodities: number;
}

interface ScenarioData {
  name: string;
  description: string;
  icon: any;
  color: string;
  expectedReturn: number;
  volatility: number;
  riskLevel: "Low" | "Medium" | "High";
}

interface SimulationResult {
  year: number;
  conservative: number;
  moderate: number;
  aggressive: number;
  bestCase: number;
  worstCase: number;
}

const scenarios: ScenarioData[] = [
  {
    name: "Bull Market",
    description: "Strong economic growth, rising markets",
    icon: TrendingUp,
    color: "hsl(var(--success))",
    expectedReturn: 12,
    volatility: 15,
    riskLevel: "Medium"
  },
  {
    name: "Bear Market",
    description: "Economic downturn, declining markets",
    icon: TrendingDown,
    color: "hsl(var(--destructive))",
    expectedReturn: -8,
    volatility: 25,
    riskLevel: "High"
  },
  {
    name: "Recession",
    description: "Severe economic contraction",
    icon: AlertTriangle,
    color: "hsl(var(--warning))",
    expectedReturn: -15,
    volatility: 35,
    riskLevel: "High"
  },
  {
    name: "Stable Growth",
    description: "Steady, moderate economic expansion",
    icon: Target,
    color: "hsl(var(--primary))",
    expectedReturn: 7,
    volatility: 10,
    riskLevel: "Low"
  }
];

const PortfolioSimulator = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [allocation, setAllocation] = useState<PortfolioAllocation>({
    stocks: 60,
    bonds: 30,
    crypto: 5,
    reits: 3,
    commodities: 2
  });
  
  const [investmentAmount, setInvestmentAmount] = useState<number[]>([10000]);
  const [timeHorizon, setTimeHorizon] = useState<number[]>([10]);
  const [selectedScenario, setSelectedScenario] = useState("Bull Market");
  const [simulationData, setSimulationData] = useState<SimulationResult[]>([]);
  const [aiInsights, setAiInsights] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    generateSimulation();
  }, [allocation, investmentAmount, timeHorizon, selectedScenario]);

  const generateSimulation = () => {
    setIsLoading(true);
    
    // Simulate portfolio performance over time
    const scenario = scenarios.find(s => s.name === selectedScenario)!;
    const years = timeHorizon[0];
    const initialAmount = investmentAmount[0];
    
    const data: SimulationResult[] = [];
    
    for (let year = 0; year <= years; year++) {
      // Calculate different portfolio scenarios based on allocation
      const conservativeReturn = Math.pow(1 + (scenario.expectedReturn * 0.6) / 100, year);
      const moderateReturn = Math.pow(1 + scenario.expectedReturn / 100, year);
      const aggressiveReturn = Math.pow(1 + (scenario.expectedReturn * 1.4) / 100, year);
      
      // Add volatility for best/worst case
      const volatilityFactor = scenario.volatility / 100;
      const bestCaseReturn = Math.pow(1 + (scenario.expectedReturn + volatilityFactor * 100) / 100, year);
      const worstCaseReturn = Math.pow(1 + (scenario.expectedReturn - volatilityFactor * 100) / 100, year);
      
      data.push({
        year,
        conservative: Math.round(initialAmount * conservativeReturn),
        moderate: Math.round(initialAmount * moderateReturn),
        aggressive: Math.round(initialAmount * aggressiveReturn),
        bestCase: Math.round(initialAmount * bestCaseReturn),
        worstCase: Math.max(0, Math.round(initialAmount * worstCaseReturn))
      });
    }
    
    setSimulationData(data);
    generateAIInsights(scenario);
    setIsLoading(false);
  };

  const generateAIInsights = (scenario: ScenarioData) => {
    // AI-powered insights based on allocation and scenario
    const riskScore = (allocation.stocks * 0.8 + allocation.crypto * 1.0 + allocation.commodities * 0.6) / 100;
    
    let insights = `Based on your ${allocation.stocks}% stock allocation in a ${scenario.name} scenario: `;
    
    if (riskScore > 0.7) {
      insights += "Your portfolio has high growth potential but increased volatility. Consider reducing exposure to high-risk assets if you're risk-averse.";
    } else if (riskScore < 0.3) {
      insights += "Your conservative allocation provides stability but may limit growth. Consider slightly increasing equity exposure for better long-term returns.";
    } else {
      insights += "Your balanced allocation offers a good risk-return trade-off suitable for most investors.";
    }
    
    setAiInsights(insights);
  };

  const getAllocationData = () => {
    return [
      { name: "Stocks", value: allocation.stocks, color: "hsl(var(--primary))" },
      { name: "Bonds", value: allocation.bonds, color: "hsl(var(--secondary))" },
      { name: "Crypto", value: allocation.crypto, color: "hsl(var(--education))" },
      { name: "REITs", value: allocation.reits, color: "hsl(var(--success))" },
      { name: "Commodities", value: allocation.commodities, color: "hsl(var(--warning))" }
    ];
  };

  const handleAllocationChange = (asset: keyof PortfolioAllocation, value: number[]) => {
    const newValue = value[0];
    const currentTotal = Object.values(allocation).reduce((sum, val) => sum + val, 0);
    const otherAssetsTotal = currentTotal - allocation[asset];
    
    if (otherAssetsTotal + newValue <= 100) {
      setAllocation(prev => ({
        ...prev,
        [asset]: newValue
      }));
    }
  };

  const normalizeAllocation = () => {
    const total = Object.values(allocation).reduce((sum, val) => sum + val, 0);
    if (total !== 100) {
      const factor = 100 / total;
      setAllocation(prev => ({
        stocks: Math.round(prev.stocks * factor),
        bonds: Math.round(prev.bonds * factor),
        crypto: Math.round(prev.crypto * factor),
        reits: Math.round(prev.reits * factor),
        commodities: Math.round(prev.commodities * factor)
      }));
      toast("Portfolio allocation normalized to 100%");
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-education bg-clip-text text-transparent">
              AI Portfolio Simulator
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Use AI-powered analysis to simulate your portfolio performance across different market scenarios and optimize your investment strategy.
            </p>
          </div>

          <Tabs defaultValue="simulator" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="simulator">Portfolio Simulator</TabsTrigger>
              <TabsTrigger value="scenarios">Scenario Analysis</TabsTrigger>
              <TabsTrigger value="insights">AI Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="simulator" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Controls */}
                <div className="lg:col-span-1 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Portfolio Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Investment Amount */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Initial Investment</label>
                        <div className="text-2xl font-bold text-primary">
                          ${investmentAmount[0].toLocaleString()}
                        </div>
                        <Slider
                          value={investmentAmount}
                          onValueChange={setInvestmentAmount}
                          min={1000}
                          max={1000000}
                          step={1000}
                          className="mt-2"
                        />
                      </div>

                      {/* Time Horizon */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Time Horizon</label>
                        <div className="text-xl font-semibold">
                          {timeHorizon[0]} years
                        </div>
                        <Slider
                          value={timeHorizon}
                          onValueChange={setTimeHorizon}
                          min={1}
                          max={30}
                          step={1}
                          className="mt-2"
                        />
                      </div>

                      {/* Market Scenario */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Market Scenario</label>
                        <Select value={selectedScenario} onValueChange={setSelectedScenario}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {scenarios.map((scenario) => (
                              <SelectItem key={scenario.name} value={scenario.name}>
                                <div className="flex items-center gap-2">
                                  <scenario.icon className="h-4 w-4" />
                                  {scenario.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Asset Allocation */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Asset Allocation</CardTitle>
                      <CardDescription>
                        Adjust your portfolio allocation (Total: {Object.values(allocation).reduce((sum, val) => sum + val, 0)}%)
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {Object.entries(allocation).map(([asset, value]) => (
                        <div key={asset} className="space-y-2">
                          <div className="flex justify-between">
                            <label className="text-sm font-medium capitalize">{asset}</label>
                            <span className="text-sm font-semibold">{value}%</span>
                          </div>
                          <Slider
                            value={[value]}
                            onValueChange={(newValue) => handleAllocationChange(asset as keyof PortfolioAllocation, newValue)}
                            min={0}
                            max={100}
                            step={1}
                          />
                        </div>
                      ))}
                      <Button onClick={normalizeAllocation} variant="outline" className="w-full">
                        Normalize to 100%
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Performance Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Portfolio Performance Projection</CardTitle>
                      <CardDescription>
                        Projected portfolio value over {timeHorizon[0]} years in {selectedScenario} scenario
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={simulationData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="year" />
                            <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                            <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, ""]} />
                            <Area
                              type="monotone"
                              dataKey="bestCase"
                              stackId="1"
                              stroke="hsl(var(--success))"
                              fill="hsl(var(--success))"
                              fillOpacity={0.1}
                            />
                            <Area
                              type="monotone"
                              dataKey="aggressive"
                              stackId="2"
                              stroke="hsl(var(--education))"
                              fill="hsl(var(--education))"
                              fillOpacity={0.3}
                            />
                            <Area
                              type="monotone"
                              dataKey="moderate"
                              stackId="3"
                              stroke="hsl(var(--primary))"
                              fill="hsl(var(--primary))"
                              fillOpacity={0.5}
                            />
                            <Area
                              type="monotone"
                              dataKey="conservative"
                              stackId="4"
                              stroke="hsl(var(--secondary))"
                              fill="hsl(var(--secondary))"
                              fillOpacity={0.7}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Allocation Pie Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Current Allocation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={getAllocationData()}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {getAllocationData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="scenarios" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {scenarios.map((scenario) => (
                  <Card key={scenario.name} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedScenario(scenario.name)}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <scenario.icon className="h-5 w-5" style={{ color: scenario.color }} />
                        {scenario.name}
                        {selectedScenario === scenario.name && (
                          <Badge variant="default">Selected</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{scenario.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="font-medium">Expected Return</div>
                          <div className="text-lg font-bold" style={{ color: scenario.expectedReturn >= 0 ? "hsl(var(--success))" : "hsl(var(--destructive))" }}>
                            {scenario.expectedReturn > 0 ? "+" : ""}{scenario.expectedReturn}%
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">Volatility</div>
                          <div className="text-lg font-bold text-warning">
                            {scenario.volatility}%
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">Risk Level</div>
                          <Badge variant={scenario.riskLevel === "High" ? "destructive" : scenario.riskLevel === "Medium" ? "default" : "secondary"}>
                            {scenario.riskLevel}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    AI-Powered Portfolio Insights
                  </CardTitle>
                  <CardDescription>
                    Personalized recommendations based on your portfolio allocation and selected scenario
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-primary mt-1" />
                      <p className="text-sm leading-relaxed">{aiInsights}</p>
                    </div>
                  </div>
                  
                  {/* Performance Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center space-y-2">
                          <div className="text-2xl font-bold text-primary">
                            {simulationData.length > 0 ? ((simulationData[simulationData.length - 1]?.moderate / investmentAmount[0] - 1) * 100).toFixed(1) : 0}%
                          </div>
                          <div className="text-sm text-muted-foreground">Total Return</div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center space-y-2">
                          <div className="text-2xl font-bold text-education">
                            {timeHorizon[0] > 0 ? (((simulationData[simulationData.length - 1]?.moderate / investmentAmount[0]) ** (1/timeHorizon[0]) - 1) * 100).toFixed(1) : 0}%
                          </div>
                          <div className="text-sm text-muted-foreground">Annual Return</div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center space-y-2">
                          <div className="text-2xl font-bold text-success">
                            ${simulationData.length > 0 ? simulationData[simulationData.length - 1]?.moderate.toLocaleString() : 0}
                          </div>
                          <div className="text-sm text-muted-foreground">Final Value</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PortfolioSimulator;