
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Moon, Sun, LogOut, Users } from "lucide-react";
import { useTheme } from "next-themes";
import { Household } from '@/hooks/useHouseholds';

interface TopBarProps {
  user: any;
  households: Household[];
  selectedHousehold: Household | null;
  onHouseholdChange: (householdId: string) => void;
  onSignOut: () => void;
}

const TopBar: React.FC<TopBarProps> = ({
  user,
  households,
  selectedHousehold,
  onHouseholdChange,
  onSignOut
}) => {
  const { theme, setTheme } = useTheme();

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
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
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
                <div className="flex items-center space-x-3 pb-4 border-b">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>{user?.email?.[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{user.email}</p>
                    <p className="text-xs text-muted-foreground">Family Member</p>
                  </div>
                </div>

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

                <Button variant="outline" onClick={onSignOut} className="w-full justify-start">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
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
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>{user?.email?.[0].toUpperCase()}</AvatarFallback>
            </Avatar>
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
