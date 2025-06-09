
import React, { useState } from 'react';
import { Home, Heart, DollarSign, StickyNote, Brain, Baby, Users, Calendar, MoreHorizontal, X, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { usePagePreferences } from '@/hooks/usePagePreferences';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface CleanMobileNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const CleanMobileNavigation: React.FC<CleanMobileNavigationProps> = ({ activeTab, setActiveTab }) => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const { getVisiblePages } = usePagePreferences();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Primary navigation items (shown in bottom bar) - now includes profile
  const primaryItems = [
    { key: 'dashboard', label: 'Home', icon: Home, route: '/' },
    { key: 'appreciations', label: 'Thanks', icon: Heart, route: '/appreciations' },
    { key: 'bills', label: 'Bills', icon: DollarSign, route: '/bills' },
    { key: 'notes', label: 'Notes', icon: StickyNote, route: '/notes' },
    { key: 'profile', label: 'Profile', icon: User, alwaysVisible: true, route: '/profile' },
  ];

  // Secondary navigation items (shown in "More" menu)
  const secondaryItems = [
    { key: 'calendar', label: 'Calendar', icon: Calendar, route: '/calendar' },
    { key: 'mental-load', label: 'Tasks', icon: Brain, route: '/mental-load' },
    { key: 'nanny-mode', label: 'Nanny', icon: Baby, route: '/nanny-mode' },
    { key: 'children', label: 'Kids', icon: Users, route: '/children' },
    { key: 'weekly-sync', label: 'Goals', icon: Calendar, route: '/weekly-sync' },
  ];

  // Filter items based on user preferences (except profile which is always visible)
  const visiblePrimaryItems = primaryItems.filter(item => 
    item.alwaysVisible || getVisiblePages([item]).length > 0
  );
  const visibleSecondaryItems = getVisiblePages(secondaryItems);
  const allVisibleItems = [...visiblePrimaryItems.filter(item => item.key !== 'profile'), ...visibleSecondaryItems];

  const handleTabChange = (tab: string, route: string) => {
    navigate(route);
    setActiveTab(tab);
    setIsMoreMenuOpen(false);
  };

  // Special rendering for profile tab with user avatar
  const renderProfileTab = () => {
    const isActive = activeTab === 'profile';
    return (
      <button
        key="profile"
        onClick={() => handleTabChange('profile', '/profile')}
        className={`flex flex-col items-center gap-1 p-2 rounded-md transition-all duration-200 ${
          isActive
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
        }`}
      >
        <div className={`h-5 w-5 rounded-full flex items-center justify-center text-xs font-medium ${
          isActive 
            ? 'bg-primary-foreground text-primary' 
            : 'bg-blue-600 text-white'
        }`}>
          {user?.email?.[0].toUpperCase() || 'U'}
        </div>
        <span className="text-xs font-medium truncate">Profile</span>
      </button>
    );
  };

  return (
    <>
      {/* Desktop Top Navigation */}
      <div className="hidden md:block fixed left-0 right-0 top-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border shadow-sm z-30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 py-3 overflow-x-auto">
            {allVisibleItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => handleTabChange(item.key, item.route)}
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

      {/* Mobile Bottom Navigation - Now with 5 tabs including profile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border shadow-lg z-40">
        <div className="grid grid-cols-5 gap-1 p-2">
          {/* First 3 primary navigation items */}
          {visiblePrimaryItems.slice(0, 3).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => handleTabChange(item.key, item.route)}
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

          {/* More Menu Button - only show if there are more items */}
          {(visibleSecondaryItems.length > 0 || visiblePrimaryItems.length > 4) && (
            <button
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              className={`flex flex-col items-center gap-1 p-2 rounded-md transition-all duration-200 ${
                visibleSecondaryItems.some(item => item.key === activeTab) || 
                visiblePrimaryItems.slice(4).some(item => item.key === activeTab)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <MoreHorizontal size={18} />
              <span className="text-xs font-medium">More</span>
            </button>
          )}

          {/* Profile Tab - Always visible as the last tab */}
          {renderProfileTab()}
        </div>

        {/* More Menu Overlay */}
        {isMoreMenuOpen && (
          <div className="absolute bottom-full left-0 right-0 bg-background border-t border-border shadow-lg">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
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
              <div className="grid grid-cols-2 gap-3">
                {/* Show remaining primary items first, then secondary items */}
                {[...visiblePrimaryItems.slice(4).filter(item => item.key !== 'profile'), ...visibleSecondaryItems].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.key}
                      onClick={() => handleTabChange(item.key, item.route)}
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
            </div>
          </div>
        )}
      </div>

      {/* Overlay for closing more menu */}
      {isMoreMenuOpen && (
        <div 
          className="fixed inset-0 z-30 md:hidden" 
          onClick={() => setIsMoreMenuOpen(false)}
        />
      )}
    </>
  );
};

export default CleanMobileNavigation;
