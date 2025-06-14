
import React from 'react';
import { useReactReadiness } from './ReactReadinessProvider';

interface ReactHealthCheckProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const ReactHealthCheck: React.FC<ReactHealthCheckProps> = ({ children, fallback }) => {
  const { isReady, error } = useReactReadiness();

  if (error) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">React Initialization Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500 mb-4">
            This is usually a temporary issue. The app will retry automatically.
          </p>
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

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing React...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ReactHealthCheck;
