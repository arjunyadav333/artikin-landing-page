import { memo, useMemo } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { useIsMobile } from "@/hooks/use-mobile";
import { SidebarProvider } from "@/components/ui/sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
}

/**
 * Ultra-fast app layout with memoization and optimized rendering
 */
export const AppLayoutOptimized = memo(({ children }: AppLayoutProps) => {
  const isMobile = useIsMobile();

  // Memoize layout classes for performance
  const layoutClasses = useMemo(() => ({
    main: isMobile 
      ? "flex-1 pb-16" // Bottom nav padding on mobile
      : "flex-1",
    container: "min-h-screen bg-background"
  }), [isMobile]);

  if (isMobile) {
    return (
      <div className={layoutClasses.container}>
        <TopBar />
        <main className={layoutClasses.main}>
          {children}
        </main>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className={layoutClasses.container}>
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <TopBar />
          <main className={layoutClasses.main}>
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
});

AppLayoutOptimized.displayName = 'AppLayoutOptimized';