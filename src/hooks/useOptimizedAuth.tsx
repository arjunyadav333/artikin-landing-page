import { useMemo } from 'react';
import { useAuth } from './useAuth';

// Optimized hook that provides only what's needed to minimize re-renders
export const useOptimizedAuth = () => {
  const { user, loading } = useAuth();
  
  return useMemo(() => ({
    isAuthenticated: !!user,
    userId: user?.id,
    userEmail: user?.email,
    loading
  }), [user?.id, user?.email, loading]);
};

// Hook for components that only need to know if user is authenticated
export const useIsAuthenticated = () => {
  const { user, loading } = useAuth();
  
  return useMemo(() => ({
    isAuthenticated: !!user,
    loading
  }), [!!user, loading]);
};

// Hook for components that need user ID only
export const useUserId = () => {
  const { user } = useAuth();
  return user?.id;
};