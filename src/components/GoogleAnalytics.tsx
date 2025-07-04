// src/components/GoogleAnalytics.tsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

const GoogleAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Wait for gtag to be available
    const checkGtag = () => {
      if (typeof window !== "undefined" && typeof window.gtag === "function") {
        console.log("📊 GA tracking pageview:", location.pathname + location.search);
        window.gtag("config", "G-JF7HLSBP5F", {
          page_path: location.pathname + location.search,
        });
      } else {
        console.warn("📊 GA not ready, retrying...");
        setTimeout(checkGtag, 100);
      }
    };
    
    checkGtag();
  }, [location]);

  return null;
};

export default GoogleAnalytics;
