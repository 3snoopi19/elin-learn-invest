import { motion } from "framer-motion";
import { LoadingSpinner } from "./LoadingSpinner";
import { ElinLogo } from "./ElinLogo";

interface LoadingScreenProps {
  message?: string;
  showLogo?: boolean;
  fullScreen?: boolean;
  size?: "sm" | "md" | "lg";
}

export const LoadingScreen = ({ 
  message = "Loading...", 
  showLogo = true, 
  fullScreen = true,
  size = "md"
}: LoadingScreenProps) => {
  const containerClasses = fullScreen 
    ? "min-h-screen flex items-center justify-center bg-background" 
    : "flex items-center justify-center p-8";

  return (
    <div className={containerClasses}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center space-y-4 text-center"
      >
        {showLogo && (
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              opacity: [1, 0.8, 1] 
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <ElinLogo size={size} showSubtitle={false} glowIntensity="subtle" />
          </motion.div>
        )}
        
        <div className="flex flex-col items-center space-y-3">
          <LoadingSpinner 
            size={size === "lg" ? "lg" : size === "sm" ? "sm" : "md"} 
            color="primary" 
          />
          <motion.p 
            className={`text-text-secondary font-medium ${
              size === "lg" ? "text-lg" : size === "sm" ? "text-sm" : "text-base"
            }`}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {message}
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
};

// Skeleton loading components for specific use cases
export const CardSkeleton = () => (
  <div className="professional-card p-6 animate-pulse">
    <div className="flex items-center space-x-4 mb-4">
      <div className="w-10 h-10 bg-muted rounded-lg"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-muted rounded w-3/4"></div>
        <div className="h-3 bg-muted rounded w-1/2"></div>
      </div>
    </div>
    <div className="space-y-3">
      <div className="h-4 bg-muted rounded"></div>
      <div className="h-4 bg-muted rounded w-5/6"></div>
      <div className="h-8 bg-muted rounded mt-4"></div>
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="space-y-3 animate-pulse">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
        <div className="w-8 h-8 bg-muted rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="h-3 bg-muted rounded w-1/2"></div>
        </div>
        <div className="h-4 bg-muted rounded w-20"></div>
        <div className="h-8 bg-muted rounded w-16"></div>
      </div>
    ))}
  </div>
);

export const ChartSkeleton = () => (
  <div className="h-64 bg-muted rounded-lg animate-pulse flex items-end justify-center space-x-2 p-4">
    {Array.from({ length: 7 }).map((_, i) => (
      <div 
        key={i} 
        className="bg-muted-foreground/20 rounded-t"
        style={{ 
          width: '20px', 
          height: `${Math.random() * 60 + 20}%` 
        }}
      ></div>
    ))}
  </div>
);