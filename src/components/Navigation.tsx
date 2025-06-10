
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, ListChecks, MessageSquare, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  selectedHousehold: { id: string } | null;
  userProfile: any;
}

const Navigation = ({ currentPage, onPageChange, selectedHousehold, userProfile }: NavigationProps) => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      roles: ['parent', 'nanny', 'child', 'grandparent'],
      description: 'View household overview'
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: Calendar,
      roles: ['parent', 'nanny', 'child', 'grandparent'],
      description: 'Manage family events'
    },
    {
      id: 'chores',
      label: 'Chores',
      icon: ListChecks,
      roles: ['parent', 'nanny', 'child', 'grandparent'],
      description: 'Assign and track tasks'
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageSquare,
      roles: ['parent', 'nanny', 'child', 'grandparent'],
      description: 'Send family messages'
    },
    {
      id: 'appreciations',
      label: 'Appreciations',
      icon: MessageSquare,
      roles: ['parent', 'nanny', 'child', 'grandparent'],
      description: 'Share love and gratitude'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      roles: ['parent', 'nanny', 'grandparent'],
      description: 'Manage household settings'
    },
  ];

  const filteredNavigationItems = navigationItems.filter(item => {
    if (!selectedHousehold) {
      return false;
    }
    if (!userProfile) {
      return false;
    }
    return item.roles.includes(userProfile.role);
  });

  return (
    <nav className="flex flex-col space-y-4">
      {filteredNavigationItems.map((item) => (
        <Link
          key={item.id}
          to={`/${item.id}`}
          onClick={() => onPageChange(item.id)}
          className={cn(
            "group flex items-center space-x-3 rounded-md p-2 text-sm font-medium hover:bg-secondary hover:text-foreground",
            currentPage === item.id
              ? "bg-secondary text-foreground"
              : "text-muted-foreground"
          )}
        >
          <item.icon className="h-4 w-4" />
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
};

export default Navigation;
