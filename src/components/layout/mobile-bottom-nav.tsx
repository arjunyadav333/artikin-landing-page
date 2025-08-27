import React, { memo, useMemo, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Home, 
  Briefcase, 
  Users, 
  MessageSquare,
  Bell 
} from "lucide-react";
import { Button } from "@/components/ui/button";

type NavigationItem = {
  name: string;
  href: string;
  icon: React.ForwardRefExoticComponent<any>;
  isSpecial?: boolean;
};

const navigation: NavigationItem[] = [
  { name: "Home", href: "/home", icon: Home },
  { name: "Opportunities", href: "/opportunities", icon: Briefcase },
  { name: "Connections", href: "/connections", icon: Users },
  { name: "Messages", href: "/messages", icon: MessageSquare },
  { name: "Notifications", href: "/notifications", icon: Bell },
];

// Memoized navigation item component
const NavigationItemComponent = memo(({ 
  item, 
  isActive, 
  isSpecial 
}: { 
  item: NavigationItem; 
  isActive: boolean; 
  isSpecial: boolean; 
}) => {
  const Icon = item.icon;
  
  const handleHover = useCallback(() => {}, []);
  const handleTap = useCallback(() => {}, []);
  
  // No special buttons in mobile nav anymore

  return (
    <Link key={item.name} to={item.href} className="flex-1 max-w-16">
      <div
        className={`
          flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors
          ${isActive 
            ? "text-foreground" 
            : "text-muted-foreground hover:text-foreground"
          }
        `}
      >
        <Icon className={`h-5 w-5 mb-1`} />
        <span className={`text-xs truncate w-full text-center ${isActive ? "font-bold" : "font-medium"}`}>
          {item.name}
        </span>
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
          isSpecial={!!item.isSpecial}
        />
      );
    });
  }, [location.pathname]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-background/95 backdrop-blur-lg border-t border-border/50 px-4 py-2">
        <nav className="flex items-center justify-around max-w-md mx-auto">
          {navigationItems}
        </nav>
      </div>
    </div>
  );
});

MobileBottomNav.displayName = "MobileBottomNav";