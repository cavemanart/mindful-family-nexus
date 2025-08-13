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
import Features from "./pages/Features";
import About from "./pages/About";
import Help from "./pages/Help";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import ErrorBoundary from "@/components/ErrorBoundary";
import GoogleAnalytics from "@/components/GoogleAnalytics"; // ✅ Pageview tracking for route changes

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

  // Defer hook-heavy components until after first client mount
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  return (
    <ErrorBoundary>
      <SimpleReactCheck>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <GoogleAnalytics />
            {mounted ? (
              <ThemeProvider defaultTheme="light" storageKey="hublie-theme">
                <AuthProvider>
                  <ChildSessionProvider>
                    <>
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
                        <Route path="/features" element={<Features />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/help" element={<Help />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                      <PWAInstallPrompt />
                    </>
                  </ChildSessionProvider>
                </AuthProvider>
              </ThemeProvider>
            ) : null}
          </BrowserRouter>
        </QueryClientProvider>
      </SimpleReactCheck>
    </ErrorBoundary>
  );
};

export default App;
