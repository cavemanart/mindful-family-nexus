import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useHouseholds } from '@/hooks/useHouseholds';
import { usePagePreferences } from '@/hooks/usePagePreferences';
import { useTheme } from '@/components/theme-provider';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, User, Home, Palette, Shield, Loader2, Eye, EyeOff, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ChildManagement from '@/components/ChildManagement';

const Profile = () => {
  const { user, userProfile, loading: authLoading } = useAuth();
  const { households } = useHouseholds();
  const { theme, setTheme } = useTheme();
  const { availablePages, isPageVisible, togglePageVisibility, loading: preferencesLoading } = usePagePreferences();
  const navigate = useNavigate();
  
  console.log('📄 Profile component state:', { 
    user: !!user, 
    userProfile: !!userProfile, 
    authLoading,
    householdsCount: households?.length || 0,
    userRole: userProfile?.role
  });

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  
  const selectedHousehold = households?.find(h => h.id === localStorage.getItem('selectedHouseholdId')) || households?.[0];
  const [householdName, setHouseholdName] = useState('');
  const [isUpdatingHousehold, setIsUpdatingHousehold] = useState(false);
  
  const isAdminOrOwner = selectedHousehold?.role === 'admin' || selectedHousehold?.role === 'owner';
  const canManageChildren = userProfile?.role === 'parent' || userProfile?.role === 'grandparent';

  console.log('👶 Child management check:', {
    canManageChildren,
    userRole: userProfile?.role,
    selectedHousehold: !!selectedHousehold,
    householdId: selectedHousehold?.id
  });

  // Update form values when userProfile loads
  useEffect(() => {
    if (userProfile) {
      console.log('👤 Setting profile form values:', userProfile);
      setFirstName(userProfile.first_name || '');
      setLastName(userProfile.last_name || '');
    }
  }, [userProfile]);

  // Update household name when selectedHousehold loads
  useEffect(() => {
    if (selectedHousehold) {
      console.log('🏠 Setting household name:', selectedHousehold.name);
      setHouseholdName(selectedHousehold.name || '');
    }
  }, [selectedHousehold]);

  // Redirect if not authenticated (but wait for auth loading to complete)
  useEffect(() => {
    if (!authLoading && !user) {
      console.log('🔄 Not authenticated, redirecting to auth');
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleUpdateProfile = async () => {
    if (!user) {
      console.log('❌ No user found for profile update');
      return;
    }
    
    setIsUpdatingProfile(true);
    try {
      console.log('💾 Updating profile for user:', user.id);
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
        })
        .eq('id', user.id);

      if (error) throw error;
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdateHousehold = async () => {
    if (!selectedHousehold) {
      console.log('❌ No selected household for update');
      return;
    }
    
    setIsUpdatingHousehold(true);
    try {
      console.log('🏠 Updating household:', selectedHousehold.id);
      const { error } = await supabase
        .from('households')
        .update({ name: householdName })
        .eq('id', selectedHousehold.id);

      if (error) throw error;
      
      toast.success('Household name updated successfully!');
    } catch (error) {
      console.error('❌ Error updating household:', error);
      toast.error('Failed to update household name');
    } finally {
      setIsUpdatingHousehold(false);
    }
  };

  const getRoleDisplay = (role?: string) => {
    switch (role) {
      case 'parent': return 'Parent';
      case 'nanny': return 'Nanny/Caregiver';
      case 'child': return 'Child';
      case 'grandparent': return 'Grandparent';
      default: return 'Family Member';
    }
  };

  const groupedPages = availablePages.reduce((acc, page) => {
    if (!acc[page.category]) {
      acc[page.category] = [];
    }
    acc[page.category].push(page);
    return acc;
  }, {} as Record<string, typeof availablePages>);

  // Show loading state while authentication is loading
  if (authLoading) {
    console.log('⏳ Auth loading, showing spinner');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/50">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4 text-blue-600" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Show error state if user is not found after loading
  if (!authLoading && !user) {
    console.log('❌ No user found after loading complete');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/50">
        <div className="text-center">
          <p className="text-lg font-semibold text-red-600 mb-2">Authentication Required</p>
          <p className="text-muted-foreground mb-4">Please sign in to view your profile.</p>
          <Button onClick={() => navigate('/auth')}>Go to Sign In</Button>
        </div>
      </div>
    );
  }

  console.log('✅ Rendering profile page');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 dark:from-background dark:to-muted/20">
      <div className="container max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/')}
            className="hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="space-y-8">
          {/* Profile Header */}
          <div className="text-center space-y-4">
            <Avatar className="h-24 w-24 mx-auto">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback className="text-2xl">
                {user?.email?.[0].toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">Profile Settings</h1>
              <p className="text-muted-foreground">
                Manage your account and household preferences
              </p>
            </div>
          </div>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your personal details and profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter your first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user?.email || ''} disabled className="bg-muted" />
                <p className="text-sm text-muted-foreground">
                  Email cannot be changed at this time
                </p>
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Input 
                  value={getRoleDisplay(userProfile?.role)} 
                  disabled 
                  className="bg-muted" 
                />
              </div>
              <Button 
                onClick={handleUpdateProfile}
                disabled={isUpdatingProfile}
                className="w-full md:w-auto"
              >
                {isUpdatingProfile ? 'Updating...' : 'Update Profile'}
              </Button>
            </CardContent>
          </Card>

          {/* Children Management - Always show for parents and grandparents, with better messaging */}
          {canManageChildren && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Manage Children
                </CardTitle>
                <CardDescription>
                  Create and manage child accounts with PIN access for your household
                  {!selectedHousehold && " (Select a household first)"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedHousehold ? (
                  <ChildManagement selectedHousehold={selectedHousehold} />
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium mb-2">No Household Selected</p>
                    <p className="text-muted-foreground mb-4">
                      You need to be part of a household to manage children. 
                      Please join or create a household first.
                    </p>
                    <Button onClick={() => navigate('/')} variant="outline">
                      Go to Dashboard
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Show message for non-parents/grandparents */}
          {!canManageChildren && userProfile && (
            <Card className="bg-muted/50">
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">Child Management</p>
                <p className="text-muted-foreground">
                  Child management is only available for parents and grandparents.
                  Your current role is: {getRoleDisplay(userProfile.role)}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Page Visibility Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Page Visibility
              </CardTitle>
              <CardDescription>
                Choose which pages you want to see in your navigation. You can always change these settings later.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {preferencesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="animate-spin h-6 w-6" />
                </div>
              ) : (
                Object.entries(groupedPages).map(([category, pages]) => (
                  <div key={category} className="space-y-4">
                    <h3 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
                      {category === 'core' ? 'Core Pages' : 
                       category === 'family' ? 'Family Features' : 'Management Tools'}
                    </h3>
                    <div className="space-y-3">
                      {pages.map((page) => (
                        <div key={page.key} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Label className="font-medium">{page.label}</Label>
                              {page.alwaysVisible && (
                                <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                                  Always visible
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{page.description}</p>
                          </div>
                          <Switch
                            checked={isPageVisible(page.key)}
                            onCheckedChange={() => togglePageVisibility(page.key)}
                            disabled={page.alwaysVisible}
                          />
                        </div>
                      ))}
                    </div>
                    {category !== 'management' && <Separator />}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Household Management */}
          {selectedHousehold && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Household Settings
                </CardTitle>
                <CardDescription>
                  Manage your current household settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="householdName">Household Name</Label>
                  <Input
                    id="householdName"
                    value={householdName}
                    onChange={(e) => setHouseholdName(e.target.value)}
                    disabled={!isAdminOrOwner}
                    placeholder="Enter household name"
                  />
                  {!isAdminOrOwner && (
                    <p className="text-sm text-muted-foreground">
                      Only household admins can change the household name
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Your Role in Household</Label>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="capitalize font-medium">
                      {selectedHousehold.role}
                    </span>
                  </div>
                </div>
                {isAdminOrOwner && (
                  <Button 
                    onClick={handleUpdateHousehold}
                    disabled={isUpdatingHousehold}
                    className="w-full md:w-auto"
                  >
                    {isUpdatingHousehold ? 'Updating...' : 'Update Household'}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Theme Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance
              </CardTitle>
              <CardDescription>
                Customize how the app looks and feels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Toggle between light and dark themes
                  </p>
                </div>
                <Switch
                  checked={theme === 'dark'}
                  onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Current Theme</Label>
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full ${theme === 'dark' ? 'bg-slate-800' : 'bg-white border'}`} />
                  <span className="capitalize font-medium">{theme} Mode</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
