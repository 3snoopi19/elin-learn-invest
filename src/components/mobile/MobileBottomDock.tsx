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
      // The "Anchor" - fixed positioning with safe area support
      className="fixed bottom-4 left-4 right-4 z-50 md:hidden"
      style={{ 
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {/* Dock container - floating pill design */}
      <div className="flex items-center justify-center gap-2 h-16 px-4 rounded-full backdrop-blur-xl bg-black/40 border border-white/10 shadow-2xl">
        {dockItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={`relative flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-all duration-300 ${
                isActive 
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/40' 
                  : 'text-white/70 hover:text-white active:bg-white/10'
              }`}
              whileTap={{ scale: 0.9 }}
              aria-label={`Navigate to ${item.label}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[9px] font-semibold mt-0.5">
                {item.label}
              </span>
              
              {/* Active indicator glow */}
              {isActive && (
                <motion.div
                  layoutId="dockActiveGlow"
                  className="absolute inset-0 rounded-2xl bg-primary/50 -z-10 blur-xl"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
};
