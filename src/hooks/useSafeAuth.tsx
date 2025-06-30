
import { useAuth } from './useAuth';
import { useChildSession } from './useChildSession';

interface SafeAuthReturn {
  user: any;
  userProfile: any;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isChildMode: boolean;
  activeUserName: string;
  canManageHousehold: boolean;
  retry: () => void;
  signOut: () => Promise<void>;
}

export const useSafeAuth = (): SafeAuthReturn => {
  const auth = useAuth();
  const childSession = useChildSession();

  // Provide safe defaults
  const user = auth?.user || null;
  const userProfile = auth?.userProfile || null;
  const loading = auth?.loading || false;
  const error = auth?.error || null;
  const retry = auth?.retry || (() => {});
  const authSignOut = auth?.signOut || (async () => {});

  const isAuthenticated = !!user;
  const isChildMode = childSession.isChildMode;

  // Determine active user name
  const activeUserName = isChildMode 
    ? childSession.childFullName || 'Child'
    : userProfile?.first_name 
      ? `${userProfile.first_name} ${userProfile.last_name || ''}`.trim()
      : user?.email || 'User';

  // Check if user can manage household (only authenticated parents, not children)
  const canManageHousehold = isAuthenticated && !isChildMode;

  const signOut = async () => {
    console.log('🚪 SafeAuth: Starting enhanced sign out process');
    
    try {
      // Clear child session first if in child mode
      if (isChildMode) {
        console.log('👶 SafeAuth: Clearing child session');
        childSession.clearChildSession();
      }

      // Then perform the main sign out
      console.log('🔐 SafeAuth: Performing main auth sign out');
      await authSignOut();
      
      console.log('✅ SafeAuth: Sign out completed successfully');
    } catch (error) {
      console.error('❌ SafeAuth: Error during sign out:', error);
      // Clear child session even if main signOut fails
      if (isChildMode) {
        childSession.clearChildSession();
      }
      throw error;
    }
  };

  return {
    user,
    userProfile,
    loading,
    error,
    isAuthenticated,
    isChildMode,
    activeUserName,
    canManageHousehold,
    retry,
    signOut,
  };
};
