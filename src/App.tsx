
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
      retry: (failureCount, error) => {
        console.log('Query retry attempt:', failureCount, error);
        return failureCount < 3;
      },
    },
  },
});

const App = () => {
  console.log('🚀 App component rendering');
  
  // Add safety check for React
  if (typeof React === 'undefined') {
    console.error('React is not properly initialized');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light" storageKey="hublie-theme">
          <AuthProvider>
            <ChildSessionProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
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
              </BrowserRouter>
            </ChildSessionProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
