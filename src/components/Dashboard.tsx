
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Household } from '@/hooks/useHouseholds';
import QuickActions from './QuickActions';
import OverviewCards from './OverviewCards';
import NannyTokenGenerator from './NannyTokenGenerator';

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
    <div className="space-y-8 p-6">
      {/* Welcome Header */}
      <div className="text-center py-8 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl border border-blue-100 shadow-sm">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
          Welcome to Hublie! 🏠
        </h1>
        <p className="text-gray-600 text-lg md:text-xl mb-2">
          Your family's digital headquarters
        </p>
        <p className="text-gray-500 text-base">
          Managing {selectedHousehold.name}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <QuickActions setActiveSection={setActiveSection} />
      </div>

      {/* Nanny Access Generator */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Nanny Access</h2>
        <NannyTokenGenerator householdId={selectedHousehold.id} />
      </div>

      {/* Overview Cards */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Overview</h2>
        <OverviewCards setActiveSection={setActiveSection} />
      </div>
    </div>
  );
};

export default Dashboard;
