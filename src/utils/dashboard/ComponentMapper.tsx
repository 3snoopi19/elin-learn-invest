import React from 'react';
import { 
  Brain, BookOpen, TrendingUp, MessageSquare, FileText, 
  BarChart3, Activity, Clock, PieChart as PieChartIcon,
  Search, Eye, Play, Trophy, HelpCircle, Sparkles, 
  ShieldCheck, Calendar, Building2, Filter, Download,
  ExternalLink, Star, Upload, Settings, History, PlusCircle,
  CreditCard
} from 'lucide-react';
import { HeroSummaryCard } from '@/components/HeroSummaryCard';
import { PortfolioOverviewCard } from '@/components/PortfolioOverviewCard';
import { LiveMarketFeed } from '@/components/LiveMarketFeed';
import { RecentActivityCard } from '@/components/RecentActivityCard';
import { AIInsightsCard } from '@/components/AIInsightsCard';
import { RiskAnalysisCard } from '@/components/RiskAnalysisCard';
import { GlossaryCard } from '@/components/GlossaryCard';
import { MarketSimulatorCard } from '@/components/MarketSimulatorCard';
import { LearningPathsCard } from '@/components/LearningPathsCard';
import { SECFilingsExplorer } from '@/components/SECFilingsExplorer';
import { CreditCardHelperCard } from '@/components/CreditCardHelperCard';
import { MoneyFlowRouterCard } from '@/components/MoneyFlowRouterCard';
import { DashboardCard } from '@/components/DashboardCard';
import { motion } from 'framer-motion';

// Icon mapping for dynamic rendering
export const ICON_MAP: Record<string, React.ComponentType<any>> = {
  'Brain': Brain,
  'BookOpen': BookOpen,
  'TrendingUp': TrendingUp,
  'MessageSquare': MessageSquare,
  'FileText': FileText,
  'BarChart3': BarChart3,
  'Activity': Activity,
  'Clock': Clock,
  'PieChart': PieChartIcon,
  'Search': Search,
  'Eye': Eye,
  'Play': Play,
  'Trophy': Trophy,
  'HelpCircle': HelpCircle,
  'Sparkles': Sparkles,
  'ShieldCheck': ShieldCheck,
  'Calendar': Calendar,
  'Building2': Building2,
  'Filter': Filter,
  'Download': Download,
  'ExternalLink': ExternalLink,
  'Star': Star,
  'Upload': Upload,
  'Settings': Settings,
  'History': History,
  'PlusCircle': PlusCircle,
  'CreditCard': CreditCard
};

// Component mapping for dynamic rendering
export const COMPONENT_MAP: Record<string, React.ComponentType<any>> = {
  'HeroSummaryCard': HeroSummaryCard,
  'PortfolioOverviewCard': PortfolioOverviewCard,
  'LiveMarketFeed': LiveMarketFeed,
  'RecentActivityCard': RecentActivityCard,
  'AIInsightsCard': AIInsightsCard,
  'RiskAnalysisCard': RiskAnalysisCard,
  'GlossaryCard': GlossaryCard,
  'MarketSimulatorCard': MarketSimulatorCard,
  'LearningPathsCard': LearningPathsCard,
  'SECFilingsExplorer': SECFilingsExplorer,
  'CreditCardHelperCard': CreditCardHelperCard,
  'MoneyFlowRouterCard': MoneyFlowRouterCard,
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
 * Converts icon string to React component
 */
const getIconComponent = (iconName?: string, className: string = "w-6 h-6") => {
  if (!iconName) return null;
  const IconComponent = ICON_MAP[iconName];
  return IconComponent ? <IconComponent className={className} /> : null;
};

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
  
  console.log('Rendering component:', componentName, 'with props:', props);
  
  if (!Component) {
    console.warn(`Unknown dashboard component: ${componentName}`);
    return null;
  }

  // Process props to convert icon strings to components if needed
  const processedProps = {
    ...props,
    // Convert icon strings to React components for DashboardCard
    ...(props.icon && typeof props.icon === 'string' && { 
      icon: getIconComponent(props.icon) 
    }),
    // Convert CTA icons if they exist
    ...(props.primaryAction && props.primaryAction.icon && typeof props.primaryAction.icon === 'string' && {
      primaryAction: {
        ...props.primaryAction,
        icon: getIconComponent(props.primaryAction.icon, "w-4 h-4")
      }
    }),
    ...(props.secondaryAction && props.secondaryAction.icon && typeof props.secondaryAction.icon === 'string' && {
      secondaryAction: {
        ...props.secondaryAction,
        icon: getIconComponent(props.secondaryAction.icon, "w-4 h-4")
      }
    })
  };

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
      <Component {...processedProps}>
        {children}
      </Component>
    </motion.div>
  );
};