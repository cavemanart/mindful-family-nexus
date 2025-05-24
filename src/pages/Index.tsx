
import React from 'react';
import Navigation from '@/components/Navigation';
import Dashboard from '@/components/Dashboard';
import FamilyNotes from '@/components/FamilyNotes';
import Appreciations from '@/components/Appreciations';
import BillsTracker from '@/components/BillsTracker';
import MentalLoad from '@/components/MentalLoad';
import NannyMode from '@/components/NannyMode';
import WeeklySync from '@/components/WeeklySync';
import ChildrenDashboard from '@/components/ChildrenDashboard';

const Index = () => {
  const [activeSection, setActiveSection] = React.useState('dashboard');

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
      <Navigation activeSection={activeSection} setActiveSection={setActiveSection} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
