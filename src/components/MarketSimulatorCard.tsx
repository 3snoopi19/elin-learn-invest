import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Plus,
  Minus,
  RotateCcw,
  Eye,
  Activity,
  Target,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

interface Position {
  id: string;
  symbol: string;
  name: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  gainLoss: number;
  gainLossPercent: number;
}

interface SimulatorData {
  balance: number;
  totalValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  positions: Position[];
  transactions: Transaction[];
}

interface Transaction {
  id: string;
  type: 'buy' | 'sell';
  symbol: string;
  shares: number;
  price: number;
  timestamp: Date;
}

const mockStocks = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 175.43, change: 2.34, changePercent: 1.35 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.56, change: -1.23, changePercent: -0.85 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.85, change: 4.67, changePercent: 1.25 },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 238.45, change: -8.32, changePercent: -3.37 },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 875.23, change: 15.67, changePercent: 1.82 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 156.78, change: 0.89, changePercent: 0.57 }
];

export const MarketSimulatorCard = () => {
  const [simulatorData, setSimulatorData] = useState<SimulatorData>({
    balance: 100000, // Start with $100k virtual money
    totalValue: 100000,
    totalGainLoss: 0,
    totalGainLossPercent: 0,
    positions: [],
    transactions: []
  });

  const [selectedStock, setSelectedStock] = useState<typeof mockStocks[0] | null>(null);
  const [tradeAmount, setTradeAmount] = useState<string>('');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [view, setView] = useState<'trade' | 'portfolio'>('trade');

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update positions with new prices (simulate market movement)
      setSimulatorData(prev => {
        const updatedPositions = prev.positions.map(position => {
          const mockStock = mockStocks.find(s => s.symbol === position.symbol);
          if (mockStock) {
            const priceChange = (Math.random() - 0.5) * 2; // Random price movement
            const newPrice = Math.max(0.01, mockStock.price + priceChange);
            const gainLoss = (newPrice - position.avgPrice) * position.shares;
            const gainLossPercent = ((newPrice - position.avgPrice) / position.avgPrice) * 100;
            
            return {
              ...position,
              currentPrice: newPrice,
              gainLoss,
              gainLossPercent
            };
          }
          return position;
        });

        const totalPositionValue = updatedPositions.reduce((acc, pos) => 
          acc + (pos.currentPrice * pos.shares), 0
        );
        const totalValue = prev.balance + totalPositionValue;
        const totalGainLoss = totalValue - 100000; // Against initial $100k
        const totalGainLossPercent = (totalGainLoss / 100000) * 100;

        return {
          ...prev,
          positions: updatedPositions,
          totalValue,
          totalGainLoss,
          totalGainLossPercent
        };
      });
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleTrade = () => {
    if (!selectedStock || !tradeAmount) return;

    const shares = parseInt(tradeAmount);
    const totalCost = shares * selectedStock.price;

    if (tradeType === 'buy') {
      if (totalCost > simulatorData.balance) {
        alert('Insufficient funds!');
        return;
      }

      const existingPosition = simulatorData.positions.find(p => p.symbol === selectedStock.symbol);
      
      setSimulatorData(prev => {
        const newTransaction: Transaction = {
          id: Date.now().toString(),
          type: 'buy',
          symbol: selectedStock.symbol,
          shares,
          price: selectedStock.price,
          timestamp: new Date()
        };

        let updatedPositions;
        if (existingPosition) {
          // Update existing position
          const totalShares = existingPosition.shares + shares;
          const totalCost = (existingPosition.avgPrice * existingPosition.shares) + (selectedStock.price * shares);
          const newAvgPrice = totalCost / totalShares;
          
          updatedPositions = prev.positions.map(p =>
            p.symbol === selectedStock.symbol
              ? {
                  ...p,
                  shares: totalShares,
                  avgPrice: newAvgPrice,
                  currentPrice: selectedStock.price,
                  gainLoss: (selectedStock.price - newAvgPrice) * totalShares,
                  gainLossPercent: ((selectedStock.price - newAvgPrice) / newAvgPrice) * 100
                }
              : p
          );
        } else {
          // Create new position
          const newPosition: Position = {
            id: Date.now().toString(),
            symbol: selectedStock.symbol,
            name: selectedStock.name,
            shares,
            avgPrice: selectedStock.price,
            currentPrice: selectedStock.price,
            gainLoss: 0,
            gainLossPercent: 0
          };
          updatedPositions = [...prev.positions, newPosition];
        }

        return {
          ...prev,
          balance: prev.balance - totalCost,
          positions: updatedPositions,
          transactions: [newTransaction, ...prev.transactions]
        };
      });
    } else {
      // Sell logic
      const position = simulatorData.positions.find(p => p.symbol === selectedStock.symbol);
      if (!position || position.shares < shares) {
        alert('Insufficient shares to sell!');
        return;
      }

      setSimulatorData(prev => {
        const newTransaction: Transaction = {
          id: Date.now().toString(),
          type: 'sell',
          symbol: selectedStock.symbol,
          shares,
          price: selectedStock.price,
          timestamp: new Date()
        };

        const updatedPositions = prev.positions
          .map(p => 
            p.symbol === selectedStock.symbol
              ? { ...p, shares: p.shares - shares }
              : p
          )
          .filter(p => p.shares > 0); // Remove positions with 0 shares

        return {
          ...prev,
          balance: prev.balance + (shares * selectedStock.price),
          positions: updatedPositions,
          transactions: [newTransaction, ...prev.transactions]
        };
      });
    }

    setTradeAmount('');
    setSelectedStock(null);
  };

  const resetSimulator = () => {
    setSimulatorData({
      balance: 100000,
      totalValue: 100000,
      totalGainLoss: 0,
      totalGainLossPercent: 0,
      positions: [],
      transactions: []
    });
  };

  return (
    <Card className="professional-card border-0 shadow-xl h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative p-2 bg-secondary/20 rounded-lg">
              <Activity className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-text-heading">Paper Trading</CardTitle>
              <p className="text-text-secondary text-sm">Practice with virtual money</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={resetSimulator}
            className="mobile-button"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>

        {/* Portfolio Summary */}
        <div className="bg-card/50 rounded-lg p-4 border border-border/50">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-text-heading">
                ${simulatorData.totalValue.toLocaleString()}
              </div>
              <div className="text-text-secondary text-sm">Total Value</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold flex items-center justify-center gap-1 ${
                simulatorData.totalGainLoss >= 0 ? 'text-success' : 'text-destructive'
              }`}>
                {simulatorData.totalGainLoss >= 0 ? (
                  <ArrowUpRight className="w-5 h-5" />
                ) : (
                  <ArrowDownRight className="w-5 h-5" />
                )}
                ${Math.abs(simulatorData.totalGainLoss).toLocaleString()}
              </div>
              <div className="text-text-secondary text-sm">
                {simulatorData.totalGainLossPercent >= 0 ? '+' : ''}
                {simulatorData.totalGainLossPercent.toFixed(2)}%
              </div>
            </div>
          </div>
          <div className="mt-3 text-center">
            <div className="text-text-secondary text-sm">
              Cash: ${simulatorData.balance.toLocaleString()}
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2">
          <Button
            variant={view === 'trade' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('trade')}
            className="flex-1 mobile-button"
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Trade
          </Button>
          <Button
            variant={view === 'portfolio' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('portfolio')}
            className="flex-1 mobile-button"
          >
            <Eye className="w-4 h-4 mr-2" />
            Portfolio
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {view === 'trade' ? (
          <div className="space-y-4">
            {/* Stock Selection */}
            <div className="space-y-3">
              <h4 className="font-semibold text-text-heading">Available Stocks</h4>
              <ScrollArea className="h-48">
                <div className="space-y-2">
                  {mockStocks.map((stock) => (
                    <div
                      key={stock.symbol}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedStock?.symbol === stock.symbol
                          ? 'border-primary bg-primary/10'
                          : 'border-border/30 bg-card/30 hover:bg-card/50'
                      }`}
                      onClick={() => setSelectedStock(stock)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-text-heading">{stock.symbol}</div>
                          <div className="text-xs text-text-secondary truncate">{stock.name}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-text-heading">${stock.price}</div>
                          <div className={`text-xs flex items-center gap-1 ${
                            stock.change >= 0 ? 'text-success' : 'text-destructive'
                          }`}>
                            {stock.change >= 0 ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            {stock.changePercent >= 0 ? '+' : ''}
                            {stock.changePercent.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Trade Form */}
            {selectedStock && (
              <div className="space-y-4 p-4 bg-card/30 rounded-lg border border-border/30">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-text-heading">Trade {selectedStock.symbol}</h4>
                  <div className="flex gap-2">
                    <Button
                      variant={tradeType === 'buy' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTradeType('buy')}
                      className="mobile-button"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Buy
                    </Button>
                    <Button
                      variant={tradeType === 'sell' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTradeType('sell')}
                      className="mobile-button"
                    >
                      <Minus className="w-3 h-3 mr-1" />
                      Sell
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-text-secondary">Number of Shares</label>
                    <Input
                      type="number"
                      placeholder="Enter shares"
                      value={tradeAmount}
                      onChange={(e) => setTradeAmount(e.target.value)}
                      className="mobile-input"
                    />
                  </div>

                  {tradeAmount && (
                    <div className="text-sm text-text-secondary">
                      Total: ${(parseInt(tradeAmount) * selectedStock.price).toLocaleString()}
                    </div>
                  )}

                  <Button
                    onClick={handleTrade}
                    disabled={!tradeAmount || parseInt(tradeAmount) <= 0}
                    className="w-full mobile-button"
                  >
                    {tradeType === 'buy' ? 'Buy' : 'Sell'} {selectedStock.symbol}
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Portfolio View */
          <div className="space-y-4">
            <h4 className="font-semibold text-text-heading">Your Positions</h4>
            
            {simulatorData.positions.length === 0 ? (
              <div className="text-center py-8">
                <Target className="w-8 h-8 text-text-muted mx-auto mb-3" />
                <p className="text-text-secondary">No positions yet. Start trading to build your portfolio!</p>
              </div>
            ) : (
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {simulatorData.positions.map((position) => (
                    <div key={position.id} className="p-3 bg-card/30 rounded-lg border border-border/30">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-medium text-text-heading">{position.symbol}</div>
                          <div className="text-xs text-text-secondary">{position.shares} shares</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-text-heading">
                            ${(position.currentPrice * position.shares).toLocaleString()}
                          </div>
                          <div className={`text-xs ${
                            position.gainLoss >= 0 ? 'text-success' : 'text-destructive'
                          }`}>
                            {position.gainLoss >= 0 ? '+' : ''}
                            ${position.gainLoss.toFixed(2)} ({position.gainLossPercent.toFixed(2)}%)
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-text-secondary">
                        Avg Price: ${position.avgPrice.toFixed(2)} | Current: ${position.currentPrice.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}

            {/* Recent Transactions */}
            {simulatorData.transactions.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-text-heading">Recent Transactions</h4>
                <ScrollArea className="h-32">
                  <div className="space-y-2">
                    {simulatorData.transactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between text-sm p-2 bg-card/20 rounded">
                        <div className="flex items-center gap-2">
                          <Badge variant={transaction.type === 'buy' ? 'default' : 'secondary'}>
                            {transaction.type.toUpperCase()}
                          </Badge>
                          <span className="text-text-heading">{transaction.symbol}</span>
                        </div>
                        <div className="text-right text-text-secondary">
                          <div>{transaction.shares} shares @ ${transaction.price.toFixed(2)}</div>
                          <div className="text-xs">{transaction.timestamp.toLocaleTimeString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};