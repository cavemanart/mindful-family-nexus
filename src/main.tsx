
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Ensure DOM is loaded before creating root
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error('Root element not found');
}

// Create root and render without StrictMode to avoid potential dispatcher issues
const root = createRoot(rootElement);

root.render(<App />);
