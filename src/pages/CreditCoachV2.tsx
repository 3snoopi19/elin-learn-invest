import { CreditInterestVisualization } from "@/components/CreditInterestVisualization";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, TrendingUp, Calendar, DollarSign, AlertTriangle, CheckCircle, Calculator } from "lucide-react";
import { MobileOptimizedLayout } from "@/components/ui/MobileOptimizedLayout";
import { MobileStack, MobileSection } from "@/components/ui/MobileStack";
import { ResponsiveContainer } from "@/components/ui/ResponsiveContainer";

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
    <MobileOptimizedLayout>
      <ResponsiveContainer size="full" className="py-6 md:py-8">
        <div className="max-w-7xl mx-auto mobile-container">
          <MobileStack spacing="normal" className="mb-8">
            
            {/* Enhanced Header Section */}
            <MobileSection 
              title="Credit Interest Coach"
              subtitle="Visual payment recommendations to minimize interest and optimize your credit health"
              className="text-center md:text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
              </div>
            </MobileSection>

            {/* Overview Cards - Mobile First */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
              
              {/* Total Impact Card */}
              <Card className="professional-card xl:col-span-1">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 mobile-subheading">
                    <Calculator className="w-5 h-5" />
                    This Month's Impact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center mobile-card p-4 bg-success/10 rounded-xl border border-success/20">
                      <div className="text-2xl md:text-3xl font-bold text-success mb-1">
                        ${getTotalInterestSavings().toFixed(2)}
                      </div>
                      <div className="mobile-caption text-muted-foreground">
                        Monthly Interest Savings
                      </div>
                      <div className="text-xs text-success mt-1">
                        By paying statement balances
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center mobile-card p-3 bg-card rounded-lg border">
                        <div className="font-semibold mobile-body">
                          ${mockCards.reduce((sum, card) => sum + card.statementBalance, 0).toLocaleString()}
                        </div>
                        <div className="mobile-caption text-muted-foreground">To Pay</div>
                      </div>
                      <div className="text-center mobile-card p-3 bg-card rounded-lg border">
                        <div className="font-semibold mobile-body">
                          ${mockCards.reduce((sum, card) => sum + card.minimumPayment, 0).toFixed(0)}
                        </div>
                        <div className="mobile-caption text-muted-foreground">Minimum</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations Card */}
              <Card className="professional-card xl:col-span-2">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 mobile-subheading">
                    <TrendingUp className="w-5 h-5" />
                    Smart Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getRecommendations().map((rec, index) => (
                      <div key={index} className="flex items-start gap-3 mobile-card p-4 bg-card/50 touch-target">
                        <div className="flex-shrink-0 mt-1">
                          {rec.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                            <h4 className="font-medium mobile-body">{rec.title}</h4>
                            <Badge 
                              variant={rec.priority === 'High' ? 'default' : 'secondary'} 
                              className="text-xs self-start sm:self-center"
                            >
                              {rec.priority}
                            </Badge>
                          </div>
                          <p className="mobile-caption text-muted-foreground">{rec.description}</p>
                        </div>
                        {rec.amount && (
                          <div className="text-right flex-shrink-0">
                            <div className="font-semibold mobile-body">${rec.amount.toLocaleString()}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Credit Cards Grid - Mobile Responsive */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
              {mockCards.map((card) => (
                <Card key={card.id} className="professional-card overflow-hidden">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 flex-shrink-0" />
                        <span className="mobile-body font-semibold truncate">{card.name}</span>
                      </div>
                      <Badge variant="outline" className="self-start sm:self-center">
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

            {/* Action Center - Mobile Optimized */}
            <Card className="professional-card">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 mobile-subheading">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  Next Steps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  <Button className="h-auto p-6 flex flex-col items-center gap-3 mobile-button" variant="default">
                    <DollarSign className="w-6 h-6" />
                    <div className="text-center">
                      <div className="font-medium mobile-body">Pay Statements</div>
                      <div className="mobile-caption opacity-80">Avoid all interest</div>
                    </div>
                  </Button>
                  
                  <Button className="h-auto p-6 flex flex-col items-center gap-3 mobile-button" variant="outline">
                    <Calendar className="w-6 h-6" />
                    <div className="text-center">
                      <div className="font-medium mobile-body">Set AutoPay</div>
                      <div className="mobile-caption opacity-80">Never miss payments</div>
                    </div>
                  </Button>
                  
                  <Button className="h-auto p-6 flex flex-col items-center gap-3 mobile-button sm:col-span-2 xl:col-span-1" variant="secondary">
                    <Calculator className="w-6 h-6" />
                    <div className="text-center">
                      <div className="font-medium mobile-body">Payment Calculator</div>
                      <div className="mobile-caption opacity-80">Plan payoff strategy</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
            
          </MobileStack>
        </div>
      </ResponsiveContainer>
    </MobileOptimizedLayout>
  );
}