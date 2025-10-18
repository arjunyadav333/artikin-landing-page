import React, { memo, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { SuggestedArtistsSection } from "@/components/home/suggested-artists-section";
import { PersonalizedOpportunitiesSection } from "@/components/home/personalized-opportunities-section";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = memo(({ children }: AppLayoutProps) => {
  const location = useLocation();
  
  // Hide mobile nav on conversation pages
  const hidesMobileNav = location.pathname.startsWith('/messages/');

  // Memoize main content structure
  const contentStructure = useMemo(() => (
    <div className="w-full">
      {children}
    </div>
  ), [children]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <TopBar />
          
          {!hidesMobileNav && (
            <div className="md:hidden">
              <MobileBottomNav />
            </div>
          )}
          
          <main className={`flex-1 overflow-auto ${!hidesMobileNav ? 'pb-20 md:pb-0' : ''}`}>
            {contentStructure}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
});

AppLayout.displayName = "AppLayout";
