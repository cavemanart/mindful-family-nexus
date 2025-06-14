
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log('🚀 Main entry point starting');

// Ensure React is properly loaded
if (typeof React === 'undefined') {
  console.error('❌ React is not loaded');
  throw new Error('React is not loaded');
}

console.log('✅ React loaded successfully');

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
    
    // Fallback render without StrictMode
    try {
      const root = createRoot(rootElement);
      root.render(<App />);
      console.log('✅ React app rendered with fallback');
    } catch (fallbackError) {
      console.error('❌ Fallback render also failed:', fallbackError);
      throw fallbackError;
    }
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
