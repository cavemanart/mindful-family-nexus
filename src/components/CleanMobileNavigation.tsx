
import React, { useState } from 'react';
import { Home, Trophy, DollarSign, StickyNote, Brain, Baby, Users, Calendar, MoreHorizontal, X, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { usePagePreferences } from '@/hooks/usePagePreferences';
import { useAuth } from '@/hooks/useAuth';

interface CleanMobileNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const CleanMobileNavigation: React.FC<CleanMobileNavigationProps> = ({ activeTab, setActiveTab }) => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const { getVisiblePages } = usePagePreferences();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Primary navigation items (shown in bottom bar) - profile removed from primary items
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
    { key: 'nanny', label: 'Nanny', icon: Baby }, // Changed from 'nanny-mode' to 'nanny'
    { key: 'children', label: 'Kids', icon: Users },
    { key: 'weekly-sync', label: 'Goals', icon: Calendar },
  ];

  // Filter items based on user preferences
  const visiblePrimaryItems = primaryItems.filter(item => 
    getVisiblePages([item]).length > 0
  );
  const visibleSecondaryItems = getVisiblePages(secondaryItems);
  const allVisibleItems = [...visiblePrimaryItems, ...visibleSecondaryItems];

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setIsMoreMenuOpen(false);
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  // Special rendering for profile tab with user avatar
  const renderProfileTab = () => {
    return (
      <button
        key="profile"
        onClick={handleProfileClick}
        className="flex flex-col items-center gap-1 p-2 rounded-md transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-muted"
      >
        <div className="h-5 w-5 rounded-full flex items-center justify-center text-xs font-medium bg-blue-600 text-white">
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

      {/* Mobile Bottom Navigation - Now with 5 tabs including profile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border shadow-lg z-40">
        <div className="grid grid-cols-5 gap-1 p-2">
          {/* First 3 primary navigation items */}
          {visiblePrimaryItems.slice(0, 3).map((item) => {
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

          {/* More Menu Button - only show if there are more items */}
          {(visibleSecondaryItems.length > 0 || visiblePrimaryItems.length > 3) && (
            <button
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              className={`flex flex-col items-center gap-1 p-2 rounded-md transition-all duration-200 ${
                visibleSecondaryItems.some(item => item.key === activeTab) || 
                visiblePrimaryItems.slice(3).some(item => item.key === activeTab)
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
                {[...visiblePrimaryItems.slice(3), ...visibleSecondaryItems].map((item) => {
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
