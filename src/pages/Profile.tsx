import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useHouseholds, Household } from '@/hooks/useHouseholds';
import { usePagePreferences } from '@/hooks/usePagePreferences';
import { useTheme } from '@/components/theme-provider';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, User, Home, Palette, Shield, Loader2, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import NotificationPreferencesCard from "@/components/NotificationPreferencesCard";
import CleanMobileNavigation from '@/components/CleanMobileNavigation';
import { useSafeAuth } from '@/hooks/useSafeAuth';
import ProfileHeader from "./profile/ProfileHeader";
import PersonalInfoCard from "./profile/PersonalInfoCard";
import PageVisibilityCard from "./profile/PageVisibilityCard";
import HouseholdSettingsCard from "./profile/HouseholdSettingsCard";
import AppearanceCard from "./profile/AppearanceCard";
import AccountActionsCard from "./profile/AccountActionsCard";

const Profile = () => {
  const { user, userProfile, loading: authLoading } = useAuth();
  const safeAuth = useSafeAuth();
  const { households } = useHouseholds();
  const { theme, setTheme } = useTheme();
  const { availablePages, isPageVisible, togglePageVisibility, loading: preferencesLoading } = usePagePreferences();
  const navigate = useNavigate();

  // === New: mobile navigation active tab logic ===
  // "profile" tab to match profile state in navbar
  const [activeTab, setActiveTab] = useState('profile');

  // In case user uses nav to switch tabs, handle navigation accordingly
  useEffect(() => {
    if (activeTab && activeTab !== 'profile') {
      // Define routing for standard tabs
      const routeMap: Record<string, string> = {
        overview: '/dashboard', // Fixed: Added proper route for Home button
        dashboard: '/dashboard',
        mvp: '/dashboard?tab=mvp',
        bills: '/dashboard?tab=bills',
        notes: '/dashboard?tab=notes',
        calendar: '/dashboard?tab=calendar',
        'mental-load': '/dashboard?tab=mental-load',
        'nanny-mode': '/dashboard?tab=nanny-mode',
        children: '/dashboard?tab=children',
        'weekly-sync': '/dashboard?tab=weekly-sync',
        subscription: '/subscription',
      };
      const to = routeMap[activeTab];
      if (to) {
        console.log('🏠 Navigating from profile to:', to);
        navigate(to);
      }
    }
  }, [activeTab, navigate]);

  // === END new nav logic ===

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  
  // To ensure selectedHousehold is properly typed and the role property is available as possibly undefined:
  const selectedHousehold: Household | undefined = households?.find(
    (h) => h.id === localStorage.getItem('selectedHouseholdId')
  );
  const [householdName, setHouseholdName] = useState('');
  const [isUpdatingHousehold, setIsUpdatingHousehold] = useState(false);
  
  const isAdminOrOwner = selectedHousehold?.role === 'admin' || selectedHousehold?.role === 'owner';

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

  // Group pages by category
  const groupedPages = availablePages.reduce((acc, page) => {
    if (!acc[page.category]) {
      acc[page.category] = [];
    }
    acc[page.category].push(page);
    return acc;
  }, {} as Record<string, typeof availablePages>);

  // --- Logout function (handles child and parent) ---
  const handleLogout = async () => {
    if (safeAuth.isChildMode) {
      safeAuth.signOut();
      // No redirect: let app handle session
    } else {
      await safeAuth.signOut();
      navigate('/auth');
    }
  };

  // Handle navigation to dashboard
  const handleBackToDashboard = () => {
    console.log('🏠 Navigating back to dashboard');
    navigate('/dashboard');
  };

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

  const getAvatarFallback = () => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    return user?.email?.[0].toUpperCase() || 'U';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 dark:from-background dark:to-muted/20 flex flex-col relative">
      <div className="container max-w-4xl mx-auto p-6 pb-28">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBackToDashboard}
            className="hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="space-y-8">
          {/* Profile Header */}
          <ProfileHeader 
            userProfile={userProfile}
            firstName={firstName}
            lastName={lastName}
            getAvatarFallback={getAvatarFallback}
          />

          {/* Personal Information */}
          <PersonalInfoCard 
            firstName={firstName}
            lastName={lastName}
            setFirstName={setFirstName}
            setLastName={setLastName}
            user={user}
            userProfile={userProfile}
            isUpdatingProfile={isUpdatingProfile}
            handleUpdateProfile={handleUpdateProfile}
            getRoleDisplay={getRoleDisplay}
          />

          {/* Page Visibility Preferences */}
          <PageVisibilityCard 
            preferencesLoading={preferencesLoading}
            groupedPages={groupedPages}
            isPageVisible={isPageVisible}
            togglePageVisibility={togglePageVisibility}
          />

          {/* Notification Preferences Card (NEW) */}
          <NotificationPreferencesCard />

          {/* Household Management */}
          <HouseholdSettingsCard
            selectedHousehold={selectedHousehold}
            householdName={householdName}
            setHouseholdName={setHouseholdName}
            isAdminOrOwner={isAdminOrOwner}
            isUpdatingHousehold={isUpdatingHousehold}
            handleUpdateHousehold={handleUpdateHousehold}
          />

          <AppearanceCard 
            theme={theme}
            setTheme={setTheme}
          />

          <AccountActionsCard 
            safeAuth={safeAuth}
            handleLogout={handleLogout}
          />
        </div>
      </div>

      {/* === Mobile Navigation (fixed at bottom on mobile screens only) === */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
        <CleanMobileNavigation 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>
    </div>
  );
};

export default Profile;
