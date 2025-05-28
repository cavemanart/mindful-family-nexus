
import React, { useEffect, useState } from 'react';
import { TooltipProvider } from "@/components/ui/tooltip";

interface SafeTooltipProviderProps {
  children: React.ReactNode;
}

const SafeTooltipProvider: React.FC<SafeTooltipProviderProps> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Ensure React is fully initialized before rendering TooltipProvider
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Check if React is properly initialized
  if (typeof React === 'undefined' || !React) {
    console.warn('React not properly initialized, skipping TooltipProvider');
    return <>{children}</>;
  }

  // Wait for next tick to ensure dispatcher is ready
  if (!isReady) {
    return <>{children}</>;
  }

  try {
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
