import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "components/providers/theme-provider";
import { AuthProvider } from "@/hooks/useAuth";
import { AppLayout } from "@/components/layout/app-layout";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

// Import pages
import Home from "@/pages/Home";
import Auth from "@/pages/Auth";
import Profile from "@/pages/Profile";
import Opportunities from "@/pages/Opportunities";
import Messages from "@/pages/Messages";
import Connections from "@/pages/Connections";
import Create from "@/pages/Create";
import NotFound from "@/pages/NotFound";

// Create QueryClient with proper configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
    mutations: {
      retry: 1,
    },
  },
});

// Protected Route wrapper component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <AppLayout>{children}</AppLayout>;
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AuthProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-background font-sans antialiased">
              <Routes>
                {/* Auth route - standalone, no layout */}
                <Route path="/auth" element={<Auth />} />
                
                {/* Protected routes with AppLayout */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                } />
                
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                
                <Route path="/profile/:id" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                
                <Route path="/opportunities" element={
                  <ProtectedRoute>
                    <Opportunities />
                  </ProtectedRoute>
                } />
                
                <Route path="/messages" element={
                  <ProtectedRoute>
                    <Messages />
                  </ProtectedRoute>
                } />
                
                <Route path="/connections" element={
                  <ProtectedRoute>
                    <Connections />
                  </ProtectedRoute>
                } />
                
                <Route path="/create" element={
                  <ProtectedRoute>
                    <Create />
                  </ProtectedRoute>
                } />
                
                {/* Catch-all route for 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              
              {/* Toast notifications */}
              <Toaster />
              <Sonner />
            </div>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;