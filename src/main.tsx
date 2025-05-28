
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Ensure React is properly initialized before creating root
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error('Root element not found');
}

const root = createRoot(rootElement);

// Use React.StrictMode to help catch issues early in development
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
