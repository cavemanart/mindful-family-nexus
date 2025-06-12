
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import ReactHealthCheck from '@/components/ReactHealthCheck';

// Ensure DOM is ready before initializing React
function initializeApp() {
  const rootElement = document.getElementById("root");

  if (!rootElement) {
    console.error('Root element not found');
    return;
  }

  try {
    const root = createRoot(rootElement);

    // Render with health check wrapper
    root.render(
      <React.StrictMode>
        <ReactHealthCheck fallback={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center p-4">
              <h2 className="text-xl font-bold text-gray-800 mb-2">Loading Application...</h2>
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            </div>
          </div>
        }>
          <App />
        </ReactHealthCheck>
      </React.StrictMode>
    );
  } catch (error) {
    console.error('Failed to initialize React app:', error);
    // Fallback display
    rootElement.innerHTML = '<div style="padding: 20px; text-align: center; font-family: system-ui;"><h2>Failed to load application</h2><p>Please refresh the page to try again.</p><button onclick="window.location.reload()" style="margin-top: 10px; padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">Refresh Page</button></div>';
  }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  // DOM is already ready
  initializeApp();
}
