import { useState } from "react";
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

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
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

            {/* Hamburger Menu with Settings */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="rounded-full h-9 w-9">
                  <Menu className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="w-full cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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