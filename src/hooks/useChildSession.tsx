
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Child } from './useChildren';

interface ChildSessionContextType {
  activeChild: Child | null;
  isChildMode: boolean;
  setActiveChild: (child: Child | null) => void;
  clearChildSession: () => void;
  childFullName: string | null;
  loginWithPin: (pin: string, householdId: string) => Promise<boolean>;
}

const ChildSessionContext = createContext<ChildSessionContextType | undefined>(undefined);

export const ChildSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeChild, setActiveChildState] = useState<Child | null>(null);
  const { user } = useAuth();

  // Clear child session if parent logs out
  useEffect(() => {
    if (!user) {
      setActiveChildState(null);
    }
  }, [user]);

  const setActiveChild = (child: Child | null) => {
    console.log('👶 Setting active child:', child?.first_name || 'none');
    setActiveChildState(child);
  };

  const clearChildSession = () => {
    console.log('👶 Clearing child session');
    setActiveChildState(null);
  };

  const loginWithPin = async (pin: string, householdId: string): Promise<boolean> => {
    try {
      console.log('🔐 Attempting PIN login for household:', householdId);
      
      const { data, error } = await supabase.rpc('verify_child_pin', {
        p_pin: pin,
        p_household_id: householdId
      });

      if (error) {
        console.error('❌ PIN verification error:', error);
        return false;
      }

      if (data && data.length > 0) {
        const childData = data[0];
        const childProfile: Child = {
          id: childData.child_id,
          first_name: childData.child_name.split(' ')[0],
          last_name: childData.child_name.split(' ').slice(1).join(' '),
          avatar_selection: childData.avatar_selection,
          is_child_account: true,
          pin: pin,
          parent_id: undefined, // This is optional in our Child interface
          created_at: new Date().toISOString()
        };
        
        setActiveChild(childProfile);
        console.log('✅ Child logged in successfully:', childProfile.first_name);
        return true;
      }

      console.log('❌ No child found with this PIN');
      return false;
    } catch (error) {
      console.error('❌ PIN login error:', error);
      return false;
    }
  };

  const isChildMode = !!activeChild;
  const childFullName = activeChild ? `${activeChild.first_name} ${activeChild.last_name}` : null;

  const value = {
    activeChild,
    isChildMode,
    setActiveChild,
    clearChildSession,
    childFullName,
    loginWithPin,
  };

  return (
    <ChildSessionContext.Provider value={value}>
      {children}
    </ChildSessionContext.Provider>
  );
};

export const useChildSession = () => {
  const context = useContext(ChildSessionContext);
  if (context === undefined) {
    throw new Error('useChildSession must be used within a ChildSessionProvider');
  }
  return context;
};
