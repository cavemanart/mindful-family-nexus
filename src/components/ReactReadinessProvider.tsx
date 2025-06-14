
import React, { createContext, useContext, useEffect, useState } from 'react';

interface ReactReadinessContextType {
  isReady: boolean;
  error: string | null;
}

const ReactReadinessContext = createContext<ReactReadinessContextType>({
  isReady: false,
  error: null,
});

export const ReactReadinessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeReact = async () => {
      try {
        console.log('🔄 Checking React readiness...');
        
        // Check if React hooks are available
        if (!React.useState) {
          throw new Error('React.useState is not available');
        }

        // Test hooks functionality
        const testState = React.useState(true);
        if (!testState || !Array.isArray(testState) || testState.length !== 2) {
          throw new Error('React hooks are not functioning properly');
        }

        // Check if we can access DOM
        if (typeof window === 'undefined' || typeof document === 'undefined') {
          throw new Error('DOM is not available');
        }

        // Small delay to ensure React dispatcher is fully set up
        await new Promise(resolve => setTimeout(resolve, 10));

        console.log('✅ React is ready');
        setIsReady(true);
        setError(null);
      } catch (err) {
        console.error('❌ React readiness check failed:', err);
        setError(err instanceof Error ? err.message : 'Unknown React initialization error');
        
        // Retry after a delay
        setTimeout(() => {
          initializeReact();
        }, 100);
      }
    };

    initializeReact();
  }, []);

  const value = {
    isReady,
    error,
  };

  return (
    <ReactReadinessContext.Provider value={value}>
      {children}
    </ReactReadinessContext.Provider>
  );
};

export const useReactReadiness = () => {
  const context = useContext(ReactReadinessContext);
  if (!context) {
    throw new Error('useReactReadiness must be used within ReactReadinessProvider');
  }
  return context;
};
