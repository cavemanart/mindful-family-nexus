
import React from 'react';
import { Home, Calendar, DollarSign, StickyNote, Users, CheckSquare, Star, Baby, Shield, Brain } from 'lucide-react';
import { usePagePreferences } from '@/hooks/usePagePreferences';

interface CleanMobileNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function CleanMobileNavigation({ activeTab, setActiveTab }: CleanMobileNavigationProps) {
  const { preferences } = usePagePreferences();

  const isVisible = (pageKey: string) => {
    const pref = preferences.find(p => p.page_key === pageKey);
    return pref?.is_visible !== false;
  };

  const navItems = [
    { id: 'overview', icon: Home, label: 'Home', visible: true },
    { id: 'chores', icon: CheckSquare, label: 'Chores', visible: true }, // New chores section
    { id: 'calendar', icon: Calendar, label: 'Calendar', visible: isVisible('calendar') },
    { id: 'children', icon: Users, label: 'Kids', visible: isVisible('children') },
    { id: 'bills', icon: DollarSign, label: 'Bills', visible: isVisible('bills') },
  ];

  const visibleItems = navItems.filter(item => item.visible);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {visibleItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
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
      </div>
    </div>
  );
}
