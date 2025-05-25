
import React from 'react';
import { Bell, LogOut, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Household } from '@/hooks/useHouseholds';

interface NavigationProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  selectedHousehold?: Household;
  onHouseholdChange?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ 
  activeSection, 
  setActiveSection, 
  selectedHousehold,
  onHouseholdChange 
}) => {
  const { signOut } = useAuth();

  const navigationItems = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'notes', label: 'Notes' },
    { key: 'appreciations', label: 'Appreciations' },
    { key: 'bills', label: 'Bills' },
    { key: 'mental-load', label: 'Mental Load' },
    { key: 'weekly-sync', label: 'Weekly Sync' },
    { key: 'kids', label: 'Kids Dashboard' },
    { key: 'nanny', label: 'Nanny Mode' },
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <h1 
              className="text-xl font-bold text-gray-800 cursor-pointer hover:text-blue-600 transition-colors"
              onClick={() => setActiveSection('dashboard')}
            >
              Family Hub
            </h1>
            {selectedHousehold && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users size={16} />
                <span>{selectedHousehold.name}</span>
              </div>
            )}
            <div className="hidden md:flex space-x-6">
              {navigationItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActiveSection(item.key)}
                  className={`text-sm font-medium transition-colors ${
                    activeSection === item.key
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-gray-600">
              <Bell size={20} />
            </Button>
            {onHouseholdChange && (
              <Button variant="outline" size="sm" onClick={onHouseholdChange}>
                Switch Household
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={signOut} className="text-gray-600">
              <LogOut size={20} />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
