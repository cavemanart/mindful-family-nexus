
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Household } from '@/hooks/useHouseholds';
import Navigation from '@/components/Navigation';
import Dashboard from '@/components/Dashboard';
import FamilyNotes from '@/components/FamilyNotes';
import Appreciations from '@/components/Appreciations';
import BillsTracker from '@/components/BillsTracker';
import MentalLoad from '@/components/MentalLoad';
import NannyMode from '@/components/NannyMode';
import WeeklySync from '@/components/WeeklySync';
import ChildrenDashboard from '@/components/ChildrenDashboard';
import HouseholdSelector from '@/components/HouseholdSelector';
import Auth from './Auth';

const Index = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [selectedHousehold, setSelectedHousehold] = useState<Household | null>(null);
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  if (!selectedHousehold) {
    return <HouseholdSelector onHouseholdSelect={setSelectedHousehold} />;
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'notes':
        return <FamilyNotes />;
      case 'appreciations':
        return <Appreciations />;
      case 'bills':
        return <BillsTracker />;
      case 'mental-load':
        return <MentalLoad />;
      case 'nanny':
        return <NannyMode />;
      case 'weekly-sync':
        return <WeeklySync />;
      case 'kids':
        return <ChildrenDashboard />;
      default:
        return <Dashboard setActiveSection={setActiveSection} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation 
        activeSection={activeSection} 
        setActiveSection={setActiveSection}
        selectedHousehold={selectedHousehold}
        onHouseholdChange={() => setSelectedHousehold(null)}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
