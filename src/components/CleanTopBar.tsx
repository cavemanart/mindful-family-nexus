
import React, { useState } from 'react';
import { Menu, X, Home, User, Settings, Users, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import HouseholdSelector from './HouseholdSelector';
import CleanUserProfile from './CleanUserProfile';
import { useChildSession } from '@/hooks/useChildSession';
import { Household } from '@/hooks/useHouseholds';

interface CleanTopBarProps {
  user: any;
  households: Household[];
  selectedHousehold: Household | null;
  onHouseholdChange: (householdId: string) => void;
  onSignOut: () => void;
}

const CleanTopBar: React.FC<CleanTopBarProps> = ({ 
  user, 
  households, 
  selectedHousehold, 
  onHouseholdChange, 
  onSignOut 
}) => {
  const { userProfile } = useAuth();
  const { isChildMode } = useChildSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  if (!userProfile) {
    return null;
  }

  // Remove duplicates and ensure unique households
  const uniqueHouseholds = households.filter((household, index, self) => 
    index === self.findIndex(h => h.id === household.id)
  );

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Home className="h-6 w-6 text-primary mr-2" />
            <span className="font-semibold text-lg text-gray-900 dark:text-gray-100">
              {isChildMode ? 'Kids Mode' : 'Family Hub'}
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Household Selector for Desktop */}
            {uniqueHouseholds.length > 1 && (
              <Select onValueChange={onHouseholdChange} value={selectedHousehold?.id || ''}>
                <SelectTrigger className="w-[200px]">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <SelectValue placeholder="Select household" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {uniqueHouseholds.map((household) => (
                    <SelectItem key={household.id} value={household.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{household.name}</span>
                        <span className="text-xs text-gray-500 capitalize">Role: {household.role}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {/* Single household display */}
            {uniqueHouseholds.length === 1 && selectedHousehold && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Users className="h-4 w-4" />
                <span>{selectedHousehold.name}</span>
              </div>
            )}
            
            <CleanUserProfile 
              user={user}
              selectedHousehold={selectedHousehold}
              onSignOut={onSignOut}
            />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="p-2"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4 space-y-4">
            {/* Mobile Household Selector */}
            <div className="px-2">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Household
                </span>
              </div>
              
              {uniqueHouseholds.length > 1 ? (
                <Select onValueChange={onHouseholdChange} value={selectedHousehold?.id || ''}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select household" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueHouseholds.map((household) => (
                      <SelectItem key={household.id} value={household.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{household.name}</span>
                          <span className="text-xs text-gray-500 capitalize">Role: {household.role}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedHousehold?.name || 'No household selected'}
                </div>
              )}
            </div>

            {/* Mobile User Profile */}
            <div className="px-2">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Profile
                </span>
              </div>
              <div onClick={closeMobileMenu}>
                <CleanUserProfile 
                  user={user}
                  selectedHousehold={selectedHousehold}
                  onSignOut={onSignOut}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CleanTopBar;
