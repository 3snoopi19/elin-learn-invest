import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BookOpen, 
  Search, 
  ExternalLink,
  Lightbulb,
  TrendingUp,
  DollarSign,
  Shield,
  BarChart3
} from "lucide-react";

interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  category: 'basics' | 'investing' | 'risk' | 'analysis' | 'trading';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  examples?: string[];
  relatedTerms?: string[];
}

const glossaryTerms: GlossaryTerm[] = [
  {
    id: '1',
    term: 'Asset Allocation',
    definition: 'The strategic distribution of investments across different asset classes (stocks, bonds, cash) to balance risk and return based on investment goals and risk tolerance.',
    category: 'investing',
    difficulty: 'beginner',
    examples: ['60% stocks, 30% bonds, 10% cash', '80/20 stock/bond allocation'],
    relatedTerms: ['Diversification', 'Portfolio', 'Risk Management']
  },
  {
    id: '2',
    term: 'P/E Ratio',
    definition: 'Price-to-Earnings ratio measures a company\'s current share price relative to its earnings per share. It indicates how much investors are willing to pay per dollar of earnings.',
    category: 'analysis',
    difficulty: 'intermediate',
    examples: ['A P/E of 15 means investors pay $15 for every $1 of earnings', 'Tech stocks often have higher P/E ratios than utilities'],
    relatedTerms: ['Earnings Per Share', 'Valuation', 'Market Cap']
  },
  {
    id: '3',
    term: 'Diversification',
    definition: 'An investment strategy that spreads investments across various assets, sectors, or geographic regions to reduce overall portfolio risk.',
    category: 'risk',
    difficulty: 'beginner',
    examples: ['Investing in both tech and healthcare stocks', 'Owning domestic and international investments'],
    relatedTerms: ['Asset Allocation', 'Risk Management', 'Correlation']
  },
  {
    id: '4',
    term: 'Dividend Yield',
    definition: 'The annual dividend payment divided by the stock price, expressed as a percentage. It shows how much income an investment generates relative to its price.',
    category: 'investing',
    difficulty: 'beginner',
    examples: ['A $100 stock paying $4 annually has a 4% yield', 'Utility stocks often have higher dividend yields'],
    relatedTerms: ['Dividend', 'Yield', 'Income Investing']
  },
  {
    id: '5',
    term: 'Beta',
    definition: 'A measure of a stock\'s volatility relative to the overall market. A beta of 1 means the stock moves with the market, above 1 is more volatile, below 1 is less volatile.',
    category: 'risk',
    difficulty: 'intermediate',
    examples: ['Beta of 1.5 means 50% more volatile than market', 'Defensive stocks often have beta below 1'],
    relatedTerms: ['Volatility', 'Market Risk', 'Systematic Risk']
  },
  {
    id: '6',
    term: 'Bull Market',
    definition: 'A prolonged period of rising stock prices, typically characterized by investor optimism and economic growth expectations.',
    category: 'trading',
    difficulty: 'beginner',
    examples: ['The 2010-2020 decade was largely a bull market', 'Tech stocks led the recent bull market'],
    relatedTerms: ['Bear Market', 'Market Cycles', 'Market Sentiment']
  },
  {
    id: '7',
    term: 'Expense Ratio',
    definition: 'The annual fee charged by mutual funds or ETFs, expressed as a percentage of your investment. Lower expense ratios mean more of your money stays invested.',
    category: 'investing',
    difficulty: 'intermediate',
    examples: ['0.05% expense ratio costs $5 per $10,000 invested', 'Index funds typically have lower expense ratios'],
    relatedTerms: ['ETF', 'Mutual Fund', 'Investment Costs']
  },
  {
    id: '8',
    term: 'Market Cap',
    definition: 'Market Capitalization is the total value of a company\'s shares, calculated by multiplying share price by number of outstanding shares.',
    category: 'analysis',
    difficulty: 'beginner',
    examples: ['Large cap: over $10B', 'Small cap: $300M-$2B'],
    relatedTerms: ['Share Price', 'Outstanding Shares', 'Company Size']
  }
];

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'basics': return BookOpen;
    case 'investing': return TrendingUp;
    case 'risk': return Shield;
    case 'analysis': return BarChart3;
    case 'trading': return DollarSign;
    default: return Lightbulb;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'basics': return 'bg-education/20 text-education border-education/30';
    case 'investing': return 'bg-success/20 text-success border-success/30';
    case 'risk': return 'bg-warning/20 text-warning border-warning/30';
    case 'analysis': return 'bg-secondary/20 text-secondary border-secondary/30';
    case 'trading': return 'bg-accent/20 text-accent border-accent/30';
    default: return 'bg-muted/20 text-muted-foreground border-muted/30';
  }
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner': return 'bg-success/20 text-success border-success/30';
    case 'intermediate': return 'bg-warning/20 text-warning border-warning/30';
    case 'advanced': return 'bg-destructive/20 text-destructive border-destructive/30';
    default: return 'bg-muted/20 text-muted-foreground border-muted/30';
  }
};

export const GlossaryCard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<GlossaryTerm | null>(null);

  const categories = ['basics', 'investing', 'risk', 'analysis', 'trading'];

  const filteredTerms = useMemo(() => {
    return glossaryTerms.filter(term => {
      const matchesSearch = term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           term.definition.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || term.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  return (
    <Card className="professional-card border-0 shadow-xl h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative p-2 bg-education/20 rounded-lg">
            <BookOpen className="w-6 h-6 text-education" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-text-heading">Investment Glossary</CardTitle>
            <p className="text-text-secondary text-sm">Learn key investment terms</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
          <Input
            placeholder="Search terms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 mobile-input"
          />
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className="mobile-button"
          >
            All
          </Button>
          {categories.map(category => {
            const Icon = getCategoryIcon(category);
            return (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="mobile-button capitalize"
              >
                <Icon className="w-3 h-3 mr-1" />
                {category}
              </Button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent>
        {selectedTerm ? (
          /* Term Detail View */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTerm(null)}
                className="mobile-button"
              >
                ← Back to List
              </Button>
              <div className="flex gap-2">
                <Badge className={getCategoryColor(selectedTerm.category)}>
                  {selectedTerm.category}
                </Badge>
                <Badge className={getDifficultyColor(selectedTerm.difficulty)}>
                  {selectedTerm.difficulty}
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-text-heading">{selectedTerm.term}</h3>
              
              <p className="text-text-body leading-relaxed">{selectedTerm.definition}</p>
              
              {selectedTerm.examples && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-text-heading">Examples:</h4>
                  <ul className="space-y-1">
                    {selectedTerm.examples.map((example, index) => (
                      <li key={index} className="text-text-secondary text-sm flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedTerm.relatedTerms && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-text-heading">Related Terms:</h4>
                  <div className="flex gap-2 flex-wrap">
                    {selectedTerm.relatedTerms.map((relatedTerm, index) => (
                      <Badge key={index} variant="outline" className="cursor-pointer hover:bg-primary/10">
                        {relatedTerm}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button className="flex-1 mobile-button">
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Learn More
                </Button>
                <Button variant="outline" className="mobile-button">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Terms List View */
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {filteredTerms.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-8 h-8 text-text-muted mx-auto mb-3" />
                  <p className="text-text-secondary">No terms found matching your search.</p>
                </div>
              ) : (
                filteredTerms.map((term) => {
                  const CategoryIcon = getCategoryIcon(term.category);
                  return (
                    <div
                      key={term.id}
                      className="p-4 bg-card/30 rounded-lg border border-border/30 cursor-pointer hover:bg-card/50 transition-colors group"
                      onClick={() => setSelectedTerm(term)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <CategoryIcon className="w-4 h-4 text-text-muted" />
                          <h4 className="font-semibold text-text-heading group-hover:text-primary transition-colors">
                            {term.term}
                          </h4>
                        </div>
                        <div className="flex gap-1">
                          <Badge variant="outline" className={`text-xs ${getCategoryColor(term.category)}`}>
                            {term.category}
                          </Badge>
                          <Badge variant="outline" className={`text-xs ${getDifficultyColor(term.difficulty)}`}>
                            {term.difficulty}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-text-secondary text-sm line-clamp-2 leading-relaxed">
                        {term.definition}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};