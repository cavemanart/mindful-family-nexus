
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './useAuth';

interface ChildProfile {
  id: string;
  first_name: string;
  last_name: string;
  avatar_selection: string;
  pin?: string;
  created_at: string;
}

interface ChildSessionContextType {
  activeChild: ChildProfile | null;
  isChildMode: boolean;
  setActiveChild: (child: ChildProfile | null) => void;
  clearChildSession: () => void;
  childFullName: string | null;
}

const ChildSessionContext = createContext<ChildSessionContextType | undefined>(undefined);

export const ChildSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeChild, setActiveChildState] = useState<ChildProfile | null>(null);
  const { user } = useAuth();

  // Clear child session if parent logs out
  useEffect(() => {
    if (!user) {
      setActiveChildState(null);
    }
  }, [user]);

  const setActiveChild = (child: ChildProfile | null) => {
    console.log('👶 Setting active child:', child?.first_name || 'none');
    setActiveChildState(child);
  };

  const clearChildSession = () => {
    console.log('👶 Clearing child session');
    setActiveChildState(null);
  };

  const isChildMode = !!activeChild;
  const childFullName = activeChild ? `${activeChild.first_name} ${activeChild.last_name}` : null;

  const value = {
    activeChild,
    isChildMode,
    setActiveChild,
    clearChildSession,
    childFullName,
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
