
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useHouseholds, Household } from '@/hooks/useHouseholds';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Loader2, Menu, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import MobileNavigation from '@/components/MobileNavigation';
import TopBar from '@/components/TopBar';
import Appreciations from '@/components/Appreciations';
import BillsTracker from '@/components/BillsTracker';
import FamilyNotes from '@/components/FamilyNotes';
import MentalLoad from '@/components/MentalLoad';
import NannyMode from '@/components/NannyMode';
import ChildrenDashboard from '@/components/ChildrenDashboard';
import WeeklySync from '@/components/WeeklySync';
import Dashboard from '@/components/Dashboard';

interface NavItem {
  id: string;
  label: string;
}

const Index = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const { households, loading, fetchHouseholds } = useHouseholds();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedHousehold, setSelectedHousehold] = useState<Household | null>(null);

  useEffect(() => {
    if (!user && !authLoading) {
      navigate('/auth');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (households.length > 0) {
      setSelectedHousehold(households[0]);
    }
  }, [households]);

  const handleHouseholdChange = (householdId: string) => {
    const household = households.find((h) => h.id === householdId);
    setSelectedHousehold(household || null);
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="animate-spin" size={48} />
    </div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <TopBar 
        user={user}
        households={households}
        selectedHousehold={selectedHousehold}
        onHouseholdChange={handleHouseholdChange}
        onSignOut={signOut}
      />

      {/* Main Content */}
      <main className="pb-20 md:pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="animate-spin" size={24} />
            <span className="ml-2">Loading...</span>
          </div>
        ) : (
          <div className="px-4 py-6 max-w-7xl mx-auto">
            {activeTab === 'dashboard' && <Dashboard setActiveSection={setActiveTab} selectedHousehold={selectedHousehold} />}
            {activeTab === 'appreciations' && <Appreciations selectedHousehold={selectedHousehold} />}
            {activeTab === 'bills' && <BillsTracker selectedHousehold={selectedHousehold} />}
            {activeTab === 'notes' && <FamilyNotes selectedHousehold={selectedHousehold} />}
            {activeTab === 'mental-load' && <MentalLoad />}
            {activeTab === 'nanny-mode' && <NannyMode />}
            {activeTab === 'children' && <ChildrenDashboard selectedHousehold={selectedHousehold} />}
            {activeTab === 'weekly-sync' && <WeeklySync selectedHousehold={selectedHousehold} />}
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default Index;
