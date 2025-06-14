
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
import { usePagePreferences } from '@/hooks/usePagePreferences';

const Index = () => {
  const { user, userProfile, loading } = useAuth();
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
          onSignOut={() => {}}
        />
        <div className="max-w-4xl mx-auto pt-20 px-4">
          <HouseholdSelector 
            onHouseholdSelect={selectHousehold}
          />
        </div>
      </div>
    );
  }

  const renderPage = () => {
    const isVisible = (pageKey: string) => {
      const pref = preferences.find(p => p.page_key === pageKey);
      return pref?.is_visible !== false; // Default to visible if no preference
    };

    switch (currentPage) {
      case 'overview':
        return <Dashboard selectedHousehold={selectedHousehold} setActiveSection={() => {}} />;
      case 'calendar':
        return isVisible('calendar') ? <FamilyCalendar selectedHousehold={selectedHousehold} /> : null;
      case 'bills':
        return isVisible('bills') ? (
          <BillsErrorBoundary>
            <BillsTracker selectedHousehold={selectedHousehold} />
          </BillsErrorBoundary>
        ) : null;
      case 'notes':
        return isVisible('notes') ? <FamilyNotes selectedHousehold={selectedHousehold} /> : null;
      case 'rules':
        return isVisible('rules') ? <HouseRulesManager householdId={selectedHousehold.id} canEdit={true} /> : null;
      case 'weekly':
        return isVisible('weekly') ? <WeeklySync selectedHousehold={selectedHousehold} /> : null;
      case 'children':
        return isVisible('children') ? <ChildrenDashboard selectedHousehold={selectedHousehold} /> : null;
      case 'mvp':
        return isVisible('mvp') ? <MVPOfTheDay selectedHousehold={selectedHousehold} /> : null;
      case 'subscription':
        return <SubscriptionManager />;
      case 'nanny':
        return isVisible('nanny') ? <NannyMode selectedHousehold={selectedHousehold} /> : null;
      default:
        return <Dashboard selectedHousehold={selectedHousehold} setActiveSection={() => {}} />;
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
        onSignOut={() => {}}
      />
      
      <main className="max-w-7xl mx-auto pt-20 pb-20 px-4">
        {renderPage()}
      </main>

      <CleanMobileNavigation 
        activeTab={currentPage}
        setActiveTab={setCurrentPage}
      />
    </div>
  );
};

export default Index;
