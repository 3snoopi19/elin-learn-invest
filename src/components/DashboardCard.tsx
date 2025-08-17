import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReactNode, MouseEvent, KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  subtitle: string;
  icon: ReactNode;
  children?: ReactNode;
  primaryAction: {
    label: string;
    icon: ReactNode;
    onClick: (e?: MouseEvent) => void;
  };
  secondaryAction?: {
    label: string;
    icon: ReactNode;
    onClick: (e?: MouseEvent) => void;
    count?: number;
    disabled?: boolean;
    tooltip?: string;
  };
  tertiaryAction?: {
    label: string;
    onClick: (e?: MouseEvent) => void;
  };
  badge?: {
    label: string;
    variant?: "default" | "secondary" | "outline";
  };
  statChip?: {
    label: string;
  };
  onClick?: () => void;
  className?: string;
  delay?: number;
  gradientHeader?: boolean;
  featured?: boolean;
}

export const DashboardCard = ({
  title,
  subtitle,
  icon,
  children,
  primaryAction,
  secondaryAction,
  tertiaryAction,
  badge,
  statChip,
  onClick,
  className,
  delay = 0,
  gradientHeader = false,
  featured = false
}: DashboardCardProps) => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && onClick) {
      e.preventDefault();
      onClick();
    }
  };

  const baseCardClasses = cn(
    "group relative rounded-2xl p-5 md:p-6 border border-zinc-100 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400/70",
    className
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <motion.div
        className={baseCardClasses}
        whileHover={{ y: -2, scale: 1.01 }}
        whileTap={{ scale: 0.995 }}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        tabIndex={onClick ? 0 : undefined}
        role={onClick ? "button" : undefined}
        aria-label={onClick ? `${title}: ${subtitle}` : undefined}
      >
        {/* Gradient Header Strip for Learning Journey */}
        {gradientHeader && (
          <div className="absolute top-0 left-0 right-0 h-16 rounded-t-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-500 opacity-15 dark:opacity-10" />
        )}

        {/* Header */}
        <div className="flex items-start justify-between mb-4 relative z-10">
          <div className="flex items-center gap-3">
            {/* Icon Chip */}
            <div className="rounded-xl bg-zinc-900/5 dark:bg-white/10 p-2 backdrop-blur">
              {icon}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg md:text-xl font-semibold">{title}</h3>
                {badge && (
                  <Badge variant={badge.variant || "default"} className="text-xs">
                    {badge.label}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
          </div>
          
          {/* Stats Chip */}
          {statChip && (
            <div className="hidden md:flex items-center gap-1 px-3 py-1 bg-muted rounded-full text-xs text-muted-foreground">
              {statChip.label}
            </div>
          )}
        </div>

        {/* Body Content */}
        {children && (
          <div className="mb-4 relative z-10">
            {children}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center gap-3 md:gap-4 justify-between md:justify-start relative z-10">
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Primary Action */}
            <Button 
              size="lg"
              className="h-11 px-5 rounded-xl font-medium"
              onClick={(e) => {
                e.stopPropagation();
                primaryAction.onClick(e);
              }}
            >
              {primaryAction.icon}
              {primaryAction.label}
            </Button>
            
            {/* Secondary Action */}
            {secondaryAction && (
              <div className="relative">
                <Button 
                  variant="outline"
                  size="lg"
                  className="h-11 px-5 rounded-xl font-medium focus-visible:ring-2 focus-visible:ring-emerald-400/70"
                  onClick={(e) => {
                    e.stopPropagation();
                    secondaryAction.onClick(e);
                  }}
                  disabled={secondaryAction.disabled}
                  aria-disabled={secondaryAction.disabled}
                  title={secondaryAction.tooltip}
                >
                  {secondaryAction.icon}
                  {secondaryAction.label}
                </Button>
                {/* Count Badge */}
                {secondaryAction.count !== undefined && secondaryAction.count > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-emerald-600 text-white dark:bg-emerald-500 text-xs min-w-[1.25rem] h-5 flex items-center justify-center">
                    {secondaryAction.count}
                  </Badge>
                )}
              </div>
            )}
          </div>
          
          {/* Tertiary Action & Settings */}
          {(tertiaryAction || !featured) && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground ml-auto">
              {tertiaryAction && (
                <Button 
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    tertiaryAction.onClick(e);
                  }}
                >
                  {tertiaryAction.label}
                </Button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};