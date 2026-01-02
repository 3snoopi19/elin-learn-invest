import { Outlet } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileBottomDock } from "@/components/mobile/MobileBottomDock";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

/**
 * MainLayout - Global layout wrapper for all authenticated pages
 * Ensures consistent mobile viewport, scrolling, and navigation across all pages
 */
export const MainLayout = () => {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden bg-background">
      {/* Desktop Header - Hidden on mobile */}
      <div className="hidden md:block shrink-0">
        <Header />
      </div>

      {/* Main Content Area - Scrollable with z-0 to stay behind dock */}
      <main className="flex-1 w-full overflow-y-auto z-0 relative">
        <div className="pb-40 md:pb-8">
          <Outlet />
        </div>
      </main>

      {/* Desktop Footer - Hidden on mobile */}
      <div className="hidden md:block shrink-0">
        <Footer />
      </div>

      {/* Mobile Bottom Dock - Fixed at bottom, only on mobile */}
      {isMobile && <MobileBottomDock />}
    </div>
  );
};

export default MainLayout;
