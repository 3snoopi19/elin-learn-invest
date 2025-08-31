import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface MobileStackProps {
  children: React.ReactNode;
  className?: string;
  spacing?: "tight" | "normal" | "loose";
  animated?: boolean;
}

export const MobileStack = ({
  children,
  className = "",
  spacing = "normal",
  animated = true,
}: MobileStackProps) => {
  const isMobile = useIsMobile();

  const spacingClasses = {
    tight: "space-y-3 md:space-y-4",
    normal: "space-y-4 md:space-y-6", 
    loose: "space-y-6 md:space-y-8"
  };

  const containerClasses = cn(
    "flex flex-col w-full",
    spacingClasses[spacing],
    isMobile && "pb-20", // Account for bottom navigation
    className
  );

  if (!animated) {
    return (
      <div className={containerClasses}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={containerClasses}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, staggerChildren: 0.1 }}
    >
      {children}
    </motion.div>
  );
};

// Component for responsive grid that stacks on mobile
interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
  gap?: "sm" | "md" | "lg";
}

export const ResponsiveGrid = ({
  children,
  className = "",
  columns = 2,
  gap = "md",
}: ResponsiveGridProps) => {
  const isMobile = useIsMobile();

  const gapClasses = {
    sm: "gap-3 md:gap-4",
    md: "gap-4 md:gap-6",
    lg: "gap-6 md:gap-8"
  };

  const gridCols = isMobile
    ? "grid-cols-1"
    : {
        1: "md:grid-cols-1",
        2: "md:grid-cols-2",
        3: "md:grid-cols-3",
        4: "md:grid-cols-4"
      }[columns];

  return (
    <div className={cn(
      "grid",
      gridCols,
      gapClasses[gap],
      isMobile && "pb-4", // Extra padding on mobile
      className
    )}>
      {children}
    </div>
  );
};

// Component for sections that need mobile-specific layouts
interface MobileSectionProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  headerAction?: React.ReactNode;
}

export const MobileSection = ({
  children,
  title,
  subtitle,
  className = "",
  headerAction,
}: MobileSectionProps) => {
  return (
    <section className={cn("w-full", className)}>
      {(title || subtitle) && (
        <div className="mb-4 md:mb-6">
          <div className="flex items-center justify-between mb-2">
            {title && (
              <h2 className="text-xl md:text-2xl font-semibold text-text-heading">
                {title}
              </h2>
            )}
            {headerAction}
          </div>
          {subtitle && (
            <p className="text-sm md:text-base text-text-secondary">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  );
};