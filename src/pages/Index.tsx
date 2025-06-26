
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
import HouseRulesManager from '@/components/HouseRulesManager';
import WeeklySync from '@/components/WeeklySync';
import ChildrenDashboard from '@/components/ChildrenDashboard';
import MVPOfTheDay from '@/components/MVPOfTheDay';
import SubscriptionManager from '@/components/SubscriptionManager';
import NannyMode from '@/components/NannyMode';
import MentalLoad from '@/components/MentalLoad';
import WeeklySyncOverview from '@/components/WeeklySyncOverview';
import { usePagePreferences } from '@/hooks/usePagePreferences';

const Index = () => {
  const { user, userProfile, loading, signOut } = useAuth();
  const { households, selectedHousehold, selectHousehold, loading: householdsLoading } = useHouseholds();
  const [currentPage, setCurrentPage] = useState('overview');
  const { preferences, loading: preferencesLoading } = usePagePreferences();

  console.log('📊 Index page state:', { 
    user: !!user, 
    userProfile: !!userProfile, 
    selectedHousehold: !!selectedHousehold,
    currentPage,
    loading,
    householdsLoading
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

  if (loading || householdsLoading || preferencesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user) {
    console.log('📊 No user, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  if (!userProfile) {
    console.log('📊 No user profile, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  if (!selectedHousehold) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
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

    console.log('📊 Index: Rendering page:', currentPage);

    switch (currentPage) {
      case 'overview':
        return <Dashboard selectedHousehold={selectedHousehold} setActiveSection={handlePageChange} />;
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
      case 'rules':
        return isVisible('rules') ? <HouseRulesManager householdId={selectedHousehold.id} canEdit={true} /> : null;
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
        return isVisible('mental-load') ? <MentalLoad /> : null;
      default:
        console.log('📊 Index: Unknown page, rendering dashboard:', currentPage);
        return <Dashboard selectedHousehold={selectedHousehold} setActiveSection={handlePageChange} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
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
        {currentPage === 'overview' && selectedHousehold ? (
          <Dashboard
            selectedHousehold={selectedHousehold}
            setActiveSection={handlePageChange}
            WeeklySyncOverviewSlot={
              <WeeklySyncOverview
                householdId={selectedHousehold.id}
                onViewFullSync={() => handlePageChange('weekly-sync')}
              />
            }
          />
        ) : (
          renderPage()
        )}
      </main>

      <CleanMobileNavigation 
        activeTab={currentPage}
        setActiveTab={handlePageChange}
      />
    </div>
  );
};

export default Index;
