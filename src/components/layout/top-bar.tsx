import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, Bell, Settings, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";

export function TopBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const { user } = useAuth();
  
  const lastScrollY = useRef(0);
  const scrollAccumulator = useRef(0);
  const headerRef = useRef<HTMLElement>(null);

  // Scroll behavior hook
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY.current;
      
      // Ignore tiny movements
      if (Math.abs(delta) < 10) return;
      
      // Always show at top
      if (currentScrollY <= 0) {
        setIsHeaderVisible(true);
        scrollAccumulator.current = 0;
        lastScrollY.current = currentScrollY;
        return;
      }
      
      // Accumulate scroll direction
      scrollAccumulator.current += delta;
      
      // Hide header: scroll down > 60px and current scroll > 100px
      if (delta > 0 && scrollAccumulator.current > 60 && currentScrollY > 100) {
        setIsHeaderVisible(false);
      }
      
      // Show header: scroll up > 25px accumulated
      if (delta < 0 && scrollAccumulator.current < -25) {
        setIsHeaderVisible(true);
        scrollAccumulator.current = 0;
      }
      
      lastScrollY.current = currentScrollY;
    };

    // Use passive listener for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Show header on keyboard focus
  const handleHeaderFocus = () => {
    setIsHeaderVisible(true);
  };

  return (
    <header 
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 z-[1100] w-full bg-background/95 backdrop-blur-xl border-b border-border/50 transition-all duration-220 ease-[cubic-bezier(.2,.9,.2,1)] ${
        isHeaderVisible 
          ? 'transform-none opacity-100 shadow-[0_2px_12px_rgba(11,20,36,0.06)]' 
          : 'transform -translate-y-full opacity-0 pointer-events-none'
      }`}
      style={{ willChange: isHeaderVisible ? 'auto' : 'transform' }}
    >
      <div className="flex items-center gap-4 h-16 lg:h-16 md:h-16 px-6 lg:px-6">
        {/* Mobile Layout (< 992px) */}
        <div className="flex lg:hidden items-center justify-between w-full h-14">
          {/* Mobile Left: Artikin Logo */}
          <Link 
            to="/home" 
            className="flex items-center"
            onFocus={handleHeaderFocus}
            aria-label="Go to home page"
          >
            <span className="text-xl font-bold text-primary">Artikin</span>
          </Link>

          {/* Mobile Right: Search + Notifications + Create + Hamburger */}
          <div className="flex items-center gap-1">
            {/* Search Icon/Expandable */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative rounded-full h-11 w-11 min-w-[44px]"
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
              onFocus={handleHeaderFocus}
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Notifications */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative rounded-full h-11 w-11 min-w-[44px]"
              onFocus={handleHeaderFocus}
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full"></span>
            </Button>

            {/* Create */}
            <Link to="/create">
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative rounded-full h-11 w-11 min-w-[44px]"
                onFocus={handleHeaderFocus}
                aria-label="Create post"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </Link>

            {/* Hamburger Menu (Settings only) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="relative rounded-full h-11 w-11 min-w-[44px]"
                  onFocus={handleHeaderFocus}
                  aria-label="Menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 bg-background/95 backdrop-blur-lg border border-border/50" align="end">
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Desktop Layout (≥ 992px) */}
        <div className="hidden lg:flex w-full items-center gap-6 h-16">
          {/* Desktop Left: Artikin Logo */}
          <Link 
            to="/home" 
            className="flex items-center flex-shrink-0"
            onFocus={handleHeaderFocus}
            aria-label="Go to home page"
          >
            <span className="text-xl font-bold text-primary">Artikin</span>
          </Link>

          {/* Desktop Center: Search Bar (flexible) */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for artists, organizations, jobs..."
                className="w-full pl-10 pr-4 bg-muted/40 border-border/50 rounded-full focus:ring-2 focus:ring-primary/20 focus:border-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={handleHeaderFocus}
                aria-label="Search for artists, organizations, jobs"
              />
            </div>
          </div>

          {/* Desktop Right: Notifications + Create */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Notifications */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative rounded-full h-10 w-10"
              onFocus={handleHeaderFocus}
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full"></span>
            </Button>

            {/* Create */}
            <Link to="/create">
              <Button 
                size="sm" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-full px-4 h-10"
                onFocus={handleHeaderFocus}
                aria-label="Create post"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span>Create</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Expanded Search */}
      {isSearchExpanded && (
        <div className="lg:hidden px-4 pb-4 border-t border-border/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for artists, organizations, jobs..."
              className="w-full pl-10 pr-4 bg-muted/40 border-border/50 rounded-full focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              aria-label="Search for artists, organizations, jobs"
            />
          </div>
        </div>
      )}
    </header>
  );
}