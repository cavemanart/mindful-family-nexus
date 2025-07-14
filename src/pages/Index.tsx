
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useHouseholds } from '@/hooks/useHouseholds';
import HouseholdSelector from '@/components/HouseholdSelector';
import CleanTopBar from '@/components/CleanTopBar';
import CleanMobileNavigation from '@/components/CleanMobileNavigation';
import Dashboard from '@/components/Dashboard';
import FamilyCalendar from '@/components/FamilyCalendar';
import BillsTracker from '@/components/BillsTracker';
import BillsErrorBoundary from '@/components/BillsErrorBoundary';
import FamilyNotes from '@/components/FamilyNotes';
import WeeklySync from '@/components/WeeklySync';
import ChildrenDashboard from '@/components/ChildrenDashboard';
import ChildDashboard from '@/components/ChildDashboard';
import MVPOfTheDay from '@/components/MVPOfTheDay';
import SubscriptionManager from '@/components/SubscriptionManager';
import NannyMode from '@/components/NannyMode';
import MentalLoad from '@/components/MentalLoad';
import WeeklySyncOverview from '@/components/WeeklySyncOverview';
import ChoreSystemDashboard from '@/components/chore-system/ChoreSystemDashboard';
import { usePagePreferences } from '@/hooks/usePagePreferences';

const Index = () => {
  const { user, userProfile, loading, signOut } = useAuth();
  const { households, selectedHousehold, selectHousehold, loading: householdsLoading } = useHouseholds();
  const [currentPage, setCurrentPage] = useState('overview');
  const { preferences, loading: preferencesLoading } = usePagePreferences();
  const [redirectTimer, setRedirectTimer] = useState<NodeJS.Timeout | null>(null);

  const isChild = userProfile?.is_child_account;

  console.log('📊 Index page state:', { 
    user: !!user, 
    userProfile: !!userProfile, 
    selectedHousehold: !!selectedHousehold,
    currentPage,
    loading,
    householdsLoading,
    isChildAccount: isChild
  });

  useEffect(() => {
    console.log('📊 Index: Auth state changed', { 
      user: !!user, 
      userProfile: !!userProfile, 
      loading 
    });
  }, [user, userProfile, loading]);

  // Add effect to track current page changes
  useEffect(() => {
    console.log('📊 Index: Current page changed to:', currentPage);
  }, [currentPage]);

  // Clear any existing redirect timer when component unmounts or auth state changes
  useEffect(() => {
    return () => {
      if (redirectTimer) {
        clearTimeout(redirectTimer);
      }
    };
  }, [redirectTimer]);

  // Show loading state while auth is initializing
  if (loading || householdsLoading || preferencesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Handle authentication redirect - check for user first
  if (!user) {
    console.log('📊 No user detected, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  // Handle missing profile with proper loading check and error state
  if (!userProfile) {
    console.log('📊 No user profile detected');
    
    // If auth is done loading but still no profile, show error with retry option
    if (!loading) {
      console.log('📊 Auth completed but no profile found - showing retry option');
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-4 max-w-md mx-auto p-6">
            <h2 className="text-xl font-semibold text-foreground">Profile Loading Error</h2>
            <p className="text-muted-foreground">
              We couldn't load your profile. This might be a temporary issue.
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Retry
            </button>
            <button 
              onClick={signOut} 
              className="ml-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
            >
              Sign Out
            </button>
          </div>
        </div>
      );
    }
    
    // Still loading, continue to show loading state
    console.log('📊 Profile still loading, staying on loading screen');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!selectedHousehold) {
    return (
      <div className="min-h-screen bg-background">
        <CleanTopBar 
          user={user}
          households={households}
          selectedHousehold={selectedHousehold}
          onHouseholdChange={(householdId) => {
            const household = households.find(h => h.id === householdId);
            if (household) selectHousehold(household);
          }}
          onSignOut={signOut}
        />
        <div className="max-w-4xl mx-auto pt-20 px-4">
          <HouseholdSelector 
            onHouseholdSelect={selectHousehold}
          />
        </div>
      </div>
    );
  }

  // Centralized page change handler with debugging
  const handlePageChange = (page: string) => {
    console.log('📊 Index: Page change requested from', currentPage, 'to', page);
    
    // Ensure we're setting a valid page
    if (page && page !== currentPage) {
      console.log('📊 Index: Actually changing page to:', page);
      setCurrentPage(page);
    } else {
      console.log('📊 Index: Page change ignored - same page or invalid:', page);
    }
  };

  const renderPage = () => {
    const isVisible = (pageKey: string) => {
      const pref = preferences.find(p => p.page_key === pageKey);
      return pref?.is_visible !== false; // Default to visible if no preference
    };

    console.log('📊 Index: Rendering page:', currentPage, 'isChildAccount:', isChild);

    // If user is a child account, render child-specific pages
    if (isChild) {
      switch (currentPage) {
        case 'overview':
          return <ChildDashboard selectedHousehold={selectedHousehold} />;
        case 'children':
          return <ChildDashboard selectedHousehold={selectedHousehold} />;
        case 'chores':
          return <ChoreSystemDashboard householdId={selectedHousehold.id} />;
        case 'calendar':
          return isVisible('calendar') ? <FamilyCalendar selectedHousehold={selectedHousehold} /> : <ChildDashboard selectedHousehold={selectedHousehold} />;
        case 'notes':
          return isVisible('notes') ? <FamilyNotes householdId={selectedHousehold.id} canEdit={true} /> : <ChildDashboard selectedHousehold={selectedHousehold} />;
        case 'mvp':
          return isVisible('mvp') ? <MVPOfTheDay selectedHousehold={selectedHousehold} /> : <ChildDashboard selectedHousehold={selectedHousehold} />;
        default:
          return <ChildDashboard selectedHousehold={selectedHousehold} />;
      }
    }

    // Parent/admin view
    switch (currentPage) {
      case 'overview':
        return <Dashboard onNavigate={handlePageChange} />;
      case 'chores':
        return <ChoreSystemDashboard householdId={selectedHousehold.id} />;
      case 'calendar':
        return isVisible('calendar') ? <FamilyCalendar selectedHousehold={selectedHousehold} /> : null;
      case 'bills':
        return isVisible('bills') ? (
          <BillsErrorBoundary>
            <BillsTracker selectedHousehold={selectedHousehold} />
          </BillsErrorBoundary>
        ) : null;
      case 'notes':
        return isVisible('notes') ? <FamilyNotes householdId={selectedHousehold.id} canEdit={true} /> : null;
      case 'weekly-sync':
        return isVisible('weekly-sync') ? <WeeklySync selectedHousehold={selectedHousehold} /> : null;
      case 'children':
        return isVisible('children') ? <ChildrenDashboard selectedHousehold={selectedHousehold} /> : null;
      case 'mvp':
        return isVisible('mvp') ? <MVPOfTheDay selectedHousehold={selectedHousehold} /> : null;
      case 'subscription':
        return <SubscriptionManager />;
      case 'nanny-mode':
        return isVisible('nanny-mode') ? <NannyMode selectedHousehold={selectedHousehold} /> : null;
      case 'mental-load':
        return isVisible('mental-load') ? <MentalLoad householdId={selectedHousehold.id} /> : null;
      default:
        console.log('📊 Index: Unknown page, rendering dashboard:', currentPage);
        return <Dashboard onNavigate={handlePageChange} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <CleanTopBar 
        user={user}
        households={households}
        selectedHousehold={selectedHousehold}
        onHouseholdChange={(householdId) => {
          const household = households.find(h => h.id === householdId);
          if (household) selectHousehold(household);
        }}
        onSignOut={signOut}
      />
      
      <main className="max-w-7xl mx-auto pt-20 pb-20 px-4">
        {renderPage()}
      </main>

      <CleanMobileNavigation 
        activeTab={currentPage}
        setActiveTab={handlePageChange}
      />
    </div>
  );
};

export default Index;
