
import React from 'react';
import { TooltipProvider } from "@/components/ui/tooltip";

interface SafeTooltipProviderProps {
  children: React.ReactNode;
}

const SafeTooltipProvider: React.FC<SafeTooltipProviderProps> = ({ children }) => {
  // Pure functional component - no hooks, no state
  // Just render the TooltipProvider directly since React.StrictMode 
  // and proper root mounting should handle the timing
  
  try {
    return (
      <TooltipProvider>
        {children}
      </TooltipProvider>
    );
  } catch (error) {
    // If TooltipProvider fails to initialize, fallback to just children
    console.warn('TooltipProvider failed to initialize, falling back to children only:', error);
    return <>{children}</>;
  }
};

export default SafeTooltipProvider;
