
import React from 'react';

interface SimpleReactCheckProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// Simple non-hook based React readiness check
const SimpleReactCheck: React.FC<SimpleReactCheckProps> = ({ children, fallback }) => {
  // Simple checks without using hooks to avoid circular dependencies
  if (typeof React === 'undefined' || !React.createElement) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">React Not Available</h2>
          <p className="text-gray-600 mb-4">React is not properly loaded.</p>
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

  return <>{children}</>;
};

export default SimpleReactCheck;
