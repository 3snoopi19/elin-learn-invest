import { AlertTriangle, RefreshCw, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MarketErrorFallbackProps {
  error: string;
  onRetry: () => void;
  lastUpdate?: Date;
  className?: string;
}

export const MarketErrorFallback = ({ 
  error, 
  onRetry, 
  lastUpdate,
  className 
}: MarketErrorFallbackProps) => {
  const formatLastUpdate = () => {
    if (!lastUpdate) return "Unknown";
    return lastUpdate.toLocaleTimeString();
  };

  return (
    <Alert className={cn("border-warning/30 bg-warning/5", className)}>
      <AlertTriangle className="h-4 w-4 text-warning" />
      <AlertDescription className="text-warning">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">Market Data Unavailable</span>
            <Badge variant="outline" className="text-xs border-warning/30">
              <Wifi className="w-3 h-3 mr-1" />
              Connection Lost
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground">
            {error} {lastUpdate && `Last update: ${formatLastUpdate()}`}
          </p>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="self-start border-warning/30 text-warning hover:bg-warning/10"
          >
            <RefreshCw className="w-3 h-3 mr-2" />
            Retry Connection
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};