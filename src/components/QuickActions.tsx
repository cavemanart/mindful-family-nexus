
import React from 'react';
import { Heart, Receipt, Brain, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuickActionsProps {
  setActiveSection: (section: string) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ setActiveSection }) => {
  const quickActions = [
    { 
      icon: Heart, 
      label: 'Add Appreciation', 
      color: 'bg-pink-100 text-pink-600 hover:bg-pink-200',
      section: 'appreciations'
    },
    { 
      icon: Receipt, 
      label: 'Track Bill', 
      color: 'bg-green-100 text-green-600 hover:bg-green-200',
      section: 'bills'
    },
    { 
      icon: Brain, 
      label: 'Mental Load', 
      color: 'bg-purple-100 text-purple-600 hover:bg-purple-200',
      section: 'mental-load'
    },
    { 
      icon: Calendar, 
      label: 'Weekly Sync', 
      color: 'bg-blue-100 text-blue-600 hover:bg-blue-200',
      section: 'weekly-sync'
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {quickActions.map((action, index) => (
        <Button
          key={index}
          variant="ghost"
          className={`h-24 flex flex-col gap-2 ${action.color} transition-all duration-200 hover:scale-105`}
          onClick={() => setActiveSection(action.section)}
        >
          <action.icon size={24} />
          <span className="text-sm font-medium">{action.label}</span>
        </Button>
      ))}
    </div>
  );
};

export default QuickActions;
