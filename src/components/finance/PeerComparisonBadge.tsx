import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Users } from 'lucide-react';
import { motion } from 'framer-motion';

interface PeerComparisonBadgeProps {
  percentile?: number;
  comparisonType: 'above' | 'below' | 'top';
  category: string;
}

export const PeerComparisonBadge = ({ 
  percentile = 15, 
  comparisonType,
  category 
}: PeerComparisonBadgeProps) => {
  const getBadgeContent = () => {
    switch (comparisonType) {
      case 'top':
        return {
          icon: TrendingUp,
          text: `Top ${percentile}% of spenders`,
          color: 'bg-warning/10 text-warning border-warning/30',
          subtext: 'in your city'
        };
      case 'below':
        return {
          icon: TrendingDown,
          text: `${percentile}% less than avg`,
          color: 'bg-success/10 text-success border-success/30',
          subtext: 'great job!'
        };
      case 'above':
        return {
          icon: TrendingUp,
          text: `${percentile}% more than avg`,
          color: 'bg-destructive/10 text-destructive border-destructive/30',
          subtext: 'consider cutting back'
        };
      default:
        return {
          icon: Users,
          text: 'Average spender',
          color: 'bg-muted text-text-secondary border-border',
          subtext: ''
        };
    }
  };

  const content = getBadgeContent();
  const Icon = content.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Badge 
        variant="outline" 
        className={`text-xs px-2 py-1 ${content.color} flex items-center gap-1`}
      >
        <Icon className="w-3 h-3" />
        <span>{content.text}</span>
      </Badge>
    </motion.div>
  );
};
