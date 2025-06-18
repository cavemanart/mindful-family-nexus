
import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, Settings, UserPlus, LogOut } from 'lucide-react';
import { Household } from '@/hooks/useHouseholds';
import { useSafeAuth } from '@/hooks/useSafeAuth';
import { useChildSession } from '@/hooks/useChildSession';
import { useNavigate } from 'react-router-dom';
import { useChildren } from '@/hooks/useChildren';
import LeaveHouseholdDialog from './LeaveHouseholdDialog';
import AddChildDialog from './AddChildDialog';
import UserProfileErrorBoundary from './UserProfileErrorBoundary';
import HouseholdJoinCodeCard from "./HouseholdJoinCodeCard";
import JoinHouseholdDialog from './JoinHouseholdDialog';

interface UserProfileProps {
  selectedHousehold: Household | null;
  onSignOut: () => void;
  onHouseholdLeft?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ 
  selectedHousehold, 
  onSignOut, 
  onHouseholdLeft 
}) => {
  const { 
    user, 
    userProfile, 
    isChildMode, 
    activeUserName, 
    canManageHousehold,
    signOut: safeSignOut 
  } = useSafeAuth();
  const { activeChild, clearChildSession } = useChildSession();
  const navigate = useNavigate();
  const { children } = useChildren(selectedHousehold?.id);

  const handleSignOut = async () => {
    if (isChildMode) {
      clearChildSession();
    } else {
      await safeSignOut();
      onSignOut();
    }
  };

  const getRoleDisplay = (role?: string) => {
    if (isChildMode) return 'Child';
    
    switch (role) {
      case 'parent': return 'Parent';
      case 'nanny': return 'Nanny/Caregiver';
      case 'child': return 'Child';
      case 'grandparent': return 'Grandparent';
      default: return 'Family Member';
    }
  };

  const getAvatarFallback = () => {
    if (isChildMode && activeChild) {
      return activeChild.first_name[0].toUpperCase();
    }
    if (userProfile?.first_name && userProfile?.last_name) {
      return `${userProfile.first_name[0]}${userProfile.last_name[0]}`.toUpperCase();
    }
    return user?.email?.[0].toUpperCase() || activeUserName[0].toUpperCase();
  };

  const getAvatarUrl = () => {
    if (isChildMode) {
      return null; // Children don't have uploaded avatars yet
    }
    return userProfile?.avatar_url;
  };

  const isAdminOrOwner = selectedHousehold?.role === 'admin' || selectedHousehold?.role === 'owner';
  const canManageChildren = canManageHousehold && (userProfile?.role === 'parent' || userProfile?.role === 'grandparent' || isAdminOrOwner);

  // Don't show invite code options for child accounts
  const isChildAccount = userProfile?.is_child_account || userProfile?.role === 'child' || isChildMode;

  return (
    <UserProfileErrorBoundary>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 px-0">
            <Avatar className="h-8 w-8">
              <AvatarImage src={getAvatarUrl() || undefined} />
              <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
            </Avatar>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[350px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={getAvatarUrl() || undefined} />
                <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="text-lg font-semibold">
                  {activeUserName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {getRoleDisplay(userProfile?.role)}
                </p>
                {isChildMode && (
                  <p className="text-xs text-purple-600 dark:text-purple-400">
                    👶 Kid's Mode
                  </p>
                )}
              </div>
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Current Household Info */}
            {selectedHousehold && !isChildMode && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">Current Household</h3>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium">{selectedHousehold.name}</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    Role: {selectedHousehold.role}
                  </p>
                  {selectedHousehold.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedHousehold.description}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Household Management - Only show for non-child accounts */}
            {!isChildAccount && user && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">Household Actions</h3>
                <div className="space-y-2">
                  <JoinHouseholdDialog />
                </div>
              </div>
            )}

            {/* Children section for parents/grandparents - Only show for non-child accounts */}
            {!isChildAccount && canManageChildren && selectedHousehold && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">Children ({children.length})</h3>
                <div className="space-y-2">
                  {children.length > 0 && (
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="space-y-1">
                        {children.map((child) => (
                          <p key={child.id} className="text-sm">
                            {child.first_name}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                  <HouseholdJoinCodeCard householdId={selectedHousehold.id} />
                </div>
              </div>
            )}

            {/* Admin Actions - Only show for non-child accounts */}
            {!isChildAccount && isAdminOrOwner && selectedHousehold && canManageHousehold && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">Admin Actions</h3>
                <div className="space-y-2">
                  <LeaveHouseholdDialog 
                    household={selectedHousehold} 
                    onLeave={onHouseholdLeft}
                  />
                </div>
              </div>
            )}

            {/* General Actions */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Account</h3>
              <div className="space-y-2">
                {!isChildMode && (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate('/profile')}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Profile Settings
                  </Button>
                )}
                <Button variant="outline" onClick={handleSignOut} className="w-full justify-start">
                  <LogOut className="mr-2 h-4 w-4" />
                  {isChildMode ? 'Switch User' : 'Sign Out'}
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </UserProfileErrorBoundary>
  );
};

export default UserProfile;
