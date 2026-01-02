import { Outlet } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileBottomDock } from "@/components/mobile/MobileBottomDock";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

/**
 * MainLayout - Global layout wrapper for all authenticated pages
 * Fluid Flexbox Architecture for universal iPhone support (SE to Pro Max)
 * Uses 100dvh for proper iOS Safari address bar handling
 */
export const MainLayout = () => {
  const isMobile = useIsMobile();

  return (
    // Root Container - The "Frame" - locked, no scrolling
    <div className="h-[100dvh] w-full flex flex-col overflow-hidden bg-background">
      {/* Desktop Header - Hidden on mobile */}
      <div className="hidden md:block shrink-0">
        <Header />
      </div>

      {/* Content Zone - The "Scrollable Area" */}
      <main className="flex-1 w-full overflow-y-auto overflow-x-hidden scroll-smooth z-0 relative">
        {/* Safety Pad: 140px clearance for floating dock on mobile, 32px on desktop */}
        <div className="pb-[140px] md:pb-8">
          <Outlet />
        </div>
      </main>

      {/* Desktop Footer - Hidden on mobile */}
      <div className="hidden md:block shrink-0">
        <Footer />
      </div>

      {/* Bottom Dock - The "Anchor" - Fixed outside scrollable area */}
      {isMobile && <MobileBottomDock />}
    </div>
  );
};

export default MainLayout;
