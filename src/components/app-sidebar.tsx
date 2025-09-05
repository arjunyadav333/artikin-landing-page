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
        {/* Profile Section - Clickable */}
        <Link to="/profile/me" className="flex items-center gap-3 hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
              {user?.user_metadata?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">
                {user?.user_metadata?.full_name || user?.user_metadata?.display_name || user?.email}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                @{user?.user_metadata?.username || 'user'}
              </p>
              <p className="text-xs text-muted-foreground/80 font-normal">
                {user?.user_metadata?.role || 'Artist'}
              </p>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-3">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    className={`w-full justify-start px-4 py-3 rounded-lg transition-all duration-200 border-0 ${
                      isActive(item.url) 
                        ? 'text-sidebar-active font-bold bg-transparent hover:bg-sidebar-hover' 
                        : 'text-sidebar-inactive font-normal hover:bg-sidebar-hover'
                    }`}
                  >
                    <Link to={item.url === '#' ? location.pathname : item.url}>
                      <item.icon className={`h-5 w-5 ${
                        isActive(item.url) 
                          ? 'text-sidebar-active' 
                          : 'text-sidebar-inactive'
                      } ${isCollapsed ? '' : 'mr-3'}`} />
                      {!isCollapsed && (
                        <span className={
                          isActive(item.url) 
                            ? 'font-bold text-sidebar-active' 
                            : 'font-normal text-sidebar-inactive'
                        }>
                          {item.title}
                        </span>
                      )}
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