// src/components/GoogleAnalytics.tsx
import { useEffect } from "react";

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

const sendPageview = () => {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    const path = window.location.pathname + window.location.search;
    console.log("📊 GA tracking pageview:", path);
    window.gtag("config", "G-JF7HLSBP5F", { page_path: path });
  } else {
    // Silently skip if GA not ready
  }
};

const GoogleAnalytics = () => {
  useEffect(() => {
    // Initial pageview
    sendPageview();

    // Patch history methods to detect SPA navigation without router hooks
    const originalPush = history.pushState;
    const originalReplace = history.replaceState;

    const notifyChange = () => {
      // Slight delay to ensure URL settled
      setTimeout(sendPageview, 0);
    };

    history.pushState = function (...args) {
      originalPush.apply(this, args as any);
      notifyChange();
    } as typeof history.pushState;

    history.replaceState = function (...args) {
      originalReplace.apply(this, args as any);
      notifyChange();
    } as typeof history.replaceState;

    window.addEventListener("popstate", notifyChange);

    return () => {
      history.pushState = originalPush;
      history.replaceState = originalReplace;
      window.removeEventListener("popstate", notifyChange);
    };
  }, []);

  return null;
};

export default GoogleAnalytics;
