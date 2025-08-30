import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

/**
 * Ultra-fast authentication singleton with intelligent caching
 * Eliminates repeated auth checks and provides sub-50ms auth state access
 */
class AuthSingleton {
  private static instance: AuthSingleton;
  private user: User | null = null;
  private session: Session | null = null;
  private loading = true;
  private initialized = false;
  private listeners = new Set<(user: User | null, session: Session | null, loading: boolean) => void>();
  private authPromise: Promise<void> | null = null;

  private constructor() {
    this.initializeAuth();
  }

  static getInstance(): AuthSingleton {
    if (!AuthSingleton.instance) {
      AuthSingleton.instance = new AuthSingleton();
    }
    return AuthSingleton.instance;
  }

  private async initializeAuth() {
    // Prevent multiple initializations
    if (this.authPromise) return this.authPromise;

    this.authPromise = this.doInitializeAuth();
    return this.authPromise;
  }

  private async doInitializeAuth() {
    try {
      // Get initial session synchronously from local storage if available
      const storedSession = localStorage.getItem('sb-uyhgnqrtirnwaxqemacw-auth-token');
      if (storedSession) {
        try {
          const parsedSession = JSON.parse(storedSession);
          if (parsedSession.access_token && parsedSession.expires_at > Date.now() / 1000) {
            this.session = parsedSession;
            this.user = parsedSession.user;
            this.loading = false;
            this.notifyListeners();
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }

      // Set up auth state listener (only once)
      supabase.auth.onAuthStateChange((event, session) => {
        this.session = session;
        this.user = session?.user ?? null;
        this.loading = false;
        this.initialized = true;
        this.notifyListeners();
      });

      // Get current session from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      this.session = session;
      this.user = session?.user ?? null;
      this.loading = false;
      this.initialized = true;
      this.notifyListeners();
    } catch (error) {
      console.error('Auth initialization error:', error);
      this.loading = false;
      this.initialized = true;
      this.notifyListeners();
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => {
      listener(this.user, this.session, this.loading);
    });
  }

  // Ultra-fast getters - return immediately from cache
  getUser(): User | null {
    return this.user;
  }

  getSession(): Session | null {
    return this.session;
  }

  isLoading(): boolean {
    return this.loading;
  }

  isAuthenticated(): boolean {
    return !!this.user && !!this.session;
  }

  // Subscribe to auth state changes
  subscribe(listener: (user: User | null, session: Session | null, loading: boolean) => void) {
    this.listeners.add(listener);
    
    // Immediately call with current state if initialized
    if (this.initialized) {
      listener(this.user, this.session, this.loading);
    }

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Wait for auth to be ready
  async waitForAuth(): Promise<{ user: User | null; session: Session | null }> {
    if (this.initialized) {
      return { user: this.user, session: this.session };
    }

    return new Promise((resolve) => {
      const unsubscribe = this.subscribe((user, session, loading) => {
        if (!loading) {
          unsubscribe();
          resolve({ user, session });
        }
      });
    });
  }

  // Authentication methods
  async signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }

  async signUp(email: string, password: string, metadata?: any) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: metadata
      }
    });
    return { error };
  }

  async signOut() {
    await supabase.auth.signOut();
  }
}

export const authSingleton = AuthSingleton.getInstance();