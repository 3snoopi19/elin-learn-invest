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
    "group relative rounded-xl p-5 md:p-6 border border-border bg-card shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background hover:-translate-y-0.5 hover:border-primary/30 active:scale-98 touch-target",
    featured && "border-primary/20 shadow-lg shadow-primary/10",
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
          <div className="absolute top-0 left-0 right-0 h-16 rounded-t-2xl bg-gradient-to-tr from-primary via-accent to-education opacity-20" />
        )}

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Icon Chip */}
            <div className="rounded-lg bg-primary/10 p-3 border border-primary/20 group-hover:border-primary/40 transition-colors">
              {icon}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg md:text-xl font-semibold text-text-heading">{title}</h3>
                {badge && (
                  <Badge variant={badge.variant || "default"} className="text-xs">
                    {badge.label}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-text-secondary">{subtitle}</p>
            </div>
          </div>
          
          {/* Stats Chip */}
          {statChip && (
            <div className="hidden md:flex items-center gap-1 px-3 py-1 bg-muted rounded-full text-xs text-text-muted">
              {statChip.label}
            </div>
          )}
        </div>

        {/* Body Content */}
        {children && (
          <div className="mb-4">
            {children}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center gap-3 md:gap-4 justify-between md:justify-start">
          <div className="flex flex-col sm:flex-row gap-2 flex-1">
            {/* Primary Action */}
            <Button 
              size="lg"
              className="h-11 px-5 rounded-lg font-medium min-h-[44px] flex-1 sm:flex-none"
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
              <div className="relative flex-1 sm:flex-none">
                <Button 
                  variant="outline"
                  size="lg"
                  className="h-11 px-5 rounded-lg font-medium min-h-[44px] w-full sm:w-auto focus-visible:ring-2 focus-visible:ring-primary"
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
                  <Badge className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs min-w-[1.25rem] h-5 flex items-center justify-center border border-background shadow-md">
                    {secondaryAction.count}
                  </Badge>
                )}
              </div>
            )}
          </div>
          
          {/* Tertiary Action */}
          {tertiaryAction && (
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <Button 
                variant="ghost"
                size="sm"
                className="text-xs text-text-muted hover:text-text-body min-h-[36px] whitespace-nowrap"
                onClick={(e) => {
                  e.stopPropagation();
                  tertiaryAction.onClick(e);
                }}
              >
                {tertiaryAction.label}
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};