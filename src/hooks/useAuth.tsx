import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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
    console.log('Auth provider initializing...');
    
    // Set up auth state listener first (before checking cache)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, !!session);
        setAuthState(session);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', !!session);
      setAuthState(session);
    });

    return () => subscription.unsubscribe();
  }, [setAuthState]);

  const signUp = useCallback(async (email: string, password: string, metadata?: any) => {
    try {
      console.log('Attempting sign up for:', email);
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: metadata
        }
      });

      if (error) {
        console.error('Sign up error:', error);
        toast({
          title: "Sign Up Failed",
          description: error.message || "An error occurred during sign up",
          variant: "destructive",
        });
      } else {
        console.log('Sign up successful');
        toast({
          title: "Success",
          description: "Please check your email to verify your account",
        });
      }

      return { error };
    } catch (error: any) {
      console.error('Sign up exception:', error);
      toast({
        title: "Sign Up Failed", 
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      console.log('Attempting sign in for:', email);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Sign in error:', error);
        toast({
          title: "Sign In Failed",
          description: error.message || "Invalid email or password",
          variant: "destructive",
        });
      } else {
        console.log('Sign in successful');
        toast({
          title: "Welcome back!",
          description: "You have been signed in successfully",
        });
      }

      return { error };
    } catch (error: any) {
      console.error('Sign in exception:', error);
      toast({
        title: "Sign In Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully",
      });
      // Use window.location for navigation since we're outside Router context
      window.location.href = '/';
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
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