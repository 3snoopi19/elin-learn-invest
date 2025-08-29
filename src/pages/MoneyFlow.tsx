import { MoneyFlowVisualization } from "@/components/MoneyFlowVisualization";
import { MobileOptimizedLayout } from "@/components/ui/MobileOptimizedLayout";
import { ResponsiveContainer } from "@/components/ui/ResponsiveContainer";

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
  return (
    <MobileOptimizedLayout>
      <ResponsiveContainer size="full" className="py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-heading mb-2">
              Money Flow Visualization
            </h1>
            <p className="text-text-secondary">
              Visualize and optimize your financial flows with interactive diagrams. Track income, expenses, and account transfers in real-time.
            </p>
          </div>
          
          <MoneyFlowVisualization 
            accounts={mockAccounts} 
            timeframe="30"
          />
        </div>
      </ResponsiveContainer>
    </MobileOptimizedLayout>
  );
}