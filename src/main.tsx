
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Ensure DOM is loaded before creating root
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error('Root element not found');
}

// Create root and render with proper React initialization
const root = createRoot(rootElement);

// Wrap in StrictMode to ensure proper React behavior and hook initialization
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
