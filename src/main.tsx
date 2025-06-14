
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error('Root element not found');
}

console.log('🏁 Starting React application');

// Add global error handler for unhandled errors
window.addEventListener('error', (event) => {
  console.error('🔥 Global error:', event.error);
  if (event.error?.message?.includes('useState') || event.error?.message?.includes('dispatcher')) {
    console.error('React hook/dispatcher error detected globally');
    // Don't prevent default - let React's error boundary handle it
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('🔥 Unhandled promise rejection:', event.reason);
});

try {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('✅ React application initialized successfully');
} catch (error) {
  console.error('💥 Failed to initialize React application:', error);
  
  // Fallback error display
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
        max-width: 400px;
      ">
        <h2 style="color: #dc2626; margin-bottom: 1rem; font-size: 1.5rem; font-weight: bold;">
          Failed to Start
        </h2>
        <p style="color: #6b7280; margin-bottom: 1.5rem;">
          The application failed to initialize. This might be a temporary issue.
        </p>
        <button 
          onclick="window.location.reload()" 
          style="
            background: #3b82f6; 
            color: white; 
            padding: 0.5rem 1rem; 
            border: none; 
            border-radius: 0.25rem; 
            cursor: pointer;
            font-size: 1rem;
          "
        >
          Refresh Page
        </button>
      </div>
    </div>
  `;
  
  throw error;
}
