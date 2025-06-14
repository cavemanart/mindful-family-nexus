import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useHouseholds, Household } from '@/hooks/useHouseholds';
import { usePagePreferences } from '@/hooks/usePagePreferences';
import { Loader2, RefreshCw, Wifi, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import ErrorBoundary from '@/components/ErrorBoundary';
import CleanMobileNavigation from '@/components/CleanMobileNavigation';
import CleanTopBar from '@/components/CleanTopBar';
import Appreciations from '@/components/Appreciations';
import BillsTracker from '@/components/BillsTracker';
import FamilyNotes from '@/components/FamilyNotes';
import MentalLoad from '@/components/MentalLoad';
import NannyMode from '@/components/NannyMode';
import ChildrenDashboard from '@/components/ChildrenDashboard';
import WeeklySync from '@/components/WeeklySync';
import Dashboard from '@/components/Dashboard';
import NannyDashboard from '@/components/NannyDashboard';
import ChildDashboard from '@/components/ChildDashboard';
import HouseholdSelector from '@/components/HouseholdSelector';
import FamilyCalendar from '@/components/FamilyCalendar';
import MVPOfTheDay from '@/components/MVPOfTheDay';

const Index = () => {
  const { user, userProfile, signOut, loading: authLoading, error: authError, retry: retryAuth } = useAuth();
  const { households, loading: householdsLoading, error: householdsError, retry: retryHouseholds } = useHouseholds();
  const { isPageVisible, loading: preferencesLoading, error: preferencesError } = usePagePreferences();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedHousehold, setSelectedHousehold] = useState<Household | null>(null);
  const [showHouseholdSelector, setShowHouseholdSelector] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!user && !authLoading) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && !householdsLoading) {
      if (households.length === 0) {
        setShowHouseholdSelector(true);
        setSelectedHousehold(null);
      } else if (households.length === 1) {
        setSelectedHousehold(households[0]);
        setShowHouseholdSelector(false);
      } else {
        const savedHouseholdId = localStorage.getItem('selectedHouseholdId');
        const savedHousehold = households.find(h => h.id === savedHouseholdId);
        
        if (savedHousehold) {
          setSelectedHousehold(savedHousehold);
          setShowHouseholdSelector(false);
        } else {
          setSelectedHousehold(households[0]);
          setShowHouseholdSelector(false);
          localStorage.setItem('selectedHouseholdId', households[0].id);
        }
      }
    }
  }, [user, households, householdsLoading]);

  // Redirect to dashboard if current tab is not visible (except profile which is always accessible)
  useEffect(() => {
    if (activeTab !== 'dashboard' && activeTab !== 'profile' && !isPageVisible(activeTab)) {
      setActiveTab('dashboard');
    }
  }, [activeTab, isPageVisible]);

  const handleHouseholdSelect = (household: Household) => {
    setSelectedHousehold(household);
    setShowHouseholdSelector(false);
    localStorage.setItem('selectedHouseholdId', household.id);
  };

  const handleHouseholdChange = (householdId: string) => {
    const household = households.find((h) => h.id === householdId);
    if (household) {
      setSelectedHousehold(household);
      localStorage.setItem('selectedHouseholdId', household.id);
    }
  };

  const handleSignOut = async () => {
    localStorage.removeItem('selectedHouseholdId');
    await signOut();
    navigate('/');
  };

  const handleRetry = () => {
    console.log('🔄 Retrying all failed operations');
    retryAuth();
    retryHouseholds();
  };

  // Handle tab changes including profile navigation
  const handleTabChange = (tab: string) => {
    if (tab === 'profile') {
      navigate('/profile');
    } else {
      setActiveTab(tab);
    }
  };

  // Progressive loading messages
  const getLoadingMessage = () => {
    if (!isOnline) return "Checking connection...";
    if (authLoading) return "Authenticating...";
    if (householdsLoading) return "Loading households...";
    if (preferencesLoading) return "Loading preferences...";
    return "Loading your family hub...";
  };

  // Error handling with retry options
  const renderError = () => {
    const hasError = authError || householdsError || preferencesError;
    const errorMessage = authError || householdsError || preferencesError || "Something went wrong";

    if (!hasError) return null;

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
        <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-lg">
          <div className="mb-4">
            {!isOnline ? <WifiOff className="h-12 w-12 mx-auto text-red-500" /> : <RefreshCw className="h-12 w-12 mx-auto text-red-500" />}
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            {!isOnline ? "Connection Issue" : "Loading Error"}
          </h2>
          <p className="text-gray-600 mb-4">
            {!isOnline ? "Please check your internet connection and try again." : errorMessage}
          </p>
          <div className="space-y-2">
            <Button onClick={handleRetry} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()} className="w-full">
              Refresh Page
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Show error state if there are errors
  if (authError || householdsError || preferencesError) {
    return renderError();
  }

  // Show loading state with progressive messages and timeout handling
  if (authLoading || (user && householdsLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center max-w-md p-8">
          <div className="mb-4">
            {!isOnline ? <WifiOff className="h-8 w-8 mx-auto text-gray-400" /> : <Loader2 className="animate-spin h-8 w-8 mx-auto text-blue-600" />}
          </div>
          <p className="text-gray-600 mb-4">{getLoadingMessage()}</p>
          
          {/* Show retry option after some time */}
          {(authLoading || householdsLoading) && (
            <div className="mt-6 space-y-2">
              <p className="text-sm text-gray-500">Taking longer than expected?</p>
              <Button variant="outline" onClick={handleRetry} size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          )}
          
          {/* Connection status indicator */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
            {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            <span>{isOnline ? "Connected" : "Offline"}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (showHouseholdSelector) {
    return <HouseholdSelector onHouseholdSelect={handleHouseholdSelect} />;
  }

  // Role-based dashboard rendering
  const renderDashboard = () => {
    if (!userProfile || !selectedHousehold) {
      return <Dashboard setActiveSection={setActiveTab} selectedHousehold={selectedHousehold} />;
    }

    switch (userProfile.role) {
      case 'child':
        return <ChildDashboard selectedHousehold={selectedHousehold} />;
      case 'nanny':
        return <NannyDashboard selectedHousehold={selectedHousehold} />;
      case 'parent':
      case 'grandparent':
      default:
        if (activeTab === 'dashboard') return <Dashboard setActiveSection={setActiveTab} selectedHousehold={selectedHousehold} />;
        if (activeTab === 'mvp' && isPageVisible('mvp')) return <MVPOfTheDay selectedHousehold={selectedHousehold} />;
        if (activeTab === 'bills' && isPageVisible('bills')) return <BillsTracker selectedHousehold={selectedHousehold} />;
        if (activeTab === 'notes' && isPageVisible('notes')) return <FamilyNotes selectedHousehold={selectedHousehold} />;
        if (activeTab === 'calendar' && isPageVisible('calendar')) return <FamilyCalendar selectedHousehold={selectedHousehold} />;
        if (activeTab === 'mental-load' && isPageVisible('mental-load')) return <MentalLoad />;
        if (activeTab === 'nanny-mode' && isPageVisible('nanny-mode')) return <NannyMode />;
        if (activeTab === 'children' && isPageVisible('children')) return <ChildrenDashboard selectedHousehold={selectedHousehold} />;
        if (activeTab === 'weekly-sync' && isPageVisible('weekly-sync')) return <WeeklySync selectedHousehold={selectedHousehold} />;
        return <Dashboard setActiveSection={setActiveTab} selectedHousehold={selectedHousehold} />;
    }
  };

  const showMobileNav = userProfile?.role !== 'child';

  return (
    <ErrorBoundary fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Dashboard Error</h2>
          <p className="text-gray-600 mb-4">Please refresh to try again</p>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Page
          </Button>
        </div>
      </div>
    }>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        <CleanTopBar 
          user={user}
          households={households}
          selectedHousehold={selectedHousehold}
          onHouseholdChange={handleHouseholdChange}
          onSignOut={handleSignOut}
        />

        <main className={`${showMobileNav ? "pb-20 md:pb-4" : "pb-4"} ${showMobileNav ? "md:pt-28" : "md:pt-16"} pt-16`}>
          <div className="max-w-7xl mx-auto px-4">
            {renderDashboard()}
          </div>
        </main>

        {showMobileNav && (
          <CleanMobileNavigation activeTab={activeTab} setActiveTab={handleTabChange} />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default Index;
