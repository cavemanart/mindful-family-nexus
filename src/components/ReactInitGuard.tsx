
import React, { useEffect, useState } from 'react';

interface ReactInitGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const ReactInitGuard: React.FC<ReactInitGuardProps> = ({ children, fallback }) => {
  const [isReactReady, setIsReactReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkReactReadiness = () => {
      try {
        // Comprehensive React readiness check
        if (typeof React === 'undefined') {
          throw new Error('React is not defined');
        }

        if (!React.useState) {
          throw new Error('React hooks are not available');
        }

        if (!React.useEffect) {
          throw new Error('React useEffect is not available');
        }

        // Test hook execution
        const testHook = React.useState(true);
        if (!testHook || typeof testHook[0] !== 'boolean' || typeof testHook[1] !== 'function') {
          throw new Error('React hooks are not functioning properly');
        }

        console.log('✅ React initialization guard: All checks passed');
        setIsReactReady(true);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown React initialization error';
        console.error('❌ React initialization guard failed:', errorMessage);
        setError(errorMessage);
      }
    };

    // Immediate check
    checkReactReadiness();

    // Retry mechanism for race conditions
    const retryTimeout = setTimeout(() => {
      if (!isReactReady && !error) {
        console.log('🔄 React initialization guard: Retrying...');
        checkReactReadiness();
      }
    }, 100);

    return () => clearTimeout(retryTimeout);
  }, [isReactReady, error]);

  if (error) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-4">
          <h2 className="text-xl font-bold text-red-600 mb-2">React Initialization Error</h2>
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Reload Application
          </button>
        </div>
      </div>
    );
  }

  if (!isReactReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ReactInitGuard;
