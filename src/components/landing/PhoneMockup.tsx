import { motion } from "framer-motion";
import { X, Check } from "lucide-react";

interface PhoneMockupProps {
  className?: string;
}

export const PhoneMockup = ({ className = "" }: PhoneMockupProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateY: -5 }}
      animate={{ opacity: 1, y: 0, rotateY: 0 }}
      transition={{ duration: 0.8, delay: 0.3, type: "spring" }}
      className={`relative ${className}`}
      style={{ perspective: "1000px" }}
    >
      {/* Floating Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, x: -20 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ delay: 0.8, type: "spring" }}
        className="absolute -top-4 -left-4 md:-left-8 z-20 bg-gradient-to-r from-success to-success/80 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-bold shadow-lg"
      >
        👍 Thumb-First Design
      </motion.div>

      {/* Phone Frame */}
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-[2.5rem] md:rounded-[3rem] p-2 md:p-3 shadow-2xl">
        {/* Notch */}
        <div className="absolute top-4 md:top-5 left-1/2 -translate-x-1/2 w-20 md:w-28 h-5 md:h-6 bg-black rounded-full z-10" />
        
        {/* Screen */}
        <div className="relative bg-background rounded-[2rem] md:rounded-[2.5rem] overflow-hidden w-[240px] md:w-[280px] h-[480px] md:h-[560px]">
          {/* Status Bar */}
          <div className="absolute top-0 left-0 right-0 h-10 md:h-12 bg-background/95 backdrop-blur-sm z-10 flex items-end justify-center pb-1">
            <span className="text-xs text-text-muted font-medium">Daily Swipe</span>
          </div>

          {/* Screen Content */}
          <div className="pt-14 md:pt-16 px-4 flex flex-col items-center h-full bg-gradient-to-b from-primary/5 to-background">
            {/* Progress */}
            <div className="w-full mb-4">
              <div className="flex justify-between text-xs text-text-muted mb-1">
                <span>2 reviewed</span>
                <span>3 left</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-success"
                  initial={{ width: "0%" }}
                  animate={{ width: "40%" }}
                  transition={{ delay: 1, duration: 0.8 }}
                />
              </div>
            </div>

            {/* Swipe Card */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="relative w-full"
            >
              {/* Background cards for stack effect */}
              <div className="absolute top-2 left-2 right-2 h-full bg-card/50 rounded-2xl border border-border/30 transform scale-95" />
              <div className="absolute top-1 left-1 right-1 h-full bg-card/70 rounded-2xl border border-border/40 transform scale-[0.97]" />
              
              {/* Main Card */}
              <motion.div
                animate={{ 
                  rotate: [0, -2, 2, 0],
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="relative bg-card rounded-2xl p-4 md:p-5 shadow-xl border border-border/50"
              >
                {/* Swipe hints */}
                <motion.div
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-destructive/20 border border-destructive/40 flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-destructive" />
                </motion.div>
                <motion.div
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  className="absolute -right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-success/20 border border-success/40 flex items-center justify-center"
                >
                  <Check className="w-4 h-4 text-success" />
                </motion.div>

                {/* Card Content */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl md:text-3xl mb-3">
                    ☕
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-text-heading mb-1">
                    Starbucks
                  </h3>
                  <div className="text-2xl md:text-3xl font-black text-primary mb-2">
                    $14.50
                  </div>
                  <span className="px-3 py-1 rounded-full bg-muted text-text-secondary text-xs font-medium">
                    Food & Drink
                  </span>
                </div>
              </motion.div>
            </motion.div>

            {/* Action Buttons */}
            <div className="flex gap-6 mt-6">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-destructive/10 border-2 border-destructive flex items-center justify-center shadow-lg cursor-pointer"
              >
                <X className="w-6 h-6 md:w-7 md:h-7 text-destructive" />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-success/10 border-2 border-success flex items-center justify-center shadow-lg cursor-pointer"
              >
                <Check className="w-6 h-6 md:w-7 md:h-7 text-success" />
              </motion.div>
            </div>

            {/* Labels */}
            <div className="flex justify-between w-full px-4 mt-3">
              <span className="text-xs text-destructive font-medium">Impulse</span>
              <span className="text-xs text-success font-medium">Essential</span>
            </div>
          </div>
        </div>
      </div>

      {/* Glow effect */}
      <div className="absolute -inset-4 bg-primary/20 rounded-[3rem] blur-3xl -z-10 opacity-50" />
    </motion.div>
  );
};
