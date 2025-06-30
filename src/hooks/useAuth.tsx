
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { ensureUserSubscription } from '@/lib/subscription-db';
import { useNavigate } from 'react-router-dom';

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
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [profileFetchInProgress, setProfileFetchInProgress] = useState(false);

  console.log('🔐 AuthProvider state:', { 
    user: !!user, 
    session: !!session, 
    userProfile: !!userProfile, 
    loading, 
    error,
    isSigningOut
  });

  const fetchUserProfile = async (userId: string) => {
    // Prevent concurrent profile fetches
    if (profileFetchInProgress || isSigningOut) {
      console.log('📝 Profile fetch skipped - already in progress or signing out');
      return;
    }

    try {
      console.log('📝 Fetching user profile for:', userId);
      setProfileFetchInProgress(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data && !isSigningOut) {
        console.log('✅ User profile fetched:', data);
        setUserProfile(data);
        setError(null);

        // Get user's household for subscription setup
        const { data: householdData } = await supabase
          .from('household_members')
          .select('household_id')
          .eq('user_id', userId)
          .limit(1)
          .single();

        // Ensure subscription exists after profile is loaded
        if (!isSigningOut) {
          ensureUserSubscription(userId, householdData?.household_id).catch(error => {
            console.error('❌ Error ensuring subscription:', error);
          });
        }
      } else if (error && !isSigningOut) {
        console.log('❌ Error fetching user profile:', error);
        setError('Failed to load user profile');
      }
    } catch (error) {
      if (!isSigningOut) {
        console.error('🚨 Error in fetchUserProfile:', error);
        setError('Failed to load user profile');
      }
    } finally {
      setProfileFetchInProgress(false);
    }
  };

  const initializeAuth = async () => {
    if (isSigningOut) {
      console.log('🔄 Skipping auth initialization - signing out');
      return;
    }

    try {
      console.log('🚀 Initializing auth');
      setLoading(true);
      setError(null);

      // Get initial session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError && !isSigningOut) {
        console.error('❌ Session error:', sessionError);
        await supabase.auth.signOut();
        setError('Session error. Please sign in again.');
        setLoading(false);
        return;
      }

      console.log('🎯 Initial session check:', !!session);
      
      if (!isSigningOut) {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        }
      }
      
      setLoading(false);
    } catch (error) {
      if (!isSigningOut) {
        console.error('🚨 Auth initialization error:', error);
        setError('Failed to initialize authentication');
        setLoading(false);
      }
    }
  };

  const retry = () => {
    if (!isSigningOut) {
      console.log('🔄 Retrying auth initialization');
      initializeAuth();
    }
  };

  useEffect(() => {
    console.log('🚀 Setting up auth state listener');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔄 Auth state changed:', event, !!session, 'isSigningOut:', isSigningOut);
        
        // Skip processing during sign out
        if (isSigningOut && event === 'SIGNED_OUT') {
          console.log('🚪 Sign out completed, clearing state');
          setSession(null);
          setUser(null);
          setUserProfile(null);
          setIsSigningOut(false);
          return;
        }
        
        if (isSigningOut) {
          console.log('🔄 Skipping auth state change - signing out in progress');
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && event !== 'SIGNED_OUT') {
          console.log('👤 User authenticated, fetching profile');
          // Use setTimeout to avoid blocking the auth state change
          setTimeout(() => {
            if (!isSigningOut) {
              fetchUserProfile(session.user.id);
            }
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          console.log('👤 User signed out, clearing profile');
          setUserProfile(null);
        }
        
        if (event === 'SIGNED_OUT') {
          setError(null);
          // Clear any cached data
          localStorage.removeItem('selectedHouseholdId');
          localStorage.removeItem('child_device_id');
        }
      }
    );

    // Initialize auth
    initializeAuth();

    return () => {
      console.log('🧹 Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

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
    console.log('🚪 Starting sign out process');
    
    // Prevent multiple simultaneous sign out attempts
    if (isSigningOut) {
      console.log('🚪 Sign out already in progress, skipping');
      return;
    }

    try {
      setIsSigningOut(true);
      
      // Clear local state immediately
      console.log('🧹 Clearing local state');
      setUserProfile(null);
      setError(null);
      
      // Clear any cached data
      localStorage.removeItem('selectedHouseholdId');
      localStorage.removeItem('child_device_id');
      
      // Sign out from Supabase
      console.log('🚪 Signing out from Supabase');
      await supabase.auth.signOut();
      
      console.log('✅ Sign out completed successfully');
      
    } catch (error) {
      console.error('❌ Error during sign out:', error);
      // Still clear local state even if Supabase signOut fails
      setSession(null);
      setUser(null);
      setUserProfile(null);
      setIsSigningOut(false);
    }
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
