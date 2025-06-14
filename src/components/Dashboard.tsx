
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Household } from '@/hooks/useHouseholds';
import QuickActions from './QuickActions';
import OverviewCards from './OverviewCards';
import NannyTokenGenerator from './NannyTokenGenerator';
import SubscriptionStatusCard from './SubscriptionStatusCard';
import ChoresOverviewCard from './ChoresOverviewCard';
import AddChoreDialog from './AddChoreDialog';
import { useChildren } from '@/hooks/useChildren';

interface DashboardProps {
  setActiveSection: (section: string) => void;
  selectedHousehold?: Household | null;
}

const Dashboard: React.FC<DashboardProps> = ({ setActiveSection, selectedHousehold }) => {
  const { user } = useAuth();
  const { children } = useChildren(selectedHousehold?.id);

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
      <div className="text-center py-8 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/30 dark:via-purple-950/30 dark:to-pink-950/30 rounded-2xl border border-blue-100 dark:border-blue-800 shadow-sm">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
          Welcome to Hublie! 🏠
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl mb-2">
          Your family's digital headquarters
        </p>
        <p className="text-muted-foreground text-base">
          Managing {selectedHousehold.name}
        </p>
      </div>

      {/* Grid layout for main content */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left column - Main actions and overview */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Actions */}
          <div className="bg-card rounded-2xl border shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Quick Actions</h2>
              {children.length > 0 && (
                <AddChoreDialog 
                  householdId={selectedHousehold.id}
                  trigger={
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      + Assign Chore
                    </button>
                  }
                />
              )}
            </div>
            <QuickActions setActiveSection={setActiveSection} />
          </div>

          {/* Overview Cards */}
          <div className="bg-card rounded-2xl border shadow-sm p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Overview</h2>
            <OverviewCards setActiveSection={setActiveSection} />
          </div>

          {/* Chores Overview */}
          {children.length > 0 && (
            <div className="bg-card rounded-2xl border shadow-sm p-6">
              <ChoresOverviewCard 
                householdId={selectedHousehold.id}
                onNavigateToChildren={() => setActiveSection('children')}
              />
            </div>
          )}

          {/* Nanny Access Generator */}
          <div className="bg-card rounded-2xl border shadow-sm p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Nanny Access</h2>
            <NannyTokenGenerator householdId={selectedHousehold.id} />
          </div>
        </div>

        {/* Right column - Subscription status */}
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">Your Plan</h2>
            <SubscriptionStatusCard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
