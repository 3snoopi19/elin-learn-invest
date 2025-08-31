import { forwardRef } from "react";
import { motion, MotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "./LoadingSpinner";
import { AlertCircle } from "lucide-react";

interface EnhancedCardProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "outlined" | "glass";
  loading?: boolean;
  error?: string | null;
  interactive?: boolean;
}

export const EnhancedCard = forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ 
    children, 
    className = "", 
    variant = "default",
    loading = false,
    error = null,
    interactive = false,
    ...motionProps 
  }, ref) => {
    const variantClasses = {
      default: "bg-card border border-border rounded-xl shadow-sm",
      elevated: "bg-card border border-border rounded-xl shadow-lg hover:shadow-xl",
      outlined: "bg-card border-2 border-primary/20 rounded-xl shadow-sm hover:border-primary/40",
      glass: "bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl shadow-md"
    };

    const interactiveClasses = interactive 
      ? "cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1 active:scale-98"
      : "";

    if (error) {
      return (
        <motion.div
          ref={ref}
          className={cn(
            "bg-card border border-destructive/30 rounded-xl p-6 shadow-sm",
            className
          )}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          {...motionProps}
        >
          <div className="flex items-center space-x-3 text-destructive">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        </motion.div>
      );
    }

    if (loading) {
      return (
        <motion.div
          ref={ref}
          className={cn(
            variantClasses[variant],
            "p-6",
            className
          )}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          {...motionProps}
        >
          <div className="flex items-center justify-center space-x-3">
            <LoadingSpinner size="sm" color="primary" />
            <p className="text-sm text-text-secondary">Loading...</p>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        ref={ref}
        className={cn(
          variantClasses[variant],
          interactiveClasses,
          className
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        {...motionProps}
      >
        {children}
      </motion.div>
    );
  }
);

EnhancedCard.displayName = "EnhancedCard";

// Card content components with proper spacing and typography
export const CardHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-2 p-6 pb-4", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-tight tracking-tight text-text-heading",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

export const CardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-text-secondary leading-relaxed", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

export const CardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn("p-6 pt-4", className)} 
    {...props} 
  />
));
CardContent.displayName = "CardContent";

export const CardFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center justify-between p-6 pt-4", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";