import React, { useState } from 'react';
import { Home, Trophy, DollarSign, StickyNote, Brain, Baby, Users, Calendar, MoreHorizontal, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface MobileNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ activeTab, setActiveTab }) => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  // Primary navigation items (shown in bottom bar)
  const primaryItems = [
    { key: 'dashboard', label: 'Home', icon: Home },
    { key: 'mvp', label: 'MVP', icon: Trophy },
    { key: 'bills', label: 'Bills', icon: DollarSign },
    { key: 'notes', label: 'Notes', icon: StickyNote },
  ];

  // Secondary navigation items (shown in "More" menu)
  const secondaryItems = [
    { key: 'calendar', label: 'Calendar', icon: Calendar },
    { key: 'mental-load', label: 'Tasks', icon: Brain },
    { key: 'nanny-mode', label: 'Nanny', icon: Baby },
    { key: 'children', label: 'Kids', icon: Users },
    { key: 'weekly-sync', label: 'Goals', icon: Calendar },
  ];

  const allItems = [...primaryItems, ...secondaryItems];

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setIsMoreMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Top Navigation */}
      <div className="hidden md:block fixed left-0 right-0 top-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border shadow-sm z-30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 py-3 overflow-x-auto">
            {allItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    activeTab === item.key
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation - Single Row */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border shadow-lg z-40">
        <div className="grid grid-cols-5 gap-1 p-2">
          {/* Primary Navigation Items */}
          {primaryItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => handleTabChange(item.key)}
                className={`flex flex-col items-center gap-1 p-2 rounded-md transition-all duration-200 ${
                  activeTab === item.key
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon size={18} />
                <span className="text-xs font-medium truncate">{item.label}</span>
              </button>
            );
          })}

          {/* More Menu */}
          <Sheet open={isMoreMenuOpen} onOpenChange={setIsMoreMenuOpen}>
            <SheetTrigger asChild>
              <button
                className={`flex flex-col items-center gap-1 p-2 rounded-md transition-all duration-200 ${
                  secondaryItems.some(item => item.key === activeTab)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <MoreHorizontal size={18} />
                <span className="text-xs font-medium">More</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">More Options</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMoreMenuOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  <X size={16} />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3 pb-4">
                {secondaryItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.key}
                      onClick={() => handleTabChange(item.key)}
                      className={`flex items-center gap-3 p-4 rounded-lg text-left transition-all duration-200 ${
                        activeTab === item.key
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  );
};

export default MobileNavigation;
