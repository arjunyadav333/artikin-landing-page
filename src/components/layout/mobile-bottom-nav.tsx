import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Home, 
  Briefcase, 
  Plus, 
  Users, 
  User, 
  MessageSquare 
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Home", href: "/home", icon: Home },
  { name: "Opportunities", href: "/opportunities", icon: Briefcase },
  { name: "Create", href: "/create", icon: Plus, isSpecial: true },
  { name: "Connections", href: "/connections", icon: Users },
  { name: "Messages", href: "/messages", icon: MessageSquare },
  { name: "Profile", href: "/profile", icon: User },
];

export function MobileBottomNav() {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-background/95 backdrop-blur-lg border-t border-border/50 px-4 py-2">
        <nav className="flex items-center justify-around max-w-md mx-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            if (item.isSpecial) {
              return (
                <Link key={item.name} to={item.href}>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="sm"
                      className="h-12 w-12 rounded-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg"
                    >
                      <Icon className="h-5 w-5" />
                    </Button>
                  </motion.div>
                </Link>
              );
            }

            return (
              <Link key={item.name} to={item.href} className="flex-1 max-w-16">
                <motion.div
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                  className={`
                    flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors
                    ${isActive 
                      ? "text-primary bg-primary/10" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 mb-1 ${isActive ? "fill-current" : ""}`} />
                  <span className="text-xs font-medium truncate w-full text-center">
                    {item.name}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}