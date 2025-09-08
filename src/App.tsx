import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { AppLayout } from "./components/layout/app-layout";
import { PageSpinner } from "@/components/ui/loading-spinner";
import { HomePageSkeleton, ProfilePageSkeleton, ConnectionsPageSkeleton } from "@/components/ui/page-skeleton";
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
const ConversationPage = lazy(() => import("./pages/ConversationPage"));
const Settings = lazy(() => import("./pages/Settings"));

// Optimized loading components for different pages
const HomeLoader = () => <HomePageSkeleton />;
const ProfileLoader = () => <ProfilePageSkeleton />;
const ConnectionsLoader = () => <ConnectionsPageSkeleton />;
const DefaultLoader = () => <PageSpinner />;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Optimized cache settings for sub-300ms performance
      staleTime: 2 * 60 * 1000, // 2 minutes - fresher data
      gcTime: 5 * 60 * 1000, // 5 minutes - faster cleanup
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      networkMode: 'always',
      retry: (failureCount, error: any) => {
        // Don't retry auth errors
        if (error?.message?.includes('JWT') || error?.message?.includes('auth')) {
          return false;
        }
        return failureCount < 2; // Reduced retries for speed
      },
      retryDelay: attemptIndex => Math.min(500 * 2 ** attemptIndex, 5000), // Faster retries
    },
    mutations: {
      // Optimized mutation settings
      retry: 1,
      retryDelay: 500, // Faster mutation retries
      networkMode: 'always'
    }
  }
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageSpinner />;
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
          <Suspense fallback={<DefaultLoader />}>
            <Auth />
          </Suspense>
        } />
        <Route path="/signup" element={
          <Suspense fallback={<DefaultLoader />}>
            <SignUp />
          </Suspense>
        } />
        <Route path="/auth/signup" element={
          <Suspense fallback={<DefaultLoader />}>
            <SignUp />
          </Suspense>
        } />
        
        {/* App Routes (With Layout) */}
        <Route path="/" element={
          <ProtectedRoute>
            <AppLayout>
              <Suspense fallback={<HomeLoader />}>
                <Home />
              </Suspense>
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/home" element={
          <ProtectedRoute>
            <AppLayout>
              <Suspense fallback={<HomeLoader />}>
                <Home />
              </Suspense>
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/opportunities" element={
          <ProtectedRoute>
            <AppLayout>
              <Suspense fallback={<DefaultLoader />}>
                <Opportunities />
              </Suspense>
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/create" element={
          <ProtectedRoute>
            <AppLayout>
              <Suspense fallback={<DefaultLoader />}>
                <Create />
              </Suspense>
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/connections" element={
          <ProtectedRoute>
            <AppLayout>
              <Suspense fallback={<ConnectionsLoader />}>
                <Connections />
              </Suspense>
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/connections/discover" element={
          <ProtectedRoute>
            <AppLayout>
              <Suspense fallback={<ConnectionsLoader />}>
                <DiscoverPeople />
              </Suspense>
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/profile/me" element={
          <ProtectedRoute>
            <AppLayout>
              <Suspense fallback={<ProfileLoader />}>
                <UserProfile />
              </Suspense>
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/profile/:userId" element={
          <ProtectedRoute>
            <AppLayout>
              <Suspense fallback={<ProfileLoader />}>
                <UserProfile />
              </Suspense>
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={<Navigate to="/profile/me" replace />} />
        <Route path="/post/:postId" element={
          <ProtectedRoute>
            <AppLayout>
              <Suspense fallback={<DefaultLoader />}>
                <PostDetail />
              </Suspense>
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/tags/:tag" element={
          <ProtectedRoute>
            <AppLayout>
              <Suspense fallback={<HomeLoader />}>
                <TagFeed />
              </Suspense>
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/messages" element={
          <ProtectedRoute>
            <Suspense fallback={<DefaultLoader />}>
              <Messages />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="/messages/:chatId" element={
          <ProtectedRoute>
            <Suspense fallback={<DefaultLoader />}>
              <ConversationPage />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <AppLayout>
              <Suspense fallback={<DefaultLoader />}>
                <Settings />
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
        <AppRoutes />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
