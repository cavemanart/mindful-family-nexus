
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import ReactInitGuard from './components/ReactInitGuard';

console.log('🚀 Main entry point starting');

// Enhanced React validation
const validateReact = () => {
  if (typeof React === 'undefined') {
    console.error('❌ React is not loaded');
    throw new Error('React is not loaded');
  }

  if (!React.useState || !React.useEffect) {
    console.error('❌ React hooks are not available');
    throw new Error('React hooks are not available');
  }

  console.log('✅ React validation passed');
  return true;
};

// Safe app initialization
const initializeApp = () => {
  try {
    validateReact();
    
    const rootElement = document.getElementById("root");
    if (!rootElement) {
      console.error('❌ Root element not found');
      throw new Error('Root element not found');
    }

    console.log('✅ Root element found, creating React root');

    const root = createRoot(rootElement);
    
    root.render(
      <React.StrictMode>
        <ReactInitGuard>
          <App />
        </ReactInitGuard>
      </React.StrictMode>
    );
    
    console.log('✅ React app rendered successfully with initialization guard');
  } catch (error) {
    console.error('❌ Critical error during app initialization:', error);
    
    // Emergency fallback
    const rootElement = document.getElementById("root");
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #fef2f2;">
          <div style="text-align: center; padding: 1rem;">
            <h2 style="color: #dc2626; margin-bottom: 1rem;">Application Failed to Load</h2>
            <p style="color: #7f1d1d; margin-bottom: 1rem;">There was a critical error during initialization.</p>
            <button onclick="window.location.reload()" style="background: #dc2626; color: white; padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer;">
              Reload Page
            </button>
          </div>
        </div>
      `;
    }
  }
};

// Initialize when DOM is ready with additional safety
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  // Small delay to ensure React is fully loaded
  setTimeout(initializeApp, 10);
}
