import { useNavigate, useLocation } from "react-router-dom";
import { 
  Home, 
  MessageSquare, 
  TrendingUp, 
  BookOpen, 
  User,
  BarChart3,
  FileSearch
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

interface NavItem {
  id: string;
  icon: React.ComponentType<any>;
  label: string;
  path: string;
}

const navigationItems: NavItem[] = [
  {
    id: 'dashboard',
    icon: Home,
    label: 'Home',
    path: '/dashboard'
  },
  {
    id: 'chat',
    icon: MessageSquare,
    label: 'ELIN',
    path: '/chat'
  },
  {
    id: 'portfolio',
    icon: TrendingUp,
    label: 'Portfolio',
    path: '/portfolio'
  },
  {
    id: 'filings',
    icon: FileSearch,
    label: 'Research',
    path: '/filings'
  },
  {
    id: 'learn',
    icon: BookOpen,
    label: 'Learn',
    path: '/learn'
  }
];

export const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/98 backdrop-blur-xl border-t border-border/50 shadow-2xl"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}
    >
      <div className="flex items-center justify-around max-w-md mx-auto px-2 py-2"
           style={{ minHeight: '80px' }}>
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`relative flex flex-col items-center justify-center p-2.5 rounded-xl min-w-[60px] min-h-[56px] transition-all duration-300 touch-target ${
                isActive 
                  ? 'bg-primary/15 text-primary shadow-lg border border-primary/20' 
                  : 'text-text-muted hover:text-text-body hover:bg-muted/30 border border-transparent'
              }`}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              aria-label={`Navigate to ${item.label}`}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-primary' : 'text-current'}`} />
              <span className={`text-xs font-medium leading-tight ${isActive ? 'text-primary' : 'text-current'}`}>
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary rounded-full"
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