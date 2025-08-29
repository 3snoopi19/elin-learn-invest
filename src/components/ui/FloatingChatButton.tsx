import { useState } from "react";
import { MessageCircle, X, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";

export const FloatingChatButton = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showTooltip, setShowTooltip] = useState(false);

  if (!user) return null;

  const handleChatClick = () => {
    navigate('/chat');
  };

  return (
    <div className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-50">
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20 }}
            className="absolute bottom-full right-0 mb-2"
          >
            <Card className="bg-card/95 backdrop-blur-xl border-primary/20 shadow-lg">
              <CardContent className="p-3 text-sm text-text-body">
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <Brain className="w-4 h-4 text-primary" />
                  Chat with ELIN AI
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onHoverStart={() => setShowTooltip(true)}
        onHoverEnd={() => setShowTooltip(false)}
        onTouchStart={() => setShowTooltip(true)}
        onTouchEnd={() => setTimeout(() => setShowTooltip(false), 2000)}
      >
        <Button
          onClick={handleChatClick}
          className="floating-action-btn shadow-lg hover:shadow-xl"
          aria-label="Chat with ELIN AI Mentor"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </motion.div>
    </div>
  );
};