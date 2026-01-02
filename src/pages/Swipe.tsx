import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { TransactionSwipeStack } from "@/components/mobile/TransactionSwipeStack";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { useIsMobile } from "@/hooks/use-mobile";

const SwipePage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Redirect desktop users to dashboard
  useEffect(() => {
    if (!loading && !isMobile) {
      navigate('/dashboard');
    }
  }, [isMobile, loading, navigate]);

  if (loading) {
    return <LoadingScreen message="Loading..." showLogo={true} />;
  }

  if (!user) return null;

  return (
    <div className="px-4 pt-4">
      {/* Minimal Header */}
      <header className="flex items-center justify-between mb-4">
        <button 
          onClick={() => navigate('/dashboard')}
          className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-text-muted" />
        </button>
        
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-lg font-bold text-text-heading flex items-center gap-2"
        >
          <Sparkles className="w-5 h-5 text-primary" />
          Daily Swipe
        </motion.h1>
        
        <div className="w-9" /> {/* Spacer for centering */}
      </header>

      {/* Hero Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center px-2 pt-2 pb-4"
      >
        <h2 className="text-2xl font-black text-text-heading mb-1">
          Review Your Day
        </h2>
        <p className="text-text-secondary">
          Swipe right for essential, left for impulse
        </p>
      </motion.div>

      {/* Swipe Stack */}
      <TransactionSwipeStack />
    </div>
  );
};

export default SwipePage;
