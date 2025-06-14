
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error('Root element not found');
}

console.log('🏁 Starting React application');

// Enhanced global error handler
window.addEventListener('error', (event) => {
  console.error('🔥 Global error:', event.error);
  
  // Check for React-specific errors
  if (event.error?.message?.includes('useState') || 
      event.error?.message?.includes('dispatcher') ||
      event.error?.message?.includes('Cannot read properties of null')) {
    console.error('React initialization error detected globally');
    console.error('This indicates React hooks are being called before React is ready');
    
    // Don't prevent default - let React's error boundary handle it
    return;
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('🔥 Unhandled promise rejection:', event.reason);
});

// Enhanced initialization with better error handling
const initializeApp = () => {
  try {
    // Verify React is available
    if (!React || !React.createElement || !React.useState) {
      throw new Error('React is not properly loaded');
    }

    // Verify DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeApp);
      return;
    }

    console.log('✅ React and DOM are ready, initializing app');
    
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    console.log('✅ React application initialized successfully');
  } catch (error) {
    console.error('💥 Failed to initialize React application:', error);
    
    // Enhanced fallback error display
    rootElement.innerHTML = `
      <div style="
        min-height: 100vh; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        font-family: system-ui, sans-serif;
        background: linear-gradient(135deg, #fef2f2 0%, #fed7cc 100%);
      ">
        <div style="
          text-align: center; 
          padding: 2rem; 
          background: white; 
          border-radius: 0.5rem; 
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          max-width: 500px;
        ">
          <h2 style="color: #dc2626; margin-bottom: 1rem; font-size: 1.5rem; font-weight: bold;">
            Application Failed to Start
          </h2>
          <p style="color: #6b7280; margin-bottom: 1rem;">
            React failed to initialize properly. This is usually caused by:
          </p>
          <ul style="color: #6b7280; margin-bottom: 1.5rem; text-align: left; list-style: disc; padding-left: 1.5rem;">
            <li>Browser compatibility issues</li>
            <li>JavaScript being disabled</li>
            <li>Network connectivity problems</li>
            <li>Cached application data conflicts</li>
          </ul>
          <div style="space-y: 0.5rem;">
            <button 
              onclick="window.location.reload()" 
              style="
                background: #3b82f6; 
                color: white; 
                padding: 0.75rem 1.5rem; 
                border: none; 
                border-radius: 0.25rem; 
                cursor: pointer;
                font-size: 1rem;
                margin-right: 0.5rem;
              "
            >
              Refresh Page
            </button>
            <button 
              onclick="localStorage.clear(); sessionStorage.clear(); window.location.reload();" 
              style="
                background: #ef4444; 
                color: white; 
                padding: 0.75rem 1.5rem; 
                border: none; 
                border-radius: 0.25rem; 
                cursor: pointer;
                font-size: 1rem;
              "
            >
              Clear Cache & Refresh
            </button>
          </div>
          <details style="margin-top: 1rem; text-align: left;">
            <summary style="cursor: pointer; color: #6b7280;">Technical Details</summary>
            <pre style="font-size: 0.75rem; color: #374151; margin-top: 0.5rem; padding: 0.5rem; background: #f3f4f6; border-radius: 0.25rem; overflow: auto;">
              ${error instanceof Error ? error.stack || error.message : String(error)}
            </pre>
          </details>
        </div>
      </div>
    `;
    
    throw error;
  }
};

// Start initialization
initializeApp();
