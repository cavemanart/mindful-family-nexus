
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ChildSessionProvider } from "@/hooks/useChildSession";
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const App = () => {
  console.log('🚀 App component rendering');

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeProvider defaultTheme="light" storageKey="hublie-theme">
            <ErrorBoundary>
              <AuthProvider>
                <ErrorBoundary>
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
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                    <PWAInstallPrompt />
                  </ChildSessionProvider>
                </ErrorBoundary>
              </AuthProvider>
            </ErrorBoundary>
          </ThemeProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
