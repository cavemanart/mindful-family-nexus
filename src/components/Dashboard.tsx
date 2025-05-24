
import React from 'react';
import QuickActions from './QuickActions';
import OverviewCards from './OverviewCards';

interface DashboardProps {
  setActiveSection: (section: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setActiveSection }) => {
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
