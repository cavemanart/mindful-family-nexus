
import React from 'react';
import { TooltipProvider } from "@/components/ui/tooltip";

interface SafeTooltipProviderProps {
  children: React.ReactNode;
}

const SafeTooltipProvider: React.FC<SafeTooltipProviderProps> = ({ children }) => {
  // Instead of using hooks, we'll use a try-catch approach
  // to safely wrap the TooltipProvider
  
  // Check if React is properly available
  if (typeof React === 'undefined' || !React) {
    console.warn('React not properly initialized, rendering without TooltipProvider');
    return <>{children}</>;
  }

  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return <>{children}</>;
  }

  try {
    // Use a simple component wrapper to ensure we're in a valid React context
    return (
      <TooltipProvider>
        {children}
      </TooltipProvider>
    );
  } catch (error) {
    console.error('TooltipProvider failed to initialize:', error);
    // Fallback to rendering children without tooltip functionality
    return <>{children}</>;
  }
};

export default SafeTooltipProvider;
