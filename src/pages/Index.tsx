
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useHouseholds, Household } from '@/hooks/useHouseholds';
import { Loader2 } from "lucide-react"
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

const Index = () => {
  const { user, userProfile, signOut, loading: authLoading } = useAuth();
  const { households, loading: householdsLoading } = useHouseholds();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedHousehold, setSelectedHousehold] = useState<Household | null>(null);
  const [showHouseholdSelector, setShowHouseholdSelector] = useState(false);

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

  if (authLoading || (user && householdsLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading your family hub...</p>
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
        if (activeTab === 'appreciations') return <Appreciations selectedHousehold={selectedHousehold} />;
        if (activeTab === 'bills') return <BillsTracker selectedHousehold={selectedHousehold} />;
        if (activeTab === 'notes') return <FamilyNotes selectedHousehold={selectedHousehold} />;
        if (activeTab === 'calendar') return <FamilyCalendar selectedHousehold={selectedHousehold} />;
        if (activeTab === 'mental-load') return <MentalLoad />;
        if (activeTab === 'nanny-mode') return <NannyMode />;
        if (activeTab === 'children') return <ChildrenDashboard selectedHousehold={selectedHousehold} />;
        if (activeTab === 'weekly-sync') return <WeeklySync selectedHousehold={selectedHousehold} />;
        return <Dashboard setActiveSection={setActiveTab} selectedHousehold={selectedHousehold} />;
    }
  };

  const showMobileNav = userProfile?.role !== 'child';

  return (
    <ErrorBoundary fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Dashboard Error</h2>
          <p className="text-gray-600">Please refresh to try again</p>
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
          <CleanMobileNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default Index;
