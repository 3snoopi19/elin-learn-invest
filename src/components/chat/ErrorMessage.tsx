import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorMessage = ({ message, onRetry, className }: ErrorMessageProps) => {
  return (
    <Alert className={cn("border-destructive/30 bg-destructive/5", className)}>
      <AlertCircle className="h-4 w-4 text-destructive" />
      <AlertDescription className="text-destructive pr-8">
        <div className="flex flex-col gap-3">
          <span>{message}</span>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="self-start border-destructive/30 text-destructive hover:bg-destructive/10"
            >
              <RefreshCw className="w-3 h-3 mr-2" />
              Try Again
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};