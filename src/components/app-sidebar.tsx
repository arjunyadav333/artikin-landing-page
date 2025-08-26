import { useState } from "react";
import { 
  Home, 
  Briefcase, 
  Users, 
  MessageCircle, 
  Bell, 
  Bookmark, 
  Settings,
  User,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Home", url: "/home", icon: Home },
  { title: "Opportunities", url: "/opportunities", icon: Briefcase },
  { title: "Connections", url: "/connections", icon: Users },
  { title: "Messages", url: "/messages", icon: MessageCircle },
  { title: "Notifications", url: "#", icon: Bell },
  { title: "Saved", url: "#", icon: Bookmark },
  { title: "Settings", url: "#", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { user } = useAuth();
  const currentPath = location.pathname;
  
  const isCollapsed = state === "collapsed";
  const isActive = (path: string) => currentPath === path;

  return (
    <Sidebar className="border-r border-border/50 bg-card/50 backdrop-blur-xl hidden md:flex" collapsible="icon">
      <SidebarHeader className="p-6">
        {/* Profile Section */}
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">
                {user?.user_metadata?.display_name || user?.email}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                @{user?.user_metadata?.username || 'user'}
              </p>
              <p className="text-xs text-primary font-medium">
                {user?.user_metadata?.role || 'Artist'}
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    className={`w-full justify-start px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      isActive(item.url) 
                        ? 'bg-primary text-primary-foreground shadow-sm' 
                        : 'hover:bg-muted/80'
                    }`}
                  >
                    <Link to={item.url === '#' ? location.pathname : item.url}>
                      <item.icon className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'}`} />
                      {!isCollapsed && <span className="font-medium">{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}