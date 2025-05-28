
import React from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Moon, Sun, Users } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Household } from '@/hooks/useHouseholds';
import UserProfile from './UserProfile';

interface TopBarProps {
  user: any;
  households: Household[];
  selectedHousehold: Household | null;
  onHouseholdChange: (householdId: string) => void;
  onSignOut: () => void;
  onHouseholdLeft?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({
  user,
  households,
  selectedHousehold,
  onHouseholdChange,
  onSignOut,
  onHouseholdLeft
}) => {
  const { theme, setTheme } = useTheme();

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

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 px-0 md:hidden">
                <Menu className="h-4 w-4" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col space-y-4 py-4">
                <UserProfile 
                  user={user}
                  selectedHousehold={selectedHousehold}
                  onSignOut={onSignOut}
                  onHouseholdLeft={onHouseholdLeft}
                />

                {/* Household Selector */}
                {households.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Household</label>
                    <Select onValueChange={onHouseholdChange} defaultValue={households[0].id}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select household" />
                      </SelectTrigger>
                      <SelectContent>
                        {households.map((household) => (
                          <SelectItem key={household.id} value={household.id}>
                            {household.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* Desktop User Info */}
          <div className="hidden md:flex items-center space-x-3">
            {households.length > 0 && (
              <Select onValueChange={onHouseholdChange} defaultValue={households[0].id}>
                <SelectTrigger className="w-[160px] h-8">
                  <SelectValue placeholder="Select household" />
                </SelectTrigger>
                <SelectContent>
                  {households.map((household) => (
                    <SelectItem key={household.id} value={household.id}>
                      {household.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <UserProfile 
              user={user}
              selectedHousehold={selectedHousehold}
              onSignOut={onSignOut}
              onHouseholdLeft={onHouseholdLeft}
            />
            <Button variant="outline" size="sm" onClick={onSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
