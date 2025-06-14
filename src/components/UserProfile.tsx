
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
import { User, Settings, UserPlus } from 'lucide-react';
import { Household } from '@/hooks/useHouseholds';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useChildren } from '@/hooks/useChildren';
import LeaveHouseholdDialog from './LeaveHouseholdDialog';
import AddChildDialog from './AddChildDialog';
import UserProfileErrorBoundary from './UserProfileErrorBoundary';

interface UserProfileProps {
  user: any;
  selectedHousehold: Household | null;
  onSignOut: () => void;
  onHouseholdLeft?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ 
  user, 
  selectedHousehold, 
  onSignOut, 
  onHouseholdLeft 
}) => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const { children } = useChildren(selectedHousehold?.id);
  const isAdminOrOwner = selectedHousehold?.role === 'admin' || selectedHousehold?.role === 'owner';
  const canManageChildren = userProfile?.role === 'parent' || userProfile?.role === 'grandparent' || isAdminOrOwner;

  const getRoleDisplay = (role?: string) => {
    switch (role) {
      case 'parent': return 'Parent';
      case 'nanny': return 'Nanny/Caregiver';
      case 'child': return 'Child';
      case 'grandparent': return 'Grandparent';
      default: return 'Family Member';
    }
  };

  return (
    <UserProfileErrorBoundary>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 px-0">
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>{user?.email?.[0].toUpperCase()}</AvatarFallback>
            </Avatar>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[350px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>{user?.email?.[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="text-lg font-semibold">
                  {userProfile?.first_name && userProfile?.last_name 
                    ? `${userProfile.first_name} ${userProfile.last_name}`
                    : user?.email
                  }
                </p>
                <p className="text-sm text-muted-foreground">
                  {getRoleDisplay(userProfile?.role)}
                </p>
              </div>
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Current Household Info */}
            {selectedHousehold && (
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

            {/* Children Management */}
            {canManageChildren && selectedHousehold && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">Children ({children.length})</h3>
                <div className="space-y-2">
                  {children.length > 0 && (
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="space-y-1">
                        {children.map((child) => (
                          <p key={child.id} className="text-sm">
                            {child.first_name} {child.last_name}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                  <AddChildDialog 
                    householdId={selectedHousehold.id}
                    trigger={
                      <Button variant="outline" className="w-full justify-start">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Child
                      </Button>
                    }
                  />
                </div>
              </div>
            )}

            {/* Admin Actions */}
            {isAdminOrOwner && selectedHousehold && userProfile?.role !== 'child' && (
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
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/profile')}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Profile Settings
                </Button>
                <Button variant="outline" onClick={onSignOut} className="w-full justify-start">
                  <User className="mr-2 h-4 w-4" />
                  Sign Out
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
