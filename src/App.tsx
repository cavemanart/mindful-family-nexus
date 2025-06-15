
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

  // Check if React is properly initialized
  if (!React || !React.createElement || !React.useState) {
    console.error('React is not properly initialized');
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Loading Error</h2>
          <p className="text-gray-600 mb-4">React is not properly loaded.</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Reload Application
          </button>
        </div>
      </div>
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
