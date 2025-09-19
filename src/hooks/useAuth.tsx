import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cache for user data to prevent excessive API calls
let userCache: { user: User | null; timestamp: number } | null = null;
const CACHE_DURATION = 30000; // 30 seconds cache

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  // Return memoized context to prevent unnecessary re-renders
  return useMemo(() => context, [context.user, context.loading, context.session]);
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Memoize auth functions to prevent re-renders
  const setAuthState = useCallback((newSession: Session | null) => {
    setSession(newSession);
    const newUser = newSession?.user ?? null;
    setUser(newUser);
    
    // Update cache
    if (newUser) {
      userCache = { user: newUser, timestamp: Date.now() };
    } else {
      userCache = null;
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    // Check cache first to avoid unnecessary API calls
    if (userCache && Date.now() - userCache.timestamp < CACHE_DURATION) {
      setUser(userCache.user);
      setSession(userCache.user ? { user: userCache.user } as Session : null);
      setLoading(false);
      return;
    }

    // Set up auth state listener with optimized callback
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setAuthState(session);
      }
    );

    // Get initial session only if cache is empty or expired
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState(session);
    });

    return () => subscription.unsubscribe();
  }, [setAuthState]);

  const signUp = useCallback(async (email: string, password: string, metadata?: any) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: metadata
        }
      });

      // Remove toast notifications

      return { error };
    } catch (error: any) {
      return { error };
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      // Remove toast notifications

      return { error };
    } catch (error: any) {
      return { error };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      // Use window.location for navigation since we're outside Router context
      window.location.href = '/';
    } catch (error: any) {
      // Silent error handling
    }
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut
  }), [user, session, loading, signUp, signIn, signOut]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};