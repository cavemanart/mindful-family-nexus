
import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Home } from 'lucide-react';
import ChildrenDashboard from '@/components/ChildrenDashboard';

interface ChildDashboardContainerProps {
  childData: {
    child_id: string;
    child_name: string;
    avatar_selection: string;
    household_id: string;
  };
  onLogout: () => void;
}

const avatarOptions = [
  { id: 'child-1', emoji: '😊', name: 'Happy Kid' },
  { id: 'child-2', emoji: '🌟', name: 'Star Child' },
  { id: 'child-3', emoji: '🦄', name: 'Unicorn' },
  { id: 'child-4', emoji: '🎈', name: 'Balloon' },
  { id: 'child-5', emoji: '🚀', name: 'Rocket' },
  { id: 'child-6', emoji: '🎨', name: 'Artist' },
  { id: 'child-7', emoji: '⚽', name: 'Soccer' },
  { id: 'child-8', emoji: '🎵', name: 'Music' },
];

const ChildDashboardContainer: React.FC<ChildDashboardContainerProps> = ({ childData, onLogout }) => {
  const avatar = avatarOptions.find(a => a.id === childData.avatar_selection) || avatarOptions[0];

  // Create a mock household object for the ChildrenDashboard
  const selectedHousehold = {
    id: childData.household_id
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950/30 dark:via-pink-950/30 dark:to-blue-950/30">
      {/* Child-friendly top bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-purple-200 dark:border-purple-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center text-2xl">
                {avatar.emoji}
              </div>
              <div>
                <h1 className="text-lg font-bold text-purple-600">Hi {childData.child_name}!</h1>
                <p className="text-xs text-muted-foreground">Your Family Dashboard</p>
              </div>
            </div>
            
            <Button
              variant="outline"
              onClick={onLogout}
              className="text-purple-600 hover:text-purple-700 border-purple-200 hover:border-purple-300"
            >
              <LogOut size={16} className="mr-2" />
              Switch User
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ChildrenDashboard selectedHousehold={selectedHousehold} />
      </div>
    </div>
  );
};

export default ChildDashboardContainer;
