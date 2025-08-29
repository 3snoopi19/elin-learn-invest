import { useEffect } from "react";
import { motion } from "framer-motion";

interface AccessibilityWrapperProps {
  children: React.ReactNode;
  announceRoute?: boolean;
  skipToMain?: boolean;
}

export const AccessibilityWrapper = ({ 
  children, 
  announceRoute = true, 
  skipToMain = true 
}: AccessibilityWrapperProps) => {
  
  useEffect(() => {
    if (announceRoute) {
      // Announce route changes for screen readers
      const mainElement = document.querySelector('main');
      if (mainElement) {
        mainElement.setAttribute('aria-live', 'polite');
        mainElement.setAttribute('aria-atomic', 'true');
      }
    }
  }, [announceRoute]);

  return (
    <>
      {/* Skip to main content link for keyboard navigation */}
      {skipToMain && (
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50 transition-all"
          onFocus={(e) => {
            e.currentTarget.classList.remove('sr-only');
          }}
          onBlur={(e) => {
            e.currentTarget.classList.add('sr-only');
          }}
        >
          Skip to main content
        </a>
      )}
      
      {/* High contrast mode detection */}
      <div className="hidden" aria-hidden="true">
        <style>{`
          @media (prefers-contrast: high) {
            :root {
              --text-heading: 0 0% 100%;
              --text-body: 0 0% 95%;
              --border: 0 0% 50%;
            }
          }
          
          @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }
          
          /* Focus indicators for better accessibility */
          *:focus-visible {
            outline: 2px solid hsl(var(--primary)) !important;
            outline-offset: 2px !important;
          }
        `}</style>
      </div>

      <div id="main-content">
        {children}
      </div>
    </>
  );
};