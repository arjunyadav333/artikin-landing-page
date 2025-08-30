import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthOptimized } from "./hooks/useAuthOptimized";
import { AppLayoutOptimized } from "./components/layout/app-layout-optimized";
import { PerformanceMonitor } from "./components/layout/performance-monitor";
import NotFound from "./pages/NotFound";
import { authSingleton } from "@/lib/auth-singleton";

// Lazy load components for better performance and code splitting
const Home = lazy(() => import("./pages/Home"));
const Opportunities = lazy(() => import("./pages/Opportunities"));
const Create = lazy(() => import("./pages/Create"));
const Connections = lazy(() => import("./pages/Connections"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const Messages = lazy(() => import("./pages/Messages"));
const Auth = lazy(() => import("./pages/Auth"));
const AuthNew = lazy(() => import("./pages/AuthNew"));
const SignUp = lazy(() => import("./pages/SignUp"));
const PostDetail = lazy(() => import("./pages/PostDetail"));
const TagFeed = lazy(() => import("./pages/TagFeed"));
const SavedPosts = lazy(() => import("./pages/SavedPosts"));

// Loading component for lazy routes
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

// Ultra-fast query client with aggressive caching for sub-50ms performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Ultra-aggressive caching for maximum performance
      staleTime: 2 * 60 * 1000, // 2 minutes - fresh but fast
      gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: (failureCount, error: any) => {
        // Don't retry auth errors
        if (error?.message?.includes('JWT') || error?.message?.includes('auth')) {
          return false;
        }
        return failureCount < 2; // Reduced retries for speed
      },
      retryDelay: 500, // Faster retries
      // Performance optimizations
      networkMode: 'online',
    },
    mutations: {
      // Ultra-fast mutations
      retry: 1,
      retryDelay: 500,
      networkMode: 'online',
    }
  }
});

// Ultra-fast protected route with optimistic authentication
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isAuthenticated } = useAuthOptimized();

  // Optimistic rendering - show content immediately if we have cached auth
  if (isAuthenticated) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes (No Layout) */}
        <Route path="/auth" element={
          <Suspense fallback={<PageLoader />}>
            <Auth />
          </Suspense>
        } />
        <Route path="/signup" element={
          <Suspense fallback={<PageLoader />}>
            <SignUp />
          </Suspense>
        } />
        <Route path="/auth/signup" element={
          <Suspense fallback={<PageLoader />}>
            <SignUp />
          </Suspense>
        } />
        
        {/* App Routes (With Layout) */}
        <Route path="/" element={
          <ProtectedRoute>
            <AppLayoutOptimized>
              <Suspense fallback={<PageLoader />}>
                <Home />
              </Suspense>
            </AppLayoutOptimized>
          </ProtectedRoute>
        } />
        <Route path="/home" element={
          <ProtectedRoute>
            <AppLayoutOptimized>
              <Suspense fallback={<PageLoader />}>
                <Home />
              </Suspense>
            </AppLayoutOptimized>
          </ProtectedRoute>
        } />
        <Route path="/opportunities" element={
          <ProtectedRoute>
            <AppLayoutOptimized>
              <Suspense fallback={<PageLoader />}>
                <Opportunities />
              </Suspense>
            </AppLayoutOptimized>
          </ProtectedRoute>
        } />
        <Route path="/create" element={
          <ProtectedRoute>
            <AppLayoutOptimized>
              <Suspense fallback={<PageLoader />}>
                <Create />
              </Suspense>
            </AppLayoutOptimized>
          </ProtectedRoute>
        } />
        <Route path="/connections" element={
          <ProtectedRoute>
            <AppLayoutOptimized>
              <Suspense fallback={<PageLoader />}>
                <Connections />
              </Suspense>
            </AppLayoutOptimized>
          </ProtectedRoute>
        } />
        <Route path="/profile/me" element={
          <ProtectedRoute>
            <AppLayoutOptimized>
              <Suspense fallback={<PageLoader />}>
                <UserProfile />
              </Suspense>
            </AppLayoutOptimized>
          </ProtectedRoute>
        } />
        <Route path="/profile/:userId" element={
          <ProtectedRoute>
            <AppLayoutOptimized>
              <Suspense fallback={<PageLoader />}>
                <UserProfile />
              </Suspense>
            </AppLayoutOptimized>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={<Navigate to="/profile/me" replace />} />
        <Route path="/post/:postId" element={
          <ProtectedRoute>
            <AppLayoutOptimized>
              <Suspense fallback={<PageLoader />}>
                <PostDetail />
              </Suspense>
            </AppLayoutOptimized>
          </ProtectedRoute>
        } />
        <Route path="/tags/:tag" element={
          <ProtectedRoute>
            <AppLayoutOptimized>
              <Suspense fallback={<PageLoader />}>
                <TagFeed />
              </Suspense>
            </AppLayoutOptimized>
          </ProtectedRoute>
        } />
        <Route path="/messages" element={
          <Suspense fallback={<PageLoader />}>
            <Messages />
          </Suspense>
        } />
        <Route path="/saved" element={
          <ProtectedRoute>
            <AppLayoutOptimized>
              <Suspense fallback={<PageLoader />}>
                <SavedPosts />
              </Suspense>
            </AppLayoutOptimized>
          </ProtectedRoute>
        } />
        
        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

// Ultra-fast app initialization with singleton auth
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <PerformanceMonitor />
      <AppRoutes />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
