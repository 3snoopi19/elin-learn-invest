import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  CreditCard, 
  Building2, 
  PiggyBank, 
  ArrowRight, 
  RefreshCw, 
  Plus, 
  Target,
  AlertTriangle,
  Calendar,
  DollarSign,
  TrendingUp,
  Info
} from "lucide-react";
import { toast } from "sonner";

// Mock data for simulation
const mockAccounts = [
  {
    id: "acc_1",
    name: "Chase Checking",
    type: "checking",
    balance: 3250.75,
    institution: "Chase Bank",
    lastSynced: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
  },
  {
    id: "acc_2", 
    name: "Savings Account",
    type: "savings",
    balance: 8500.00,
    institution: "Chase Bank",
    lastSynced: new Date(Date.now() - 1000 * 60 * 30)
  },
  {
    id: "acc_3",
    name: "Freedom Unlimited",
    type: "credit",
    balance: -1245.80,
    institution: "Chase Bank",
    lastSynced: new Date(Date.now() - 1000 * 60 * 30),
    statementBalance: 1245.80,
    minPayment: 35.00,
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15) // 15 days from now
  }
];

const mockRules = [
  {
    id: "rule_1",
    type: "percentage",
    description: "Save 20% of paycheck",
    config: { percentage: 20, targetAccount: "acc_2" }
  },
  {
    id: "rule_2", 
    type: "fixed",
    description: "Pay credit card minimum + $50",
    config: { amount: 85, targetAccount: "acc_3", daysBeforeDue: 5 }
  }
];

const Router = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [accounts, setAccounts] = useState(mockAccounts);
  const [rules, setRules] = useState(mockRules);
  const [timeframe, setTimeframe] = useState("30");
  const [isConnecting, setIsConnecting] = useState(false);
  const [simulation, setSimulation] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const handleConnectAccount = async () => {
    setIsConnecting(true);
    // Simulate Plaid connection
    setTimeout(() => {
      toast.success("Account connected successfully!");
      setIsConnecting(false);
    }, 2000);
  };

  const handleRefreshAccounts = () => {
    toast.success("Accounts refreshed!");
    setAccounts(prev => prev.map(acc => ({
      ...acc,
      lastSynced: new Date()
    })));
  };

  const handleSimulateMonth = () => {
    const projectedBalances = {
      checking: 2890.50,
      savings: 8920.00,
      credit: -1160.80
    };
    
    const suggestedMoves = [
      {
        date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
        target: "Savings Account", 
        amount: 420.00,
        rationale: "20% of biweekly paycheck ($2,100)"
      },
      {
        date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10),
        target: "Freedom Unlimited",
        amount: 85.00, 
        rationale: "Minimum payment + $50 buffer"
      }
    ];

    setSimulation({ projectedBalances, suggestedMoves });
    toast.success("Simulation completed!");
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(amount));
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Money Flow Router</h1>
            <p className="text-muted-foreground mb-4">
              Visualize your cashflow and get Smart Rule suggestions.
            </p>
            
            <Alert className="mb-6">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Educational suggestions only. ELIN does not move money in v1.
              </AlertDescription>
            </Alert>
          </div>

          <Tabs defaultValue="accounts" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="accounts">Connect Accounts</TabsTrigger>
              <TabsTrigger value="map">Money Map</TabsTrigger>
              <TabsTrigger value="rules">Smart Rules</TabsTrigger>
            </TabsList>

            {/* Step 1: Connect Accounts */}
            <TabsContent value="accounts" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Connected Accounts
                    </CardTitle>
                    <CardDescription>
                      Read-only access to view balances and transactions
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={handleRefreshAccounts}
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Refresh
                    </Button>
                    <Button 
                      onClick={handleConnectAccount}
                      disabled={isConnecting}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      {isConnecting ? "Connecting..." : "Connect Account"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {accounts.map((account) => (
                      <div 
                        key={account.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-full bg-muted">
                            {account.type === 'checking' && <DollarSign className="h-4 w-4" />}
                            {account.type === 'savings' && <PiggyBank className="h-4 w-4" />}
                            {account.type === 'credit' && <CreditCard className="h-4 w-4" />}
                          </div>
                          <div>
                            <h3 className="font-medium">{account.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {account.institution} • {account.type}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${account.balance < 0 ? 'text-destructive' : 'text-foreground'}`}>
                            {formatCurrency(account.balance)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Last synced {formatDate(account.lastSynced)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Credit Card Helper */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Credit Card Interest Helper
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {accounts.filter(acc => acc.type === 'credit').map((card) => (
                      <div key={card.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-medium">{card.name}</h3>
                          <Badge variant="outline">Due {formatDate(card.dueDate)}</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Min Payment</p>
                            <p className="font-medium">{formatCurrency(card.minPayment)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Statement Balance</p>
                            <p className="font-medium">{formatCurrency(card.statementBalance)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Avoid Interest</p>
                            <p className="font-semibold text-green-600">
                              Pay {formatCurrency(card.statementBalance)} by {formatDate(card.dueDate)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Step 2: Money Map */}
            <TabsContent value="map" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Money Flow Visualization</CardTitle>
                    <CardDescription>
                      See how money flows between your accounts
                    </CardDescription>
                  </div>
                  <Select value={timeframe} onValueChange={setTimeframe}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">Last 30 days</SelectItem>
                      <SelectItem value="90">Last 90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Money Map visualization coming soon</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Will show income flows, bill payments, and transfers
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Step 3: Smart Rules */}
            <TabsContent value="rules" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Smart Rules
                    </CardTitle>
                    <CardDescription>
                      Create rules to automatically optimize your money flow
                    </CardDescription>
                  </div>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Rule
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 mb-6">
                    {rules.map((rule) => (
                      <div key={rule.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{rule.description}</h3>
                            <p className="text-sm text-muted-foreground">
                              {rule.type === 'percentage' && `${rule.config.percentage}% to ${accounts.find(a => a.id === rule.config.targetAccount)?.name}`}
                              {rule.type === 'fixed' && `$${rule.config.amount} to ${accounts.find(a => a.id === rule.config.targetAccount)?.name}`}
                            </p>
                          </div>
                          <Badge variant="secondary">{rule.type}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="mb-6" />

                  <div className="flex justify-center">
                    <Button onClick={handleSimulateMonth} className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Simulate Next Month
                    </Button>
                  </div>

                  {simulation && (
                    <div className="mt-6 space-y-4">
                      <h3 className="font-medium">Suggested Moves</h3>
                      {simulation.suggestedMoves.map((move, index) => (
                        <div key={index} className="p-4 border rounded-lg bg-muted/50">
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
                  )}
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

export default Router;