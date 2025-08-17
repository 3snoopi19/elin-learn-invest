import { Badge } from "@/components/ui/badge";
import { Shield, Target, Trophy } from "lucide-react";

interface RiskProfileBadgeProps {
  riskProfile: string | null;
  className?: string;
  showIcon?: boolean;
}

const profileConfig = {
  cautious: {
    label: "Cautious Planner",
    icon: Shield,
    variant: "secondary" as const,
    color: "text-blue-600"
  },
  balanced: {
    label: "Balanced Investor", 
    icon: Target,
    variant: "default" as const,
    color: "text-green-600"
  },
  bold: {
    label: "Bold Explorer",
    icon: Trophy,
    variant: "secondary" as const,
    color: "text-orange-600"
  }
};

const RiskProfileBadge = ({ riskProfile, className, showIcon = true }: RiskProfileBadgeProps) => {
  if (!riskProfile || !profileConfig[riskProfile as keyof typeof profileConfig]) {
    return (
      <Badge variant="outline" className={className}>
        Take Risk Quiz
      </Badge>
    );
  }

  const config = profileConfig[riskProfile as keyof typeof profileConfig];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={`${className} ${config.color}`}>
      {showIcon && <Icon className="h-3 w-3 mr-1" />}
      {config.label}
    </Badge>
  );
};

export { RiskProfileBadge };