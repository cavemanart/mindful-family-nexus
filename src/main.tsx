
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Ensure DOM is ready before initializing React
function initializeApp() {
  const rootElement = document.getElementById("root");

  if (!rootElement) {
    console.error('Root element not found');
    return;
  }

  try {
    const root = createRoot(rootElement);

    // Simple render without health check wrapper to avoid hook issues during initialization
    root.render(
      <React.StrictMode>
        <App />
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
