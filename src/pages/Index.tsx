import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useHouseholds, Household } from '@/hooks/useHouseholds';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
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

  const navigationItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'appreciations', label: 'Appreciations' },
    { id: 'bills', label: 'Bills' },
    { id: 'notes', label: 'Family Notes' },
    { id: 'mental-load', label: 'Mental Load' },
    { id: 'nanny-mode', label: 'Nanny Mode' },
    { id: 'children', label: 'Children' },
    { id: 'weekly-sync', label: 'Weekly Sync' },
  ];

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin" size={48} />
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">
            Household OS
          </h1>

          {/* User Info and Sign Out */}
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>{user?.email?.[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="text-gray-700">{user.email}</span>
            <Button variant="outline" size="sm" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-100 border-b">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex space-x-4">
            {navigationItems.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                onClick={() => setActiveTab(item.id)}
              >
                {item.label}
              </Button>
            ))}
          </div>

          {/* Household Selector */}
          {households.length > 0 && (
            <Select onValueChange={handleHouseholdChange} defaultValue={households[0].id}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select household" />
              </SelectTrigger>
              <SelectContent>
                {households.map((household) => (
                  <SelectItem key={household.id} value={household.id}>
                    {household.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="animate-spin" size={24} />
            <span className="ml-2">Loading...</span>
          </div>
        ) : (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Total Bills Due</CardTitle>
                  <CardDescription>This month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$3,450</div>
                </CardContent>
                <CardFooter>
                  <Button>View Bills</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Chores Completed</CardTitle>
                  <CardDescription>This week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                </CardContent>
                <CardFooter>
                  <Button>View Chores</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Family Notes</CardTitle>
                  <CardDescription>New messages</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                </CardContent>
                <CardFooter>
                  <Button>View Notes</Button>
                </CardFooter>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2">Quick Actions</h2>
              <div className="flex space-x-4">
                <Button>Add Bill</Button>
                <Button>Add Chore</Button>
                <Button>Write Note</Button>
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="mt-8">
              {activeTab === 'dashboard' && <Dashboard setActiveSection={setActiveTab} selectedHousehold={selectedHousehold} />}
              {activeTab === 'appreciations' && <Appreciations selectedHousehold={selectedHousehold} />}
              {activeTab === 'bills' && <BillsTracker selectedHousehold={selectedHousehold} />}
              {activeTab === 'notes' && <FamilyNotes selectedHousehold={selectedHousehold} />}
              {activeTab === 'mental-load' && <MentalLoad />}
              {activeTab === 'nanny-mode' && <NannyMode />}
              {activeTab === 'children' && <ChildrenDashboard selectedHousehold={selectedHousehold} />}
              {activeTab === 'weekly-sync' && <WeeklySync selectedHousehold={selectedHousehold} />}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
