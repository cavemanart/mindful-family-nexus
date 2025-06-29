
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useHouseholds } from "@/hooks/useHouseholds";
import { usePagePreferences } from "@/hooks/usePagePreferences";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import HouseholdSelector from "./HouseholdSelector";
import TopBar from "./TopBar";
import Navigation from "./Navigation";
import QuickActions from "./QuickActions";
import WeeklySyncOverview from "./WeeklySyncOverview";
import ChoresOverviewCard from "./ChoresOverviewCard";
import NotificationScheduler from "./NotificationScheduler";

interface DashboardProps {
  onNavigate?: (section: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { user, signOut } = useAuth();
  const { households, selectedHousehold, selectHousehold, loading: householdsLoading } = useHouseholds();
  const { preferences, loading: preferencesLoading } = usePagePreferences();
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  useEffect(() => {
    // Handle URL hash navigation
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        setSelectedSection(hash);
      }
    };

    // Check initial hash
    handleHashChange();
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleSectionSelect = (section: string) => {
    console.log('Dashboard: Section selected:', section);
    setSelectedSection(section);
    // Update URL hash
    window.location.hash = section;
    
    // Call parent navigation handler if provided
    if (onNavigate) {
      onNavigate(section);
    }
  };

  if (householdsLoading || preferencesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  if (!selectedHousehold) {
    return <HouseholdSelector onHouseholdSelect={selectHousehold} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Add the notification scheduler */}
      <NotificationScheduler householdId={selectedHousehold.id} />
      
      {/* Welcome Section */}
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome to {selectedHousehold.name}
        </h1>
        <p className="text-gray-600">
          Stay organized and connected with your family
        </p>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold text-gray-800">Quick Actions</h2>
        <QuickActions setActiveSection={handleSectionSelect} />
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChoresOverviewCard 
          householdId={selectedHousehold.id}
          onNavigateToChildren={() => handleSectionSelect('children')}
        />
        <WeeklySyncOverview 
          householdId={selectedHousehold.id}
          onViewFullSync={() => handleSectionSelect('weekly-sync')}
        />
      </div>
    </div>
  );
}
