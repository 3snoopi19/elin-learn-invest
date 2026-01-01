import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
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
  useReactFlow,
  ReactFlowProvider
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
  Activity,
  Maximize2
} from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
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

// Modern Sequence.io-inspired Edge Component with Enhanced Colors
const SequenceFlowEdge = ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style, data }: any) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.3,
  });

  // Determine edge color based on flow type
  const getEdgeColor = () => {
    if (data?.type === 'income') return 'hsl(var(--success))';
    if (data?.type === 'expense') return 'hsl(var(--destructive))';
    if (data?.type === 'transfer') return 'hsl(var(--warning))';
    return 'hsl(var(--secondary))'; // Account transfers
  };

  const isDashed = data?.type === 'expense' || data?.type === 'transfer';

  return (
    <>
      <BaseEdge 
        path={edgePath} 
        style={{ 
          ...style, 
          strokeWidth: 3,
          stroke: getEdgeColor(),
          strokeDasharray: isDashed ? '8,4' : undefined,
          filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.15))'
        }}
        markerEnd={MarkerType.ArrowClosed}
      />
      <EdgeLabelRenderer>
        <div
          className="absolute bg-card/98 backdrop-blur-md border rounded-full px-3 py-1.5 text-xs font-semibold text-foreground shadow-lg pointer-events-none z-20 border-border/50"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.1)'
          }}
        >
          {data?.label || `💸 $${data?.amount || '0'}`}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

const ModernIncomeNode = ({ data }: { data: NodeData }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isMobile = useIsMobile();

  const getIcon = () => {
    switch (data.type) {
      case 'salary': return '💼';
      case 'freelance': return '⚡';
      case 'investment': return '📈';
      case 'business': return '🏢';
      default: return '💰';
    }
  };

  // On mobile, tap to expand instead of hover
  const handleInteraction = () => {
    if (isMobile) {
      setIsHovered(!isHovered);
    }
  };

  return (
    <div 
      className="group relative"
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
      onClick={handleInteraction}
    >
      {/* Handles positioned for both horizontal and vertical layouts */}
      <Handle 
        type="source" 
        position={isMobile ? Position.Bottom : Position.Right} 
        className="w-4 h-4 bg-success border-2 border-card shadow-md"
      />
      
      <div className={cn(
        "p-4 bg-card rounded-xl border-2 shadow-lg transition-all duration-300",
        isMobile ? "min-w-[160px] min-h-[88px] cursor-pointer" : "min-w-[180px] cursor-move",
        !isMobile && "hover:shadow-xl hover:-translate-y-1",
        isHovered ? "border-success/40 shadow-success/20 bg-success/5" : "border-border/60",
        "professional-card"
      )}>
        <div className="flex items-center gap-3 mb-2">
          <div className="text-xl">{getIcon()}</div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm text-text-heading">{data.label}</h3>
            <p className="text-xs text-text-secondary">{data.frequency}</p>
          </div>
        </div>
        
        <div className="text-lg font-bold text-success mb-1">
          +${data.amount.toLocaleString()}
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-muted">{data.totalTransactions} txns</span>
          <Badge variant="outline" className="bg-success/10 text-success border-success/30 text-xs px-2 py-0.5">
            Active
          </Badge>
        </div>
        {isMobile && isHovered && (
          <div className="mt-2 pt-2 border-t border-border/30 text-xs text-text-secondary">
            Tap again to collapse
          </div>
        )}
      </div>
    </div>
  );
};

const ModernAccountNode = ({ data }: { data: any }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isMobile = useIsMobile();

  const getIcon = () => {
    switch (data.type) {
      case 'checking': return '🏦';
      case 'savings': return '🏛️';
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

  const getStatusColor = () => {
    if (data.balance > 5000) return 'success';
    if (data.balance < 0) return 'destructive';
    return 'warning';
  };

  // On mobile, tap to expand instead of hover
  const handleInteraction = () => {
    if (isMobile) {
      setIsHovered(!isHovered);
    }
  };

  return (
    <div 
      className="group relative"
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
      onClick={handleInteraction}
    >
      {/* Handles positioned for both horizontal and vertical layouts */}
      <Handle 
        type="target" 
        position={isMobile ? Position.Top : Position.Left} 
        className="w-4 h-4 bg-secondary border-2 border-card shadow-md"
      />
      <Handle 
        type="source" 
        position={isMobile ? Position.Bottom : Position.Right} 
        className="w-4 h-4 bg-secondary border-2 border-card shadow-md"
      />
      
      <div className={cn(
        "p-4 bg-card rounded-xl border-2 shadow-lg transition-all duration-300",
        isMobile ? "min-w-[180px] min-h-[88px] cursor-pointer" : "min-w-[200px] cursor-move",
        !isMobile && "hover:shadow-xl hover:-translate-y-1",
        isHovered ? "border-secondary/40 shadow-secondary/20 bg-secondary/5" : "border-border/60",
        "professional-card"
      )}>
        <div className="flex items-center gap-3 mb-2">
          <div className="text-xl">{getIcon()}</div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm text-text-heading">{data.name}</h3>
            <p className="text-xs text-text-secondary">{data.institution}</p>
          </div>
        </div>
        
        <div className={cn(
          "text-lg font-bold mb-1",
          data.balance < 0 ? 'text-destructive' : 'text-text-heading'
        )}>
          {formatCurrency(data.balance)}
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-muted">Last sync: Today</span>
          <Badge 
            variant="outline"
            className={cn(
              "border text-xs px-2 py-0.5",
              getStatusColor() === 'success' && "bg-success/10 text-success border-success/30",
              getStatusColor() === 'destructive' && "bg-destructive/10 text-destructive border-destructive/30",
              getStatusColor() === 'warning' && "bg-warning/10 text-warning border-warning/30"
            )}
          >
            {data.balance > 5000 ? 'Healthy' : data.balance < 0 ? 'Credit' : 'Low'}
          </Badge>
        </div>
        {isMobile && isHovered && (
          <div className="mt-2 pt-2 border-t border-border/30 text-xs text-text-secondary">
            Tap again to collapse
          </div>
        )}
      </div>
    </div>
  );
};

const ModernExpenseNode = ({ data }: { data: NodeData }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isMobile = useIsMobile();

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

  // On mobile, tap to expand instead of hover
  const handleInteraction = () => {
    if (isMobile) {
      setIsHovered(!isHovered);
    }
  };

  return (
    <div 
      className="group relative"
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
      onClick={handleInteraction}
    >
      {/* Handles positioned for both horizontal and vertical layouts */}
      <Handle 
        type="target" 
        position={isMobile ? Position.Top : Position.Left} 
        className="w-4 h-4 bg-destructive border-2 border-card shadow-md"
      />
      
      <div className={cn(
        "p-4 bg-card rounded-xl border-2 shadow-lg transition-all duration-300",
        isMobile ? "min-w-[160px] min-h-[88px] cursor-pointer" : "min-w-[180px] cursor-move",
        !isMobile && "hover:shadow-xl hover:-translate-y-1",
        isHovered ? "border-destructive/40 shadow-destructive/20 bg-destructive/5" : "border-border/60",
        "professional-card"
      )}>
        <div className="flex items-center gap-3 mb-2">
          <div className="text-xl">{getIcon()}</div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm text-text-heading">{data.label}</h3>
            <p className="text-xs text-text-secondary">{data.frequency}</p>
          </div>
        </div>
        
        <div className="text-lg font-bold text-destructive mb-1">
          -${data.amount.toLocaleString()}
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-muted">{data.totalTransactions} txns</span>
          <Badge 
            variant="outline"
            className={cn(
              "border text-xs px-2 py-0.5",
              data.amount > 1000 
                ? "bg-destructive/10 text-destructive border-destructive/30" 
                : "bg-muted/50 text-text-muted border-border/50"
            )}
          >
            {data.amount > 1000 ? 'High' : data.category === 'housing' ? 'Fixed' : 'Variable'}
          </Badge>
        </div>
        {isMobile && isHovered && (
          <div className="mt-2 pt-2 border-t border-border/30 text-xs text-text-secondary">
            Tap again to collapse
          </div>
        )}
      </div>
    </div>
  );
};

// Node types
const nodeTypes = {
  income: ModernIncomeNode,
  account: ModernAccountNode,
  expense: ModernExpenseNode,
};

const edgeTypes = {
  sequence: SequenceFlowEdge,
};

// Collapsible Summary Bar Component for Mobile
const CollapsibleSummaryBar = ({ 
  income, 
  expenses, 
  netWorth 
}: { 
  income: number; 
  expenses: number; 
  netWorth: number;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const cashFlow = income - expenses;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <div className="bg-card/95 backdrop-blur-md border border-border/50 rounded-xl p-3 cursor-pointer shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-success" />
                <span className="text-xs font-medium text-success">+${income.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5 text-destructive" />
                <span className="text-xs font-medium text-destructive">-${expenses.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={cn(
                  "text-[10px]",
                  cashFlow >= 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                )}
              >
                {cashFlow >= 0 ? '+' : ''}{cashFlow.toLocaleString()} flow
              </Badge>
              {isOpen ? (
                <ChevronDown className="w-4 h-4 text-text-muted" />
              ) : (
                <ChevronUp className="w-4 h-4 text-text-muted" />
              )}
            </div>
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-2 bg-card/95 backdrop-blur-md border border-border/50 rounded-xl p-4 shadow-lg space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <p className="text-[10px] text-text-muted uppercase tracking-wider">Monthly Income</p>
              <p className="text-lg font-bold text-success">+${income.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-text-muted uppercase tracking-wider">Monthly Expenses</p>
              <p className="text-lg font-bold text-destructive">-${expenses.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-text-muted uppercase tracking-wider">Net Worth</p>
              <p className="text-lg font-bold text-text-heading">${netWorth.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-text-muted uppercase tracking-wider">Cash Flow</p>
              <p className={cn("text-lg font-bold", cashFlow >= 0 ? "text-success" : "text-destructive")}>
                {cashFlow >= 0 ? '+' : ''}{cashFlow.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

// Inner component that uses useReactFlow hook
const MoneyFlowCanvasInner: React.FC<MoneyFlowVisualizationProps> = ({
  accounts,
  timeframe,
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe || "30");
  const isMobile = useIsMobile();
  const { fitView } = useReactFlow();
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Auto fit view on resize and orientation change
  useEffect(() => {
    const handleResize = () => {
      setTimeout(() => {
        fitView({ padding: 0.2, duration: 300 });
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [fitView]);

  // Find credit card account for edge connection
  const checkingAccount = accounts.find(acc => acc.type === 'checking');
  const creditCardAccount = accounts.find(acc => acc.type === 'credit');
  const estimatedCreditPayment = creditCardAccount ? Math.abs(creditCardAccount.balance) : 0;

  // Calculate totals for summary
  const totalIncome = 5000; // Mock total
  const totalExpenses = 2450;
  const netWorth = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  // Initialize nodes and edges with mobile-first vertical layout
  useEffect(() => {
    // Position calculation based on layout direction
    const getPosition = (section: 'income' | 'account' | 'expense', index: number) => {
      if (isMobile) {
        // Vertical layout: Top to Bottom
        const yBase = section === 'income' ? 20 : section === 'account' ? 280 : 540;
        const xOffset = index * 200;
        return { x: 20 + xOffset, y: yBase + (index * 20) };
      } else {
        // Horizontal layout: Left to Right
        const xBase = section === 'income' ? 50 : section === 'account' ? 400 : 750;
        return { x: xBase, y: 100 + index * 200 };
      }
    };

    // Income nodes - disable drag on mobile
    const incomeNodes: Node[] = [
      {
        id: 'income-salary',
        type: 'income',
        position: getPosition('income', 0),
        data: { 
          label: 'Monthly Salary', 
          amount: 4200,
          type: 'salary',
          frequency: 'Monthly',
          totalTransactions: 12
        },
        draggable: !isMobile,
      },
      {
        id: 'income-freelance',
        type: 'income',
        position: getPosition('income', 1),
        data: { 
          label: 'Freelance Work', 
          amount: 800,
          type: 'freelance',
          frequency: 'Weekly',
          totalTransactions: 8
        },
        draggable: !isMobile,
      }
    ];

    // Account nodes with better positioning - disable drag on mobile
    const accountNodes: Node[] = accounts.map((account, index) => ({
      id: account.id,
      type: 'account',
      position: getPosition('account', index),
      data: { ...account } as Record<string, unknown>,
      draggable: !isMobile,
    }));

    // Expense nodes - disable drag on mobile
    const expenseNodes: Node[] = [
      {
        id: 'expense-rent',
        type: 'expense',
        position: getPosition('expense', 0),
        data: { 
          label: 'Rent & Utilities', 
          amount: 1800,
          category: 'housing',
          frequency: 'Monthly',
          totalTransactions: 2
        },
        draggable: !isMobile,
      },
      {
        id: 'expense-groceries',
        type: 'expense',
        position: getPosition('expense', 1),
        data: { 
          label: 'Groceries', 
          amount: 650,
          category: 'food',
          frequency: 'Weekly',
          totalTransactions: 15
        },
        draggable: !isMobile,
      }
    ];

    const allNodes = [...incomeNodes, ...accountNodes, ...expenseNodes];
    
    // Modern edges with sequence styling and proper flow types
    const flowEdges: Edge[] = [
      {
        id: 'e1',
        source: 'income-salary',
        target: checkingAccount?.id || 'acc_1',
        type: 'sequence',
        data: { amount: '4,200', type: 'income' },
        animated: true,
        style: { strokeWidth: 3 },
      },
      {
        id: 'e2',
        source: 'income-freelance',
        target: checkingAccount?.id || 'acc_1',
        type: 'sequence',
        data: { amount: '800', type: 'income' },
        animated: true,
        style: { strokeWidth: 3 },
      },
      {
        id: 'e3',
        source: checkingAccount?.id || 'acc_1',
        target: 'expense-rent',
        type: 'sequence',
        data: { amount: '1,800', type: 'expense' },
        style: { strokeWidth: 3 },
      },
      {
        id: 'e4',
        source: checkingAccount?.id || 'acc_1',
        target: 'expense-groceries',
        type: 'sequence',
        data: { amount: '650', type: 'expense' },
        style: { strokeWidth: 3 },
      }
    ];

    // Add credit card payment edge if both accounts exist
    if (checkingAccount && creditCardAccount) {
      flowEdges.push({
        id: 'e-credit-payment',
        source: checkingAccount.id,
        target: creditCardAccount.id,
        type: 'sequence',
        data: { 
          amount: estimatedCreditPayment.toLocaleString(), 
          type: 'transfer',
          label: `💳 Credit Payment $${estimatedCreditPayment.toLocaleString()}`
        },
        style: { strokeWidth: 3 },
      });
    }

    setNodes(allNodes);
    setEdges(flowEdges);

    // Fit view after nodes are set
    setTimeout(() => {
      fitView({ padding: 0.2, duration: 300 });
    }, 100);
  }, [accounts, isMobile, checkingAccount, creditCardAccount, estimatedCreditPayment, fitView]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleFitView = useCallback(() => {
    fitView({ padding: 0.2, duration: 300 });
  }, [fitView]);

  return (
    <div ref={containerRef} className="flex flex-col h-full">
      {/* Mobile View Only Badge */}
      {isMobile && (
        <div className="flex items-center justify-between mb-3 px-1">
          <Badge variant="outline" className="bg-muted/50 text-text-secondary border-border/50 text-xs">
            <Eye className="w-3 h-3 mr-1" />
            View Only Mode
          </Badge>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              className="h-11 min-w-[100px] text-sm bg-success/10 text-success border-success/30"
              onClick={() => toast.info('Add Income feature coming soon!')}
            >
              <Plus className="h-4 w-4 mr-1" />
              Income
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              className="h-11 min-w-[100px] text-sm bg-destructive/10 text-destructive border-destructive/30"
              onClick={() => toast.info('Add Expense feature coming soon!')}
            >
              <Plus className="h-4 w-4 mr-1" />
              Expense
            </Button>
          </div>
        </div>
      )}

      {/* Main Canvas - Fixed height to prevent scroll trap */}
      <div className={cn(
        "w-full relative professional-card rounded-xl border overflow-hidden",
        isMobile ? "h-[350px] flex-shrink-0" : "flex-1 h-[500px] md:h-[600px]"
      )}>
        {/* Header Controls */}
        <Panel position="top-left">
          <div className="bg-card/95 backdrop-blur-md rounded-lg border border-border/50 p-2 shadow-lg">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-text-heading">Money Flow</span>
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger className="w-20 h-9 text-sm min-h-[44px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-50 bg-card">
                  <SelectItem value="7">7d</SelectItem>
                  <SelectItem value="30">30d</SelectItem>
                  <SelectItem value="90">90d</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Panel>

        {/* Fit View & Automation Buttons */}
        <Panel position="top-right">
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline"
              className="h-11 w-11 p-0 bg-card/95 backdrop-blur-md border-border/50 min-w-[44px] min-h-[44px]"
              onClick={handleFitView}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            {!isMobile && (
              <Button 
                size="sm" 
                className="bg-primary hover:bg-primary-hover text-primary-foreground h-11 min-h-[44px]"
                onClick={() => {
                  toast.info('New Automation feature coming soon!');
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Automate
              </Button>
            )}
          </div>
        </Panel>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={isMobile ? undefined : onNodesChange}
          onEdgesChange={isMobile ? undefined : onEdgesChange}
          onConnect={isMobile ? undefined : onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{
            padding: 0.2,
          }}
          minZoom={0.3}
          maxZoom={1.5}
          defaultViewport={{ x: 0, y: 0, zoom: 0.7 }}
          nodesDraggable={!isMobile}
          nodesConnectable={!isMobile}
          elementsSelectable={!isMobile}
          panOnDrag={!isMobile}
          panOnScroll={false}
          zoomOnScroll={!isMobile}
          zoomOnPinch={true}
          zoomOnDoubleClick={!isMobile}
          preventScrolling={false}
        >
          <Background 
            variant={BackgroundVariant.Dots} 
            gap={20} 
            size={1} 
            color="hsl(var(--border))"
          />
          {!isMobile && (
            <>
              <Controls 
                className="bg-card/95 backdrop-blur-md border border-border/50 rounded-lg shadow-lg"
                showZoom={true}
                showFitView={true}
                showInteractive={false}
              />
              <MiniMap 
                className="bg-card/95 backdrop-blur-md border border-border/50 rounded-lg shadow-lg"
                nodeColor="hsl(var(--muted))"
                maskColor="hsla(var(--card), 0.9)"
              />
            </>
          )}
        </ReactFlow>
      </div>

      {/* Collapsible Summary Bar for Mobile */}
      {isMobile && (
        <div className="mt-3">
          <CollapsibleSummaryBar 
            income={totalIncome}
            expenses={totalExpenses}
            netWorth={netWorth}
          />
        </div>
      )}
    </div>
  );
};

// Main component wrapped with ReactFlowProvider
export const MoneyFlowVisualizationV2: React.FC<MoneyFlowVisualizationProps> = (props) => {
  return (
    <ReactFlowProvider>
      <MoneyFlowCanvasInner {...props} />
    </ReactFlowProvider>
  );
};