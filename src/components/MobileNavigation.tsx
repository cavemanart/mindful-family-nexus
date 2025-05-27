
import React from 'react';
import { 
  Home, 
  Heart, 
  Receipt, 
  MessageSquare, 
  Brain, 
  Baby, 
  Users, 
  Calendar 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ activeTab, setActiveTab }) => {
  const navigationItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'appreciations', label: 'Love', icon: Heart },
    { id: 'bills', label: 'Bills', icon: Receipt },
    { id: 'notes', label: 'Notes', icon: MessageSquare },
    { id: 'children', label: 'Kids', icon: Users },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t md:hidden">
        <div className="flex items-center justify-around py-2">
          {navigationItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center space-y-1 h-auto py-2 px-3 ${
                activeTab === item.id 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <item.icon size={20} />
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          ))}
        </div>
      </nav>

      {/* Desktop Side Navigation */}
      <nav className="hidden md:block fixed left-4 top-1/2 -translate-y-1/2 z-40">
        <div className="flex flex-col space-y-2 bg-background/95 backdrop-blur rounded-lg border p-2">
          {[
            ...navigationItems,
            { id: 'mental-load', label: 'Mental Load', icon: Brain },
            { id: 'nanny-mode', label: 'Nanny', icon: Baby },
            { id: 'weekly-sync', label: 'Sync', icon: Calendar },
          ].map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab(item.id)}
              className={`justify-start w-32 ${
                activeTab === item.id 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <item.icon size={16} className="mr-2" />
              <span className="text-sm">{item.label}</span>
            </Button>
          ))}
        </div>
      </nav>
    </>
  );
};

export default MobileNavigation;
