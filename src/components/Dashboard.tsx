
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Household } from '@/hooks/useHouseholds';
import QuickActions from './QuickActions';
import OverviewCards from './OverviewCards';

interface DashboardProps {
  setActiveSection: (section: string) => void;
  selectedHousehold?: Household | null;
}

const Dashboard: React.FC<DashboardProps> = ({ setActiveSection, selectedHousehold }) => {
  const { user } = useAuth();

  // If not logged in, prompt to log in
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Please log in to continue</p>
        </div>
      </div>
    );
  }

  // If no household selected, show message
  if (!selectedHousehold) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">No Household Selected</h2>
          <p className="text-muted-foreground">Please select or create a household to continue</p>
        </div>
      </div>
    );
  }

  // Main dashboard content
  return (
    <div className="space-y-6 md:ml-36">
      {/* Welcome Header */}
      <div className="text-center py-6 md:py-8 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl border">
        <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-2">
          Welcome to Hublie! 🏠
        </h1>
        <p className="text-muted-foreground text-base md:text-lg">
          Your family's digital headquarters
        </p>
        <p className="text-muted-foreground text-sm mt-2">
          {selectedHousehold.name}
        </p>
      </div>

      {/* Quick Actions */}
      <QuickActions setActiveSection={setActiveSection} />

      {/* Overview Cards */}
      <OverviewCards setActiveSection={setActiveSection} />
    </div>
  );
};

export default Dashboard;
