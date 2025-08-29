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
  Edge,
  Connection,
  BackgroundVariant,
  MiniMap,
  Panel,
  Handle,
  getBezierPath,
  EdgeLabelRenderer,
  BaseEdge,
  useReactFlow
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
  ArrowRight,
  Move,
  Settings,
  RotateCcw,
  Bot,
  Sparkles,
  Activity
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
  amount: number;
  type?: string;
  category?: string;
  frequency?: string;
  transactions?: Transaction[];
  totalTransactions?: number;
  icon?: string;
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

// Custom Animated Edge with Amount Display
const AnimatedMoneyEdge = ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style, data }: any) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge 
        path={edgePath} 
        style={{ 
          ...style, 
          strokeWidth: 3,
          stroke: 'hsl(var(--primary))',
          strokeDasharray: '5,5',
          animation: 'dash 2s linear infinite'
        }}
        markerEnd={MarkerType.ArrowClosed}
      />
      <EdgeLabelRenderer>
        <div
          className="absolute bg-card/95 backdrop-blur-sm border rounded-lg px-2 py-1 text-xs font-semibold text-foreground shadow-lg pointer-events-none"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          }}
        >
          💰 ${data?.amount || '1,200'}/mo
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

// Custom Node Components
const IncomeSourceNode = ({ data }: { data: NodeData }) => {
  const getIcon = () => {
    switch (data.type) {
      case 'salary': return '💼';
      case 'freelance': return '⚡';
      case 'investment': return '📈';
      case 'business': return '🏢';
      default: return '💰';
    }
  };

  return (
    <div className="group relative">
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-success border-2 border-success-foreground" />
      <div className="min-w-[180px] p-4 bg-gradient-to-br from-success/10 to-success/5 backdrop-blur-xl border border-success/20 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-move">
        <div className="flex items-center gap-3 mb-3">
          <div className="text-2xl">{getIcon()}</div>
          <div>
            <h3 className="font-bold text-sm text-foreground">{data.label}</h3>
            <p className="text-xs text-muted-foreground">{data.frequency}</p>
          </div>
        </div>
        <div className="text-xl font-bold text-success">
          +${data.amount.toLocaleString()}
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground">{data.totalTransactions} transactions</span>
          <Badge variant="outline" className="text-xs bg-success/10 text-success">Active</Badge>
        </div>
      </div>
    </div>
  );
};

const AccountNode = ({ data }: { data: any }) => {
  const getIcon = () => {
    switch (data.type) {
      case 'checking': return '🏦';
      case 'savings': return '🐷';
      case 'credit': return '💳';
      case 'investment': return '📊';
      default: return '🏛️';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="group relative">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-secondary border-2 border-secondary-foreground" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-secondary border-2 border-secondary-foreground" />
      <div className="min-w-[200px] p-4 bg-gradient-to-br from-secondary/10 to-secondary/5 backdrop-blur-xl border border-secondary/20 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-move">
        <div className="flex items-center gap-3 mb-3">
          <div className="text-2xl">{getIcon()}</div>
          <div>
            <h3 className="font-bold text-sm text-foreground">{data.name}</h3>
            <p className="text-xs text-muted-foreground">{data.institution}</p>
          </div>
        </div>
        <div className={`text-xl font-bold ${data.balance < 0 ? 'text-destructive' : 'text-secondary'}`}>
          {formatCurrency(data.balance)}
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground">Last sync: Today</span>
          <Badge 
            variant={data.balance > 5000 ? 'default' : data.balance < 0 ? 'destructive' : 'secondary'}
            className="text-xs"
          >
            {data.balance > 5000 ? 'Healthy' : data.balance < 0 ? 'Credit' : 'Low'}
          </Badge>
        </div>
      </div>
    </div>
  );
};

const ExpenseNode = ({ data }: { data: NodeData }) => {
  const getIcon = () => {
    switch (data.category) {
      case 'housing': return '🏠';
      case 'food': return '🛒';
      case 'transportation': return '🚗';
      case 'entertainment': return '🎬';
      case 'utilities': return '⚡';
      case 'healthcare': return '🏥';
      default: return '💸';
    }
  };

  return (
    <div className="group relative">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-destructive border-2 border-destructive-foreground" />
      <div className="min-w-[180px] p-4 bg-gradient-to-br from-destructive/10 to-destructive/5 backdrop-blur-xl border border-destructive/20 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-move">
        <div className="flex items-center gap-3 mb-3">
          <div className="text-2xl">{getIcon()}</div>
          <div>
            <h3 className="font-bold text-sm text-foreground">{data.label}</h3>
            <p className="text-xs text-muted-foreground">{data.frequency}</p>
          </div>
        </div>
        <div className="text-xl font-bold text-destructive">
          -${data.amount.toLocaleString()}
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground">{data.totalTransactions} transactions</span>
          <Badge 
            variant={data.amount > 1000 ? 'destructive' : 'outline'}
            className="text-xs"
          >
            {data.amount > 1000 ? 'High' : data.category === 'housing' ? 'Fixed' : 'Variable'}
          </Badge>
        </div>
      </div>
    </div>
  );
};

// Automation Sidebar Component
const AutomationSidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute top-0 right-0 w-80 h-full bg-card/95 backdrop-blur-xl border-l border-border shadow-2xl z-50 p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-foreground">Smart Automations</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-4">
        <Card className="p-4">
          <CardHeader className="p-0 mb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Auto-Save Rule
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-xs text-muted-foreground mb-3">
              When salary arrives → auto-transfer 20% to savings
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="text-xs">Edit</Button>
              <Button size="sm" variant="ghost" className="text-xs">Pause</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardHeader className="p-0 mb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4 text-secondary" />
              Bill Pay Alert
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-xs text-muted-foreground mb-3">
              Notify me 3 days before rent is due
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="text-xs">Edit</Button>
              <Button size="sm" variant="ghost" className="text-xs">Delete</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Button className="w-full mt-6" size="sm">
        <Plus className="h-4 w-4 mr-2" />
        Create New Automation
      </Button>
    </div>
  );
};

// Node type definitions
const nodeTypes = {
  income: IncomeSourceNode,
  account: AccountNode,
  expense: ExpenseNode,
};

const edgeTypes = {
  animated: AnimatedMoneyEdge,
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
  
  const [showAutomationSidebar, setShowAutomationSidebar] = useState(false);
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

  useEffect(() => {
    setShowMobileView(isMobile);
  }, [isMobile]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Initialize React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Initialize nodes and edges
  useEffect(() => {
    // Income nodes
    const incomeNodes: Node[] = [
      {
        id: 'income-salary',
        type: 'income',
        position: { x: 50, y: 100 },
        data: { 
          label: 'Monthly Salary', 
          amount: 4200,
          type: 'salary',
          frequency: 'Monthly',
          totalTransactions: 12
        },
        draggable: true,
      },
      {
        id: 'income-freelance',
        type: 'income',
        position: { x: 50, y: 300 },
        data: { 
          label: 'Freelance Work', 
          amount: 800,
          type: 'freelance',
          frequency: 'Weekly',
          totalTransactions: 8
        },
        draggable: true,
      }
    ];

    // Account nodes
    const accountNodes: Node[] = accounts.map((account, index) => ({
      id: account.id,
      type: 'account',
      position: { x: 400, y: 100 + index * 200 },
      data: account as Record<string, unknown>,
      draggable: true,
    }));

    // Expense nodes
    const expenseNodes: Node[] = [
      {
        id: 'expense-rent',
        type: 'expense',
        position: { x: 750, y: 100 },
        data: { 
          label: 'Rent & Utilities', 
          amount: 1800,
          category: 'housing',
          frequency: 'Monthly',
          totalTransactions: 2
        },
        draggable: true,
      },
      {
        id: 'expense-groceries',
        type: 'expense',
        position: { x: 750, y: 300 },
        data: { 
          label: 'Groceries', 
          amount: 650,
          category: 'food',
          frequency: 'Weekly',
          totalTransactions: 15
        },
        draggable: true,
      },
      {
        id: 'expense-transport',
        type: 'expense',
        position: { x: 750, y: 500 },
        data: { 
          label: 'Transportation', 
          amount: 420,
          category: 'transportation',
          frequency: 'Monthly',
          totalTransactions: 8
        },
        draggable: true,
      }
    ];

    const initialEdges: Edge[] = [
      // Income to accounts
      {
        id: 'e-salary-checking',
        source: 'income-salary',
        target: accounts[0]?.id || 'acc_1',
        type: 'animated',
        animated: true,
        data: { amount: '3200' },
        style: { stroke: 'hsl(var(--success))' }
      },
      {
        id: 'e-freelance-savings',
        source: 'income-freelance',
        target: accounts[1]?.id || 'acc_2',
        type: 'animated',
        animated: true,
        data: { amount: '800' },
        style: { stroke: 'hsl(var(--success))' }
      },
      // Accounts to expenses
      {
        id: 'e-checking-rent',
        source: accounts[0]?.id || 'acc_1',
        target: 'expense-rent',
        type: 'animated',
        animated: true,
        data: { amount: '1800' },
        style: { stroke: 'hsl(var(--destructive))' }
      },
      {
        id: 'e-checking-groceries',
        source: accounts[0]?.id || 'acc_1',
        target: 'expense-groceries',
        type: 'animated',
        animated: true,
        data: { amount: '650' },
        style: { stroke: 'hsl(var(--destructive))' }
      },
      {
        id: 'e-checking-transport',
        source: accounts[0]?.id || 'acc_1',
        target: 'expense-transport',
        type: 'animated',
        animated: true,
        data: { amount: '420' },
        style: { stroke: 'hsl(var(--destructive))' }
      }
    ];

    setNodes([...incomeNodes, ...accountNodes, ...expenseNodes]);
    setEdges(initialEdges);
  }, [accounts, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ 
      ...params, 
      type: 'animated',
      animated: true,
      data: { amount: '500' } 
    }, eds)),
    [setEdges]
  );

  // Calculate totals for insight cards
  const totals = useMemo(() => {
    const totalIncome = 5000; 
    const totalExpenses = 2870;
    const netWorth = accounts.reduce((sum, account) => sum + account.balance, 0);
    
    return {
      income: totalIncome,
      expenses: totalExpenses,
      netWorth,
      cashFlow: totalIncome - totalExpenses
    };
  }, [accounts]);

  // Mobile view with collapsible sections
  if (showMobileView) {
    return (
      <div className="space-y-4">
        {/* Sticky Filter Header */}
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border pb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">💰 Money Flow</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMobileView(false)}
              className="text-xs"
            >
              <Move className="h-4 w-4 mr-2" />
              Canvas View
            </Button>
          </div>
          
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-full bg-card/50 backdrop-blur-sm">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent className="bg-card/95 backdrop-blur-xl border-border/50 z-50">
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
              <SelectItem value="365">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Income Section */}
        <Collapsible 
          open={expandedSections.income} 
          onOpenChange={() => toggleSection('income')}
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-gradient-to-br from-success/10 to-success/5 rounded-2xl border border-success/20">
            <div className="flex items-center gap-3">
              <div className="text-2xl">💰</div>
              <div>
                <h3 className="font-bold text-success">Income Sources</h3>
                <p className="text-sm text-muted-foreground">+${totals.income.toLocaleString()}/month</p>
              </div>
            </div>
            {expandedSections.income ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4 space-y-3 px-1">
            <div className="p-4 bg-card/50 rounded-xl border border-success/10">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-foreground">Salary</h4>
                  <p className="text-sm text-muted-foreground">Monthly</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-success">+$4,200</div>
                  <div className="text-xs text-muted-foreground">12 transactions</div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-card/50 rounded-xl border border-success/10">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-foreground">Freelance</h4>
                  <p className="text-sm text-muted-foreground">Weekly</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-success">+$800</div>
                  <div className="text-xs text-muted-foreground">8 transactions</div>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 bg-gradient-to-br from-success/10 to-success/5 border-success/20">
            <CardContent className="p-0">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-xs font-medium text-success">Total Income</span>
              </div>
              <div className="text-xl font-bold text-success">
                +${totals.income.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
            <CardContent className="p-0">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-destructive" />
                <span className="text-xs font-medium text-destructive">Total Expenses</span>
              </div>
              <div className="text-xl font-bold text-destructive">
                -${totals.expenses.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Flow Visualization */}
        <div className="text-center py-8">
          <div className="text-6xl mb-4">💰➡️🏦➡️💸</div>
          <p className="text-sm text-muted-foreground">
            Tap Canvas View for interactive flow diagram
          </p>
        </div>

        {/* Floating CTA */}
        <div className="fixed bottom-6 right-6 z-50">
          <Button 
            className="rounded-full h-14 w-14 shadow-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            onClick={() => setShowAutomationSidebar(true)}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      </div>
    );
  }

  // Desktop interactive canvas view
  return (
    <div className="relative h-[800px] w-full overflow-hidden">
      {/* Top Control Panel */}
      <Panel position="top-center" className="z-30">
        <div className="flex items-center gap-4 bg-card/95 backdrop-blur-xl rounded-2xl border border-border/50 p-4 shadow-2xl">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Money Flow Canvas
          </h2>
          
          <div className="h-6 w-px bg-border" />
          
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-40 bg-background/50">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent className="bg-card/95 backdrop-blur-xl border-border/50 z-50">
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
              <SelectItem value="365">This Year</SelectItem>
            </SelectContent>
          </Select>

          <div className="h-6 w-px bg-border" />

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowAutomationSidebar(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Automations
            </Button>
            
            <Button variant="outline" size="sm">
              <Bot className="h-4 w-4 mr-2" />
              Ask ELIN
            </Button>
            
            {isMobile && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMobileView(true)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Mobile
              </Button>
            )}
          </div>
        </div>
      </Panel>

      {/* React Flow Interactive Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{
          padding: 0.1,
          includeHiddenNodes: false,
        }}
        className="bg-gradient-to-br from-background via-muted/10 to-background"
        
        connectionLineStyle={{ stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={24} 
          size={1.2}
          color="hsl(var(--muted-foreground) / 0.2)"
        />
        <Controls 
          className="bg-card/90 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg"
          showZoom={true}
          showFitView={true}
          showInteractive={true}
        />
        <MiniMap 
          className="bg-card/90 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg"
          nodeColor={(node) => {
            switch (node.type) {
              case 'income': return 'hsl(var(--success))';
              case 'expense': return 'hsl(var(--destructive))';
              default: return 'hsl(var(--secondary))';
            }
          }}
          maskColor="hsl(var(--muted) / 0.5)"
        />
      </ReactFlow>

      {/* Bottom Insight Panel */}
      <Panel position="bottom-center" className="z-30">
        <div className="grid grid-cols-4 gap-4 bg-card/95 backdrop-blur-xl rounded-2xl border border-border/50 p-6 shadow-2xl">
          <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-xs font-medium text-success">Total Income</span>
              </div>
              <div className="text-xl font-bold text-success">
                +${totals.income.toLocaleString()}
              </div>
              <Badge variant="outline" className="mt-2 text-xs bg-success/10 text-success border-success/20">
                📈 Healthy Growth
              </Badge>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="h-4 w-4 text-secondary" />
                <span className="text-xs font-medium text-secondary">Net Worth</span>
              </div>
              <div className="text-xl font-bold text-secondary">
                ${totals.netWorth.toLocaleString()}
              </div>
              <Badge variant="outline" className="mt-2 text-xs bg-secondary/10 text-secondary border-secondary/20">
                🎯 On Track
              </Badge>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-destructive" />
                <span className="text-xs font-medium text-destructive">Total Expenses</span>
              </div>
              <div className="text-xl font-bold text-destructive">
                -${totals.expenses.toLocaleString()}
              </div>
              <Badge variant="outline" className="mt-2 text-xs bg-warning/10 text-warning border-warning/20">
                ⚠ Monitor Closely
              </Badge>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-primary">Monthly Surplus</span>
              </div>
              <div className={`text-xl font-bold ${totals.cashFlow > 0 ? 'text-success' : 'text-destructive'}`}>
                {totals.cashFlow > 0 ? '+' : ''}${Math.abs(totals.cashFlow).toLocaleString()}
              </div>
              <Badge variant="outline" className="mt-2 text-xs bg-primary/10 text-primary border-primary/20">
                💡 Optimize Flow
              </Badge>
            </CardContent>
          </Card>
        </div>
      </Panel>

      {/* Floating New Automation Button */}
      <div className="absolute bottom-32 right-6 z-40">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                className="rounded-full h-16 w-16 shadow-2xl bg-gradient-to-r from-primary via-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 hover:scale-110 transition-all duration-300 border-2 border-primary-foreground/20"
                onClick={() => setShowAutomationSidebar(true)}
              >
                <Zap className="h-7 w-7" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="bg-card/95 backdrop-blur-sm">
              <p>⚡ Create Smart Automation</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Automation Sidebar */}
      <AutomationSidebar 
        isOpen={showAutomationSidebar} 
        onClose={() => setShowAutomationSidebar(false)} 
      />
    </div>
  );
};