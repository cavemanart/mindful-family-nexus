
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import HomePage from "./components/HomePage";
import NannyAccess from "./pages/NannyAccess";
import Profile from "./pages/Profile";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import ErrorBoundary from "./components/ErrorBoundary";

const queryClient = new QueryClient();

const App = () => {
  console.log('🚀 App component rendering');
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light" storageKey="hublie-theme">
          <AuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/dashboard" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/profile" element={
                  <ErrorBoundary fallback={
                    <div className="min-h-screen flex items-center justify-center">
                      <div className="p-6 bg-white rounded-lg shadow-lg text-center">
                        <h2 className="text-xl font-bold text-red-600 mb-2">Profile Error</h2>
                        <p className="mb-4">There was an error loading your profile</p>
                        <button onClick={() => window.location.href = '/'} 
                          className="px-4 py-2 bg-blue-600 text-white rounded">
                          Return Home
                        </button>
                      </div>
                    </div>
                  }>
                    <Profile />
                  </ErrorBoundary>
                } />
                <Route path="/nanny" element={<NannyAccess />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <PWAInstallPrompt />
            </BrowserRouter>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
