
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById("root");

  if (!rootElement) {
    throw new Error('Root element not found');
  }

  // Clear any existing content to ensure clean slate
  rootElement.innerHTML = '';

  // Create root with proper error boundaries
  const root = createRoot(rootElement);

  // Render with StrictMode for proper React behavior
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});

// Fallback initialization if DOMContentLoaded already fired
if (document.readyState === 'loading') {
  // DOM hasn't loaded yet, event listener will handle it
} else {
  // DOM is already loaded, initialize immediately
  const rootElement = document.getElementById("root");

  if (!rootElement) {
    throw new Error('Root element not found');
  }

  rootElement.innerHTML = '';
  const root = createRoot(rootElement);

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
