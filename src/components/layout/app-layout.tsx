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
  const isHomePage = location.pathname === '/home' || location.pathname === '/';

  // Memoize right sidebar content - only show on home page
  const rightSidebar = useMemo(() => {
    if (!isHomePage) return null;
    
    return (
      <div className="hidden xl:block w-80 sticky top-20 h-fit ml-8">
        <SuggestedArtistsSection />
        <PersonalizedOpportunitiesSection />
      </div>
    );
  }, [isHomePage]);

  // Memoize main content structure
  const contentStructure = useMemo(() => (
    <div className="w-full">
      <div className="flex">
        {/* Center Column - Main Content */}
        <div className={`flex-1 min-w-0 ${isHomePage ? 'max-w-none' : 'max-w-4xl mx-auto'}`}>
          {children}
        </div>
        
        {/* Right Column - Personalized Suggestions (Home page only) */}
        {rightSidebar}
      </div>
    </div>
  ), [children, isHomePage, rightSidebar]);

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
          
          <main className="flex-1 overflow-auto">
            {contentStructure}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
});

AppLayout.displayName = "AppLayout";
