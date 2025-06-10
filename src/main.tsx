
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
    // Create root only once
    const root = createRoot(rootElement);

    // Render the app
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error('Failed to initialize React app:', error);
    // Fallback display
    rootElement.innerHTML = '<div style="padding: 20px; text-align: center;">Failed to load application. Please refresh the page.</div>';
  }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  // DOM is already ready
  initializeApp();
}
