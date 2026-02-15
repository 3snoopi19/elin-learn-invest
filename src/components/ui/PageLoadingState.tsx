import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { cn } from "@/lib/utils";

interface PageLoadingStateProps {
  message?: string;
  className?: string;
}

export const PageLoadingState = ({
  message = "Loading…",
  className,
}: PageLoadingStateProps) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center min-h-[40vh] gap-3",
        className
      )}
    >
      <LoadingSpinner size="lg" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
};
