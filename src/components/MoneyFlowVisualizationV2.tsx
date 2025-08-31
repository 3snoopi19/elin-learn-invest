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

// Modern Sequence.io-inspired Edge Component
const SequenceFlowEdge = ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style, data }: any) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.25,
  });

  return (
    <>
      <BaseEdge 
        path={edgePath} 
        style={{ 
          ...style, 
          strokeWidth: 2,
          stroke: 'hsl(var(--primary))',
          strokeDasharray: '5,3',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
        }}
        markerEnd={MarkerType.ArrowClosed}
      />
      <EdgeLabelRenderer>
        <div
          className="absolute bg-card/95 backdrop-blur-sm border rounded-full px-3 py-1 text-xs font-medium text-foreground shadow-lg pointer-events-none z-10"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          }}
        >
          💸 ${data?.amount || '1,200'}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

// Sequence.io-inspired Node Components
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
        className="w-3 h-3 bg-success border-2 border-white shadow-sm"
      />
      
      <div className={cn(
        "min-w-[200px] p-4 bg-white rounded-xl border-2 shadow-lg transition-all duration-300 cursor-move",
        "hover:shadow-xl hover:-translate-y-1",
        isHovered ? "border-success/30 shadow-success/20" : "border-gray-200"
      )}>
        <div className="flex items-center gap-3 mb-3">
          <div className="text-2xl">{getIcon()}</div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm text-gray-800">{data.label}</h3>
            <p className="text-xs text-gray-500">{data.frequency}</p>
          </div>
        </div>
        
        <div className="text-xl font-bold text-success mb-2">
          +${data.amount.toLocaleString()}
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">{data.totalTransactions} transactions</span>
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
        className="w-3 h-3 bg-secondary border-2 border-white shadow-sm"
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-3 h-3 bg-secondary border-2 border-white shadow-sm"
      />
      
      <div className={cn(
        "min-w-[220px] p-4 bg-white rounded-xl border-2 shadow-lg transition-all duration-300 cursor-move",
        "hover:shadow-xl hover:-translate-y-1",
        isHovered ? "border-secondary/30 shadow-secondary/20" : "border-gray-200"
      )}>
        <div className="flex items-center gap-3 mb-3">
          <div className="text-2xl">{getIcon()}</div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm text-gray-800">{data.name}</h3>
            <p className="text-xs text-gray-500">{data.institution}</p>
          </div>
        </div>
        
        <div className={cn(
          "text-xl font-bold mb-2",
          data.balance < 0 ? 'text-red-600' : 'text-gray-800'
        )}>
          {formatCurrency(data.balance)}
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Last sync: Today</span>
          <Badge 
            variant="outline"
            className={cn(
              "border",
              getStatusColor() === 'success' && "bg-green-50 text-green-700 border-green-200",
              getStatusColor() === 'destructive' && "bg-red-50 text-red-700 border-red-200",
              getStatusColor() === 'warning' && "bg-yellow-50 text-yellow-700 border-yellow-200"
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
        className="w-3 h-3 bg-red-500 border-2 border-white shadow-sm"
      />
      
      <div className={cn(
        "min-w-[200px] p-4 bg-white rounded-xl border-2 shadow-lg transition-all duration-300 cursor-move",
        "hover:shadow-xl hover:-translate-y-1",
        isHovered ? "border-red-300 shadow-red-100" : "border-gray-200"
      )}>
        <div className="flex items-center gap-3 mb-3">
          <div className="text-2xl">{getIcon()}</div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm text-gray-800">{data.label}</h3>
            <p className="text-xs text-gray-500">{data.frequency}</p>
          </div>
        </div>
        
        <div className="text-xl font-bold text-red-600 mb-2">
          -${data.amount.toLocaleString()}
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">{data.totalTransactions} transactions</span>
          <Badge 
            variant="outline"
            className={cn(
              "border",
              data.amount > 1000 
                ? "bg-red-50 text-red-700 border-red-200" 
                : "bg-gray-50 text-gray-600 border-gray-200"
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
          <button className="text-xs px-2 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors">
            Analyze
          </button>
          <button className="text-xs px-2 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors">
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
    
    // Modern edges with sequence styling
    const flowEdges: Edge[] = [
      {
        id: 'e1',
        source: 'income-salary',
        target: accounts[0]?.id || 'acc_1',
        type: 'sequence',
        data: { amount: '4,200' },
        animated: true,
        style: { strokeWidth: 2 },
      },
      {
        id: 'e2',
        source: 'income-freelance',
        target: accounts[0]?.id || 'acc_1',
        type: 'sequence',
        data: { amount: '800' },
        animated: true,
        style: { strokeWidth: 2 },
      },
      {
        id: 'e3',
        source: accounts[0]?.id || 'acc_1',
        target: 'expense-rent',
        type: 'sequence',
        data: { amount: '1,800' },
        style: { strokeWidth: 2 },
      },
      {
        id: 'e4',
        source: accounts[0]?.id || 'acc_1',
        target: 'expense-groceries',
        type: 'sequence',
        data: { amount: '650' },
        style: { strokeWidth: 2 },
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
    // Mobile simplified view
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Money Flow</h3>
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Simplified mobile cards */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  💼
                </div>
                <div>
                  <h4 className="font-medium">Income Sources</h4>
                  <p className="text-2xl font-bold text-green-600">+$5,000</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  🏦
                </div>
                <div>
                  <h4 className="font-medium">Account Balance</h4>
                  <p className="text-2xl font-bold text-blue-600">${accounts.reduce((sum, acc) => sum + acc.balance, 0).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  💸
                </div>
                <div>
                  <h4 className="font-medium">Monthly Expenses</h4>
                  <p className="text-2xl font-bold text-red-600">-$2,450</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-96 md:h-[600px] w-full relative bg-gray-50/50 rounded-xl border overflow-hidden">
      {/* Header Controls */}
      <Panel position="top-left">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg border p-3 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Money Flow</span>
            </div>
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-32 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
          color="#e5e7eb"
        />
        <Controls 
          className="bg-white/90 backdrop-blur-sm border rounded-lg shadow-sm"
          showZoom={true}
          showFitView={true}
          showInteractive={false}
        />
        <MiniMap 
          className="bg-white/90 backdrop-blur-sm border rounded-lg shadow-sm"
          nodeColor="#e5e7eb"
          maskColor="rgba(255, 255, 255, 0.8)"
        />
      </ReactFlow>
    </div>
  );
};