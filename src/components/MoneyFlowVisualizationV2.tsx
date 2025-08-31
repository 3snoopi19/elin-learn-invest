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
    return 'hsl(var(--secondary))'; // Account transfers
  };

  return (
    <>
      <BaseEdge 
        path={edgePath} 
        style={{ 
          ...style, 
          strokeWidth: 3,
          stroke: getEdgeColor(),
          strokeDasharray: data?.type === 'expense' ? '8,4' : undefined,
          filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.15))'
        }}
        markerEnd={MarkerType.ArrowClosed}
      />
      <EdgeLabelRenderer>
        <div
          className="absolute bg-card/98 backdrop-blur-md border rounded-full px-4 py-2 text-xs font-semibold text-foreground shadow-lg pointer-events-none z-20 border-border/50"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.1)'
          }}
        >
          💸 ${data?.amount || '1,200'}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

const ModernIncomeNode = ({ data }: { data: NodeData }) => {
  const [isHovered, setIsHovered] = useState(false);

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
    <div 
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-3 h-3 bg-success border-2 border-card shadow-md"
      />
      
      <div className={cn(
        "min-w-[200px] p-4 bg-card rounded-xl border-2 shadow-lg transition-all duration-300 cursor-move",
        "hover:shadow-xl hover:-translate-y-1",
        isHovered ? "border-success/40 shadow-success/20 bg-success/5" : "border-border/60",
        "professional-card"
      )}>
        <div className="flex items-center gap-3 mb-3">
          <div className="text-2xl">{getIcon()}</div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm text-text-heading">{data.label}</h3>
            <p className="text-xs text-text-secondary">{data.frequency}</p>
          </div>
        </div>
        
        <div className="text-xl font-bold text-success mb-2">
          +${data.amount.toLocaleString()}
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-muted">{data.totalTransactions} transactions</span>
          <Badge variant="outline" className="bg-success/10 text-success border-success/30">
            Active
          </Badge>
        </div>

        {/* Hover Enhancement */}
        <div className={cn(
          "mt-3 flex gap-2 transition-opacity duration-200",
          isHovered ? "opacity-100" : "opacity-0"
        )}>
          <button className="text-xs px-2 py-1 bg-success/10 text-success rounded hover:bg-success/20 transition-colors">
            Details
          </button>
          <button className="text-xs px-2 py-1 bg-success/10 text-success rounded hover:bg-success/20 transition-colors">
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};

const ModernAccountNode = ({ data }: { data: any }) => {
  const [isHovered, setIsHovered] = useState(false);

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

  return (
    <div 
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-3 h-3 bg-secondary border-2 border-card shadow-md"
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-3 h-3 bg-secondary border-2 border-card shadow-md"
      />
      
      <div className={cn(
        "min-w-[220px] p-4 bg-card rounded-xl border-2 shadow-lg transition-all duration-300 cursor-move",
        "hover:shadow-xl hover:-translate-y-1",
        isHovered ? "border-secondary/40 shadow-secondary/20 bg-secondary/5" : "border-border/60",
        "professional-card"
      )}>
        <div className="flex items-center gap-3 mb-3">
          <div className="text-2xl">{getIcon()}</div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm text-text-heading">{data.name}</h3>
            <p className="text-xs text-text-secondary">{data.institution}</p>
          </div>
        </div>
        
        <div className={cn(
          "text-xl font-bold mb-2",
          data.balance < 0 ? 'text-destructive' : 'text-text-heading'
        )}>
          {formatCurrency(data.balance)}
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-muted">Last sync: Today</span>
          <Badge 
            variant="outline"
            className={cn(
              "border",
              getStatusColor() === 'success' && "bg-success/10 text-success border-success/30",
              getStatusColor() === 'destructive' && "bg-destructive/10 text-destructive border-destructive/30",
              getStatusColor() === 'warning' && "bg-warning/10 text-warning border-warning/30"
            )}
          >
            {data.balance > 5000 ? 'Healthy' : data.balance < 0 ? 'Credit' : 'Low'}
          </Badge>
        </div>

        {/* Hover Enhancement */}
        <div className={cn(
          "mt-3 flex gap-2 transition-opacity duration-200",
          isHovered ? "opacity-100" : "opacity-0"
        )}>
          <button className="text-xs px-2 py-1 bg-secondary/10 text-secondary rounded hover:bg-secondary/20 transition-colors">
            View
          </button>
          <button className="text-xs px-2 py-1 bg-secondary/10 text-secondary rounded hover:bg-secondary/20 transition-colors">
            Transfer
          </button>
        </div>
      </div>
    </div>
  );
};

const ModernExpenseNode = ({ data }: { data: NodeData }) => {
  const [isHovered, setIsHovered] = useState(false);

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
    <div 
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-3 h-3 bg-destructive border-2 border-card shadow-md"
      />
      
      <div className={cn(
        "min-w-[200px] p-4 bg-card rounded-xl border-2 shadow-lg transition-all duration-300 cursor-move",
        "hover:shadow-xl hover:-translate-y-1",
        isHovered ? "border-destructive/40 shadow-destructive/20 bg-destructive/5" : "border-border/60",
        "professional-card"
      )}>
        <div className="flex items-center gap-3 mb-3">
          <div className="text-2xl">{getIcon()}</div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm text-text-heading">{data.label}</h3>
            <p className="text-xs text-text-secondary">{data.frequency}</p>
          </div>
        </div>
        
        <div className="text-xl font-bold text-destructive mb-2">
          -${data.amount.toLocaleString()}
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-muted">{data.totalTransactions} transactions</span>
          <Badge 
            variant="outline"
            className={cn(
              "border",
              data.amount > 1000 
                ? "bg-destructive/10 text-destructive border-destructive/30" 
                : "bg-muted/50 text-text-muted border-border/50"
            )}
          >
            {data.amount > 1000 ? 'High' : data.category === 'housing' ? 'Fixed' : 'Variable'}
          </Badge>
        </div>

        {/* Hover Enhancement */}
        <div className={cn(
          "mt-3 flex gap-2 transition-opacity duration-200",
          isHovered ? "opacity-100" : "opacity-0"
        )}>
          <button className="text-xs px-2 py-1 bg-destructive/10 text-destructive rounded hover:bg-destructive/20 transition-colors">
            Analyze
          </button>
          <button className="text-xs px-2 py-1 bg-destructive/10 text-destructive rounded hover:bg-destructive/20 transition-colors">
            Reduce
          </button>
        </div>
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

export const MoneyFlowVisualizationV2: React.FC<MoneyFlowVisualizationProps> = ({
  accounts,
  timeframe,
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe || "30");
  const [showMobileView, setShowMobileView] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    setShowMobileView(isMobile);
  }, [isMobile]);

  // Initialize React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Initialize nodes and edges with modern styling
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

    // Account nodes with better positioning
    const accountNodes: Node[] = accounts.map((account, index) => ({
      id: account.id,
      type: 'account',
      position: { x: 400, y: 100 + index * 220 },
      data: { ...account } as Record<string, unknown>,
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
      }
    ];

    const allNodes = [...incomeNodes, ...accountNodes, ...expenseNodes];
    
    // Modern edges with sequence styling and proper flow types
    const flowEdges: Edge[] = [
      {
        id: 'e1',
        source: 'income-salary',
        target: accounts[0]?.id || 'acc_1',
        type: 'sequence',
        data: { amount: '4,200', type: 'income' },
        animated: true,
        style: { strokeWidth: 3 },
      },
      {
        id: 'e2',
        source: 'income-freelance',
        target: accounts[0]?.id || 'acc_1',
        type: 'sequence',
        data: { amount: '800', type: 'income' },
        animated: true,
        style: { strokeWidth: 3 },
      },
      {
        id: 'e3',
        source: accounts[0]?.id || 'acc_1',
        target: 'expense-rent',
        type: 'sequence',
        data: { amount: '1,800', type: 'expense' },
        style: { strokeWidth: 3 },
      },
      {
        id: 'e4',
        source: accounts[0]?.id || 'acc_1',
        target: 'expense-groceries',
        type: 'sequence',
        data: { amount: '650', type: 'expense' },
        style: { strokeWidth: 3 },
      }
    ];

    setNodes(allNodes);
    setEdges(flowEdges);
  }, [accounts]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  if (showMobileView) {
    // Mobile simplified view with collapsible sections
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="mobile-subheading text-text-heading">Money Flow</h3>
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-36 mobile-button">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-50">
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Enhanced mobile cards with proper theming */}
        <div className="space-y-3">
          <Card className="mobile-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-success/20 rounded-xl flex items-center justify-center">
                  <span className="text-xl">💼</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-text-heading">Income Sources</h4>
                  <p className="text-2xl font-bold text-success">+$5,000</p>
                  <p className="text-xs text-text-muted">Monthly total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mobile-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center">
                  <span className="text-xl">🏦</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-text-heading">Account Balance</h4>
                  <p className="text-2xl font-bold text-secondary">${accounts.reduce((sum, acc) => sum + acc.balance, 0).toLocaleString()}</p>
                  <p className="text-xs text-text-muted">Across {accounts.length} accounts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mobile-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-destructive/20 rounded-xl flex items-center justify-center">
                  <span className="text-xl">💸</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-text-heading">Monthly Expenses</h4>
                  <p className="text-2xl font-bold text-destructive">-$2,450</p>
                  <p className="text-xs text-text-muted">Fixed and variable</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action button for mobile */}
        <div className="pt-4">
          <Button className="w-full mobile-button bg-primary hover:bg-primary-hover">
            <Activity className="w-4 h-4 mr-2" />
            View Full Canvas
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-96 md:h-[600px] w-full relative professional-card rounded-xl border overflow-hidden">
      {/* Header Controls */}
      <Panel position="top-left">
        <div className="bg-card/95 backdrop-blur-md rounded-lg border border-border/50 p-3 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-text-heading">Money Flow</span>
            </div>
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-32 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-50">
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Panel>

      {/* New Automation Button */}
      <Panel position="top-right">
        <div className="bg-card/95 backdrop-blur-md rounded-lg border border-border/50 p-2 shadow-lg">
          <Button 
            size="sm" 
            className="bg-primary hover:bg-primary-hover text-primary-foreground"
            onClick={() => {
              // TODO: Implement automation interface
              alert('New Automation feature coming soon! This will allow you to create rules like "When salary arrives, allocate 20% to savings"');
            }}
          >
            <Plus className="h-3 w-3 mr-1" />
            New Automation
          </Button>
        </div>
      </Panel>

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
          padding: 0.2,
        }}
        minZoom={0.5}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={1} 
          color="hsl(var(--border))"
        />
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
      </ReactFlow>
    </div>
  );
};