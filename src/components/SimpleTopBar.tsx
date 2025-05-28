
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Moon, Sun, Users, Menu, X } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Household } from '@/hooks/useHouseholds';
import CleanUserProfile from './CleanUserProfile';

interface SimpleTopBarProps {
  user: any;
  households: Household[];
  selectedHousehold: Household | null;
  onHouseholdChange: (householdId: string) => void;
  onSignOut: () => void;
}

const SimpleTopBar: React.FC<SimpleTopBarProps> = ({
  user,
  households,
  selectedHousehold,
  onHouseholdChange,
  onSignOut
}) => {
  const { theme, setTheme } = useTheme();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center space-x-3">
          <h1 className="text-lg font-bold text-foreground">
            Family Hub
          </h1>
          {selectedHousehold && (
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <Users size={14} />
              <span>{selectedHousehold.name}</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="h-8 w-8 px-0"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 px-0 md:hidden"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            <span className="sr-only">Toggle menu</span>
          </Button>

          {/* Desktop Controls */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Simple Household Selector */}
            {households.length > 0 && (
              <select 
                className="px-3 py-1 border rounded-md bg-background text-foreground"
                value={selectedHousehold?.id || ''}
                onChange={(e) => onHouseholdChange(e.target.value)}
              >
                {households.map((household) => (
                  <option key={household.id} value={household.id}>
                    {household.name}
                  </option>
                ))}
              </select>
            )}
            
            <CleanUserProfile 
              user={user}
              selectedHousehold={selectedHousehold}
              onSignOut={onSignOut}
            />
            
            <Button variant="outline" size="sm" onClick={onSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden border-t bg-background">
          <div className="p-4 space-y-4">
            {/* Mobile Household Selector */}
            {households.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-1">Household</label>
                <select 
                  className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                  value={selectedHousehold?.id || ''}
                  onChange={(e) => onHouseholdChange(e.target.value)}
                >
                  {households.map((household) => (
                    <option key={household.id} value={household.id}>
                      {household.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {/* Mobile User Info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                {user?.email?.[0].toUpperCase()}
              </div>
              <div>
                <p className="font-medium">{user?.email}</p>
              </div>
            </div>
            
            <Button variant="outline" onClick={onSignOut} className="w-full">
              Sign Out
            </Button>
          </div>
        </div>
      )}

      {/* Mobile menu overlay */}
      {showMobileMenu && (
        <div 
          className="fixed inset-0 z-40 md:hidden" 
          onClick={() => setShowMobileMenu(false)}
        />
      )}
    </header>
  );
};

export default SimpleTopBar;
