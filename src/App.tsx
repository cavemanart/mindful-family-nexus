
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import ErrorBoundary from '@/components/ErrorBoundary';

import { queryClient } from '@/lib/queryClient';

import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Profile from '@/pages/Profile';
import ChildrenPage from '@/pages/ChildrenPage';
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

// Lazy load components that use complex hooks to ensure React is fully ready
const LazyThemeProvider = React.lazy(() => import('@/components/theme-provider').then(module => ({ default: module.ThemeProvider })));
const LazyAuthProvider = React.lazy(() => import('@/hooks/useAuth').then(module => ({ default: module.AuthProvider })));

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <React.Suspense fallback={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center p-4">
              <h2 className="text-xl font-bold text-gray-800 mb-2">Loading Application...</h2>
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            </div>
          </div>
        }>
          <LazyThemeProvider defaultTheme="system" storageKey="hublie-theme">
            <ErrorBoundary fallback={
              <div className="min-h-screen flex items-center justify-center bg-red-50">
                <div className="text-center p-4">
                  <h2 className="text-xl font-bold text-red-600 mb-2">Authentication Error</h2>
                  <p className="text-red-500 mb-4">Failed to initialize authentication system</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Reload Application
                  </button>
                </div>
              </div>
            }>
              <LazyAuthProvider>
                <BrowserRouter>
                  <div className="min-h-screen bg-background">
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/dashboard" element={<Index />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/children" element={<ChildrenPage />} />
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
              </LazyAuthProvider>
            </ErrorBoundary>
          </LazyThemeProvider>
        </React.Suspense>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
