import { forwardRef } from "react";
import { motion, MotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface OptimizedCardProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "neon" | "professional" | "glass";
  interactive?: boolean;
  loading?: boolean;
}

export const OptimizedCard = forwardRef<HTMLDivElement, OptimizedCardProps>(
  ({ 
    children, 
    className = "", 
    variant = "default",
    interactive = false,
    loading = false,
    ...motionProps 
  }, ref) => {
    const variantClasses = {
      default: "bg-card border border-border rounded-lg shadow-sm",
      neon: "neon-card",
      professional: "professional-card", 
      glass: "glass-effect rounded-lg"
    };

    const interactiveClasses = interactive 
      ? "cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
      : "";

    const loadingClasses = loading
      ? "animate-pulse"
      : "";

    return (
      <motion.div
        ref={ref}
        className={cn(
          variantClasses[variant],
          interactiveClasses,
          loadingClasses,
          "touch-target",
          className
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        {...motionProps}
      >
        {loading ? (
          <div className="p-6 space-y-3">
            <div className="h-4 bg-muted/50 rounded animate-pulse" />
            <div className="h-4 bg-muted/50 rounded animate-pulse w-2/3" />
            <div className="h-4 bg-muted/50 rounded animate-pulse w-1/2" />
          </div>
        ) : (
          children
        )}
      </motion.div>
    );
  }
);

OptimizedCard.displayName = "OptimizedCard";