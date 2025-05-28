
import React, { useState, useEffect } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';

interface DelayedTooltipProviderProps {
  children: React.ReactNode;
}

const DelayedTooltipProvider: React.FC<DelayedTooltipProviderProps> = ({ children }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Ensure React is fully mounted before rendering TooltipProvider
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  if (!isMounted) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider>
      {children}
    </TooltipProvider>
  );
};

export default DelayedTooltipProvider;
