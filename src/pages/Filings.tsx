import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Search, FileText, Building2, Calendar, ExternalLink, AlertCircle } from "lucide-react";
import { secEdgarService, type Filing } from "@/services/secEdgar";
import { marketDataProvider } from "@/services/marketDataProvider";

const Filings = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [filings, setFilings] = useState<Filing[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedFiling, setSelectedFiling] = useState<Filing | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setSearchLoading(true);
    try {
      // First try to get company info to validate ticker
      const companyInfo = await marketDataProvider.getCompanyInfo(searchTerm.toUpperCase());
      
      if (companyInfo.cik) {
        // Get company submissions using CIK
        const submissions = await secEdgarService.searchCompanyByCIK(companyInfo.cik);
        if (submissions) {
          setSearchResults({
            company: companyInfo,
            submissions
          });
          
          // Get recent filings
          const recentFilings = await secEdgarService.getFilings(companyInfo.cik);
          setFilings(recentFilings);
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults(null);
      setFilings([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getFilingTypeDescription = (form: string) => {
    const descriptions: Record<string, string> = {
      '10-K': 'Annual report providing comprehensive company overview',
      '10-Q': 'Quarterly report with unaudited financial statements',
      '8-K': 'Current report for material events or changes',
      '4': 'Statement of ownership changes by insiders',
      'S-1': 'Registration statement for new securities'
    };
    return descriptions[form] || 'SEC filing';
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">SEC Filings Explorer</h1>
          <p className="text-muted-foreground">
            Search and explore company SEC filings with AI-powered explanations
          </p>
        </div>

        {/* Compliance Notice */}
        <Alert className="mb-6 border-education/20 bg-education/5">
          <AlertCircle className="h-4 w-4 text-education" />
          <AlertDescription>
            <strong>Educational Tool:</strong> Use this to learn about companies and understand 
            SEC filings. This analysis is educational only and not investment advice.
          </AlertDescription>
        </Alert>

        {/* Search */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Company Search</span>
            </CardTitle>
            <CardDescription>
              Enter a stock ticker (e.g., AAPL, TSLA) to explore SEC filings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter ticker symbol (AAPL, TSLA, SPY...)"
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={searchLoading}>
                {searchLoading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Search Results */}
        {searchResults && (
          <div className="space-y-6">
            {/* Company Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Building2 className="h-6 w-6 text-primary" />
                    <div>
                      <CardTitle>{searchResults.company.name}</CardTitle>
                      <CardDescription>{searchResults.company.ticker}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline">{searchResults.company.sector}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchResults.company.description}
                </p>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Industry:</strong> {searchResults.company.industry}
                  </div>
                  <div>
                    <strong>CIK:</strong> {searchResults.submissions?.cik}
                  </div>
                  {searchResults.company.website && (
                    <div className="flex items-center space-x-1">
                      <strong>Website:</strong>
                      <a 
                        href={searchResults.company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center space-x-1"
                      >
                        <span>Visit</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Filings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Recent SEC Filings</span>
                </CardTitle>
                <CardDescription>
                  Click on any filing to view details and get AI explanations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filings.length > 0 ? (
                  <div className="space-y-3">
                    {filings.map((filing) => (
                      <div
                        key={filing.accessionNumber}
                        className="border rounded-lg p-4 hover:bg-muted/20 cursor-pointer transition-colors"
                        onClick={() => setSelectedFiling(filing)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">{filing.form}</Badge>
                              <span className="font-medium">{filing.primaryDocDescription}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {getFilingTypeDescription(filing.form)}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>Filed: {new Date(filing.filingDate).toLocaleDateString()}</span>
                              </div>
                              {filing.reportDate && (
                                <span>Report Date: {new Date(filing.reportDate).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            View Filing
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No recent filings found for this company.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filing Detail Modal/Sidebar */}
        {selectedFiling && (
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {searchResults?.company.name} - {selectedFiling.form}
                </CardTitle>
                <Button variant="outline" onClick={() => setSelectedFiling(null)}>
                  Close
                </Button>
              </div>
              <CardDescription>
                Filed on {new Date(selectedFiling.filingDate).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="summary">
                <TabsList>
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="ai-explain">AI Explanation</TabsTrigger>
                </TabsList>
                
                <TabsContent value="summary" className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Filing Details</h4>
                      <dl className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <dt>Form Type:</dt>
                          <dd>{selectedFiling.form}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt>Filing Date:</dt>
                          <dd>{new Date(selectedFiling.filingDate).toLocaleDateString()}</dd>
                        </div>
                        {selectedFiling.reportDate && (
                          <div className="flex justify-between">
                            <dt>Report Date:</dt>
                            <dd>{new Date(selectedFiling.reportDate).toLocaleDateString()}</dd>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <dt>Document:</dt>
                          <dd>{selectedFiling.primaryDocument}</dd>
                        </div>
                      </dl>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">What This Filing Contains</h4>
                      <p className="text-sm text-muted-foreground">
                        {getFilingTypeDescription(selectedFiling.form)}
                      </p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="content">
                  <div className="bg-muted/20 rounded-lg p-4 text-sm">
                    <p className="text-muted-foreground mb-4">
                      Filing content preview (in a real implementation, this would show 
                      the actual SEC filing content with highlighting and navigation)
                    </p>
                    <div className="space-y-2 text-xs">
                      <div className="font-mono">&lt;DOCUMENT&gt;</div>
                      <div className="font-mono ml-4">&lt;TYPE&gt;{selectedFiling.form}&lt;/TYPE&gt;</div>
                      <div className="font-mono ml-4">&lt;FILENAME&gt;{selectedFiling.primaryDocument}&lt;/FILENAME&gt;</div>
                      <div className="font-mono">&lt;/DOCUMENT&gt;</div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="ai-explain">
                  <div className="space-y-4">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Educational Analysis:</strong> The following explanation is for 
                        learning purposes only and not investment advice.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="bg-card border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">ELIN's Explanation</h4>
                      <div className="space-y-3 text-sm">
                        <p>
                          <strong>What is a {selectedFiling.form}?</strong><br />
                          {getFilingTypeDescription(selectedFiling.form)}
                        </p>
                        
                        <p>
                          <strong>Key sections to focus on:</strong><br />
                          {selectedFiling.form === '10-K' && 
                            "Business Overview, Risk Factors, Management Discussion & Analysis (MD&A), and Financial Statements."
                          }
                          {selectedFiling.form === '10-Q' && 
                            "Quarterly financial statements, MD&A, and any material changes since the last annual report."
                          }
                          {selectedFiling.form === '8-K' && 
                            "The specific event or change being reported, often found in Item descriptions."
                          }
                        </p>
                        
                        <p>
                          <strong>Learning tip:</strong><br />
                          Start by reading the summary sections first, then dive into specific 
                          areas that interest you. Don't feel like you need to read everything!
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* No Results State */}
        {searchTerm && !searchLoading && !searchResults && (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
              <p className="text-muted-foreground mb-4">
                We couldn't find SEC filings for "{searchTerm}". Try a different ticker symbol.
              </p>
              <p className="text-sm text-muted-foreground">
                Popular examples: AAPL (Apple), TSLA (Tesla), SPY (S&P 500 ETF)
              </p>
            </CardContent>
          </Card>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Filings;