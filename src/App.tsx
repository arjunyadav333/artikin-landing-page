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

const ManageApplicants = lazy(() => import("./pages/ManageApplicants"));
const Notifications = lazy(() => import("./pages/Notifications"));

// Lazy load components for better performance and code splitting
const Index = lazy(() => import("./pages/Index"));
const Home = lazy(() => import("./pages/Home"));
const Opportunities = lazy(() => import("./pages/Opportunities"));
const OpportunityDetailPage = lazy(() => import("./pages/OpportunityDetailPage"));
const OpportunityCardDemo = lazy(() => import("./pages/OpportunityCardDemo"));
const Create = lazy(() => import("./pages/Create"));
const Connections = lazy(() => import("./pages/Connections"));
const DiscoverPeople = lazy(() => import("./pages/DiscoverPeople"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const MessagesLayout = lazy(() => import("./pages/MessagesLayout"));
const Auth = lazy(() => import("./pages/Auth"));
const AuthNew = lazy(() => import("./pages/AuthNew"));
const SignUp = lazy(() => import("./pages/SignUp"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const PostDetail = lazy(() => import("./pages/PostDetail"));
const TagFeed = lazy(() => import("./pages/TagFeed"));
const Settings = lazy(() => import("./pages/Settings"));

// Optimized loading components for different pages
const HomeLoader = () => <HomePageSkeleton />;
const ProfileLoader = () => <ProfilePageSkeleton />;
const ConnectionsLoader = () => <ConnectionsPageSkeleton />;
const DefaultLoader = () => <PageSpinner />;

// Ultra-optimized React Query client for maximum performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Extended caching for maximum performance
      staleTime: 10 * 60 * 1000, // 10 minutes - much longer cache
      gcTime: 30 * 60 * 1000, // 30 minutes - extended cleanup
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: 'always', // Only reconnect refetch
      networkMode: 'always',
      // Enable structural sharing for better performance
      structuralSharing: true,
      // Request deduplication
      queryKeyHashFn: (queryKey) => JSON.stringify(queryKey),
      retry: (failureCount, error: any) => {
        // Fail fast for auth errors
        if (error?.message?.includes('JWT') || 
            error?.message?.includes('auth') ||
            error?.status === 401 ||
            error?.status === 403) {
          return false;
        }
        return failureCount < 1; // Single retry only
      },
      retryDelay: 100, // Super fast retries
    },
    mutations: {
      // Lightning fast mutations
      retry: 0, // No retries for mutations - fail fast
      networkMode: 'always',
      // Use optimistic updates where possible
      onMutate: () => {
        console.log('Mutation starting...');
      }
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
  const { user, loading } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page for unauthenticated users */}
        <Route path="/" element={
          loading ? (
            <DefaultLoader />
          ) : user ? (
            <ProtectedRoute>
              <AppLayout>
                <Suspense fallback={<HomeLoader />}>
                  <Home />
                </Suspense>
              </AppLayout>
            </ProtectedRoute>
          ) : (
            <Suspense fallback={<DefaultLoader />}>
              <Index />
            </Suspense>
          )
        } />
        
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
        <Route path="/forgot-password" element={
          <Suspense fallback={<DefaultLoader />}>
            <ForgotPassword />
          </Suspense>
        } />
        <Route path="/auth/reset-password" element={
          <Suspense fallback={<DefaultLoader />}>
            <ResetPassword />
          </Suspense>
        } />
        
        {/* App Routes (With Layout) */}
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
        <Route path="/opportunities/:id/applicants" element={
          <ProtectedRoute>
            <AppLayout>
              <Suspense fallback={<DefaultLoader />}>
                <ManageApplicants />
              </Suspense>
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/opportunities/:id" element={
          <ProtectedRoute>
            <AppLayout>
              <Suspense fallback={<DefaultLoader />}>
                <OpportunityDetailPage />
              </Suspense>
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/opportunity/:id" element={
          <ProtectedRoute>
            <AppLayout>
              <Suspense fallback={<DefaultLoader />}>
                <OpportunityDetailPage />
              </Suspense>
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/opportunity-demo" element={
          <ProtectedRoute>
            <AppLayout>
              <Suspense fallback={<DefaultLoader />}>
                <OpportunityCardDemo />
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
              <MessagesLayout />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="/messages/:chatId" element={
          <ProtectedRoute>
            <Suspense fallback={<DefaultLoader />}>
              <MessagesLayout />
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
        <Route path="/notifications" element={
          <ProtectedRoute>
            <AppLayout>
              <Suspense fallback={<DefaultLoader />}>
                <Notifications />
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
