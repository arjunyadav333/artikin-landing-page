import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { AppLayout } from "./components/layout/app-layout";
import { PerformanceMonitor } from "./components/layout/performance-monitor";
import NotFound from "./pages/NotFound";

// Lazy load components for better performance and code splitting
const Home = lazy(() => import("./pages/Home"));
const Opportunities = lazy(() => import("./pages/Opportunities"));
const Create = lazy(() => import("./pages/Create"));
const Connections = lazy(() => import("./pages/Connections"));
const DiscoverPeople = lazy(() => import("./pages/DiscoverPeople"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const Messages = lazy(() => import("./pages/Messages"));
const Auth = lazy(() => import("./pages/Auth"));
const AuthNew = lazy(() => import("./pages/AuthNew"));
const SignUp = lazy(() => import("./pages/SignUp"));
const PostDetail = lazy(() => import("./pages/PostDetail"));
const TagFeed = lazy(() => import("./pages/TagFeed"));
const SavedPosts = lazy(() => import("./pages/SavedPosts"));
const ConversationPage = lazy(() => import("./pages/ConversationPage"));
const ProfileEdit = lazy(() => import("./pages/ProfileEdit"));

// Loading component for lazy routes
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Global cache settings for better performance
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: (failureCount, error: any) => {
        // Don't retry auth errors
        if (error?.message?.includes('JWT') || error?.message?.includes('auth')) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Global mutation settings
      retry: 1,
      retryDelay: 1000,
    }
  }
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const { user } = useAuth();

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
            <AppLayout>
              <Suspense fallback={<PageLoader />}>
                <Home />
              </Suspense>
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/home" element={
          <ProtectedRoute>
            <AppLayout>
              <Suspense fallback={<PageLoader />}>
                <Home />
              </Suspense>
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/opportunities" element={
          <ProtectedRoute>
            <AppLayout>
              <Suspense fallback={<PageLoader />}>
                <Opportunities />
              </Suspense>
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/create" element={
          <ProtectedRoute>
            <AppLayout>
              <Suspense fallback={<PageLoader />}>
                <Create />
              </Suspense>
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/connections" element={
          <ProtectedRoute>
            <AppLayout>
              <Suspense fallback={<PageLoader />}>
                <Connections />
              </Suspense>
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/connections/discover" element={
          <ProtectedRoute>
            <AppLayout>
              <Suspense fallback={<PageLoader />}>
                <DiscoverPeople />
              </Suspense>
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/profile/me" element={
          <ProtectedRoute>
            <AppLayout>
              <Suspense fallback={<PageLoader />}>
                <UserProfile />
              </Suspense>
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/profile/:userId" element={
          <ProtectedRoute>
            <AppLayout>
              <Suspense fallback={<PageLoader />}>
                <UserProfile />
              </Suspense>
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={<Navigate to="/profile/me" replace />} />
        <Route path="/profile/edit" element={
          <ProtectedRoute>
            <AppLayout>
              <Suspense fallback={<PageLoader />}>
                <ProfileEdit />
              </Suspense>
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/post/:postId" element={
          <ProtectedRoute>
            <AppLayout>
              <Suspense fallback={<PageLoader />}>
                <PostDetail />
              </Suspense>
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/tags/:tag" element={
          <ProtectedRoute>
            <AppLayout>
              <Suspense fallback={<PageLoader />}>
                <TagFeed />
              </Suspense>
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/messages" element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <Messages />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="/messages/:chatId" element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <ConversationPage />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="/saved" element={
          <ProtectedRoute>
            <AppLayout>
              <Suspense fallback={<PageLoader />}>
                <SavedPosts />
              </Suspense>
            </AppLayout>
          </ProtectedRoute>
        } />
        
        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <PerformanceMonitor />
        <AppRoutes />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
