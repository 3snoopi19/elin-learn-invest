import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  ReactFlow,
  addEdge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Position,
  MarkerType,
  Node,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { 
  DollarSign, 
  PiggyBank, 
  CreditCard, 
  Briefcase, 
  Home, 
  Car, 
  Plus,
  ChevronDown,
  Wallet,
  Building2,
  ShoppingCart,
  Zap,
  Info,
  TrendingUp,
  TrendingDown,
  X,
  Calendar,
  Target,
  AlertCircle,
  Lightbulb
} from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';

interface Transaction {
  id: string;
  date: string;
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense' | 'transfer';
}

interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit';
  balance: number;
  institution: string;
}

interface NodeData {
  label: string;
  amount: string;
  type?: string;
  category?: string;
  frequency?: string;
  transactions?: Transaction[];
  totalTransactions?: number;
}

interface MoneyFlowVisualizationProps {
  accounts: Account[];
  timeframe: string;
}

// Mock transaction data
const mockTransactions: Transaction[] = [
  { id: '1', date: '2024-01-15', amount: 4200, description: 'Salary Deposit', category: 'salary', type: 'income' },
  { id: '2', date: '2024-01-10', amount: -1800, description: 'Monthly Rent', category: 'rent', type: 'expense' },
  { id: '3', date: '2024-01-08', amount: 800, description: 'Freelance Project', category: 'freelance', type: 'income' },
  { id: '4', date: '2024-01-05', amount: -420, description: 'Car Payment', category: 'car', type: 'expense' },
  { id: '5', date: '2024-01-03', amount: -125, description: 'Grocery Shopping', category: 'shopping', type: 'expense' },
];

// Transaction History Modal Component
const TransactionModal = ({ data, type }: { data: NodeData; type: 'income' | 'expense' | 'account' }) => {
  const transactions = data.transactions || mockTransactions.filter(t => t.type === type).slice(0, 5);
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="w-full h-full" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            {type === 'income' && <TrendingUp className="h-5 w-5 text-success" />}
            {type === 'expense' && <TrendingDown className="h-5 w-5 text-destructive" />}
            {type === 'account' && <Wallet className="h-5 w-5 text-secondary" />}
            {data.label} Transactions
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium text-foreground">{transaction.description}</p>
                <p className="text-sm text-muted-foreground">{transaction.date}</p>
              </div>
              <div className={`font-bold ${transaction.amount > 0 ? 'text-success' : 'text-destructive'}`}>
                {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const IncomeNode = ({ data }: { data: NodeData }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'salary':
        return <Briefcase className="h-5 w-5 text-success" />;
      case 'freelance':
        return <Zap className="h-5 w-5 text-success" />;
      default:
        return <DollarSign className="h-5 w-5 text-success" />;
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative">
            <TransactionModal data={data} type="income" />
            <div className="group relative px-4 py-3 bg-card border-2 border-success/20 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 min-w-[160px] cursor-pointer hover:scale-105 animate-pulse-subtle">
              <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-success/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-success/10 rounded-lg group-hover:scale-110 transition-transform duration-200">
                    {getIcon(data.type || '')}
                  </div>
                  <div className="flex flex-col">
                    <div className="text-sm font-semibold text-card-foreground">{data.label}</div>
                    <div className="text-xs text-muted-foreground">{data.frequency || 'Monthly'}</div>
                  </div>
                </div>
                <div className="text-lg font-bold text-success">
                  +{data.amount}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {data.totalTransactions || data.transactions?.length || 0} transactions
                </div>
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Click to view transaction history</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const AccountNode = ({ data }: { data: any }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'checking':
        return <Wallet className="h-5 w-5 text-secondary" />;
      case 'savings':
        return <PiggyBank className="h-5 w-5 text-secondary" />;
      case 'credit':
        return <CreditCard className="h-5 w-5 text-secondary" />;
      default:
        return <Building2 className="h-5 w-5 text-secondary" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(amount));
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative">
            <TransactionModal data={data} type="account" />
            <div className="group relative px-4 py-3 bg-card border-2 border-secondary/20 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 min-w-[180px] cursor-pointer hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-secondary/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-secondary/10 rounded-lg group-hover:scale-110 transition-transform duration-200">
                    {getIcon(data.type)}
                  </div>
                  <div className="flex flex-col">
                    <div className="text-sm font-semibold text-card-foreground">{data.name}</div>
                    <div className="text-xs text-muted-foreground">{data.institution}</div>
                  </div>
                </div>
                <div className={`text-lg font-bold ${data.balance < 0 ? 'text-destructive' : 'text-card-foreground'}`}>
                  {formatCurrency(data.balance)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Last updated today
                </div>
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Click to view account transactions</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const ExpenseNode = ({ data }: { data: NodeData }) => {
  const getIcon = (category: string) => {
    switch (category) {
      case 'rent':
        return <Home className="h-5 w-5 text-destructive" />;
      case 'car':
        return <Car className="h-5 w-5 text-destructive" />;
      case 'credit':
        return <CreditCard className="h-5 w-5 text-destructive" />;
      case 'shopping':
        return <ShoppingCart className="h-5 w-5 text-destructive" />;
      default:
        return <DollarSign className="h-5 w-5 text-destructive" />;
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative">
            <TransactionModal data={data} type="expense" />
            <div className="group relative px-4 py-3 bg-card border-2 border-destructive/20 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 min-w-[160px] cursor-pointer hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 to-destructive/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-destructive/10 rounded-lg group-hover:scale-110 transition-transform duration-200">
                    {getIcon(data.category || '')}
                  </div>
                  <div className="flex flex-col">
                    <div className="text-sm font-semibold text-card-foreground">{data.label}</div>
                    <div className="text-xs text-muted-foreground">{data.frequency || 'Monthly'}</div>
                  </div>
                </div>
                <div className="text-lg font-bold text-destructive">
                  -{data.amount}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {data.totalTransactions || data.transactions?.length || 0} transactions
                </div>
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Click to view expense history</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const nodeTypes = {
  account: AccountNode,
  income: IncomeNode,
  expense: ExpenseNode,
};

export const MoneyFlowVisualization: React.FC<MoneyFlowVisualizationProps> = ({
  accounts,
  timeframe,
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('money-flow-timeframe') || timeframe || "30";
    }
    return timeframe || "30";
  });
  const isMobile = useIsMobile();

  // Persist timeframe selection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('money-flow-timeframe', selectedTimeframe);
    }
  }, [selectedTimeframe]);

  const initialNodes = useMemo((): Node[] => {
    // Income sources positioned on the left
    const incomeNodes: Node[] = [
      {
        id: 'income-salary',
        type: 'income',
        position: { x: 0, y: 50 },
        data: { 
          label: 'Salary', 
          amount: '$4,200', 
          type: 'salary',
          frequency: 'Bi-weekly',
          transactions: 2
        },
        sourcePosition: Position.Right,
      },
      {
        id: 'income-freelance',
        type: 'income',
        position: { x: 0, y: 220 },
        data: { 
          label: 'Freelance', 
          amount: '$800', 
          type: 'freelance',
          frequency: 'Weekly',
          transactions: 4
        },
        sourcePosition: Position.Right,
      },
      {
        id: 'income-investment',
        type: 'income',
        position: { x: 0, y: 390 },
        data: { 
          label: 'Dividends', 
          amount: '$150', 
          type: 'investment',
          frequency: 'Quarterly',
          transactions: 1
        },
        sourcePosition: Position.Right,
      },
    ];

    // Bank accounts positioned in the center
    const accountNodes: Node[] = accounts.map((account, index) => ({
      id: account.id,
      type: 'account',
      position: { x: 350, y: 50 + index * 180 },
      data: { ...account } as Record<string, unknown>,
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    }));

    // Expenses positioned on the right
    const expenseNodes: Node[] = [
      {
        id: 'expense-rent',
        type: 'expense',
        position: { x: 700, y: 50 },
        data: { 
          label: 'Rent', 
          amount: '$1,800', 
          category: 'rent',
          frequency: 'Monthly',
          transactions: 1
        },
        targetPosition: Position.Left,
      },
      {
        id: 'expense-car',
        type: 'expense',
        position: { x: 700, y: 220 },
        data: { 
          label: 'Car Payment', 
          amount: '$420', 
          category: 'car',
          frequency: 'Monthly',
          transactions: 1
        },
        targetPosition: Position.Left,
      },
      {
        id: 'expense-groceries',
        type: 'expense',
        position: { x: 700, y: 390 },
        data: { 
          label: 'Groceries', 
          amount: '$650', 
          category: 'shopping',
          frequency: 'Weekly',
          transactions: 12
        },
        targetPosition: Position.Left,
      },
      {
        id: 'expense-credit',
        type: 'expense',
        position: { x: 700, y: 560 },
        data: { 
          label: 'Credit Card', 
          amount: '$285', 
          category: 'credit',
          frequency: 'Monthly',
          transactions: 8
        },
        targetPosition: Position.Left,
      },
    ];

    return [...incomeNodes, ...accountNodes, ...expenseNodes];
  }, [accounts]);

  const initialEdges = useMemo(() => [
    // Income flows with enhanced styling
    {
      id: 'salary-checking',
      source: 'income-salary',
      target: 'acc_1',
      type: 'smoothstep',
      animated: true,
      style: { 
        stroke: '#10b981', 
        strokeWidth: 4,
        strokeDasharray: '0',
      },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' },
      label: 'Direct Deposit',
      labelStyle: { 
        fill: '#10b981', 
        fontWeight: 600, 
        fontSize: 12,
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '2px 8px',
        borderRadius: '4px',
      },
    },
    {
      id: 'freelance-checking',
      source: 'income-freelance',
      target: 'acc_1',
      type: 'smoothstep',
      animated: true,
      style: { 
        stroke: '#10b981', 
        strokeWidth: 3,
      },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' },
      label: 'Bank Transfer',
      labelStyle: { 
        fill: '#10b981', 
        fontWeight: 600, 
        fontSize: 11,
      },
    },
    {
      id: 'investment-savings',
      source: 'income-investment',
      target: 'acc_2',
      type: 'smoothstep',
      animated: true,
      style: { 
        stroke: '#10b981', 
        strokeWidth: 2,
      },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' },
      label: 'Auto-invest',
      labelStyle: { 
        fill: '#10b981', 
        fontWeight: 600, 
        fontSize: 11,
      },
    },
    // Internal account transfers
    {
      id: 'checking-savings',
      source: 'acc_1',
      target: 'acc_2',
      type: 'smoothstep',
      animated: true,
      style: { 
        stroke: '#3b82f6', 
        strokeWidth: 3,
        strokeDasharray: '5,5',
      },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
      label: '20% Auto-save',
      labelStyle: { 
        fill: '#3b82f6', 
        fontWeight: 600, 
        fontSize: 11,
      },
    },
    // Expense flows with enhanced styling
    {
      id: 'checking-rent',
      source: 'acc_1',
      target: 'expense-rent',
      type: 'smoothstep',
      style: { 
        stroke: '#ef4444', 
        strokeWidth: 4,
      },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' },
      label: 'Auto-pay',
      labelStyle: { 
        fill: '#ef4444', 
        fontWeight: 600, 
        fontSize: 11,
      },
    },
    {
      id: 'checking-car',
      source: 'acc_1',
      target: 'expense-car',
      type: 'smoothstep',
      style: { 
        stroke: '#ef4444', 
        strokeWidth: 3,
      },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' },
    },
    {
      id: 'checking-groceries',
      source: 'acc_1',
      target: 'expense-groceries',
      type: 'smoothstep',
      style: { 
        stroke: '#ef4444', 
        strokeWidth: 3,
      },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' },
    },
    // Credit card flows
    {
      id: 'checking-credit-payment',
      source: 'acc_1',
      target: 'acc_3',
      type: 'smoothstep',
      animated: true,
      style: { 
        stroke: '#f59e0b', 
        strokeWidth: 3,
      },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' },
      label: 'Payment',
      labelStyle: { 
        fill: '#f59e0b', 
        fontWeight: 600, 
        fontSize: 11,
      },
    },
    {
      id: 'credit-expense',
      source: 'acc_3',
      target: 'expense-credit',
      type: 'smoothstep',
      style: { 
        stroke: '#ef4444', 
        strokeWidth: 2,
      },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' },
    },
  ], []);

  // Calculate dynamic mobile positioning for better mobile experience
  const mobileNodes = useMemo(() => {
    if (!isMobile) return initialNodes;
    
    // Mobile layout: vertical stacking with adequate spacing
    return initialNodes.map((node, index) => {
      const nodeType = node.type;
      let yPosition = 50;
      let xPosition = 50;
      
      if (nodeType === 'income') {
        yPosition = 50 + (index * 200);
      } else if (nodeType === 'account') {
        yPosition = 600 + (index * 180);
      } else if (nodeType === 'expense') {
        yPosition = 1200 + (index * 200);
      }
      
      return {
        ...node,
        position: { x: xPosition, y: yPosition },
      };
    });
  }, [initialNodes, isMobile]);

  const [nodes, setNodes, onNodesChange] = useNodesState(isMobile ? mobileNodes : initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Dynamic insights based on data
  const insights = useMemo(() => {
    const totalIncome = 5150;
    const totalExpenses = 3155;
    const netIncome = totalIncome - totalExpenses;
    const savingsRate = ((netIncome / totalIncome) * 100).toFixed(1);
    
    const topExpense = { name: 'Rent', amount: 1800 };
    const suggestions = [];
    
    if (parseFloat(savingsRate) < 20) {
      suggestions.push({
        icon: <AlertCircle className="h-5 w-5 text-warning" />,
        title: "Low Savings Rate",
        description: `You're saving ${savingsRate}% - aim for 20%+`,
        action: "Review expenses"
      });
    }
    
    if (topExpense.amount > totalIncome * 0.3) {
      suggestions.push({
        icon: <Home className="h-5 w-5 text-destructive" />,
        title: "High Housing Cost",
        description: "Housing costs over 30% of income",
        action: "Consider alternatives"
      });
    }
    
    return {
      totalIncome,
      totalExpenses,
      netIncome,
      savingsRate,
      topExpense,
      suggestions
    };
  }, [selectedTimeframe]);

  return (
    <div className="w-full space-y-6">
      {/* Mobile-optimized header */}
      <div className={`${isMobile ? 'flex-col space-y-4' : 'flex items-center justify-between'} mb-4 p-4 bg-card rounded-xl border`}>
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-card-foreground">
            Money Flow Automation
          </h3>
          {!isMobile && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-3 h-3 bg-success rounded-full"></div>
              <span>Income</span>
              <div className="w-3 h-3 bg-secondary rounded-full ml-3"></div>
              <span>Accounts</span>
              <div className="w-3 h-3 bg-destructive rounded-full ml-3"></div>
              <span>Expenses</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className={`${isMobile ? 'w-full' : 'w-40'} bg-background border`}>
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="secondary" size={isMobile ? "sm" : "default"}>
            <Plus className="h-4 w-4 mr-2" />
            New Rule
          </Button>
        </div>
      </div>

      {/* Flow Visualization */}
      <div className={`${isMobile ? 'h-[800px]' : 'h-[600px]'} w-full bg-background border rounded-xl shadow-sm overflow-hidden`}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{
            padding: isMobile ? 0.05 : 0.1,
            includeHiddenNodes: false,
          }}
          className="rounded-xl"
          proOptions={{ hideAttribution: true }}
        >
          <Controls 
            className="bg-card border rounded-lg shadow-sm"
            showZoom={!isMobile}
            showFitView={true}
            showInteractive={!isMobile}
          />
          <Background 
            variant={BackgroundVariant.Dots} 
            gap={isMobile ? 12 : 16} 
            size={1} 
            className="opacity-30"
          />
        </ReactFlow>
      </div>

      {/* Summary Stats */}
      <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-3'} gap-4`}>
        <Card className="bg-success/5 border-success/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Income</div>
                <div className="text-xl font-bold text-success">+${insights.totalIncome.toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-secondary/5 border-secondary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <Wallet className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Savings Rate</div>
                <div className="text-xl font-bold text-secondary">{insights.savingsRate}%</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <TrendingDown className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Expenses</div>
                <div className="text-xl font-bold text-destructive">-${insights.totalExpenses.toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dynamic Insights */}
      {insights.suggestions.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-warning" />
            Smart Suggestions
          </h4>
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
            {insights.suggestions.map((suggestion, index) => (
              <Card key={index} className="border-l-4 border-l-warning">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-warning/10 rounded-lg">
                      {suggestion.icon}
                    </div>
                    <div className="flex-1">
                      <h5 className="font-semibold text-card-foreground">{suggestion.title}</h5>
                      <p className="text-sm text-muted-foreground mt-1">{suggestion.description}</p>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {suggestion.action}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Top Expense Card */}
      <Card className="bg-gradient-to-r from-card to-muted/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Target className="h-5 w-5 text-destructive" />
            Top Expense This Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-card-foreground">{insights.topExpense.name}</p>
              <p className="text-sm text-muted-foreground">
                {((insights.topExpense.amount / insights.totalIncome) * 100).toFixed(1)}% of income
              </p>
            </div>
            <div className="text-2xl font-bold text-destructive">
              ${insights.topExpense.amount.toLocaleString()}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};