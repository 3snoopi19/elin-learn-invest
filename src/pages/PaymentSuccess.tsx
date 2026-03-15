import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  return (
    <div className="px-6 py-8 md:px-8 max-w-5xl mx-auto space-y-6 flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md text-center">
          <CardHeader className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
            <CardDescription>
              Thank you for your purchase. You now have premium access to all InvestEd features.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {sessionId && (
              <div className="text-sm text-muted-foreground">
                Transaction ID: {sessionId.slice(-8)}
              </div>
            )}
            
            <div className="space-y-2">
              <h3 className="font-semibold">You now have access to:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Unlimited ELIN AI chat sessions</li>
                <li>• Advanced portfolio analysis tools</li>
                <li>• Premium market insights</li>
                <li>• Priority customer support</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link to="/chat">Start ELIN Chat</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}