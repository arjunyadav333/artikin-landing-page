import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, Bell, LogOut, User, Settings, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";

export function TopBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const { user, signOut } = useAuth();
  const headerRef = useRef<HTMLElement>(null);
  const [isHidden, setIsHidden] = useState(false);
  const scrollData = useRef({
    lastScroll: 0,
    accumulated: 0,
    ticking: false
  });

  useEffect(() => {
    const isMobile = () => window.innerWidth < 768;
    
    const onScroll = () => {
      const current = window.scrollY || 0;
      const delta = current - scrollData.current.lastScroll;
      
      // Ignore tiny movements
      const minDelta = isMobile() ? 8 : 10;
      if (Math.abs(delta) < minDelta) {
        scrollData.current.lastScroll = current;
        return;
      }

      scrollData.current.accumulated += delta;

      // Hide: scroll down enough and not at top
      if (scrollData.current.accumulated > 60 && current > 100 && !isHidden) {
        setIsHidden(true);
        scrollData.current.accumulated = 0;
      }

      // Show: scroll up enough
      if (scrollData.current.accumulated < -30 && isHidden) {
        setIsHidden(false);
        scrollData.current.accumulated = 0;
      }

      // Always show at top
      if (current <= 0 && isHidden) {
        setIsHidden(false);
        scrollData.current.accumulated = 0;
      }

      scrollData.current.lastScroll = current;
    };

    const handleScroll = () => {
      if (!scrollData.current.ticking) {
        requestAnimationFrame(() => {
          onScroll();
          scrollData.current.ticking = false;
        });
        scrollData.current.ticking = true;
      }
    };

    // Add focus handlers for header elements
    const handleFocus = () => {
      setIsHidden(false);
    };

    const setupFocusHandlers = () => {
      if (headerRef.current) {
        const focusableElements = headerRef.current.querySelectorAll(
          'button, a, input, [tabindex]:not([tabindex="-1"])'
        );
        focusableElements.forEach(el => {
          el.addEventListener('focus', handleFocus);
        });

        return () => {
          focusableElements.forEach(el => {
            el.removeEventListener('focus', handleFocus);
          });
        };
      }
    };

    // Initialize scroll position
    scrollData.current.lastScroll = window.scrollY || 0;

    // Setup listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    const cleanupFocus = setupFocusHandlers();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (cleanupFocus) cleanupFocus();
    };
  }, [isHidden]);

  return (
    <header 
      ref={headerRef}
      className={`sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl transition-all duration-[220ms] will-change-transform ${
        isHidden 
          ? 'transform -translate-y-full opacity-0 pointer-events-none' 
          : 'transform translate-y-0 opacity-100'
      }`}
      style={{
        transitionTimingFunction: 'cubic-bezier(.2,.9,.2,1)',
        transitionProperty: 'transform, opacity',
        transitionDuration: '220ms, 160ms'
      }}
    >
      <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
        {/* Mobile Layout: Profile, Artikin, Notifications, Hamburger */}
        <div className="flex md:hidden items-center justify-between w-full">
          {/* Mobile Profile */}
          <Link to="/profile/me">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </Link>

          {/* Mobile Artikin Name */}
          <Link to="/home">
            <span className="text-xl font-bold text-primary">
              Artikin
            </span>
          </Link>

          {/* Mobile Right: Notifications + Hamburger */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative rounded-full h-9 w-9">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full text-xs"></span>
            </Button>

            {/* Hamburger Menu */}
            <SidebarTrigger>
              <Button variant="ghost" size="sm" className="rounded-full h-9 w-9">
                <Menu className="h-4 w-4" />
              </Button>
            </SidebarTrigger>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex w-full items-center gap-4">
          {/* Desktop Logo */}
          <div className="flex items-center gap-3">
            <Link to="/home" className="flex items-center">
              <span className="text-xl font-bold text-primary">
                Artikin
              </span>
            </Link>
          </div>

          {/* Desktop Search */}
          <div className="flex-1 max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for artists, organizations, jobs..."
                className="w-full pl-10 pr-4 bg-muted/40 border-border/50 rounded-full focus:ring-2 focus:ring-primary/20 focus:border-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative rounded-full h-9 w-9">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full text-xs"></span>
            </Button>

            {/* Create Post Button */}
            <Link to="/create">
              <Button 
                size="sm" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-full px-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Create</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}