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
  ChevronUp,
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
  Lightbulb,
  Eye,
  Filter,
  Moon,
  Sun,
  ArrowRight
} from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

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
  const transactions = Array.isArray(data.transactions) 
    ? data.transactions 
    : mockTransactions.filter(t => {
        if (type === 'account') return true; // Show all transactions for accounts
        return t.type === type;
      }).slice(0, 5);
  
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
        return <Briefcase className="h-6 w-6 text-success" />;
      case 'freelance':
        return <Zap className="h-6 w-6 text-success" />;
      default:
        return <DollarSign className="h-6 w-6 text-success" />;
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative">
            <TransactionModal data={data} type="income" />
            <div className="group relative px-6 py-4 min-w-[200px] cursor-pointer transform transition-all duration-300 hover:scale-105">
              {/* Glassmorphism background */}
              <div className="absolute inset-0 bg-gradient-to-br from-success/10 via-success/5 to-transparent backdrop-blur-xl rounded-2xl border border-success/20 shadow-lg" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-3 bg-gradient-to-br from-success/20 to-success/10 rounded-xl backdrop-blur-sm border border-success/30 group-hover:scale-110 transition-transform duration-200">
                    {getIcon(data.type || '')}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-base text-card-foreground mb-1">{data.label}</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{data.frequency || 'Monthly'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-success">
                    +{data.amount}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {data.totalTransactions || data.transactions?.length || 0} transactions
                    </span>
                    <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
                      Active
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Last: 2 days ago
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent className="bg-card/95 backdrop-blur-sm border border-success/20">
          <p>💰 Click to view transaction history</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const AccountNode = ({ data }: { data: any }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'checking':
        return <Wallet className="h-6 w-6 text-secondary" />;
      case 'savings':
        return <PiggyBank className="h-6 w-6 text-secondary" />;
      case 'credit':
        return <CreditCard className="h-6 w-6 text-secondary" />;
      default:
        return <Building2 className="h-6 w-6 text-secondary" />;
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
            <div className="group relative px-6 py-4 min-w-[220px] cursor-pointer transform transition-all duration-300 hover:scale-105">
              {/* Glassmorphism background */}
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-secondary/5 to-transparent backdrop-blur-xl rounded-2xl border border-secondary/20 shadow-lg" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-3 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-xl backdrop-blur-sm border border-secondary/30 group-hover:scale-110 transition-transform duration-200">
                    {getIcon(data.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-base text-card-foreground mb-1">{data.name}</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Building2 className="h-3 w-3" />
                      <span>{data.institution}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className={`text-2xl font-bold ${data.balance < 0 ? 'text-destructive' : 'text-secondary'}`}>
                    {formatCurrency(data.balance)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Last sync: Today
                    </span>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs border",
                        data.balance > 5000 
                          ? "bg-success/10 text-success border-success/20" 
                          : data.balance < 0 
                          ? "bg-destructive/10 text-destructive border-destructive/20"
                          : "bg-warning/10 text-warning border-warning/20"
                      )}
                    >
                      {data.balance > 5000 ? 'Healthy' : data.balance < 0 ? 'Credit' : 'Low'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent className="bg-card/95 backdrop-blur-sm border border-secondary/20">
          <p>🏦 Click to view account transactions</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const ExpenseNode = ({ data }: { data: NodeData }) => {
  const getIcon = (category: string) => {
    switch (category) {
      case 'rent':
        return <Home className="h-6 w-6 text-destructive" />;
      case 'car':
        return <Car className="h-6 w-6 text-destructive" />;
      case 'credit':
        return <CreditCard className="h-6 w-6 text-destructive" />;
      case 'shopping':
        return <ShoppingCart className="h-6 w-6 text-destructive" />;
      default:
        return <DollarSign className="h-6 w-6 text-destructive" />;
    }
  };

  const getExpenseBadge = (amount: string, category: string) => {
    const numAmount = parseInt(amount.replace('$', '').replace(',', ''));
    if (numAmount > 1000) return { label: "High", variant: "destructive" as const };
    if (category === 'rent') return { label: "Fixed", variant: "secondary" as const };
    return { label: "Variable", variant: "outline" as const };
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative">
            <TransactionModal data={data} type="expense" />
            <div className="group relative px-6 py-4 min-w-[200px] cursor-pointer transform transition-all duration-300 hover:scale-105">
              {/* Glassmorphism background */}
              <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 via-destructive/5 to-transparent backdrop-blur-xl rounded-2xl border border-destructive/20 shadow-lg" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-3 bg-gradient-to-br from-destructive/20 to-destructive/10 rounded-xl backdrop-blur-sm border border-destructive/30 group-hover:scale-110 transition-transform duration-200">
                    {getIcon(data.category || '')}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-base text-card-foreground mb-1">{data.label}</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{data.frequency || 'Monthly'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-destructive">
                    -{data.amount}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {data.totalTransactions || data.transactions?.length || 0} transactions
                    </span>
                    <Badge 
                      variant={getExpenseBadge(data.amount, data.category || '').variant}
                      className="text-xs"
                    >
                      {getExpenseBadge(data.amount, data.category || '').label}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Last: {data.category === 'rent' ? '1 month ago' : '3 days ago'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent className="bg-card/95 backdrop-blur-sm border border-destructive/20">
          <p>💸 Click to view expense history</p>
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
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showMobileView, setShowMobileView] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    income: true,
    accounts: true,
    expenses: true
  });
  const isMobile = useIsMobile();

  // Persist timeframe selection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('money-flow-timeframe', selectedTimeframe);
    }
  }, [selectedTimeframe]);

  // Auto-enable mobile view on mobile devices
  useEffect(() => {
    setShowMobileView(isMobile);
  }, [isMobile]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

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

  // Mobile collapsible sections
  const MobileFlowSection = ({ title, icon, children, sectionKey, color }: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    sectionKey: keyof typeof expandedSections;
    color: string;
  }) => (
    <Collapsible 
      open={expandedSections[sectionKey]} 
      onOpenChange={() => toggleSection(sectionKey)}
      className="space-y-2"
    >
      <CollapsibleTrigger asChild>
        <Button 
          variant="ghost" 
          className={`w-full justify-between p-4 h-auto rounded-2xl bg-gradient-to-r ${color} backdrop-blur-sm border`}
        >
          <div className="flex items-center gap-3">
            {icon}
            <span className="font-semibold">{title}</span>
          </div>
          {expandedSections[sectionKey] ? 
            <ChevronUp className="h-5 w-5" /> : 
            <ChevronDown className="h-5 w-5" />
          }
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-3 px-2">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );

  return (
    <div className="w-full space-y-6 relative">
      {/* Glassmorphism header */}
      <div className={cn(
        "relative overflow-hidden rounded-2xl border backdrop-blur-xl",
        "bg-gradient-to-r from-card/80 via-card/60 to-card/80",
        isMobile ? 'p-4 space-y-4' : 'p-6'
      )}>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-success/5 opacity-50" />
        
        <div className={cn(
          "relative z-10",
          isMobile ? 'space-y-4' : 'flex items-center justify-between'
        )}>
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-bold text-card-foreground">
              💰 Money Flow
            </h3>
            {!isMobile && (
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 text-success border border-success/20">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span>Income</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20">
                  <div className="w-2 h-2 bg-secondary rounded-full"></div>
                  <span>Accounts</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
                  <div className="w-2 h-2 bg-destructive rounded-full"></div>
                  <span>Expenses</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {!isMobile && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMobileView(!showMobileView)}
                className="bg-card/50 backdrop-blur-sm border"
              >
                <Eye className="h-4 w-4 mr-2" />
                {showMobileView ? 'Flow View' : 'List View'}
              </Button>
            )}
            
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className={cn(
                "bg-card/50 backdrop-blur-sm border z-50",
                isMobile ? 'w-full' : 'w-40'
              )}>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Timeframe" />
              </SelectTrigger>
              <SelectContent className="bg-card/95 backdrop-blur-xl border z-50">
                <SelectItem value="7">📅 Last 7 days</SelectItem>
                <SelectItem value="30">📊 Last 30 days</SelectItem>
                <SelectItem value="90">📈 Last 90 days</SelectItem>
                <SelectItem value="365">🗓️ Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Conditional Flow/Mobile View */}
      {showMobileView ? (
        /* Mobile Collapsible View */
        <div className="space-y-4">
          <MobileFlowSection
            title="Income Sources"
            icon={<TrendingUp className="h-5 w-5 text-success" />}
            sectionKey="income"
            color="from-success/10 to-success/5"
          >
            <div className="space-y-3">
              <IncomeNode data={{
                label: 'Salary', 
                amount: '$4,200', 
                type: 'salary',
                frequency: 'Bi-weekly',
                totalTransactions: 2
              }} />
              <IncomeNode data={{
                label: 'Freelance', 
                amount: '$800', 
                type: 'freelance',
                frequency: 'Weekly',
                totalTransactions: 4
              }} />
              <IncomeNode data={{
                label: 'Dividends', 
                amount: '$150', 
                type: 'investment',
                frequency: 'Quarterly',
                totalTransactions: 1
              }} />
            </div>
          </MobileFlowSection>

          <div className="flex items-center justify-center py-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <ArrowRight className="h-4 w-4" />
              <span className="text-sm">Flows to accounts</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>

          <MobileFlowSection
            title="Accounts"
            icon={<Wallet className="h-5 w-5 text-secondary" />}
            sectionKey="accounts"
            color="from-secondary/10 to-secondary/5"
          >
            <div className="space-y-3">
              {accounts.map(account => (
                <AccountNode key={account.id} data={account} />
              ))}
            </div>
          </MobileFlowSection>

          <div className="flex items-center justify-center py-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <ArrowRight className="h-4 w-4" />
              <span className="text-sm">Pays for expenses</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>

          <MobileFlowSection
            title="Expenses"
            icon={<TrendingDown className="h-5 w-5 text-destructive" />}
            sectionKey="expenses"
            color="from-destructive/10 to-destructive/5"
          >
            <div className="space-y-3">
              <ExpenseNode data={{
                label: 'Rent', 
                amount: '$1,800', 
                category: 'rent',
                frequency: 'Monthly',
                totalTransactions: 1
              }} />
              <ExpenseNode data={{
                label: 'Car Payment', 
                amount: '$420', 
                category: 'car',
                frequency: 'Monthly',
                totalTransactions: 1
              }} />
              <ExpenseNode data={{
                label: 'Groceries', 
                amount: '$650', 
                category: 'shopping',
                frequency: 'Weekly',
                totalTransactions: 12
              }} />
            </div>
          </MobileFlowSection>
        </div>
      ) : (
        /* Desktop Flow Visualization */
        <div className={cn(
          "relative overflow-hidden rounded-2xl border backdrop-blur-xl",
          "bg-gradient-to-br from-background/80 to-background/60",
          isMobile ? 'h-[800px]' : 'h-[600px]'
        )}>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-30" />
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
            className="rounded-2xl"
            proOptions={{ hideAttribution: true }}
          >
            <Controls 
              className="bg-card/90 backdrop-blur-sm border rounded-lg shadow-lg"
              showZoom={!isMobile}
              showFitView={true}
              showInteractive={!isMobile}
            />
            <Background 
              variant={BackgroundVariant.Dots} 
              gap={isMobile ? 12 : 20} 
              size={1.5} 
              className="opacity-20"
            />
          </ReactFlow>
        </div>
      )}

      {/* Enhanced Summary Stats with Glassmorphism */}
      <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-3'} gap-6`}>
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-success/10 via-success/5 to-transparent backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
          <div className="absolute inset-0 border border-success/20 rounded-lg" />
          <CardContent className="relative p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-success/20 to-success/10 rounded-xl backdrop-blur-sm border border-success/30">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
              <Badge className="bg-success/10 text-success border-success/20">
                📈 +12%
              </Badge>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Total Income</div>
              <div className="text-2xl font-bold text-success">+${insights.totalIncome.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">vs last month</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-secondary/10 via-secondary/5 to-transparent backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
          <div className="absolute inset-0 border border-secondary/20 rounded-lg" />
          <CardContent className="relative p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-xl backdrop-blur-sm border border-secondary/30">
                <Target className="h-6 w-6 text-secondary" />
              </div>
              <Badge className={cn(
                "border",
                parseFloat(insights.savingsRate) >= 20 
                  ? "bg-success/10 text-success border-success/20"
                  : "bg-warning/10 text-warning border-warning/20"
              )}>
                {parseFloat(insights.savingsRate) >= 20 ? "🎯 On Track" : "⚠️ Below Goal"}
              </Badge>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Savings Rate</div>
              <div className="text-2xl font-bold text-secondary">{insights.savingsRate}%</div>
              <div className="text-xs text-muted-foreground">Goal: 20%</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-destructive/10 via-destructive/5 to-transparent backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
          <div className="absolute inset-0 border border-destructive/20 rounded-lg" />
          <CardContent className="relative p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-destructive/20 to-destructive/10 rounded-xl backdrop-blur-sm border border-destructive/30">
                <TrendingDown className="h-6 w-6 text-destructive" />
              </div>
              <Badge className="bg-destructive/10 text-destructive border-destructive/20">
                📉 +5%
              </Badge>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Total Expenses</div>
              <div className="text-2xl font-bold text-destructive">-${insights.totalExpenses.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">vs last month</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Smart Insights */}
      {insights.suggestions.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-warning/20 to-warning/10 rounded-xl">
              <Lightbulb className="h-6 w-6 text-warning" />
            </div>
            <h4 className="text-xl font-bold text-card-foreground">
              💡 Smart Insights
            </h4>
            <Badge variant="outline" className="ml-auto">
              {insights.suggestions.length} suggestions
            </Badge>
          </div>
          
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-6`}>
            {insights.suggestions.map((suggestion, index) => (
              <Card key={index} className="relative overflow-hidden border-0 bg-gradient-to-br from-warning/5 via-card/80 to-transparent backdrop-blur-xl">
                <div className="absolute inset-0 border border-warning/20 rounded-lg" />
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-warning to-warning/50" />
                <CardContent className="relative p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-warning/20 to-warning/10 rounded-xl backdrop-blur-sm border border-warning/30">
                      {suggestion.icon}
                    </div>
                    <div className="flex-1 space-y-2">
                      <h5 className="font-bold text-card-foreground">{suggestion.title}</h5>
                      <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3 bg-card/50 backdrop-blur-sm hover:bg-warning/10"
                      >
                        {suggestion.action}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Top Expense Card */}
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-card/80 via-muted/20 to-transparent backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 to-transparent" />
        <div className="absolute inset-0 border border-destructive/20 rounded-lg" />
        <CardHeader className="relative pb-3">
          <CardTitle className="flex items-center gap-3 text-card-foreground">
            <div className="p-2 bg-gradient-to-br from-destructive/20 to-destructive/10 rounded-xl">
              <Target className="h-5 w-5 text-destructive" />
            </div>
            🎯 Top Expense This Month
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-xl font-bold text-card-foreground">{insights.topExpense.name}</p>
              <div className="flex items-center gap-4">
                <Badge className="bg-destructive/10 text-destructive border-destructive/20">
                  {((insights.topExpense.amount / insights.totalIncome) * 100).toFixed(1)}% of income
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Fixed expense
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-destructive">
                ${insights.topExpense.amount.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Due in 15 days
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Floating CTA Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button 
          size="lg"
          className="rounded-full bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 shadow-lg backdrop-blur-sm border border-white/20 min-w-0 h-14 w-14 md:w-auto md:h-auto md:px-6 md:py-3"
        >
          <Plus className="h-6 w-6 md:mr-2" />
          <span className="hidden md:inline">New Automation</span>
        </Button>
      </div>
    </div>
  );
};