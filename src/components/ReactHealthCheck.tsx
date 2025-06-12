
import React, { useEffect, useState } from 'react';

interface ReactHealthCheckProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const ReactHealthCheck: React.FC<ReactHealthCheckProps> = ({ children, fallback }) => {
  const [isHealthy, setIsHealthy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Simple React version check without using hooks
      if (React && React.version) {
        console.log('React version:', React.version);
        setIsHealthy(true);
      } else {
        throw new Error('React not properly loaded');
      }
    } catch (err) {
      console.error('React health check failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown React error');
    }
  }, []);

  if (error) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-4">
          <h2 className="text-xl font-bold text-red-600 mb-2">React Initialization Error</h2>
          <p className="text-red-500">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded"
          >
            Reload Application
          </button>
        </div>
      </div>
    );
  }

  if (!isHealthy) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ReactHealthCheck;
