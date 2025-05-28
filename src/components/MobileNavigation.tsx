
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
      {/* Desktop Sidebar */}
      <div className="hidden md:block fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 shadow-sm z-30">
        <div className="p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                  activeTab === item.key
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
        <div className="grid grid-cols-4 gap-1 p-2">
          {navigationItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all duration-200 ${
                  activeTab === item.key
                    ? 'bg-gradient-to-t from-blue-500 to-purple-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon size={18} />
                <span className="text-xs font-medium">{item.label}</span>
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
                className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all duration-200 ${
                  activeTab === item.key
                    ? 'bg-gradient-to-t from-blue-500 to-purple-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon size={18} />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default MobileNavigation;
