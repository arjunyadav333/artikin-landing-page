import React, { memo, useMemo, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
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

// Memoized navigation item component with Phase 8: Route prefetching
const NavigationItemComponent = memo(({ 
  item, 
  isActive,
  onPrefetch 
}: { 
  item: NavigationItem; 
  isActive: boolean;
  onPrefetch: (href: string) => void;
}) => {
  const Icon = item.icon;
  
  const handleMouseEnter = useCallback(() => {
    onPrefetch(item.href);
  }, [item.href, onPrefetch]);
  
  return (
    <Link key={item.name} to={item.href} className="flex-1" onMouseEnter={handleMouseEnter}>
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
  const queryClient = useQueryClient();

  // Phase 8: Prefetch data on hover for instant navigation
  const handlePrefetch = useCallback((href: string) => {
    if (href === '/home') {
      // Prefetch home feed data
      queryClient.prefetchInfiniteQuery({
        queryKey: ['homeFeed', 10],
        initialPageParam: 0,
      });
    } else if (href === '/opportunities') {
      // Prefetch opportunities data
      queryClient.prefetchQuery({
        queryKey: ['personalized-opportunities'],
      });
    }
  }, [queryClient]);

  // Memoize navigation items to prevent re-creation
  const navigationItems = useMemo(() => {
    return navigation.map((item) => {
      const isActive = location.pathname === item.href;
      return (
        <NavigationItemComponent
          key={item.name}
          item={item}
          isActive={isActive}
          onPrefetch={handlePrefetch}
        />
      );
    });
  }, [location.pathname, handlePrefetch]);

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