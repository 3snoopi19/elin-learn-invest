import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, CreditCard, MessageSquare } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

interface DockItem {
  id: string;
  icon: React.ComponentType<any>;
  label: string;
  path: string;
}

const dockItems: DockItem[] = [
  {
    id: 'focus',
    icon: LayoutDashboard,
    label: 'Focus',
    path: '/dashboard'
  },
  {
    id: 'swipe',
    icon: CreditCard,
    label: 'Swipe',
    path: '/swipe'
  },
  {
    id: 'chat',
    icon: MessageSquare,
    label: 'Ask ELIN',
    path: '/chat'
  }
];

export const MobileBottomDock = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const triggerHaptic = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) {
      // Haptics not available (web)
    }
  };

  const handleNavigation = async (path: string) => {
    await triggerHaptic();
    navigate(path);
  };

  if (!user) return null;

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ 
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
      className="fixed bottom-0 left-0 right-0 z-[100] md:hidden"
      style={{ 
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {/* Background blur gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-transparent pointer-events-none" style={{ height: '120px', bottom: 0 }} />
      
      {/* Dock container */}
      <div className="relative flex justify-center pb-5 px-4">
        <div className="flex items-center gap-3 px-5 py-3 bg-card/98 backdrop-blur-xl border border-border/60 rounded-full shadow-2xl shadow-black/20">
          {dockItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <motion.button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`relative flex flex-col items-center justify-center rounded-full transition-all duration-300 ${
                  isActive 
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' 
                    : 'text-text-muted hover:text-text-body hover:bg-muted/50'
                }`}
                style={{
                  width: 60,
                  height: 60,
                  minWidth: 60,
                  minHeight: 60,
                }}
                whileTap={{ scale: 0.92 }}
                aria-label={`Navigate to ${item.label}`}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'text-primary-foreground' : 'text-current'}`} />
                <span className={`text-[10px] font-semibold mt-0.5 ${isActive ? 'text-primary-foreground' : 'text-current'}`}>
                  {item.label}
                </span>
                
                {/* Active indicator glow */}
                {isActive && (
                  <motion.div
                    layoutId="dockActiveGlow"
                    className="absolute inset-0 rounded-full bg-primary/40 -z-10 blur-lg"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
};
