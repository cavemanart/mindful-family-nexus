
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

  if (!selectedHousehold) {
    return <HouseholdSelector onHouseholdSelect={selectHousehold} />;
  }

  const visiblePages = preferences?.filter(pref => pref.is_visible) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Add the notification scheduler */}
      <NotificationScheduler householdId={selectedHousehold.id} />
      
      <TopBar 
        user={user}
        households={households}
        selectedHousehold={selectedHousehold}
        onHouseholdChange={(householdId) => {
          const household = households.find(h => h.id === householdId);
          if (household) selectHousehold(household);
        }}
        onSignOut={signOut}
      />
      <Navigation 
        activeSection={selectedSection || 'dashboard'}
        setActiveSection={handleSectionSelect}
        selectedHousehold={selectedHousehold}
      />
      
      <main className="pb-20 px-4 pt-4 max-w-4xl mx-auto space-y-6">
        {(!selectedSection || selectedSection === 'chores') && 
          visiblePages.some((p: any) => p.page_key === 'chores') && (
          <ChoresSection 
            selectedChild={null}
            childChores={[]}
            handleCompleteChore={() => {}}
          />
        )}
        
        {(!selectedSection || selectedSection === 'bills') && 
          visiblePages.some((p: any) => p.page_key === 'bills') && (
          <BillsTracker selectedHousehold={selectedHousehold} />
        )}
        
        {(!selectedSection || selectedSection === 'calendar') && 
          visiblePages.some((p: any) => p.page_key === 'calendar') && (
          <FamilyCalendar selectedHousehold={selectedHousehold} />
        )}
        
        {(!selectedSection || selectedSection === 'mvp') && 
          visiblePages.some((p: any) => p.page_key === 'mvp') && (
          <MVPOfTheDay selectedHousehold={selectedHousehold} />
        )}
        
        {(!selectedSection || selectedSection === 'notes') && 
          visiblePages.some((p: any) => p.page_key === 'notes') && (
          <FamilyNotes householdId={selectedHousehold.id} canEdit={true} />
        )}
        
        {(!selectedSection || selectedSection === 'goals') && 
          visiblePages.some((p: any) => p.page_key === 'goals') && (
          <PersonalGoalsSection 
            personalGoals={[]}
            loading={false}
            addPersonalGoal={() => Promise.resolve(false)}
            updatePersonalGoal={() => Promise.resolve(false)}
            deletePersonalGoal={() => Promise.resolve(false)}
            currentUserName=""
            currentUserId=""
          />
        )}
        
        {(!selectedSection || selectedSection === 'weekly-goals') && 
          visiblePages.some((p: any) => p.page_key === 'weekly-goals') && (
          <WeeklyGoalsSection 
            goals={[]}
            loading={false}
            addGoal={() => Promise.resolve(false)}
            toggleGoal={() => Promise.resolve(false)}
            deleteGoal={() => Promise.resolve(false)}
            editGoal={() => Promise.resolve(false)}
            currentUserName=""
            familyMembers={[]}
          />
        )}
        
        {(!selectedSection || selectedSection === 'weekly-wins') && 
          visiblePages.some((p: any) => p.page_key === 'weekly-wins') && (
          <WeeklyWinsSection 
            wins={[]}
            loading={false}
            addWin={() => Promise.resolve(false)}
            householdId={selectedHousehold.id}
          />
        )}
        
        {(!selectedSection || selectedSection === 'weekly-sync') && 
          visiblePages.some((p: any) => p.page_key === 'weekly-sync') && (
          <WeeklySync selectedHousehold={selectedHousehold} />
        )}
      </main>
    </div>
  );
}
