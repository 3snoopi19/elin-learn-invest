import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  HelpCircle, 
  X, 
  TrendingUp, 
  PieChart, 
  Bot, 
  Activity,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TooltipData {
  id: string;
  title: string;
  content: string;
  category: 'financial' | 'technical' | 'feature';
}

const tooltipData: TooltipData[] = [
  {
    id: 'diversification',
    title: 'Diversification Score',
    content: 'Measures how spread out your investments are across different asset types. A higher score (80+) means lower risk through variety.',
    category: 'financial'
  },
  {
    id: 'ai-confidence',
    title: 'AI Confidence',
    content: 'Shows how certain ELIN is about a recommendation based on market data and your profile. Higher percentages mean more reliable suggestions.',
    category: 'technical'
  },
  {
    id: 'expense-ratio',
    title: 'Expense Ratio',
    content: 'The annual fee charged by ETFs or mutual funds, expressed as a percentage. Lower is better - 0.1% means $1 fee per $1,000 invested yearly.',
    category: 'financial'
  },
  {
    id: 'credit-utilization',
    title: 'Credit Utilization',
    content: 'The percentage of your available credit limit that you\'re currently using. Keep it below 30% for a healthy credit score.',
    category: 'financial'
  },
  {
    id: 'reit',
    title: 'REIT',
    content: 'Real Estate Investment Trust - A company that owns or finances income-producing real estate. Lets you invest in real estate without buying property.',
    category: 'financial'
  },
  {
    id: 'market-cap',
    title: 'Market Cap',
    content: 'Total value of a company\'s shares. Large-cap (>$10B) are stable, mid-cap ($2-10B) are growing, small-cap (<$2B) are risky but high potential.',
    category: 'financial'
  }
];

interface OnboardingTooltipProps {
  term: string;
  children: React.ReactNode;
  className?: string;
}

export const OnboardingTooltip = ({ term, children, className }: OnboardingTooltipProps) => {
  const tooltipInfo = tooltipData.find(t => t.id === term.toLowerCase().replace(/\s+/g, '-'));
  
  if (!tooltipInfo) {
    return <span className={className}>{children}</span>;
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <span className={`inline-flex items-center gap-1 cursor-help ${className}`}>
            {children}
            <HelpCircle className="w-3 h-3 text-primary opacity-70 hover:opacity-100 transition-opacity" />
          </span>
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="max-w-xs bg-card border border-border/50 shadow-lg"
          sideOffset={5}
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-text-heading text-sm">{tooltipInfo.title}</h4>
              <Badge 
                variant="outline" 
                className={`text-xs ${
                  tooltipInfo.category === 'financial' 
                    ? 'bg-success/10 text-success border-success/30'
                    : tooltipInfo.category === 'technical'
                    ? 'bg-primary/10 text-primary border-primary/30'
                    : 'bg-secondary/10 text-secondary border-secondary/30'
                }`}
              >
                {tooltipInfo.category}
              </Badge>
            </div>
            <p className="text-text-muted text-xs leading-relaxed">
              {tooltipInfo.content}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

interface HelpPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpPanel = ({ isOpen, onClose }: HelpPanelProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const categories = ['all', 'financial', 'technical', 'feature'];
  const filteredTooltips = selectedCategory === 'all' 
    ? tooltipData 
    : tooltipData.filter(t => t.category === selectedCategory);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed inset-4 z-50 md:inset-auto md:top-4 md:right-4 md:w-96 md:max-h-[600px]"
        >
          <Card className="h-full professional-card shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-border/30">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-text-heading">Financial Terms Guide</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <CardContent className="p-4 space-y-4">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="h-7 text-xs px-3 capitalize"
                  >
                    {category}
                  </Button>
                ))}
              </div>

              {/* Terms List */}
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {filteredTooltips.map((tooltip, index) => (
                  <motion.div
                    key={tooltip.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="mobile-card p-3 bg-muted/20 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-text-heading text-sm">{tooltip.title}</h4>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ml-2 flex-shrink-0 ${
                          tooltip.category === 'financial' 
                            ? 'bg-success/10 text-success border-success/30'
                            : tooltip.category === 'technical'
                            ? 'bg-primary/10 text-primary border-primary/30'
                            : 'bg-secondary/10 text-secondary border-secondary/30'
                        }`}
                      >
                        {tooltip.category}
                      </Badge>
                    </div>
                    <p className="text-text-muted text-xs leading-relaxed">
                      {tooltip.content}
                    </p>
                  </motion.div>
                ))}
              </div>

              <div className="text-center pt-2 border-t border-border/30">
                <p className="text-text-muted text-xs">
                  Look for the <HelpCircle className="w-3 h-3 inline mx-1 text-primary" /> icon next to terms for quick explanations
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};