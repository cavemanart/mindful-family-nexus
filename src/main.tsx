
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log('🚀 Main entry point starting');

// Ensure DOM is fully loaded
const initializeApp = () => {
  const rootElement = document.getElementById("root");

  if (!rootElement) {
    console.error('❌ Root element not found');
    throw new Error('Root element not found');
  }

  console.log('✅ Root element found, creating React root');

  try {
    const root = createRoot(rootElement);
    
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    console.log('✅ React app rendered successfully');
  } catch (error) {
    console.error('❌ Error rendering React app:', error);
    throw error;
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
