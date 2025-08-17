import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  label: string;
  current: number;
  total: number;
  className?: string;
}

export const ProgressBar = ({ label, current, total, className = "" }: ProgressBarProps) => {
  const percentage = Math.round((current / total) * 100);
  
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm text-muted-foreground">{current}/{total} lessons</span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
};