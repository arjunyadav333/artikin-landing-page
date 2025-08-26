import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, Bell, LogOut, User, Settings } from "lucide-react";
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
        {/* Left: Logo + Sidebar Toggle */}
        <div className="flex items-center gap-4">
          <SidebarTrigger className="md:flex hidden" />
          <Link to="/home" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">A</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Artikin
            </span>
          </Link>
        </div>

        {/* Center: Search */}
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

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
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

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative rounded-full h-9 w-9">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full text-xs"></span>
          </Button>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.user_metadata?.avatar_url} alt="Profile" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end" forceMount>
              <div className="flex flex-col space-y-1 p-3">
                <p className="text-sm font-medium leading-none">
                  {user?.user_metadata?.display_name || user?.email}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  @{user?.user_metadata?.username || 'user'}
                </p>
                <p className="text-xs text-primary font-medium">
                  {user?.user_metadata?.role || 'Artist'}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}