
import React, { useState } from 'react';
import { Home, Calendar, DollarSign, StickyNote, Users, CheckSquare, Star, Baby, Shield, Brain, MoreHorizontal, Trophy, Target } from 'lucide-react';
import { usePagePreferences } from '@/hooks/usePagePreferences';
import { useAuth } from '@/hooks/useAuth';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface CleanMobileNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function CleanMobileNavigation({ activeTab, setActiveTab }: CleanMobileNavigationProps) {
  const { preferences } = usePagePreferences();
  const { userProfile } = useAuth();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const isChild = userProfile?.is_child_account;

  const isVisible = (pageKey: string) => {
    const pref = preferences.find(p => p.page_key === pageKey);
    return pref?.is_visible !== false;
  };

  // Primary navigation items (shown in bottom bar)
  const primaryItems = [
    { id: 'overview', icon: Home, label: 'Home', visible: true },
    { id: 'chores', icon: CheckSquare, label: 'Chores', visible: true },
    { id: 'calendar', icon: Calendar, label: 'Calendar', visible: isVisible('calendar') },
    { id: 'children', icon: Users, label: isChild ? 'My Goals' : 'Kids', visible: isVisible('children') },
  ];

  // Secondary navigation items (shown in "More" menu) - completely filter out parent-only pages for children
  const secondaryItems = [
    { id: 'bills', icon: DollarSign, label: 'Bills', visible: isVisible('bills') && !isChild, parentOnly: true },
    { id: 'notes', icon: StickyNote, label: 'Notes', visible: isVisible('notes') },
    { id: 'mvp', icon: Trophy, label: 'MVP', visible: isVisible('mvp') },
    { id: 'weekly-sync', icon: Target, label: 'Weekly Sync', visible: isVisible('weekly-sync') && !isChild, parentOnly: true },
    { id: 'mental-load', icon: Brain, label: 'Mental Load', visible: isVisible('mental-load') && !isChild, parentOnly: true },
    { id: 'nanny-mode', icon: Baby, label: 'Nanny Mode', visible: isVisible('nanny-mode') && !isChild, parentOnly: true },
    { id: 'subscription', icon: Star, label: 'Subscription', visible: !isChild, parentOnly: true },
  ];

  // For children, completely filter out parent-only items
  const visiblePrimaryItems = primaryItems.filter(item => item.visible);
  const visibleSecondaryItems = isChild 
    ? secondaryItems.filter(item => item.visible && !item.parentOnly)
    : secondaryItems.filter(item => item.visible);

  const handleTabChange = (tab: string) => {
    console.log('📱 Mobile Navigation: Tab change from', activeTab, 'to', tab);
    setActiveTab(tab);
    setIsMoreMenuOpen(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {/* Primary Navigation Items */}
        {visiblePrimaryItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => handleTabChange(id)}
            className={`flex flex-col items-center justify-center h-full px-2 py-1 transition-colors ${
              activeTab === id
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}

        {/* More Menu - only show if there are secondary items */}
        {visibleSecondaryItems.length > 0 && (
          <Sheet open={isMoreMenuOpen} onOpenChange={setIsMoreMenuOpen}>
            <SheetTrigger asChild>
              <button
                className={`flex flex-col items-center justify-center h-full px-2 py-1 transition-colors ${
                  visibleSecondaryItems.some(item => item.id === activeTab)
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <MoreHorizontal className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">More</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-auto">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">More Options</h3>
              </div>
              <div className="grid grid-cols-2 gap-3 pb-4">
                {visibleSecondaryItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id)}
                      className={`flex items-center gap-3 p-4 rounded-lg text-left transition-all duration-200 ${
                        activeTab === item.id
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
        )}
      </div>
    </div>
  );
}
