
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from "@/components/theme-provider"
import { QueryClientProvider } from '@tanstack/react-query';
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
import CalendarPage from '@/pages/CalendarPage';
import AppreciationsPage from '@/pages/AppreciationsPage';
import BillsPage from '@/pages/BillsPage';
import NotesPage from '@/pages/NotesPage';
import MentalLoadPage from '@/pages/MentalLoadPage';
import NannyModePage from '@/pages/NannyModePage';
import WeeklySyncPage from '@/pages/WeeklySyncPage';

function App() {
  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <QueryClientProvider client={queryClient}>
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
                  <Route path="/calendar" element={<CalendarPage />} />
                  <Route path="/appreciations" element={<AppreciationsPage />} />
                  <Route path="/bills" element={<BillsPage />} />
                  <Route path="/notes" element={<NotesPage />} />
                  <Route path="/mental-load" element={<MentalLoadPage />} />
                  <Route path="/nanny-mode" element={<NannyModePage />} />
                  <Route path="/weekly-sync" element={<WeeklySyncPage />} />
                  <Route path="/nanny-login" element={<NannyLogin onSuccess={() => {}} />} />
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
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
