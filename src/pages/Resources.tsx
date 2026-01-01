import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, BookOpen, Download, Sparkles, Loader2, ChevronRight, ExternalLink } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { financialGlossary, categories, downloadableTools, GlossaryTerm } from "@/data/financialGlossary";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Resources = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const { toast } = useToast();

  const filteredTerms = useMemo(() => {
    return financialGlossary.filter(term => {
      const matchesSearch = term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           term.definition.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || term.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleExplainLikeIm10 = async (term: GlossaryTerm) => {
    setIsExplaining(true);
    setAiExplanation(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('explain-term', {
        body: { term: term.term, definition: term.definition }
      });

      if (error) throw error;

      if (data?.explanation) {
        setAiExplanation(data.explanation);
      }
    } catch (error) {
      console.error('Explain error:', error);
      toast({
        variant: "destructive",
        title: "Oops!",
        description: "Could not generate explanation. Try again later.",
      });
    } finally {
      setIsExplaining(false);
    }
  };

  const handleDownload = (toolId: string, title: string) => {
    toast({
      title: "📥 Download Started",
      description: `${title} is being prepared. Check your downloads folder.`,
    });
    // In production, this would trigger actual file download
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl pb-32 md:pb-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent mb-3">
            Financial Resources
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Learn money concepts in plain English. No jargon, no confusion.
          </p>
        </motion.div>

        <Tabs defaultValue="glossary" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="glossary" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Financial Wiki
            </TabsTrigger>
            <TabsTrigger value="tools" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Tools & Templates
            </TabsTrigger>
          </TabsList>

          {/* Glossary Tab */}
          <TabsContent value="glossary">
            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="relative max-w-xl mx-auto mb-6"
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for any financial term..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base bg-card border-border"
              />
            </motion.div>

            {/* Category Pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap justify-center gap-2 mb-8"
            >
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === cat.id
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-card hover:bg-muted text-foreground border border-border"
                  }`}
                >
                  <span className="mr-1.5">{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </motion.div>

            {/* Terms Grid */}
            <div className="grid gap-4 md:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {filteredTerms.map((term, index) => (
                  <motion.div
                    key={term.term}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.03 }}
                    layout
                  >
                    <Card 
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        expandedTerm === term.term ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => {
                        setExpandedTerm(expandedTerm === term.term ? null : term.term);
                        setAiExplanation(null);
                      }}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg font-semibold text-foreground">
                            {term.term}
                          </CardTitle>
                          <Badge variant="secondary" className="text-xs capitalize">
                            {term.category}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {term.definition}
                        </p>

                        {/* Expanded Content */}
                        <AnimatePresence>
                          {expandedTerm === term.term && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-4 pt-4 border-t border-border"
                            >
                              {/* Related Terms */}
                              {term.relatedTerms && term.relatedTerms.length > 0 && (
                                <div className="mb-4">
                                  <p className="text-xs text-muted-foreground mb-2">Related:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {term.relatedTerms.map((related) => (
                                      <Badge 
                                        key={related} 
                                        variant="outline" 
                                        className="text-xs cursor-pointer hover:bg-muted"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSearchQuery(related);
                                          setExpandedTerm(null);
                                        }}
                                      >
                                        {related}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* AI Explanation */}
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30 hover:border-primary/50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleExplainLikeIm10(term);
                                }}
                                disabled={isExplaining}
                              >
                                {isExplaining ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Thinking...
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Explain like I'm 10
                                  </>
                                )}
                              </Button>

                              {aiExplanation && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="mt-3 p-3 rounded-lg bg-primary/10 border border-primary/20"
                                >
                                  <p className="text-sm text-foreground leading-relaxed flex items-start gap-2">
                                    <span className="text-lg">🧒</span>
                                    {aiExplanation}
                                  </p>
                                </motion.div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {filteredTerms.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <p className="text-muted-foreground text-lg">
                  No terms found for "{searchQuery}"
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try a different search or category
                </p>
              </motion.div>
            )}
          </TabsContent>

          {/* Tools & Templates Tab */}
          <TabsContent value="tools">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Free Tools & Templates
              </h2>
              <p className="text-muted-foreground">
                Download practical worksheets to take control of your finances
              </p>
            </motion.div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {downloadableTools.map((tool, index) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`h-full bg-gradient-to-br ${tool.color} border-border/50 hover:shadow-lg transition-all group`}>
                    <CardContent className="p-6">
                      <div className="text-4xl mb-4">{tool.icon}</div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {tool.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {tool.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {tool.format}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                          onClick={() => handleDownload(tool.id, tool.title)}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Coming Soon Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 p-6 rounded-2xl bg-muted/50 border border-border text-center"
            >
              <p className="text-sm text-muted-foreground mb-2">
                More templates coming soon
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Badge variant="outline">Investment Tracker</Badge>
                <Badge variant="outline">Tax Prep Checklist</Badge>
                <Badge variant="outline">Retirement Calculator</Badge>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default Resources;
