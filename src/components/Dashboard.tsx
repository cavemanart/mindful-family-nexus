import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useHouseholds } from "@/hooks/useHouseholds";
import { usePagePreferences } from "@/hooks/usePagePreferences";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import HouseholdSelector from "./HouseholdSelector";
import TopBar from "./TopBar";
import Navigation from "./Navigation";
import ChoresSection from "./ChoresSection";
import BillsTracker from "./BillsTracker";
import FamilyCalendar from "./FamilyCalendar";
import MVPOfTheDay from "./MVPOfTheDay";
import FamilyNotes from "./FamilyNotes";
import PersonalGoalsSection from "./PersonalGoalsSection";
import WeeklyGoalsSection from "./WeeklyGoalsSection";
import WeeklyWinsSection from "./WeeklyWinsSection";
import WeeklySync from "./WeeklySync";
import NotificationScheduler from "./NotificationScheduler";

export default function Dashboard() {
  const { user } = useAuth();
  const { currentHousehold, households, loading: householdsLoading } = useHouseholds();
  const { pagePreferences, loading: preferencesLoading } = usePagePreferences();
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
    setSelectedSection(section);
    // Update URL hash
    window.location.hash = section;
  };

  if (householdsLoading || preferencesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  if (!currentHousehold) {
    return <HouseholdSelector />;
  }

  const visiblePages = pagePreferences?.filter(pref => pref.is_visible) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Add the notification scheduler */}
      <NotificationScheduler householdId={currentHousehold.id} />
      
      <TopBar />
      <Navigation onSectionSelect={handleSectionSelect} />
      
      <main className="pb-20 px-4 pt-4 max-w-4xl mx-auto space-y-6">
        {(!selectedSection || selectedSection === 'chores') && 
          visiblePages.some(p => p.page_key === 'chores') && (
          <ChoresSection />
        )}
        
        {(!selectedSection || selectedSection === 'bills') && 
          visiblePages.some(p => p.page_key === 'bills') && (
          <BillsTracker />
        )}
        
        {(!selectedSection || selectedSection === 'calendar') && 
          visiblePages.some(p => p.page_key === 'calendar') && (
          <FamilyCalendar />
        )}
        
        {(!selectedSection || selectedSection === 'mvp') && 
          visiblePages.some(p => p.page_key === 'mvp') && (
          <MVPOfTheDay />
        )}
        
        {(!selectedSection || selectedSection === 'notes') && 
          visiblePages.some(p => p.page_key === 'notes') && (
          <FamilyNotes />
        )}
        
        {(!selectedSection || selectedSection === 'goals') && 
          visiblePages.some(p => p.page_key === 'goals') && (
          <PersonalGoalsSection />
        )}
        
        {(!selectedSection || selectedSection === 'weekly-goals') && 
          visiblePages.some(p => p.page_key === 'weekly-goals') && (
          <WeeklyGoalsSection />
        )}
        
        {(!selectedSection || selectedSection === 'weekly-wins') && 
          visiblePages.some(p => p.page_key === 'weekly-wins') && (
          <WeeklyWinsSection />
        )}
        
        {(!selectedSection || selectedSection === 'weekly-sync') && 
          visiblePages.some(p => p.page_key === 'weekly-sync') && (
          <WeeklySync />
        )}
      </main>
    </div>
  );
}
