// src/components/GoogleAnalytics.tsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const GoogleAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    if (typeof window.gtag !== "function") return;
    window.gtag("config", "G-JF7HLSBP5F", {
      page_path: location.pathname + location.search,
    });
  }, [location]);

  return null;
};

export default GoogleAnalytics;
