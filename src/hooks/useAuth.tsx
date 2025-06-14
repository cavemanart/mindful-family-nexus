import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'parent' | 'nanny' | 'child' | 'grandparent';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: any;
  loading: boolean;
  error: string | null;
  retry: () => void;
  signUp: (email: string, password: string, firstName: string, lastName: string, role?: UserRole) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  console.log('🔐 AuthProvider state:', { user: !!user, session: !!session, userProfile: !!userProfile, loading, error, initialized });

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('📝 Fetching user profile for:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error fetching user profile:', error);
        throw error;
      }

      if (data) {
        // Ensure profile has valid names
        const safeProfile = {
          ...data,
          first_name: data.first_name || 'User',
          last_name: data.last_name || '',
          role: data.role || 'parent'
        };
        console.log('✅ User profile fetched:', safeProfile);
        setUserProfile(safeProfile);
        setError(null);
      } else {
        console.log('⚠️ No profile found, creating default profile');
        setUserProfile({
          id: userId,
          first_name: 'User',
          last_name: '',
          role: 'parent',
          email: user?.email || ''
        });
      }
    } catch (error: any) {
      console.error('🚨 Error in fetchUserProfile:', error);
      // Don't set error state for profile issues - continue with fallback
      setUserProfile({
        id: userId,
        first_name: 'User',
        last_name: '',
        role: 'parent',
        email: user?.email || ''
      });
    }
  };

  const initializeAuth = async () => {
    if (initialized) return;
    
    try {
      console.log('🚀 Initializing auth');
      setLoading(true);
      setError(null);

      // Check network connectivity
      if (typeof window !== 'undefined' && !navigator.onLine) {
        setError('You appear to be offline. Please check your connection.');
        setLoading(false);
        return;
      }

      // Get current session with timeout
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Session fetch timeout')), 10000)
      );

      const { data: { session }, error: sessionError } = await Promise.race([
        sessionPromise,
        timeoutPromise
      ]) as any;
      
      if (sessionError) {
        console.error('❌ Session error:', sessionError);
        setError('Failed to load session. Please try again.');
        setLoading(false);
        return;
      }

      console.log('🎯 Initial session check:', !!session);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Don't wait for profile fetch to complete initialization
        fetchUserProfile(session.user.id).catch(console.error);
      }
      
      setInitialized(true);
      setLoading(false);
    } catch (error: any) {
      console.error('🚨 Auth initialization error:', error);
      setError('Failed to initialize. Please refresh the page.');
      setLoading(false);
    }
  };

  const retry = () => {
    console.log('🔄 Retrying auth initialization');
    setInitialized(false);
    initializeAuth();
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string, role: UserRole = 'parent') => {
    console.log('📝 Signing up user:', email, role);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth`,
        data: {
          first_name: firstName,
          last_name: lastName,
          role: role,
          is_child_account: role === 'child',
        },
      },
    });
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    console.log('🔑 Signing in user:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    console.log('🚪 Signing out user');
    await supabase.auth.signOut();
    setUserProfile(null);
    setError(null);
  };

  useEffect(() => {
    let mounted = true;
    
    console.log('🚀 Setting up auth state listener');
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('🔄 Auth state changed:', event, !!session);
        
        // Update state immediately
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && event !== 'TOKEN_REFRESHED') {
          console.log('👤 User authenticated, fetching profile');
          fetchUserProfile(session.user.id).catch(console.error);
        } else if (!session) {
          console.log('👤 User not authenticated, clearing profile');
          setUserProfile(null);
        }
        
        if (event === 'SIGNED_OUT') {
          setError(null);
          setUserProfile(null);
        }

        // Only set loading to false after initial session check
        if (initialized) {
          setLoading(false);
        }
      }
    );

    // Initialize auth after setting up listener
    initializeAuth();

    // Online/offline detection
    const handleOnline = () => {
      console.log('🌐 Back online, checking auth');
      if (error && error.includes('offline')) {
        retry();
      }
    };

    const handleOffline = () => {
      console.log('📴 Gone offline');
      setError('You are currently offline');
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    return () => {
      mounted = false;
      console.log('🧹 Cleaning up auth subscription');
      subscription.unsubscribe();
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, []);

  const value = {
    user,
    session,
    userProfile,
    loading,
    error,
    retry,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
