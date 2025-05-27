
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useHouseholds } from '@/hooks/useHouseholds';
import QuickActions from './QuickActions';
import OverviewCards from './OverviewCards';

interface DashboardProps {
  setActiveSection: (section: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setActiveSection }) => {
  const { user } = useAuth();
  const { loading: householdsLoading } = useHouseholds();

  // Show loading spinner while fetching households
  if (householdsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not logged in, prompt to log in
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to continue</p>
        </div>
      </div>
    );
  }

  // Main dashboard content
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="text-center py-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Welcome Home, Family! 🏠
        </h1>
        <p className="text-gray-600 text-lg">
          Your central hub for everything that matters
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
