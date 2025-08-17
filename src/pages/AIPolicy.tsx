import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const AIPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-4">AI Output Policy</h1>
        
        <Alert className="mb-6 border-warning/20 bg-warning/5">
          <AlertCircle className="h-4 w-4 text-warning" />
          <AlertDescription>
            <strong>Important:</strong> All AI-generated content is for educational purposes only 
            and does not constitute financial or investment advice.
          </AlertDescription>
        </Alert>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Guidelines</CardTitle>
              <CardDescription>How ELIN generates educational content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Educational Focus</h4>
                <p className="text-sm text-muted-foreground">
                  All content is designed to educate about investment concepts, market fundamentals, 
                  and financial literacy without providing personalized investment advice.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Compliance Safeguards</h4>
                <p className="text-sm text-muted-foreground">
                  Our AI includes built-in safeguards to prevent generation of personalized 
                  investment recommendations, performance projections, or guaranteed returns.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Source Attribution</h4>
                <p className="text-sm text-muted-foreground">
                  When possible, AI responses include citations to official sources like 
                  SEC filings, regulatory guidance, and educational materials.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Limitations</CardTitle>
              <CardDescription>What ELIN cannot and will not do</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>• Provide personalized investment recommendations</p>
              <p>• Make predictions about future market performance</p>
              <p>• Guarantee investment returns or outcomes</p>
              <p>• Replace professional financial advice</p>
              <p>• Process real-time market data for trading decisions</p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AIPolicy;