
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useHouseholds, Household } from '@/hooks/useHouseholds';
import { Loader2 } from "lucide-react"
import MobileNavigation from '@/components/MobileNavigation';
import TopBar from '@/components/TopBar';
import Appreciations from '@/components/Appreciations';
import BillsTracker from '@/components/BillsTracker';
import FamilyNotes from '@/components/FamilyNotes';
import MentalLoad from '@/components/MentalLoad';
import NannyMode from '@/components/NannyMode';
import ChildrenDashboard from '@/components/ChildrenDashboard';
import WeeklySync from '@/components/WeeklySync';
import Dashboard from '@/components/Dashboard';
import HouseholdSelector from '@/components/HouseholdSelector';

const Index = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const { households, loading: householdsLoading } = useHouseholds();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedHousehold, setSelectedHousehold] = useState<Household | null>(null);
  const [showHouseholdSelector, setShowHouseholdSelector] = useState(false);

  // Redirect to homepage if not logged in
  useEffect(() => {
    if (!user && !authLoading) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  // Handle household selection logic after login
  useEffect(() => {
    if (user && !householdsLoading) {
      if (households.length === 0) {
        // No households - show selector to create or join one
        setShowHouseholdSelector(true);
        setSelectedHousehold(null);
      } else if (households.length === 1) {
        // Single household - auto-select it
        setSelectedHousehold(households[0]);
        setShowHouseholdSelector(false);
      } else {
        // Multiple households - check if we have a previously selected one
        const savedHouseholdId = localStorage.getItem('selectedHouseholdId');
        const savedHousehold = households.find(h => h.id === savedHouseholdId);
        
        if (savedHousehold) {
          setSelectedHousehold(savedHousehold);
          setShowHouseholdSelector(false);
        } else {
          // No saved selection or invalid ID - auto-select first household
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

  // Show loading spinner while checking auth or households
  if (authLoading || (user && householdsLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render anything (redirect handles this)
  if (!user) {
    return null;
  }

  // Show household selector if user needs to select/create a household
  if (showHouseholdSelector) {
    return <HouseholdSelector onHouseholdSelect={handleHouseholdSelect} />;
  }

  // Main app interface
  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <TopBar 
        user={user}
        households={households}
        selectedHousehold={selectedHousehold}
        onHouseholdChange={handleHouseholdChange}
        onSignOut={handleSignOut}
      />

      {/* Main Content */}
      <main className="pb-20 md:pb-4">
        <div className="px-4 py-6 max-w-7xl mx-auto">
          {activeTab === 'dashboard' && <Dashboard setActiveSection={setActiveTab} selectedHousehold={selectedHousehold} />}
          {activeTab === 'appreciations' && <Appreciations selectedHousehold={selectedHousehold} />}
          {activeTab === 'bills' && <BillsTracker selectedHousehold={selectedHousehold} />}
          {activeTab === 'notes' && <FamilyNotes selectedHousehold={selectedHousehold} />}
          {activeTab === 'mental-load' && <MentalLoad />}
          {activeTab === 'nanny-mode' && <NannyMode />}
          {activeTab === 'children' && <ChildrenDashboard selectedHousehold={selectedHousehold} />}
          {activeTab === 'weekly-sync' && <WeeklySync selectedHousehold={selectedHousehold} />}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default Index;
