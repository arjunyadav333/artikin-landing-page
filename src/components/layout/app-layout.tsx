import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { TopBar } from "@/components/layout/top-bar";
import Navigation from "@/components/Navigation";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Desktop/Tablet Sidebar */}
        <AppSidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Desktop/Tablet Top Bar */}
          <div className="hidden md:block">
            <TopBar />
          </div>
          
          {/* Mobile Navigation + Bottom Nav */}
          <div className="md:hidden">
            <Navigation />
            <MobileBottomNav />
          </div>
          
          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="max-w-7xl mx-auto">
              <div className="flex gap-6 lg:gap-8">
                {/* Center Column - Main Content */}
                <div className="flex-1 min-w-0 max-w-2xl mx-auto lg:max-w-none lg:mx-0">
                  {children}
                </div>
                
                {/* Right Column - Suggestions/Trending (Desktop only) */}
                <div className="hidden xl:block w-80 sticky top-20 h-fit">
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
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
