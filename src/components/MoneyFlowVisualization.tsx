import React, { useCallback, useMemo, useState } from 'react';
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
  Zap
} from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit';
  balance: number;
  institution: string;
}

interface MoneyFlowVisualizationProps {
  accounts: Account[];
  timeframe: string;
}

const IncomeNode = ({ data }: { data: any }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'salary':
        return <Briefcase className="h-5 w-5 text-emerald-600" />;
      case 'freelance':
        return <Zap className="h-5 w-5 text-emerald-600" />;
      default:
        return <DollarSign className="h-5 w-5 text-emerald-600" />;
    }
  };

  return (
    <div className="group relative px-5 py-4 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/30 border-2 border-emerald-200 dark:border-emerald-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 min-w-[180px] cursor-pointer">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-emerald-600/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      <div className="relative">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg group-hover:scale-110 transition-transform duration-200">
            {getIcon(data.type)}
          </div>
          <div className="flex flex-col">
            <div className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">{data.label}</div>
            <div className="text-xs text-emerald-700 dark:text-emerald-300">{data.frequency || 'Monthly'}</div>
          </div>
        </div>
        <div className="text-xl font-bold text-emerald-800 dark:text-emerald-200">
          +{data.amount}
        </div>
        <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
          {data.transactions || '12'} transactions
        </div>
      </div>
    </div>
  );
};

const AccountNode = ({ data }: { data: any }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'checking':
        return <Wallet className="h-5 w-5 text-blue-600" />;
      case 'savings':
        return <PiggyBank className="h-5 w-5 text-blue-600" />;
      case 'credit':
        return <CreditCard className="h-5 w-5 text-blue-600" />;
      default:
        return <Building2 className="h-5 w-5 text-blue-600" />;
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
    <div className="group relative px-5 py-4 bg-gradient-to-br from-blue-50 to-slate-50 dark:from-slate-900/50 dark:to-blue-950/30 border-2 border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 min-w-[200px] cursor-pointer">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-slate-400/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      <div className="relative">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg group-hover:scale-110 transition-transform duration-200">
            {getIcon(data.type)}
          </div>
          <div className="flex flex-col">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{data.name}</div>
            <div className="text-xs text-slate-600 dark:text-slate-400">{data.institution}</div>
          </div>
        </div>
        <div className={`text-xl font-bold ${data.balance < 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-slate-200'}`}>
          {formatCurrency(data.balance)}
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Last updated today
        </div>
      </div>
    </div>
  );
};

const ExpenseNode = ({ data }: { data: any }) => {
  const getIcon = (category: string) => {
    switch (category) {
      case 'rent':
        return <Home className="h-5 w-5 text-rose-600" />;
      case 'car':
        return <Car className="h-5 w-5 text-rose-600" />;
      case 'credit':
        return <CreditCard className="h-5 w-5 text-rose-600" />;
      case 'shopping':
        return <ShoppingCart className="h-5 w-5 text-rose-600" />;
      default:
        return <DollarSign className="h-5 w-5 text-rose-600" />;
    }
  };

  return (
    <div className="group relative px-5 py-4 bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-950/50 dark:to-red-900/30 border-2 border-rose-200 dark:border-rose-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 min-w-[180px] cursor-pointer">
      <div className="absolute inset-0 bg-gradient-to-br from-rose-400/10 to-red-400/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      <div className="relative">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-rose-100 dark:bg-rose-900/50 rounded-lg group-hover:scale-110 transition-transform duration-200">
            {getIcon(data.category)}
          </div>
          <div className="flex flex-col">
            <div className="text-sm font-semibold text-rose-900 dark:text-rose-100">{data.label}</div>
            <div className="text-xs text-rose-700 dark:text-rose-300">{data.frequency || 'Monthly'}</div>
          </div>
        </div>
        <div className="text-xl font-bold text-rose-800 dark:text-rose-200">
          -{data.amount}
        </div>
        <div className="text-xs text-rose-600 dark:text-rose-400 mt-1">
          {data.transactions || '5'} transactions
        </div>
      </div>
    </div>
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
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe || "30");

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

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Money Flow Automation
          </h3>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
            <span>Income</span>
            <div className="w-3 h-3 bg-blue-500 rounded-full ml-3"></div>
            <span>Accounts</span>
            <div className="w-3 h-3 bg-rose-500 rounded-full ml-3"></div>
            <span>Expenses</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-40 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="default" 
            size="sm" 
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Automation
          </Button>
        </div>
      </div>

      {/* Flow Visualization */}
      <div className="h-[600px] w-full bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{
            padding: 0.1,
            includeHiddenNodes: false,
          }}
          className="rounded-xl"
          proOptions={{ hideAttribution: true }}
        >
          <Controls 
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-sm"
            showZoom={true}
            showFitView={true}
            showInteractive={true}
          />
          <Background 
            variant={BackgroundVariant.Dots} 
            gap={16} 
            size={1} 
            color="#e2e8f0"
            className="opacity-30"
          />
        </ReactFlow>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/30 rounded-xl border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-sm text-emerald-700 dark:text-emerald-300">Total Income</div>
              <div className="text-xl font-bold text-emerald-800 dark:text-emerald-200">+$5,150</div>
            </div>
          </div>
        </div>
        <div className="p-4 bg-gradient-to-br from-blue-50 to-slate-50 dark:from-slate-900/50 dark:to-blue-950/30 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
              <Wallet className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Net Worth</div>
              <div className="text-xl font-bold text-slate-800 dark:text-slate-200">$12,450</div>
            </div>
          </div>
        </div>
        <div className="p-4 bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-950/50 dark:to-red-900/30 rounded-xl border border-rose-200 dark:border-rose-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 dark:bg-rose-900/50 rounded-lg">
              <ShoppingCart className="h-5 w-5 text-rose-600" />
            </div>
            <div>
              <div className="text-sm text-rose-700 dark:text-rose-300">Total Expenses</div>
              <div className="text-xl font-bold text-rose-800 dark:text-rose-200">-$3,155</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};