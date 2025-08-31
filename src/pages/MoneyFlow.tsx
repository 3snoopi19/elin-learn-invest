import { MoneyFlowVisualization } from "@/components/MoneyFlowVisualization";
import { MoneyFlowInsights } from "@/components/MoneyFlowInsights";
import { MobileOptimizedLayout } from "@/components/ui/MobileOptimizedLayout";
import { ResponsiveContainer } from "@/components/ui/ResponsiveContainer";
import { MobileStack, MobileSection } from "@/components/ui/MobileStack";

const mockAccounts = [
  {
    id: 'acc_1',
    name: 'Primary Checking',
    type: 'checking' as const,
    balance: 8450,
    institution: 'Chase Bank'
  },
  {
    id: 'acc_2',
    name: 'High-Yield Savings',
    type: 'savings' as const,
    balance: 15200,
    institution: 'Marcus Goldman'
  },
  {
    id: 'acc_3',
    name: 'Rewards Credit Card',
    type: 'credit' as const,
    balance: -1200,
    institution: 'Capital One'
  }
];

export default function MoneyFlowPage() {
  // Calculate totals for insights
  const totals = {
    income: 5000,
    expenses: 2870,
    netWorth: mockAccounts.reduce((sum, account) => sum + account.balance, 0),
    cashFlow: 5000 - 2870
  };

  return (
    <MobileOptimizedLayout>
      <ResponsiveContainer size="full" className="py-6 md:py-8">
        <div className="max-w-7xl mx-auto mobile-container">
          <MobileStack spacing="normal" className="mb-8">
            
            {/* Enhanced Header Section */}
            <MobileSection 
              title="Money Flow Visualization"
              subtitle="Visualize and optimize your financial flows with interactive diagrams. Track income, expenses, and account transfers in real-time."
              className="text-center md:text-left"
            >
              {/* Empty children for header-only section */}
              <div></div>
            </MobileSection>

            {/* Insights Summary Banner */}
            <MoneyFlowInsights 
              totals={totals}
              className="animate-fade-in-up"
            />
            
            {/* Main Visualization */}
            <div className="professional-card p-4 md:p-6 bg-gradient-to-br from-background via-background-subtle to-background animate-fade-in-up animate-delay-200">
              <MoneyFlowVisualization 
                accounts={mockAccounts} 
                timeframe="30"
              />
            </div>
            
          </MobileStack>
        </div>
      </ResponsiveContainer>
    </MobileOptimizedLayout>
  );
}