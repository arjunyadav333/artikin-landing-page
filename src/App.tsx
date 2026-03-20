import { Suspense, lazy } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PageSpinner } from "@/components/ui/loading-spinner";
import { HomePageSkeleton, ProfilePageSkeleton, ConnectionsPageSkeleton } from "@/components/ui/page-skeleton";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import CommunityGuidelines from "./pages/CommunityGuidelines";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import AboutUs from "./pages/AboutUs";
import Support from "./pages/Support";
import AccountDeletion from "./pages/AccountDeletion";
import { Toaster } from "@/components/ui/sonner";


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





const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/legal/community-guidelines" element={<CommunityGuidelines />} />
        <Route path="/legal/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/legal/terms-conditions" element={<TermsAndConditions />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/support" element={<Support />} />
        <Route path="/account-deletion" element={<AccountDeletion />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};




const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster position="top-center" expand={false} richColors />
      <AppRoutes />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
