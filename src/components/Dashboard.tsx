import React, { useState, useEffect } from 'react';
import { CalendarDays, CheckCircle, Heart, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useHouseholds } from '@/hooks/useHouseholds';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import Navigation from './Navigation';
import Appreciations from './Appreciations';
import ChoresDashboard from './ChoresDashboard';
import ChildManagement from '@/components/ChildManagement';

const Dashboard = () => {
  const { households, loading, error, createHousehold, joinHousehold, leaveHousehold } = useHouseholds();
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const [isCreating, setIsCreating] = useState(false);
  const [newHousehold, setNewHousehold] = useState({ name: '', description: '' });
  const [inviteCode, setInviteCode] = useState('');
  const [selectedHousehold, setSelectedHousehold] = useState(households[0] || null);
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    if (households.length > 0 && !selectedHousehold) {
      setSelectedHousehold(households[0]);
    }
  }, [households, selectedHousehold]);

  const handleCreateHousehold = async () => {
    if (newHousehold.name.trim() === '') {
      toast({
        title: "Missing info",
        description: "Household name is required.",
        variant: "destructive"
      });
      return;
    }

    const created = await createHousehold(newHousehold.name, newHousehold.description);
    if (created) {
      setNewHousehold({ name: '', description: '' });
      setIsCreating(false);
      setSelectedHousehold(created);
    }
  };

  const handleJoinHousehold = async () => {
    if (inviteCode.trim() === '') {
      toast({
        title: "Missing info",
        description: "Invite code is required.",
        variant: "destructive"
      });
      return;
    }

    const success = await joinHousehold(inviteCode);
    if (success) {
      setInviteCode('');
    }
  };

  const handleLeaveHousehold = async () => {
    if (!selectedHousehold) return;
    const success = await leaveHousehold(selectedHousehold.id);
    if (success) {
      setSelectedHousehold(null);
    }
  };

  const renderPageContent = () => {
    if (!selectedHousehold) {
      return (
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">No Household Selected</h2>
          <p className="text-muted-foreground">Create or join a household to get started!</p>
        </div>
      );
    }

    switch (currentPage) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <ChoresDashboard selectedHousehold={selectedHousehold} />
          </div>
        );
      case 'appreciations':
        return (
          <div className="space-y-6">
            <Appreciations selectedHousehold={selectedHousehold} />
          </div>
        );
      case 'manage-children':
        return (
          <div className="space-y-6">
            <ChildManagement selectedHousehold={selectedHousehold} />
          </div>
        );
      default:
        return (
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Page Not Found</h2>
            <p className="text-muted-foreground">The requested page could not be found.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 py-8">
          {/* Navigation */}
          <div className="md:col-span-1">
            <Navigation
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              selectedHousehold={selectedHousehold}
              userProfile={userProfile}
            />
          </div>

          {/* Main Content */}
          <div className="md:col-span-3 space-y-6">
            {/* Top Bar */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                {currentPage === 'dashboard' && <LayoutDashboard className="text-blue-500" size={28} />}
                {currentPage === 'appreciations' && <Heart className="text-pink-500" size={28} />}
                {currentPage === 'manage-children' && <CalendarDays className="text-purple-500" size={28} />}
                {currentPage === 'dashboard' && 'Dashboard'}
                {currentPage === 'appreciations' && 'Appreciations'}
                {currentPage === 'manage-children' && 'Manage Children'}
              </h2>
              {selectedHousehold && (
                <Button variant="destructive" size="sm" onClick={handleLeaveHousehold}>
                  Leave Household
                </Button>
              )}
            </div>

            {/* Household Management */}
            {!selectedHousehold && !isCreating && (
              <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30 border-2 border-dashed border-gray-300 dark:border-gray-700">
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-xl font-semibold text-foreground">Join a Household</h3>
                  <p className="text-muted-foreground">Enter invite code to join an existing household.</p>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="text"
                      placeholder="Enter invite code"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                    />
                    <Button onClick={handleJoinHousehold}>Join</Button>
                  </div>
                  <div className="border-t dark:border-gray-700 pt-4">
                    <h3 className="text-xl font-semibold text-foreground">Create a Household</h3>
                    <p className="text-muted-foreground">Create a new household to start managing tasks and appreciations.</p>
                    <Button onClick={() => setIsCreating(true)}>Create Household</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Create Household Form */}
            {!selectedHousehold && isCreating && (
              <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-2 border-dashed border-gray-300 dark:border-gray-700">
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-xl font-semibold text-foreground">Create New Household</h3>
                  <div className="space-y-2">
                    <Label htmlFor="name">Household Name</Label>
                    <Input
                      type="text"
                      id="name"
                      placeholder="Enter household name"
                      value={newHousehold.name}
                      onChange={(e) => setNewHousehold({ ...newHousehold, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (optional)</Label>
                    <Input
                      type="text"
                      id="description"
                      placeholder="Enter description"
                      value={newHousehold.description}
                      onChange={(e) => setNewHousehold({ ...newHousehold, description: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsCreating(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateHousehold}>Create</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Page Content */}
            {selectedHousehold && renderPageContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
