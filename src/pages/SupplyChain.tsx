import { Header } from "@/components/layout/Header";
import { SupplyChainExplorer } from "@/components/SupplyChainExplorer";

const SupplyChain = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mobile-container pt-20 pb-24">
        <div className="mobile-content">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Supply Chain Explorer</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Discover company supply chains with AI-powered analysis
            </p>
          </div>
          <SupplyChainExplorer />
        </div>
      </main>
    </div>
  );
};

export default SupplyChain;
