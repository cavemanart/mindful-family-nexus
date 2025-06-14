
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useHouseholds, Household } from '@/hooks/useHouseholds';
import { Loader2, RefreshCw, Wifi, WifiOff, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import ErrorBoundary from '@/components/ErrorBoundary';
import CleanTopBar from '@/components/CleanTopBar';
import CleanMobileNavigation from '@/components/CleanMobileNavigation';
import Dashboard from '@/components/Dashboard';
import NannyDashboard from '@/components/NannyDashboard';
import ChildDashboard from '@/components/ChildDashboard';
import HouseholdSelector from '@/components/HouseholdSelector';

const Index = () => {
  const { user, userProfile, signOut, loading: authLoading, error: authError, retry: retryAuth } = useAuth();
  const { households, loading: householdsLoading, error: householdsError, retry: retryHouseholds } = useHouseholds();
  const navigate = useNavigate();
  const [selectedHousehold, setSelectedHousehold] = useState<Household | null>(null);
  const [showHouseholdSelector, setShowHouseholdSelector] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? navigator.onLine : true);

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  useEffect(() => {
    if (!user && !authLoading) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && !householdsLoading && households.length > 0) {
      if (households.length === 1) {
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
    } else if (user && !householdsLoading && households.length === 0) {
      setShowHouseholdSelector(true);
      setSelectedHousehold(null);
    }
  }, [user, households, householdsLoading]);

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
    navigate('/auth');
  };

  const handleRetry = () => {
    console.log('🔄 Retrying all failed operations');
    retryAuth();
    retryHouseholds();
  };

  const handleTabChange = (tab: string) => {
    navigate(`/${tab === 'dashboard' ? '' : tab}`);
  };

  // Progressive loading messages
  const getLoadingMessage = () => {
    if (!isOnline) return "Checking connection...";
    if (authLoading) return "Authenticating...";
    if (householdsLoading) return "Loading households...";
    return "Loading your family hub...";
  };

  // Critical errors that prevent app function
  const hasCriticalError = authError && (
    authError.includes('Failed to initialize') || 
    authError.includes('offline') ||
    authError.includes('Session fetch timeout') ||
    authError.includes('Failed to load session')
  );
  
  // Error handling with retry options
  const renderError = () => {
    if (!hasCriticalError) return null;

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
        <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-lg">
          <div className="mb-4">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Connection Issue</h2>
          <p className="text-gray-600 mb-4">
            {!isOnline ? "Please check your internet connection and try again." : "Unable to connect to the server. Please try again."}
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

  // Show error state only for critical errors
  if (hasCriticalError) {
    return renderError();
  }

  // Show loading state with timeout protection
  if (authLoading || (user && householdsLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center max-w-md p-8">
          <div className="mb-4">
            {!isOnline ? <WifiOff className="h-8 w-8 mx-auto text-gray-400" /> : <Loader2 className="animate-spin h-8 w-8 mx-auto text-blue-600" />}
          </div>
          <p className="text-gray-600 mb-4">{getLoadingMessage()}</p>
          
          <div className="mt-6 space-y-2">
            <p className="text-sm text-gray-500">Taking longer than expected?</p>
            <Button variant="outline" onClick={handleRetry} size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
          
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

  // Role-based dashboard rendering with better error handling
  const renderDashboard = () => {
    try {
      console.log('🎯 Rendering dashboard for user:', userProfile?.role, 'household:', selectedHousehold?.id);
      
      // Log any non-critical errors for debugging but don't crash
      if (householdsError) {
        console.warn('⚠️ Non-critical households error:', householdsError);
      }
      
      if (!userProfile) {
        console.log('📋 Using default dashboard - no userProfile');
        return <Dashboard />;
      }

      if (!selectedHousehold) {
        console.log('📋 No selected household, showing default dashboard');
        return <Dashboard />;
      }

      switch (userProfile.role) {
        case 'child':
          console.log('👶 Rendering child dashboard');
          return <ChildDashboard selectedHousehold={selectedHousehold} />;
        case 'nanny':
          console.log('👩‍🍼 Rendering nanny dashboard');
          return <NannyDashboard selectedHousehold={selectedHousehold} />;
        case 'parent':
        case 'grandparent':
        default:
          console.log('👨‍👩‍👧‍👦 Rendering parent/default dashboard');
          return <Dashboard />;
      }
    } catch (error) {
      console.error('❌ Error rendering dashboard:', error);
      // Show graceful fallback instead of crashing
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold text-orange-600 mb-2">Loading Issue</h2>
            <p className="text-gray-600 mb-4">Having trouble loading some data</p>
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Page
            </Button>
          </div>
        </div>
      );
    }
  };

  const showMobileNav = userProfile?.role !== 'child';

  return (
    <ErrorBoundary fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Something went wrong</h2>
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
          <CleanMobileNavigation activeTab="dashboard" setActiveTab={handleTabChange} />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default Index;
