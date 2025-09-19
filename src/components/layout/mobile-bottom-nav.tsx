import React, { memo, useMemo, useCallback } from "react";
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

type NavigationItem = {
  name: string;
  href: string;
  icon: React.ForwardRefExoticComponent<any>;
};

const navigation: NavigationItem[] = [
  { name: "Home", href: "/home", icon: Home },
  { name: "Opportunities", href: "/opportunities", icon: Briefcase },
  { name: "Create", href: "/create", icon: Plus },
  { name: "Connections", href: "/connections", icon: Users },
  { name: "Messages", href: "/messages", icon: MessageSquare },
];

// Memoized navigation item component
const NavigationItemComponent = memo(({ 
  item, 
  isActive 
}: { 
  item: NavigationItem; 
  isActive: boolean; 
}) => {
  const Icon = item.icon;
  
  return (
    <Link key={item.name} to={item.href} className="flex-1">
      <div
        className={`
          flex items-center justify-center py-3 px-2 rounded-lg transition-colors
          ${isActive 
            ? "text-foreground" 
            : "text-muted-foreground hover:text-foreground"
          }
        `}
      >
        <Icon className="h-6 w-6" />
      </div>
    </Link>
  );
});
NavigationItemComponent.displayName = "NavigationItem";

export const MobileBottomNav = memo(() => {
  const location = useLocation();

  // Memoize navigation items to prevent re-creation
  const navigationItems = useMemo(() => {
    return navigation.map((item) => {
      const isActive = location.pathname === item.href;
      return (
        <NavigationItemComponent
          key={item.name}
          item={item}
          isActive={isActive}
        />
      );
    });
  }, [location.pathname]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-background/95 backdrop-blur-lg border-t border-border/50 px-2 py-1">
        <nav className="flex items-center justify-around max-w-md mx-auto">
          {navigationItems}
        </nav>
      </div>
    </div>
  );
});

MobileBottomNav.displayName = "MobileBottomNav";