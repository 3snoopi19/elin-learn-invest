import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, ArrowRight, TrendingUp, PiggyBank, CreditCard } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface MoneyFlowRouterCardProps {
  animationDelay?: number;
}

export const MoneyFlowRouterCard = ({ animationDelay = 0 }: MoneyFlowRouterCardProps) => {
  const navigate = useNavigate();

  // Mock data for demonstration
  const mockFlowData = {
    totalIncome: 4200,
    totalExpenses: 3100,
    netFlow: 1100,
    connectedAccounts: 3,
    activeRules: 2
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: animationDelay }}
    >
      <Card className="professional-card hover:shadow-lg transition-all duration-300 group cursor-pointer h-full">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                New
              </Badge>
              <Badge variant="outline" className="text-xs border-secondary/30 text-secondary">
                Beta
              </Badge>
            </div>
          </div>
          <CardTitle className="text-xl font-bold text-text-heading group-hover:text-primary transition-colors">
            Money Flow Router
          </CardTitle>
          <CardDescription className="text-text-secondary">
            Visualize cash flow and automate smart money movements between accounts
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Flow Summary */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-lg bg-success/10 border border-success/20">
              <div className="flex items-center justify-center mb-1">
                <TrendingUp className="h-4 w-4 text-success" />
              </div>
              <p className="text-xs text-success font-medium">Income</p>
              <p className="text-sm font-bold text-text-heading">
                ${mockFlowData.totalIncome.toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
              <div className="flex items-center justify-center mb-1">
                <CreditCard className="h-4 w-4 text-warning" />
              </div>
              <p className="text-xs text-warning font-medium">Expenses</p>
              <p className="text-sm font-bold text-text-heading">
                ${mockFlowData.totalExpenses.toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center justify-center mb-1">
                <PiggyBank className="h-4 w-4 text-primary" />
              </div>
              <p className="text-xs text-primary font-medium">Net Flow</p>
              <p className="text-sm font-bold text-text-heading">
                +${mockFlowData.netFlow.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Connected Accounts Status */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-text-body">Connected Accounts</p>
              <p className="text-xs text-text-secondary">
                {mockFlowData.connectedAccounts} accounts synced
              </p>
            </div>
            <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
              Active
            </Badge>
          </div>

          {/* Smart Rules Status */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-text-body">Smart Rules</p>
              <p className="text-xs text-text-secondary">
                {mockFlowData.activeRules} automation rules active
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-primary">
              <span>View</span>
              <ArrowRight className="h-3 w-3" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <Button 
              className="w-full bg-primary hover:bg-primary-hover text-primary-foreground mobile-button"
              onClick={() => navigate('/router')}
            >
              <Building2 className="h-4 w-4 mr-2" />
              Open Money Router
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="w-full border-primary text-primary hover:bg-primary/10 mobile-button"
              onClick={() => navigate('/money-flow')}
            >
              View Flow Visualization
            </Button>
          </div>

          {/* Educational Note */}
          <div className="text-xs text-text-muted bg-education/5 border border-education/20 rounded-lg p-3">
            <p className="font-medium text-education mb-1">Educational Tool</p>
            <p>Visualize money flows for learning. No actual money movements in beta.</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};