import { CreditInterestVisualization } from "@/components/CreditInterestVisualization";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, TrendingUp, Calendar, DollarSign, AlertTriangle, CheckCircle, Calculator } from "lucide-react";

export default function CreditCoachV2() {
  const mockCards = [
    {
      id: 'card_1',
      name: 'Chase Sapphire Reserve',
      currentBalance: 2847.32,
      statementBalance: 2650.00,
      minimumPayment: 75.00,
      dueDate: '2025-01-15',
      interestRate: 22.99,
      creditLimit: 15000,
      lastPayment: 150.00,
      paymentHistory: 'Excellent'
    },
    {
      id: 'card_2', 
      name: 'Capital One Venture',
      currentBalance: 1245.80,
      statementBalance: 1180.50,
      minimumPayment: 35.00,
      dueDate: '2025-01-18',
      interestRate: 19.99,
      creditLimit: 8000,
      lastPayment: 200.00,
      paymentHistory: 'Good'
    }
  ];

  const getTotalInterestSavings = () => {
    return mockCards.reduce((total, card) => {
      const monthlyInterest = card.statementBalance * (card.interestRate / 100 / 12);
      return total + monthlyInterest;
    }, 0);
  };

  const getRecommendations = () => [
    {
      icon: <CheckCircle className="w-5 h-5 text-success" />,
      title: "Pay Statement Balances",
      description: `Pay full statement balances to save $${getTotalInterestSavings().toFixed(2)} in monthly interest`,
      priority: "High",
      amount: mockCards.reduce((sum, card) => sum + card.statementBalance, 0)
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-primary" />,
      title: "Credit Utilization",
      description: "Keep total utilization below 30% for optimal credit score",
      priority: "Medium", 
      amount: null
    },
    {
      icon: <Calendar className="w-5 h-5 text-warning" />,
      title: "Set Up AutoPay",
      description: "Automate payments to never miss a due date",
      priority: "Medium",
      amount: null
    }
  ];

  return (
    <div className="px-6 py-8 md:px-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-xl">
            <CreditCard className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Credit Interest Coach</h1>
            <p className="text-sm text-muted-foreground">
              Minimize interest and optimize your credit health
            </p>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Total Impact Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Calculator className="w-5 h-5" />
              This Month's Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center p-4 bg-success/10 rounded-xl border border-success/20">
                <div className="text-2xl font-bold text-success">
                  ${getTotalInterestSavings().toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">Monthly Interest Savings</div>
                <div className="text-xs text-success mt-1">By paying statement balances</div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-card rounded-lg border">
                  <div className="font-semibold text-sm">
                    ${mockCards.reduce((sum, card) => sum + card.statementBalance, 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">To Pay</div>
                </div>
                <div className="text-center p-3 bg-card rounded-lg border">
                  <div className="font-semibold text-sm">
                    ${mockCards.reduce((sum, card) => sum + card.minimumPayment, 0).toFixed(0)}
                  </div>
                  <div className="text-xs text-muted-foreground">Minimum</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations Card */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <TrendingUp className="w-5 h-5" />
              Smart Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getRecommendations().map((rec, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg border bg-card/50 min-h-[44px]">
                  <div className="flex-shrink-0 mt-0.5">{rec.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                      <h4 className="font-medium text-sm">{rec.title}</h4>
                      <Badge variant={rec.priority === 'High' ? 'default' : 'secondary'} className="text-xs w-fit">
                        {rec.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{rec.description}</p>
                  </div>
                  {rec.amount && (
                    <div className="text-right flex-shrink-0">
                      <div className="font-semibold text-sm">${rec.amount.toLocaleString()}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Credit Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {mockCards.map((card) => (
          <Card key={card.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm md:text-base font-semibold truncate">{card.name}</span>
                </div>
                <Badge variant="outline" className="w-fit">
                  {((card.currentBalance / card.creditLimit) * 100).toFixed(1)}% Used
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CreditInterestVisualization card={card} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Center */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <AlertTriangle className="w-5 h-5 text-warning" />
            Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button className="h-auto p-4 flex flex-col items-center gap-2 min-h-[44px]" variant="default">
              <DollarSign className="w-6 h-6" />
              <div className="text-center">
                <div className="font-medium text-sm">Pay Statements</div>
                <div className="text-xs opacity-80">Avoid all interest</div>
              </div>
            </Button>
            <Button className="h-auto p-4 flex flex-col items-center gap-2 min-h-[44px]" variant="outline">
              <Calendar className="w-6 h-6" />
              <div className="text-center">
                <div className="font-medium text-sm">Set AutoPay</div>
                <div className="text-xs opacity-80">Never miss payments</div>
              </div>
            </Button>
            <Button className="h-auto p-4 flex flex-col items-center gap-2 min-h-[44px]" variant="secondary">
              <Calculator className="w-6 h-6" />
              <div className="text-center">
                <div className="font-medium text-sm">Payment Calculator</div>
                <div className="text-xs opacity-80">Plan payoff strategy</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
