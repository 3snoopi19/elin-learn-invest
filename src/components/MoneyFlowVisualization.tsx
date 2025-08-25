import React, { useCallback, useMemo } from 'react';
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
import { DollarSign, PiggyBank, CreditCard, Briefcase, Home, Car } from 'lucide-react';

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

const AccountNode = ({ data }: { data: any }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'checking':
        return <DollarSign className="h-5 w-5" />;
      case 'savings':
        return <PiggyBank className="h-5 w-5" />;
      case 'credit':
        return <CreditCard className="h-5 w-5" />;
      default:
        return <DollarSign className="h-5 w-5" />;
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
    <div className="px-4 py-3 shadow-lg rounded-lg bg-card border border-border min-w-[160px]">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1 rounded-full bg-muted">
          {getIcon(data.type)}
        </div>
        <div className="text-sm font-medium text-foreground">{data.name}</div>
      </div>
      <div className="text-sm text-muted-foreground mb-1">{data.institution}</div>
      <div className={`text-lg font-semibold ${data.balance < 0 ? 'text-destructive' : 'text-foreground'}`}>
        {formatCurrency(data.balance)}
      </div>
    </div>
  );
};

const IncomeNode = ({ data }: { data: any }) => (
  <div className="px-4 py-3 shadow-lg rounded-lg bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 min-w-[140px]">
    <div className="flex items-center gap-2 mb-2">
      <Briefcase className="h-4 w-4 text-green-600 dark:text-green-400" />
      <div className="text-sm font-medium text-green-800 dark:text-green-200">{data.label}</div>
    </div>
    <div className="text-lg font-semibold text-green-700 dark:text-green-300">
      +{data.amount}
    </div>
  </div>
);

const ExpenseNode = ({ data }: { data: any }) => {
  const getIcon = (category: string) => {
    switch (category) {
      case 'rent':
        return <Home className="h-4 w-4" />;
      case 'car':
        return <Car className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  return (
    <div className="px-4 py-3 shadow-lg rounded-lg bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 min-w-[140px]">
      <div className="flex items-center gap-2 mb-2">
        {getIcon(data.category)}
        <div className="text-sm font-medium text-red-800 dark:text-red-200">{data.label}</div>
      </div>
      <div className="text-lg font-semibold text-red-700 dark:text-red-300">
        -{data.amount}
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
  const initialNodes = useMemo((): Node[] => {
    const accountNodes: Node[] = accounts.map((account, index) => ({
      id: account.id,
      type: 'account',
      position: { x: 300, y: 50 + index * 120 },
      data: { ...account } as Record<string, unknown>,
      sourcePosition: Position.Left,
      targetPosition: Position.Right,
    }));

    const incomeNodes: Node[] = [
      {
        id: 'income-salary',
        type: 'income',
        position: { x: 50, y: 100 },
        data: { label: 'Salary', amount: '$4,200' },
        sourcePosition: Position.Right,
      },
      {
        id: 'income-freelance',
        type: 'income',
        position: { x: 50, y: 250 },
        data: { label: 'Freelance', amount: '$800' },
        sourcePosition: Position.Right,
      },
    ];

    const expenseNodes: Node[] = [
      {
        id: 'expense-rent',
        type: 'expense',
        position: { x: 600, y: 80 },
        data: { label: 'Rent', amount: '$1,800', category: 'rent' },
        targetPosition: Position.Left,
      },
      {
        id: 'expense-car',
        type: 'expense',
        position: { x: 600, y: 200 },
        data: { label: 'Car Payment', amount: '$420', category: 'car' },
        targetPosition: Position.Left,
      },
      {
        id: 'expense-credit',
        type: 'expense',
        position: { x: 600, y: 320 },
        data: { label: 'Credit Card', amount: '$285', category: 'credit' },
        targetPosition: Position.Left,
      },
    ];

    return [...incomeNodes, ...accountNodes, ...expenseNodes];
  }, [accounts]);

  const initialEdges = useMemo(() => [
    // Income flows
    {
      id: 'salary-checking',
      source: 'income-salary',
      target: 'acc_1',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#22c55e', strokeWidth: 3 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#22c55e' },
      label: 'Direct Deposit',
    },
    {
      id: 'freelance-checking',
      source: 'income-freelance',
      target: 'acc_1',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#22c55e', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#22c55e' },
    },
    // Savings transfer
    {
      id: 'checking-savings',
      source: 'acc_1',
      target: 'acc_2',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#3b82f6', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
      label: '20% Save',
    },
    // Expense flows
    {
      id: 'checking-rent',
      source: 'acc_1',
      target: 'expense-rent',
      type: 'smoothstep',
      style: { stroke: '#ef4444', strokeWidth: 3 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' },
    },
    {
      id: 'checking-car',
      source: 'acc_1',
      target: 'expense-car',
      type: 'smoothstep',
      style: { stroke: '#ef4444', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' },
    },
    // Credit card payment
    {
      id: 'checking-credit-payment',
      source: 'acc_1',
      target: 'acc_3',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#f59e0b', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' },
      label: 'Payment',
    },
    {
      id: 'credit-expense',
      source: 'acc_3',
      target: 'expense-credit',
      type: 'smoothstep',
      style: { stroke: '#ef4444', strokeWidth: 2 },
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
    <div className="h-96 w-full border rounded-lg bg-background">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="rounded-lg"
      >
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};