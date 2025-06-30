import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, StickyNote, Users, Calendar, Baby, Trophy, CheckCircle } from 'lucide-react';
import { usePagePreferences } from '@/hooks/usePagePreferences';
import { useAuth } from '@/hooks/useAuth';
import { useChildren } from '@/hooks/useChildren';
import AddChoreDialog from './AddChoreDialog';

interface QuickActionsProps {
  setActiveSection: (section: string) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ setActiveSection }) => {
  const { getVisiblePages } = usePagePreferences();
  const { userProfile } = useAuth();

  const isChild = userProfile?.is_child_account;

  const actions = [
    {
      key: 'mvp',
      title: 'Nominate MVP',
      description: 'Celebrate family heroes',
      icon: Trophy,
      action: () => setActiveSection('mvp'),
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-gradient-to-br from-yellow-50/50 to-orange-50/50 dark:from-yellow-950/30 dark:to-orange-950/30'
    },
    {
      key: 'bills',
      title: 'Track Bills',
      description: 'Manage family expenses',
      icon: DollarSign,
      action: () => setActiveSection('bills'),
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/30 dark:to-emerald-950/30',
      parentOnly: true
    },
    {
      key: 'notes',
      title: 'Family Notes',
      description: 'Share important reminders',
      icon: StickyNote,
      action: () => setActiveSection('notes'),
      color: 'from-yellow-500 to-amber-500',
      bgColor: 'bg-gradient-to-br from-yellow-50/50 to-amber-50/50 dark:from-yellow-950/30 dark:to-amber-950/30'
    },
    {
      key: 'children',
      title: isChild ? 'My Goals' : 'Kids Dashboard',
      description: isChild ? 'Track my progress' : 'Manage children activities',
      icon: Users,
      action: () => setActiveSection('children'),
      color: 'from-purple-500 to-violet-500',
      bgColor: 'bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-950/30 dark:to-violet-950/30'
    },
    {
      key: 'weekly-sync',
      title: 'Weekly Goals',
      description: 'Plan and track progress',
      icon: Calendar,
      action: () => setActiveSection('weekly-sync'),
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-blue-950/30 dark:to-cyan-950/30',
      parentOnly: true
    },
    {
      key: 'nanny-mode',
      title: 'Nanny Mode',
      description: 'Caregiver information hub',
      icon: Baby,
      action: () => setActiveSection('nanny-mode'),
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-gradient-to-br from-orange-50/50 to-red-50/50 dark:from-orange-950/30 dark:to-red-950/30',
      parentOnly: true
    },
  ];

  // Filter out parent-only actions for children
  const filteredActions = actions.filter(action => !isChild || !action.parentOnly);

  // Filter actions based on user preferences
  const visibleActions = getVisiblePages(filteredActions);

  if (visibleActions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-2">No quick actions available</p>
        <p className="text-sm text-muted-foreground">
          Enable pages in your profile settings to see quick actions here
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {visibleActions.map((action) => {
        const Icon = action.icon;
        return (
          <Card 
            key={action.key}
            className={`${action.bgColor} border-0 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group hover:-translate-y-1 bg-card/50 backdrop-blur-sm`}
            onClick={action.action}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${action.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                  <Icon size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default QuickActions;
