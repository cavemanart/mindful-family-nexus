import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from "@/components/theme-provider"
import { QueryClientProvider as QueryClient } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { ErrorBoundary } from 'react-error-boundary';

import { AuthProvider } from '@/hooks/useAuth';
import { queryClient } from '@/lib/queryClient';

import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Profile from '@/pages/Profile';
import Subscription from '@/pages/Subscription';
import Success from '@/pages/Success';
import NotFound from '@/pages/NotFound';
import NannyLogin from '@/pages/NannyLogin';
import NannyAccess from '@/pages/NannyAccess';
import ChildAccess from '@/pages/ChildAccess';
import ChildAccessHelp from '@/pages/ChildAccessHelp';

function App() {
  return (
    <ErrorBoundary>
      <QueryClient client={queryClient}>
        <AuthProvider>
          <ThemeProvider defaultTheme="system" storageKey="hublie-theme">
            <BrowserRouter>
              <div className="min-h-screen bg-background">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/subscription" element={<Subscription />} />
                  <Route path="/success" element={<Success />} />
                  <Route path="/nanny-login" element={<NannyLogin />} />
                  <Route path="/nanny-access/:householdId" element={<NannyAccess />} />
                  <Route path="/child-access/:householdId" element={<ChildAccess />} />
                  <Route path="/child-access-help" element={<ChildAccessHelp />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <Toaster />
              </div>
            </BrowserRouter>
          </ThemeProvider>
        </AuthProvider>
      </QueryClient>
    </ErrorBoundary>
  );
}

export default App;
