import React, { useState, useEffect } from 'react';
import { CalendarDays, CheckCircle, Heart, LayoutDashboard, Plus, TrendingUp, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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

  const renderDashboardOverview = () => {
    if (!selectedHousehold) return null;

    return (
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20 rounded-xl p-6 border border-blue-200/50 dark:border-blue-800/50">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Welcome back, {userProfile?.first_name || 'User'}! 👋
              </h1>
              <p className="text-muted-foreground">
                Here's what's happening in the {selectedHousehold.name} household
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                <Users size={12} className="mr-1" />
                Active Family
              </Badge>
            </div>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200/50 dark:border-green-800/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">Tasks Completed</p>
                  <p className="text-2xl font-bold text-green-800 dark:text-green-200">12</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30 border-pink-200/50 dark:border-pink-800/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-pink-700 dark:text-pink-300">Appreciations</p>
                  <p className="text-2xl font-bold text-pink-800 dark:text-pink-200">8</p>
                </div>
                <Heart className="h-8 w-8 text-pink-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200/50 dark:border-blue-800/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">This Week</p>
                  <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">Events</p>
                </div>
                <CalendarDays className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 border-purple-200/50 dark:border-purple-800/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Family Score</p>
                  <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">95%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-dashed border-2 border-gray-300 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-950/30 dark:to-slate-950/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plus className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col gap-2 hover:bg-pink-50 dark:hover:bg-pink-950/30 border-pink-200 dark:border-pink-800"
                onClick={() => navigate('/appreciations')}
              >
                <Heart className="h-5 w-5 text-pink-600" />
                <span className="text-sm">Add Thanks</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col gap-2 hover:bg-blue-50 dark:hover:bg-blue-950/30 border-blue-200 dark:border-blue-800"
                onClick={() => navigate('/calendar')}
              >
                <CalendarDays className="h-5 w-5 text-blue-600" />
                <span className="text-sm">Add Event</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col gap-2 hover:bg-green-50 dark:hover:bg-green-950/30 border-green-200 dark:border-green-800"
                onClick={() => navigate('/mental-load')}
              >
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm">Add Task</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col gap-2 hover:bg-purple-50 dark:hover:bg-purple-950/30 border-purple-200 dark:border-purple-800"
                onClick={() => navigate('/notes')}
              >
                <Clock className="h-5 w-5 text-purple-600" />
                <span className="text-sm">Add Note</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Dashboard Content */}
        <ChoresDashboard selectedHousehold={selectedHousehold} />
      </div>
    );
  };

  const renderPageContent = () => {
    if (!selectedHousehold) {
      return (
        <div className="text-center py-12">
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 rounded-xl p-8 border border-yellow-200/50 dark:border-yellow-800/50">
            <LayoutDashboard className="h-12 w-12 mx-auto mb-4 text-yellow-600" />
            <h2 className="text-2xl font-bold text-foreground mb-4">No Household Selected</h2>
            <p className="text-muted-foreground">Create or join a household to get started!</p>
          </div>
        </div>
      );
    }

    switch (currentPage) {
      case 'dashboard':
        return renderDashboardOverview();
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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 py-8">
          {/* Navigation */}
          <div className="md:col-span-1">
            <div className="sticky top-24">
              <Navigation
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                selectedHousehold={selectedHousehold}
                userProfile={userProfile}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3 space-y-6">
            {/* Top Bar with improved styling */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {currentPage === 'dashboard' && <LayoutDashboard className="text-blue-500" size={28} />}
                {currentPage === 'appreciations' && <Heart className="text-pink-500" size={28} />}
                {currentPage === 'manage-children' && <CalendarDays className="text-purple-500" size={28} />}
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {currentPage === 'dashboard' && 'Dashboard'}
                    {currentPage === 'appreciations' && 'Appreciations'}
                    {currentPage === 'manage-children' && 'Manage Children'}
                  </h2>
                  {selectedHousehold && (
                    <p className="text-sm text-muted-foreground">
                      {selectedHousehold.name}
                    </p>
                  )}
                </div>
              </div>
              {selectedHousehold && (
                <Button variant="destructive" size="sm" onClick={handleLeaveHousehold}>
                  Leave Household
                </Button>
              )}
            </div>

            {/* Household Management Cards with improved styling */}
            {!selectedHousehold && !isCreating && (
              <div className="grid gap-6">
                <Card className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-green-950/30 dark:via-blue-950/30 dark:to-purple-950/30 border-2 border-dashed border-blue-300 dark:border-blue-700 shadow-lg">
                  <CardContent className="p-8 space-y-6">
                    <div className="text-center">
                      <Users className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                      <h3 className="text-xl font-semibold text-foreground mb-2">Join a Household</h3>
                      <p className="text-muted-foreground">Enter invite code to join an existing household.</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Input
                        type="text"
                        placeholder="Enter invite code"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                        className="flex-1"
                      />
                      <Button onClick={handleJoinHousehold} className="bg-blue-600 hover:bg-blue-700">
                        Join
                      </Button>
                    </div>
                    <div className="border-t dark:border-gray-700 pt-6 text-center">
                      <Plus className="h-8 w-8 mx-auto mb-3 text-purple-600" />
                      <h3 className="text-xl font-semibold text-foreground mb-2">Create a Household</h3>
                      <p className="text-muted-foreground mb-4">Create a new household to start managing tasks and appreciations.</p>
                      <Button onClick={() => setIsCreating(true)} className="bg-purple-600 hover:bg-purple-700">
                        Create Household
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Create Household Form with improved styling */}
            {!selectedHousehold && isCreating && (
              <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-purple-950/30 dark:via-pink-950/30 dark:to-rose-950/30 border-2 border-dashed border-purple-300 dark:border-purple-700 shadow-lg">
                <CardContent className="p-8 space-y-6">
                  <div className="text-center">
                    <Plus className="h-12 w-12 mx-auto mb-4 text-purple-600" />
                    <h3 className="text-xl font-semibold text-foreground">Create New Household</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">Household Name</Label>
                      <Input
                        type="text"
                        id="name"
                        placeholder="Enter household name"
                        value={newHousehold.name}
                        onChange={(e) => setNewHousehold({ ...newHousehold, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-medium">Description (optional)</Label>
                      <Input
                        type="text"
                        id="description"
                        placeholder="Enter description"
                        value={newHousehold.description}
                        onChange={(e) => setNewHousehold({ ...newHousehold, description: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <Button variant="outline" onClick={() => setIsCreating(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateHousehold} className="bg-purple-600 hover:bg-purple-700">
                      Create
                    </Button>
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
