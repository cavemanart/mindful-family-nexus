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

  console.log('🔐 AuthProvider state:', { user: !!user, session: !!session, userProfile: !!userProfile, loading, error });

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('📝 Fetching user profile for:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        console.log('✅ User profile fetched:', data);
        setUserProfile(data);
        setError(null);

        // Check subscription status after profile is loaded
        setTimeout(() => {
          checkSubscriptionStatus();
        }, 0);
      } else {
        console.log('❌ Error fetching user profile:', error);
        setError('Failed to load user profile');
      }
    } catch (error) {
      console.error('🚨 Error in fetchUserProfile:', error);
      setError('Failed to load user profile');
    }
  };

  const checkSubscriptionStatus = async () => {
    try {
      console.log('💳 Checking subscription status');
      const { data, error } = await supabase.functions.invoke('check-subscription-status');
      if (error) {
        console.error('❌ Subscription check error:', error);
      } else {
        console.log('✅ Subscription status checked:', data);
      }
    } catch (error) {
      console.error('🚨 Error checking subscription:', error);
    }
  };

  const initializeAuth = async () => {
    try {
      console.log('🚀 Initializing auth with timeout');
      setLoading(true);
      setError(null);

      // Set a timeout for the entire auth initialization
      const authTimeout = setTimeout(() => {
        console.error('⏰ Auth initialization timeout');
        setError('Authentication took too long. Please try again.');
        setLoading(false);
      }, 15000); // 15 second timeout

      // Check if we're online
      if (!navigator.onLine) {
        clearTimeout(authTimeout);
        setError('You appear to be offline. Please check your connection.');
        setLoading(false);
        return;
      }

      // Get initial session with timeout
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ Session error:', sessionError);
        // Clear potentially corrupted tokens
        await supabase.auth.signOut();
        setError('Session error. Please sign in again.');
        clearTimeout(authTimeout);
        setLoading(false);
        return;
      }

      console.log('🎯 Initial session check:', !!session);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      }
      
      clearTimeout(authTimeout);
      setLoading(false);
    } catch (error) {
      console.error('🚨 Auth initialization error:', error);
      setError('Failed to initialize authentication');
      setLoading(false);
    }
  };

  const retry = () => {
    console.log('🔄 Retrying auth initialization');
    initializeAuth();
  };

  useEffect(() => {
    console.log('🚀 Setting up auth state listener');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, !!session);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('👤 User authenticated, fetching profile');
          // Use setTimeout to prevent potential deadlocks
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          console.log('👤 User not authenticated, clearing profile');
          setUserProfile(null);
        }
        
        if (event === 'SIGNED_OUT') {
          setError(null);
        }
      }
    );

    // Initialize auth
    initializeAuth();

    // Online/offline detection
    const handleOnline = () => {
      console.log('🌐 Back online, retrying auth');
      if (error && error.includes('offline')) {
        retry();
      }
    };

    const handleOffline = () => {
      console.log('📴 Gone offline');
      setError('You are currently offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      console.log('🧹 Cleaning up auth subscription');
      subscription.unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const signUp = async (email: string, password: string, firstName: string, lastName: string, role: UserRole = 'parent') => {
    console.log('📝 Signing up user:', email, role);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
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
