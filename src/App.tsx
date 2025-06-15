
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ChildSessionProvider } from "@/hooks/useChildSession";
import SimpleReactCheck from "@/components/SimpleReactCheck";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import HomePage from "./components/HomePage";
import NannyAccess from "./pages/NannyAccess";
import Profile from "./pages/Profile";
import Subscription from "./pages/Subscription";
import Success from "./pages/Success";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import ErrorBoundary from "./components/ErrorBoundary";
import JoinHousehold from './pages/JoinHousehold';
import ChildModeDashboard from "@/components/ChildModeDashboard";
import { useChildDeviceLogin } from "@/hooks/useChildDeviceLogin";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const DEBUG = true; // Set to false to hide debug info

const App = () => {
  // For debugging
  if (DEBUG) {
    console.log('[App] App component rendering. React.useState available:', typeof React.useState === 'function');
    if (typeof window !== "undefined") {
      console.log("[App] - LocalStorage device_id:", localStorage.getItem("child_device_id"));
      console.log("[App] - LocalStorage supabase.auth.token:", localStorage.getItem("supabase.auth.token"));
    }
  }

  // Detect device-based child session
  const isChildDeviceRoute = window.location.pathname.startsWith("/child-dashboard") || window.location.pathname === "/dashboard";
  const deviceId = typeof window !== "undefined" ? localStorage.getItem("child_device_id") : null;
  const authToken = typeof window !== "undefined" ? localStorage.getItem("supabase.auth.token") : null;

  // Show debug info for troubleshooting
  if (DEBUG) {
    window.__DEBUG_STATE__ = { 
      isChildDeviceRoute,
      deviceId,
      authToken
    };
  }

  // Only enter strict child dashboard mode if all conditions are met:
  const shouldShowChildMode =
    isChildDeviceRoute &&
    deviceId &&
    !authToken;

  if (shouldShowChildMode) {
    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.log(
        "[App] Rendering device-based (child mode) dashboard because: isChildDeviceRoute=true, deviceId exists, authToken empty"
      );
    }
    return (
      <div>
        <ChildModeDashboard />
        {/* Debug info */}
        {DEBUG && (
          <div className="fixed bottom-0 left-0 bg-gray-100 dark:bg-gray-900 px-2 py-1 text-xs rounded-tr z-50 border-t border-r border-gray-200 dark:border-gray-800">
            <div>DEBUG: Child Device Mode</div>
            <div>deviceId: <span className="font-mono">{deviceId}</span></div>
            <div>authToken: {authToken ? "SET" : "NONE"}</div>
            <div>route: {window.location.pathname}</div>
          </div>
        )}
      </div>
    );
  }

  // If not device-based child, always default to the parent-authenticated flow
  return (
    <ErrorBoundary>
      <SimpleReactCheck>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <ThemeProvider defaultTheme="light" storageKey="hublie-theme">
              <AuthProvider>
                <ChildSessionProvider>
                  <Toaster />
                  <Sonner />
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/dashboard" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/subscription" element={<Subscription />} />
                    <Route path="/success" element={<Success />} />
                    <Route path="/nanny" element={<NannyAccess />} />
                    <Route path="/join-household" element={<JoinHousehold />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  {/* Debug info for parent mode */}
                  {DEBUG && (
                    <div className="fixed bottom-0 left-0 bg-purple-100 dark:bg-purple-900 px-2 py-1 text-xs rounded-tr z-50 border-t border-r border-purple-200 dark:border-purple-800">
                      <div>DEBUG: Parent Mode</div>
                      <div>deviceId: <span className="font-mono">{deviceId}</span></div>
                      <div>authToken: {authToken ? "SET" : "NONE"}</div>
                      <div>route: {window.location.pathname}</div>
                    </div>
                  )}
                  <PWAInstallPrompt />
                </ChildSessionProvider>
              </AuthProvider>
            </ThemeProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </SimpleReactCheck>
    </ErrorBoundary>
  );
};

export default App;

