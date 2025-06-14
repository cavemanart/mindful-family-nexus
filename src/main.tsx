
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Ensure DOM is loaded before creating root
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error('Root element not found');
}

// Create root and render with StrictMode to help identify timing issues
const root = createRoot(rootElement);

// Add development mode cache busting
if (import.meta.env.DEV) {
  console.log('🔧 Development mode - clearing any cached modules');
}

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
