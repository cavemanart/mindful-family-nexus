
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { User, Settings } from 'lucide-react';
import { Household } from '@/hooks/useHouseholds';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface CleanUserProfileProps {
  user: any;
  selectedHousehold: Household | null;
  onSignOut: () => void;
  onHouseholdLeft?: () => void;
}

const CleanUserProfile: React.FC<CleanUserProfileProps> = ({ 
  user, 
  selectedHousehold, 
  onSignOut, 
  onHouseholdLeft 
}) => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);

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
    <div className="relative">
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-8 w-8 px-0"
        onClick={() => setShowProfile(!showProfile)}
      >
        <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
          {user?.email?.[0].toUpperCase()}
        </div>
      </Button>

      {showProfile && (
        <div className="absolute right-0 top-10 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
              {user?.email?.[0].toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-semibold">
                {userProfile?.first_name && userProfile?.last_name 
                  ? `${userProfile.first_name} ${userProfile.last_name}`
                  : user?.email
                }
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {getRoleDisplay(userProfile?.role)}
              </p>
            </div>
          </div>

          {selectedHousehold && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Current Household</h3>
              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <p className="font-medium">{selectedHousehold.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                  Role: {selectedHousehold.role}
                </p>
                {selectedHousehold.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {selectedHousehold.description}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => {
                navigate('/profile');
                setShowProfile(false);
              }}
            >
              <Settings className="mr-2 h-4 w-4" />
              Profile Settings
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                onSignOut();
                setShowProfile(false);
              }} 
              className="w-full justify-start"
            >
              <User className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      )}

      {showProfile && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowProfile(false)}
        />
      )}
    </div>
  );
};

export default CleanUserProfile;
