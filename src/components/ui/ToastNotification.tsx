import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export interface ToastProps {
  id?: string;
  type?: "success" | "error" | "warning" | "info";
  title?: string;
  message: string;
  duration?: number;
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const styleMap = {
  success: {
    container: "bg-card border border-success/20 text-card-foreground shadow-lg",
    icon: "text-success",
  },
  error: {
    container: "bg-card border border-destructive/20 text-card-foreground shadow-lg",
    icon: "text-destructive",
  },
  warning: {
    container: "bg-card border border-warning/20 text-card-foreground shadow-lg",
    icon: "text-warning",
  },
  info: {
    container: "bg-card border border-secondary/20 text-card-foreground shadow-lg",
    icon: "text-secondary",
  },
};

export const ToastNotification = ({
  type = "info",
  title,
  message,
  duration = 5000,
  onClose,
  action,
}: ToastProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const Icon = iconMap[type];
  const styles = styleMap[type];

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose?.();
    }, 200);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={cn(
            "rounded-lg p-4 max-w-md w-full pointer-events-auto",
            styles.container
          )}
        >
          <div className="flex items-start space-x-3">
            <Icon className={cn("h-5 w-5 flex-shrink-0 mt-0.5", styles.icon)} />
            
            <div className="flex-1 min-w-0">
              {title && (
                <p className="text-sm font-semibold text-text-heading mb-1">
                  {title}
                </p>
              )}
              <p className="text-sm text-text-body leading-relaxed">
                {message}
              </p>
              
              {action && (
                <button
                  onClick={action.onClick}
                  className="mt-3 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
                >
                  {action.label}
                </button>
              )}
            </div>

            <button
              onClick={handleClose}
              className="flex-shrink-0 ml-4 text-text-muted hover:text-text-secondary transition-colors touch-target"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Toast container for managing multiple toasts
export const ToastContainer = ({ 
  toasts, 
  onRemove 
}: { 
  toasts: (ToastProps & { id: string })[]; 
  onRemove: (id: string) => void;
}) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2 max-w-md">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastNotification
            key={toast.id}
            {...toast}
            onClose={() => onRemove(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};