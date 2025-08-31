import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SkeletonLoaderProps {
  variant?: 'card' | 'list' | 'chart' | 'market' | 'course';
  className?: string;
  count?: number;
}

export const SkeletonLoader = ({ 
  variant = 'card', 
  className,
  count = 1 
}: SkeletonLoaderProps) => {
  
  const renderCardSkeleton = () => (
    <Card className={cn("professional-card animate-pulse", className)}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-lg bg-muted" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32 bg-muted" />
            <Skeleton className="h-3 w-48 bg-muted" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-4 w-full bg-muted" />
        <Skeleton className="h-4 w-3/4 bg-muted" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 bg-muted" />
          <Skeleton className="h-8 w-24 bg-muted" />
        </div>
      </CardContent>
    </Card>
  );

  const renderListSkeleton = () => (
    <div className={cn("space-y-3 animate-pulse", className)}>
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
          <Skeleton className="w-8 h-8 rounded bg-muted" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32 bg-muted" />
            <Skeleton className="h-3 w-48 bg-muted" />
          </div>
          <Skeleton className="h-6 w-16 bg-muted" />
        </div>
      ))}
    </div>
  );

  const renderChartSkeleton = () => (
    <div className={cn("space-y-4 animate-pulse", className)}>
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-32 bg-muted" />
        <Skeleton className="h-4 w-20 bg-muted" />
      </div>
      <div className="h-64 bg-muted/20 rounded-lg flex items-end justify-around p-4">
        {Array.from({ length: 7 }).map((_, index) => (
          <Skeleton 
            key={index} 
            className="bg-muted" 
            style={{ 
              width: '20px',
              height: `${Math.random() * 150 + 50}px`
            }}
          />
        ))}
      </div>
    </div>
  );

  const renderMarketSkeleton = () => (
    <div className={cn("flex gap-4 overflow-x-auto animate-pulse", className)}>
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex-shrink-0 bg-muted/20 rounded-lg p-4 min-w-[240px] space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-12 bg-muted" />
            <Skeleton className="h-4 w-16 bg-muted" />
          </div>
          <Skeleton className="h-4 w-32 bg-muted" />
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <Skeleton className="h-6 w-20 bg-muted" />
              <Skeleton className="h-3 w-12 bg-muted" />
            </div>
            <Skeleton className="h-5 w-15 bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );

  const renderCourseSkeleton = () => (
    <Card className={cn("professional-card animate-pulse", className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="w-4 h-4 bg-muted" />
            <Skeleton className="w-16 h-5 bg-muted" />
          </div>
          <Skeleton className="w-6 h-6 bg-muted" />
        </div>
        <div className="space-y-2 mt-3">
          <Skeleton className="h-6 w-48 bg-muted" />
          <Skeleton className="h-4 w-full bg-muted" />
          <Skeleton className="h-4 w-3/4 bg-muted" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-24 bg-muted" />
            <Skeleton className="h-3 w-8 bg-muted" />
          </div>
          <Skeleton className="h-2 w-full bg-muted" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-36 bg-muted" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 bg-muted" />
            <Skeleton className="h-6 w-20 bg-muted" />
            <Skeleton className="h-6 w-12 bg-muted" />
          </div>
        </div>
        <Skeleton className="h-9 w-full bg-muted" />
      </CardContent>
    </Card>
  );

  const renderSkeleton = () => {
    switch (variant) {
      case 'list':
        return renderListSkeleton();
      case 'chart':
        return renderChartSkeleton();
      case 'market':
        return renderMarketSkeleton();
      case 'course':
        return renderCourseSkeleton();
      default:
        return renderCardSkeleton();
    }
  };

  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
};