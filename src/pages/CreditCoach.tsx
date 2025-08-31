import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CreditInterestVisualization } from "@/components/CreditInterestVisualization";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, TrendingUp, Calendar, DollarSign, AlertTriangle, CheckCircle, Calculator } from "lucide-react";
import { MobileOptimizedLayout } from "@/components/ui/MobileOptimizedLayout";

export default function CreditCoach() {
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
    <MobileOptimizedLayout>
      <main className="container mx-auto mobile-container py-6 md:py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CreditCard className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-text-heading">Credit Interest Coach</h1>
              <p className="text-text-secondary">
                Visual payment recommendations to minimize interest and optimize your credit health
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Total Overview */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                This Month's Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center p-4 bg-success/10 rounded-lg border border-success/20">
                  <div className="text-2xl font-bold text-success">
                    ${getTotalInterestSavings().toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Monthly Interest Savings
                  </div>
                  <div className="text-xs text-success mt-1">
                    By paying statement balances
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-card rounded-lg border">
                    <div className="text-lg font-semibold">
                      ${mockCards.reduce((sum, card) => sum + card.statementBalance, 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">To Pay</div>
                  </div>
                  <div className="text-center p-3 bg-card rounded-lg border">
                    <div className="text-lg font-semibold">
                      ${mockCards.reduce((sum, card) => sum + card.minimumPayment, 0).toFixed(0)}
                    </div>
                    <div className="text-xs text-muted-foreground">Minimum</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Recommendations */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Smart Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getRecommendations().map((rec, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg border bg-card/50">
                    {rec.icon}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">{rec.title}</h4>
                        <Badge variant={rec.priority === 'High' ? 'default' : 'secondary'} className="text-xs">
                          {rec.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
                    </div>
                    {rec.amount && (
                      <div className="text-right">
                        <div className="font-semibold text-sm">${rec.amount.toLocaleString()}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Credit Cards List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {mockCards.map((card) => (
            <Card key={card.id} className="relative overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    {card.name}
                  </div>
                  <Badge variant="outline">
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
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="h-auto p-4 flex flex-col items-center gap-2" variant="default">
                <DollarSign className="w-6 h-6" />
                <div className="text-center">
                  <div className="font-medium">Pay Statements</div>
                  <div className="text-xs opacity-80">Avoid all interest</div>
                </div>
              </Button>
              
              <Button className="h-auto p-4 flex flex-col items-center gap-2" variant="outline">
                <Calendar className="w-6 h-6" />
                <div className="text-center">
                  <div className="font-medium">Set AutoPay</div>
                  <div className="text-xs opacity-80">Never miss payments</div>
                </div>
              </Button>
              
              <Button className="h-auto p-4 flex flex-col items-center gap-2" variant="secondary">
                <Calculator className="w-6 h-6" />
                <div className="text-center">
                  <div className="font-medium">Payment Calculator</div>
                  <div className="text-xs opacity-80">Plan payoff strategy</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </MobileOptimizedLayout>
  );
}