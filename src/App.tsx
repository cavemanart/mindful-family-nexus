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

const App = () => {
  console.log('[App] App component rendering. React.useState available:', typeof React.useState === 'function');

  // Detect device-based child session
  const isChildDeviceRoute = window.location.pathname.startsWith("/child-dashboard") || window.location.pathname === "/dashboard";
  const deviceId = typeof window !== "undefined" ? localStorage.getItem("child_device_id") : null;

  // If this is a child device (by deviceId and currently no authenticated user), and deviceChild exists, render ChildModeDashboard directly
  if (isChildDeviceRoute && deviceId && !localStorage.getItem("supabase.auth.token")) {
    // Note: direct rendering, avoid auth providers
    return (
      <ChildModeDashboard />
    );
  }

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
