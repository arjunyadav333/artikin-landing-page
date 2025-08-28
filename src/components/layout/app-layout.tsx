import React, { memo, useMemo } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { TopBar } from "@/components/layout/top-bar";

import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

interface AppLayoutProps {
  children: React.ReactNode;
}

// Memoized sidebar content to prevent re-renders
const TrendingArtists = memo(() => (
  <div className="bg-card/50 rounded-2xl border border-border/50 p-6 backdrop-blur-sm">
    <h3 className="font-semibold text-lg mb-4">Trending Artists</h3>
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-muted"></div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">Sarah Chen</p>
          <p className="text-xs text-muted-foreground">@sarahc • Photographer</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-muted"></div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">Marcus Johnson</p>
          <p className="text-xs text-muted-foreground">@marcusj • Director</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-muted"></div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">Elena Rodriguez</p>
          <p className="text-xs text-muted-foreground">@elenar • Dancer</p>
        </div>
      </div>
    </div>
  </div>
));
TrendingArtists.displayName = "TrendingArtists";

const FeaturedOpportunities = memo(() => (
  <div className="bg-card/50 rounded-2xl border border-border/50 p-6 backdrop-blur-sm mt-6">
    <h3 className="font-semibold text-lg mb-4">Featured Opportunities</h3>
    <div className="space-y-3">
      <div className="p-3 bg-muted/30 rounded-xl">
        <p className="text-sm font-medium">Lead Actor Needed</p>
        <p className="text-xs text-muted-foreground">Feature Film • $5k-$10k</p>
      </div>
      <div className="p-3 bg-muted/30 rounded-xl">
        <p className="text-sm font-medium">Wedding Photography</p>
        <p className="text-xs text-muted-foreground">Event • $2k-$3k</p>
      </div>
    </div>
  </div>
));
FeaturedOpportunities.displayName = "FeaturedOpportunities";

export const AppLayout = memo(({ children }: AppLayoutProps) => {
  // Memoize sidebar content to prevent re-renders
  const sidebarContent = useMemo(() => (
    <div className="hidden xl:block w-80 sticky top-20 h-fit">
      <TrendingArtists />
      <FeaturedOpportunities />
    </div>
  ), []);

  // Memoize main content structure for Instagram-style feed
  const contentStructure = useMemo(() => (
    <div className="w-full">
      <div className="flex">
        {/* Center Column - Main Content (Full Width on Mobile, Centered on Desktop) */}
        <div className="flex-1 min-w-0">
          {children}
        </div>
        
        {/* Right Column - Suggestions/Trending (Desktop only) */}
        <div className="hidden xl:block w-80 sticky top-20 h-fit ml-8">
          <TrendingArtists />
          <FeaturedOpportunities />
        </div>
      </div>
    </div>
  ), [children]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar />
          
          <div className="md:hidden">
            <MobileBottomNav />
          </div>
          
          <main className="flex-1 overflow-auto">
            {contentStructure}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
});

AppLayout.displayName = "AppLayout";
