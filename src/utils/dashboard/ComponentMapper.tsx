import React from 'react';
import { HeroSummaryCard } from '@/components/HeroSummaryCard';
import { PortfolioOverviewCard } from '@/components/PortfolioOverviewCard';
import { LiveMarketFeed } from '@/components/LiveMarketFeed';
import { RecentActivityCard } from '@/components/RecentActivityCard';
import { AIInsightsCard } from '@/components/AIInsightsCard';
import { LearningPathsCard } from '@/components/LearningPathsCard';
import { SECFilingsExplorer } from '@/components/SECFilingsExplorer';
import { DashboardCard } from '@/components/DashboardCard';
import { motion } from 'framer-motion';

// Component mapping for dynamic rendering
export const COMPONENT_MAP: Record<string, React.ComponentType<any>> = {
  'HeroSummaryCard': HeroSummaryCard,
  'PortfolioOverviewCard': PortfolioOverviewCard,
  'LiveMarketFeed': LiveMarketFeed,
  'RecentActivityCard': RecentActivityCard,
  'AIInsightsCard': AIInsightsCard,
  'LearningPathsCard': LearningPathsCard,
  'SECFilingsExplorer': SECFilingsExplorer,
  'ChatCard': DashboardCard, // Fallback for cards not yet converted
  'AIPortfolioSimulatorCard': DashboardCard // Will be removed in cleanup
};

interface DashboardCardRendererProps {
  componentName: string;
  props?: Record<string, any>;
  gridSpan?: {
    default?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  children?: React.ReactNode;
}

/**
 * Renders a dashboard card component dynamically based on the component name
 */
export const DashboardCardRenderer: React.FC<DashboardCardRendererProps> = ({
  componentName,
  props = {},
  gridSpan,
  children
}) => {
  const Component = COMPONENT_MAP[componentName];
  
  if (!Component) {
    console.warn(`Unknown dashboard component: ${componentName}`);
    return null;
  }

  const gridClasses = gridSpan ? [
    gridSpan.default && `col-span-${gridSpan.default}`,
    gridSpan.md && `md:col-span-${gridSpan.md}`,
    gridSpan.lg && `lg:col-span-${gridSpan.lg}`,
    gridSpan.xl && `xl:col-span-${gridSpan.xl}`,
  ].filter(Boolean).join(' ') : '';

  return (
    <motion.div
      className={gridClasses}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: props.animationDelay || 0 }}
    >
      <Component {...props}>
        {children}
      </Component>
    </motion.div>
  );
};