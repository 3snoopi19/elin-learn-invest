import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { Plus, TrendingUp, PieChart, AlertCircle, DollarSign, Percent, Flame, Loader2, Share2, Copy, Check } from "lucide-react";
import { PageLoadingState } from "@/components/ui/PageLoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { supabase } from "@/integrations/supabase/client";
import { marketDataProvider } from "@/services/marketDataProvider";
import { validateTicker, validateShares, validateCostBasis, validatePurchaseDate } from "@/lib/validation";
import { useToast } from "@/hooks/use-toast";
import { PortfolioRoastCard } from "@/components/portfolio/PortfolioRoastCard";

const SHARE_APP_URL = "https://elin-learn-invest.lovable.app";

const ShareRoastButton = ({ result }: { result: RoastResult }) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const shareText = `ELIN roasted my portfolio — Score: ${result.roast_score}/100. "${result.headline_roast}" Try ELIN: ${SHARE_APP_URL}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "My ELIN Portfolio Roast", text: shareText });
      } catch (e) {
        // User cancelled or share failed — fall back to copy
        if ((e as DOMException).name !== "AbortError") copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    toast({ title: "📋 Copied!", description: "Paste anywhere to share your roast." });
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="flex justify-center">
      <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
        {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
        {copied ? "Copied!" : "Share my roast"}
      </Button>
    </div>
  );
};

interface Holding {
  id: string;
  ticker: string;
  shares: number;
  cost_basis: number;
  purchase_date: string;
  current_price?: number;
  current_value?: number;
  gain_loss?: number;
  gain_loss_percent?: number;
  sector?: string;
}

interface RoastResult {
  roast_score: number;
  headline_roast: string;
  key_risks: string[];
  actionable_fix: string;
}

const Portfolio = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  
  // Roast state
  const [isRoasting, setIsRoasting] = useState(false);
  const [roastResult, setRoastResult] = useState<RoastResult | null>(null);

  // Form state for adding holdings
  const [newHolding, setNewHolding] = useState({
    ticker: '',
    shares: '',
    cost_basis: '',
    purchase_date: ''
  });
  
  const [validationErrors, setValidationErrors] = useState({
    ticker: '',
    shares: '',
    cost_basis: '',
    purchase_date: ''
  });
  
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchHoldings();
    }
  }, [user]);

  const fetchHoldings = async () => {
    try {
      const { data, error } = await supabase
        .from('holdings')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Enrich with current market data
      const enrichedHoldings = await Promise.all(
        (data || []).map(async (holding) => {
          try {
            const marketData = await marketDataProvider.getQuote(holding.ticker);
            const currentValue = marketData.price * holding.shares;
            const totalCostBasis = holding.cost_basis * holding.shares;
            const gainLoss = currentValue - totalCostBasis;
            const gainLossPercent = ((gainLoss / totalCostBasis) * 100);

            return {
              ...holding,
              current_price: marketData.price,
              current_value: currentValue,
              gain_loss: gainLoss,
              gain_loss_percent: gainLossPercent
            };
          } catch (error) {
            console.error(`Error fetching market data for ${holding.ticker}:`, error);
            return holding;
          }
        })
      );

      setHoldings(enrichedHoldings);
    } catch (error) {
      console.error('Error fetching holdings:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const validateForm = () => {
    const errors = {
      ticker: '',
      shares: '',
      cost_basis: '',
      purchase_date: ''
    };
    
    let isValid = true;
    
    // Validate ticker
    const tickerValidation = validateTicker(newHolding.ticker);
    if (!tickerValidation.isValid) {
      errors.ticker = tickerValidation.error || '';
      isValid = false;
    }
    
    // Validate shares
    const sharesValidation = validateShares(newHolding.shares);
    if (!sharesValidation.isValid) {
      errors.shares = sharesValidation.error || '';
      isValid = false;
    }
    
    // Validate cost basis
    const costBasisValidation = validateCostBasis(newHolding.cost_basis);
    if (!costBasisValidation.isValid) {
      errors.cost_basis = costBasisValidation.error || '';
      isValid = false;
    }
    
    // Validate purchase date
    const dateValidation = validatePurchaseDate(newHolding.purchase_date);
    if (!dateValidation.isValid) {
      errors.purchase_date = dateValidation.error || '';
      isValid = false;
    }
    
    setValidationErrors(errors);
    return isValid;
  };

  const handleAddHolding = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors below and try again.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('holdings')
        .insert({
          user_id: user?.id,
          ticker: newHolding.ticker.toUpperCase(),
          shares: parseFloat(newHolding.shares),
          cost_basis: parseFloat(newHolding.cost_basis),
          purchase_date: newHolding.purchase_date
        });

      if (error) throw error;

      setNewHolding({ ticker: '', shares: '', cost_basis: '', purchase_date: '' });
      setValidationErrors({ ticker: '', shares: '', cost_basis: '', purchase_date: '' });
      setAddDialogOpen(false);
      fetchHoldings();
      
      toast({
        title: "Success",
        description: "Holding added successfully!"
      });
    } catch (error) {
      console.error('Error adding holding:', error);
      toast({
        title: "Couldn't add holding",
        description: "Check your connection and try again.",
        variant: "destructive"
      });
    }
  };

  const calculatePortfolioMetrics = () => {
    const totalValue = holdings.reduce((sum, h) => sum + (h.current_value || 0), 0);
    const totalCost = holdings.reduce((sum, h) => sum + (h.cost_basis * h.shares), 0);
    const totalGainLoss = totalValue - totalCost;
    const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

    return { totalValue, totalCost, totalGainLoss, totalGainLossPercent };
  };

  const getDiversificationData = () => {
    const sectorMap: Record<string, number> = {};
    let totalValue = 0;

    holdings.forEach(holding => {
      const value = holding.current_value || 0;
      totalValue += value;
      
      // Simplified sector mapping (in real app, would get from market data)
      const sector = holding.ticker.startsWith('SPY') ? 'ETF' : 
                   holding.ticker.startsWith('AAPL') ? 'Technology' :
                   holding.ticker.startsWith('TSLA') ? 'Automotive' : 'Other';
      
      sectorMap[sector] = (sectorMap[sector] || 0) + value;
    });

    return Object.entries(sectorMap).map(([sector, value]) => ({
      sector,
      value,
      percentage: totalValue > 0 ? (value / totalValue) * 100 : 0
    }));
  };

  const handleRoastPortfolio = async () => {
    if (holdings.length === 0) {
      toast({
        title: "No Holdings",
        description: "Add some holdings first before getting roasted!",
        variant: "destructive"
      });
      return;
    }

    setIsRoasting(true);
    setRoastResult(null);

    try {
      // Prepare holdings data with sector info
      const holdingsData = holdings.map(h => {
        const sector = h.ticker.startsWith('SPY') ? 'ETF' : 
                      h.ticker.startsWith('AAPL') ? 'Technology' :
                      h.ticker.startsWith('TSLA') ? 'Automotive' : 'Other';
        return {
          ticker: h.ticker,
          shares: h.shares,
          current_value: h.current_value || 0,
          sector,
          asset_class: sector === 'ETF' ? 'ETF' : 'Stock'
        };
      });

      const totalValue = holdings.reduce((sum, h) => sum + (h.current_value || 0), 0);

      const { data, error } = await supabase.functions.invoke('analyze-portfolio', {
        body: {
          holdings: holdingsData,
          total_value: totalValue
        }
      });

      if (error) throw error;

      setRoastResult(data);
      
      toast({
        title: "🔥 Roast Complete!",
        description: `Your portfolio scored ${data.roast_score}/100`,
      });
    } catch (error) {
      console.error('Error roasting portfolio:', error);
      toast({
        title: "Couldn't roast your portfolio",
        description: "Check your connection and try again.",
        variant: "destructive"
      });
    } finally {
      setIsRoasting(false);
    }
  };

  if (loading || loadingData) {
    return <PageLoadingState message="Loading your portfolio…" />;
  }

  if (!user) {
    return null;
  }

  const metrics = calculatePortfolioMetrics();
  const diversificationData = getDiversificationData();

  return (
    <div className="px-4 md:px-8 py-4 md:py-8">
        {/* Header - Mobile optimized */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Portfolio Tracker</h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Track your investments and learn about diversification
            </p>
          </div>
          
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
               <Button className="bg-success hover:bg-primary-hover text-white mobile-button w-full md:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add Holding
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Holding</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="ticker">Ticker Symbol</Label>
                  <Input
                    id="ticker"
                    value={newHolding.ticker}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase();
                      setNewHolding(prev => ({ ...prev, ticker: value }));
                      // Clear error when user starts typing
                      if (validationErrors.ticker) {
                        setValidationErrors(prev => ({ ...prev, ticker: '' }));
                      }
                    }}
                    placeholder="AAPL, SPY, MSFT..."
                    className={validationErrors.ticker ? 'border-destructive' : ''}
                  />
                  {validationErrors.ticker && (
                    <p className="text-sm text-destructive mt-1">{validationErrors.ticker}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="shares">Number of Shares</Label>
                  <Input
                    id="shares"
                    type="number"
                    step="0.000001"
                    min="0"
                    max="1000000"
                    value={newHolding.shares}
                    onChange={(e) => {
                      setNewHolding(prev => ({ ...prev, shares: e.target.value }));
                      if (validationErrors.shares) {
                        setValidationErrors(prev => ({ ...prev, shares: '' }));
                      }
                    }}
                    placeholder="10"
                    className={validationErrors.shares ? 'border-destructive' : ''}
                  />
                  {validationErrors.shares && (
                    <p className="text-sm text-destructive mt-1">{validationErrors.shares}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="cost_basis">Cost Basis (per share)</Label>
                  <Input
                    id="cost_basis"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100000"
                    value={newHolding.cost_basis}
                    onChange={(e) => {
                      setNewHolding(prev => ({ ...prev, cost_basis: e.target.value }));
                      if (validationErrors.cost_basis) {
                        setValidationErrors(prev => ({ ...prev, cost_basis: '' }));
                      }
                    }}
                    placeholder="150.00"
                    className={validationErrors.cost_basis ? 'border-destructive' : ''}
                  />
                  {validationErrors.cost_basis && (
                    <p className="text-sm text-destructive mt-1">{validationErrors.cost_basis}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="purchase_date">Purchase Date</Label>
                  <Input
                    id="purchase_date"
                    type="date"
                    max={new Date().toISOString().split('T')[0]}
                    value={newHolding.purchase_date}
                    onChange={(e) => {
                      setNewHolding(prev => ({ ...prev, purchase_date: e.target.value }));
                      if (validationErrors.purchase_date) {
                        setValidationErrors(prev => ({ ...prev, purchase_date: '' }));
                      }
                    }}
                    className={`${validationErrors.purchase_date ? 'border-destructive' : ''} pointer-events-auto`}
                  />
                  {validationErrors.purchase_date && (
                    <p className="text-sm text-destructive mt-1">{validationErrors.purchase_date}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Click the calendar icon or type the date directly
                  </p>
                </div>
                <Button onClick={handleAddHolding} className="w-full bg-success hover:bg-primary-hover text-white">
                  Add Holding
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Compliance Notice */}
        <Alert className="mb-6 border-education/20 bg-education/5">
          <AlertCircle className="h-4 w-4 text-education" />
          <AlertDescription>
            <strong>Educational Tool:</strong> This portfolio tracker is for educational purposes 
            and learning about investment concepts. Not investment advice.
          </AlertDescription>
        </Alert>

        {holdings.length === 0 ? (
          <Card className="mobile-card">
            <CardContent className="py-0">
              <EmptyState
                icon={TrendingUp}
                title="No holdings yet"
                description="Add your first holding to begin learning about portfolio management and diversification."
                actionLabel="Add Your First Holding"
                onAction={() => setAddDialogOpen(true)}
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4 md:space-y-6">
            {/* Portfolio Summary - Mobile responsive grid */}
            <div className="mobile-grid gap-3 md:gap-4">
              <Card className="mobile-card">
                <CardHeader className="pb-2 mobile-padding">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    Total Value
                  </CardTitle>
                </CardHeader>
                <CardContent className="mobile-padding">
                  <div className="text-xl md:text-2xl font-bold">
                    ${metrics.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mobile-card">
                <CardHeader className="pb-2 mobile-padding">
                  <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                </CardHeader>
                <CardContent className="mobile-padding">
                  <div className="text-xl md:text-2xl font-bold">
                    ${metrics.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mobile-card">
                <CardHeader className="pb-2 mobile-padding">
                  <CardTitle className="text-sm font-medium">Gain/Loss</CardTitle>
                </CardHeader>
                <CardContent className="mobile-padding">
                  <div className={`text-xl md:text-2xl font-bold ${metrics.totalGainLoss >= 0 ? 'text-success' : 'text-destructive'}`}>
                    ${Math.abs(metrics.totalGainLoss).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mobile-card">
                <CardHeader className="pb-2 mobile-padding">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Percent className="h-4 w-4 mr-1" />
                    Return %
                  </CardTitle>
                </CardHeader>
                <CardContent className="mobile-padding">
                  <div className={`text-xl md:text-2xl font-bold ${metrics.totalGainLossPercent >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {metrics.totalGainLossPercent >= 0 ? '+' : ''}{metrics.totalGainLossPercent.toFixed(2)}%
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Roast My Portfolio Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleRoastPortfolio}
                disabled={isRoasting || holdings.length === 0}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold px-6 py-3 h-auto shadow-lg hover:shadow-orange-500/25 transition-all duration-300"
              >
                {isRoasting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Flame className="h-5 w-5 mr-2" />
                    🔥 Roast My Portfolio
                  </>
                )}
              </Button>
            </div>

            {/* Roast Result */}
            {roastResult && (
              <>
                <PortfolioRoastCard
                  result={roastResult}
                  onClose={() => setRoastResult(null)}
                />
                <ShareRoastButton result={roastResult} />
              </>
            )}

            <Tabs defaultValue="holdings">
              <TabsList>
                <TabsTrigger value="holdings">Holdings</TabsTrigger>
                <TabsTrigger value="diversification">Diversification</TabsTrigger>
                <TabsTrigger value="insights">Educational Insights</TabsTrigger>
              </TabsList>
              
              <TabsContent value="holdings">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Holdings</CardTitle>
                    <CardDescription>
                      Individual positions in your portfolio
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {holdings.map((holding) => (
                        <div key={holding.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-lg">{holding.ticker}</span>
                                <Badge variant="outline">{holding.shares} shares</Badge>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Purchased: {new Date(holding.purchase_date).toLocaleDateString()}
                              </div>
                            </div>
                            
                            <div className="text-right space-y-1">
                              <div className="text-lg font-semibold">
                                ${holding.current_value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || 'N/A'}
                              </div>
                              {holding.gain_loss !== undefined && (
                                <div className={`text-sm ${holding.gain_loss >= 0 ? 'text-success' : 'text-destructive'}`}>
                                  {holding.gain_loss >= 0 ? '+' : ''}${Math.abs(holding.gain_loss).toFixed(2)} 
                                  ({holding.gain_loss_percent >= 0 ? '+' : ''}{holding.gain_loss_percent?.toFixed(2)}%)
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Current Price:</span>
                              <div className="font-medium">
                                ${holding.current_price?.toFixed(2) || 'N/A'}
                              </div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Cost Basis:</span>
                              <div className="font-medium">
                                ${holding.cost_basis.toFixed(2)}
                              </div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Total Cost:</span>
                              <div className="font-medium">
                                ${(holding.cost_basis * holding.shares).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="diversification">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <PieChart className="h-5 w-5" />
                      <span>Portfolio Diversification</span>
                    </CardTitle>
                    <CardDescription>
                      Educational view of your portfolio allocation
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {diversificationData.map((item) => (
                        <div key={item.sector} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{item.sector}</span>
                            <div className="text-right">
                              <div className="font-semibold">{item.percentage.toFixed(1)}%</div>
                              <div className="text-sm text-muted-foreground">
                                ${item.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                            </div>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${item.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="insights">
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Educational Insights</CardTitle>
                      <CardDescription>
                        Learn about portfolio management concepts
                      </CardDescription>
                    </CardHeader>
                     <CardContent className="space-y-4 bg-insights-bg">
                      <div>
                        <h4 className="font-semibold mb-2 text-text-heading">Diversification Basics</h4>
                        <p className="text-sm text-success">
                          Diversification means spreading investments across different asset classes, 
                          sectors, and geographic regions to reduce risk. A well-diversified portfolio 
                          typically includes stocks, bonds, and other assets.
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2 text-text-heading">Cost Basis Tracking</h4>
                        <p className="text-sm text-education">
                          Your cost basis is what you paid for an investment. It's important for 
                          calculating gains/losses and tax purposes. This tracker helps you understand 
                          how your investments are performing relative to what you paid.
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2 text-text-heading">Performance Monitoring</h4>
                        <p className="text-sm text-success">
                          Regular portfolio monitoring helps you understand investment performance and 
                          make informed decisions. Remember: short-term fluctuations are normal, 
                          focus on long-term trends.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
    </div>
  );
};

export default Portfolio;