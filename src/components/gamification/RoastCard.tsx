import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Download, Share2, Flame, Skull, TrendingDown, DollarSign, Coffee, Pizza, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface RoastData {
  headline: string;
  roasts: string[];
  topSpendCategory: string;
  topSpendAmount: number;
  savingsVsSpending: { savings: number; spending: number };
  worstPurchase: string;
  worstPurchaseAmount: number;
}

interface RoastCardProps {
  data: RoastData;
  userName?: string;
  onClose?: () => void;
}

export const RoastCard = ({ data, userName = "You", onClose }: RoastCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const getCategoryIcon = (category: string) => {
    const lower = category.toLowerCase();
    if (lower.includes("food") || lower.includes("restaurant") || lower.includes("uber eats")) return Pizza;
    if (lower.includes("coffee") || lower.includes("starbucks")) return Coffee;
    if (lower.includes("transport") || lower.includes("uber") || lower.includes("lyft")) return Car;
    return DollarSign;
  };

  const CategoryIcon = getCategoryIcon(data.topSpendCategory);

  const handleShare = async () => {
    if (!cardRef.current) return;
    
    setIsGeneratingImage(true);
    
    try {
      // Dynamic import html2canvas only when needed
      const html2canvas = (await import('html2canvas')).default;
      
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        logging: false,
      });
      
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png');
      });
      
      if (navigator.share && navigator.canShare({ files: [new File([blob], 'elin-roast.png', { type: 'image/png' })] })) {
        await navigator.share({
          files: [new File([blob], 'elin-roast.png', { type: 'image/png' })],
          title: 'My ELIN Spending Roast',
          text: 'I just got roasted by ELIN AI 🔥',
        });
      } else {
        // Fallback: download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'elin-roast.png';
        a.click();
        URL.revokeObjectURL(url);
        
        toast({
          title: "Image Downloaded!",
          description: "Share it on social media to flex your financial chaos 🔥",
        });
      }
    } catch (error) {
      console.error('Share error:', error);
      toast({
        title: "Couldn't generate image",
        description: "Try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    
    setIsGeneratingImage(true);
    
    try {
      const html2canvas = (await import('html2canvas')).default;
      
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        logging: false,
      });
      
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = 'elin-roast.png';
      a.click();
      
      toast({
        title: "Downloaded!",
        description: "Now go post it and get roasted by your friends too 😂",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="max-w-md w-full"
      >
        {/* The shareable card */}
        <div
          ref={cardRef}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f0f23] p-6 shadow-2xl"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-red-500/20 to-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-primary/20 to-pink-500/10 rounded-full blur-3xl" />
          
          {/* Header */}
          <div className="relative flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">ELIN ROASTED ME</h2>
              <p className="text-sm text-gray-400">Spending Wrapped 2024</p>
            </div>
            <div className="ml-auto">
              <Skull className="w-8 h-8 text-red-400" />
            </div>
          </div>

          {/* Main headline */}
          <div className="relative mb-6 p-4 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-lg font-medium text-white leading-relaxed">
              "{data.headline}"
            </p>
          </div>

          {/* Stats grid */}
          <div className="relative grid grid-cols-2 gap-3 mb-6">
            {/* Top spend category */}
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <CategoryIcon className="w-4 h-4 text-red-400" />
                <span className="text-xs text-gray-400">Top Spend</span>
              </div>
              <p className="text-sm font-medium text-white">{data.topSpendCategory}</p>
              <p className="text-xl font-bold text-red-400">${data.topSpendAmount.toLocaleString()}</p>
            </div>

            {/* Savings vs Spending */}
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-orange-400" />
                <span className="text-xs text-gray-400">Reality Check</span>
              </div>
              <p className="text-sm font-medium text-white">Savings: ${data.savingsVsSpending.savings}</p>
              <p className="text-xl font-bold text-orange-400">Spent: ${data.savingsVsSpending.spending}</p>
            </div>
          </div>

          {/* Worst purchase callout */}
          <div className="relative p-4 bg-gradient-to-r from-red-500/20 to-orange-500/10 rounded-xl border border-red-500/30 mb-6">
            <p className="text-xs text-red-300 mb-1">🏆 Worst Purchase Award Goes To:</p>
            <p className="text-white font-medium">{data.worstPurchase}</p>
            <p className="text-red-400 font-bold">${data.worstPurchaseAmount}</p>
          </div>

          {/* Roast quotes */}
          <div className="relative space-y-2 mb-4">
            {data.roasts.slice(0, 2).map((roast, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-orange-400">🔥</span>
                <p className="text-sm text-gray-300 italic">"{roast}"</p>
              </div>
            ))}
          </div>

          {/* Footer branding */}
          <div className="relative flex items-center justify-between pt-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-xs font-bold text-white">E</span>
              </div>
              <span className="text-sm text-gray-400">ELIN AI</span>
            </div>
            <p className="text-xs text-gray-500">elinai.app</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-4">
          <Button
            variant="outline"
            className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            onClick={handleDownload}
            disabled={isGeneratingImage}
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
            onClick={handleShare}
            disabled={isGeneratingImage}
          >
            <Share2 className="w-4 h-4 mr-2" />
            {isGeneratingImage ? "Generating..." : "Share Roast"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
