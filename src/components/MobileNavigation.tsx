
import React from 'react';
import { Home, Heart, DollarSign, StickyNote, Brain, Baby, Users, Calendar } from 'lucide-react';

interface MobileNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ activeTab, setActiveTab }) => {
  const navigationItems = [
    { key: 'dashboard', label: 'Home', icon: Home },
    { key: 'appreciations', label: 'Thanks', icon: Heart },
    { key: 'bills', label: 'Bills', icon: DollarSign },
    { key: 'notes', label: 'Notes', icon: StickyNote },
    { key: 'mental-load', label: 'Tasks', icon: Brain },
    { key: 'nanny-mode', label: 'Nanny', icon: Baby },
    { key: 'children', label: 'Kids', icon: Users },
    { key: 'weekly-sync', label: 'Goals', icon: Calendar },
  ];

  return (
    <>
      {/* Desktop Top Navigation */}
      <div className="hidden md:block fixed left-0 right-0 top-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border shadow-sm z-30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 py-3 overflow-x-auto">
            {navigationItems.map((item) => {
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

      {/* Mobile Bottom Navigation - More Compact */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border shadow-lg z-40">
        <div className="grid grid-cols-4 gap-1 p-2">
          {navigationItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`flex flex-col items-center gap-1 p-2 rounded-md transition-all duration-200 ${
                  activeTab === item.key
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon size={16} />
                <span className="text-xs font-medium truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
        <div className="grid grid-cols-4 gap-1 p-2 pt-0">
          {navigationItems.slice(4).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`flex flex-col items-center gap-1 p-2 rounded-md transition-all duration-200 ${
                  activeTab === item.key
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon size={16} />
                <span className="text-xs font-medium truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default MobileNavigation;
