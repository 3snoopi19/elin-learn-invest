import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ArrowRight, Building2, Users, Factory, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SupplyChainEntity {
  name: string;
  ticker: string | null;
  category: string;
  description: string;
}

interface SupplyChainData {
  companyName: string;
  ticker: string;
  industry: string;
  suppliers: SupplyChainEntity[];
  customers: SupplyChainEntity[];
  summary: string;
}

export const SupplyChainExplorer = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<SupplyChainData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a company name or ticker");
      return;
    }

    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const { data: response, error: fnError } = await supabase.functions.invoke(
        'supply-chain-analysis',
        { body: { company: searchQuery.trim() } }
      );

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (response.error) {
        throw new Error(response.error);
      }

      setData(response);
      toast.success(`Supply chain loaded for ${response.companyName}`);
    } catch (err) {
      console.error("Supply chain analysis error:", err);
      setError(err instanceof Error ? err.message : "Failed to analyze supply chain");
      toast.error("Failed to analyze supply chain");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card className="mobile-card">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Factory className="h-5 w-5 text-primary" />
            Supply Chain Explorer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Enter ticker or company name (e.g., TSLA, Apple)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
              />
            </div>
            <Button 
              onClick={handleSearch} 
              disabled={isLoading}
              className="mobile-button"
            >
              {isLoading ? "Analyzing..." : "Explore"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="mobile-card">
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-24" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </CardContent>
          </Card>
          <Card className="mobile-card">
            <CardContent className="flex items-center justify-center min-h-[200px]">
              <Skeleton className="h-32 w-32 rounded-full" />
            </CardContent>
          </Card>
          <Card className="mobile-card">
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-24" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <Card className="mobile-card border-destructive/50">
          <CardContent className="flex items-center gap-3 py-6">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Results - Flow Layout */}
      {data && !isLoading && (
        <>
          {/* Summary */}
          <Card className="mobile-card bg-primary/5 border-primary/20">
            <CardContent className="py-4">
              <p className="text-sm text-muted-foreground">{data.summary}</p>
            </CardContent>
          </Card>

          {/* Flow Diagram */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 items-start">
            {/* Suppliers Column */}
            <Card className="mobile-card h-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Building2 className="h-4 w-4 text-blue-500" />
                  Key Suppliers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.suppliers.map((supplier, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/15 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{supplier.name}</span>
                      {supplier.ticker && (
                        <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-600 dark:text-blue-400">
                          {supplier.ticker}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground block mb-1">
                      {supplier.category}
                    </span>
                    <p className="text-xs text-muted-foreground/80">
                      {supplier.description}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Center Company - Desktop Arrow Connectors */}
            <div className="hidden lg:flex flex-col items-center justify-center gap-2 py-8">
              <div className="flex items-center gap-2">
                <ArrowRight className="h-6 w-6 text-muted-foreground/50" />
                <Card className="mobile-card border-2 border-primary shadow-lg">
                  <CardContent className="py-6 px-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-bold text-lg">{data.companyName}</h3>
                    {data.ticker && (
                      <span className="text-sm text-primary font-medium">
                        ${data.ticker}
                      </span>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {data.industry}
                    </p>
                  </CardContent>
                </Card>
                <ArrowRight className="h-6 w-6 text-muted-foreground/50" />
              </div>
            </div>

            {/* Mobile Center Company */}
            <Card className="mobile-card border-2 border-primary shadow-lg lg:hidden">
              <CardContent className="py-4 text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold">{data.companyName}</h3>
                {data.ticker && (
                  <span className="text-sm text-primary font-medium">
                    ${data.ticker}
                  </span>
                )}
                <p className="text-xs text-muted-foreground">{data.industry}</p>
              </CardContent>
            </Card>

            {/* Customers Column */}
            <Card className="mobile-card h-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="h-4 w-4 text-green-500" />
                  Major Customers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.customers.map((customer, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 hover:bg-green-500/15 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{customer.name}</span>
                      {customer.ticker && (
                        <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-600 dark:text-green-400">
                          {customer.ticker}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground block mb-1">
                      {customer.category}
                    </span>
                    <p className="text-xs text-muted-foreground/80">
                      {customer.description}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Empty State */}
      {!data && !isLoading && !error && (
        <Card className="mobile-card">
          <CardContent className="py-12 text-center">
            <Factory className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="font-medium text-lg mb-2">Explore Supply Chains</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Enter a company name or stock ticker above to discover their key suppliers and major customers using AI-powered analysis.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
