import { cn } from "@/lib/utils";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

interface MobileOptimizedLayoutProps {
  children: React.ReactNode;
  className?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  fullHeight?: boolean;
}

export const MobileOptimizedLayout = ({
  children,
  className = "",
  showHeader = true,
  showFooter = true,
  fullHeight = true,
}: MobileOptimizedLayoutProps) => {
  return (
    <div className={cn("bg-background", fullHeight ? "min-h-screen" : "", className)}>
      {showHeader && <Header />}
      
      <main className="mobile-content mobile-container">
        {children}
      </main>
      
      {showFooter && <Footer />}
    </div>
  );
};