
import React, { useState } from 'react';
import { Brain } from 'lucide-react';
import { useChildren } from '@/hooks/useChildren';
import { useAuth } from '@/hooks/useAuth';
import MentalLoadForm from './mental-load/MentalLoadForm';
import MentalLoadStats from './mental-load/MentalLoadStats';
import MentalLoadTabs from './mental-load/MentalLoadTabs';
import { MentalLoadItemType } from './mental-load/MentalLoadItem';

interface MentalLoadProps {
  householdId?: string;
}

const MentalLoad: React.FC<MentalLoadProps> = ({ householdId }) => {
  const { children } = useChildren(householdId);
  const { user } = useAuth();
  
  const [items, setItems] = useState<MentalLoadItemType[]>([
    {
      id: '1',
      title: 'Schedule dentist appointments',
      description: 'Book appointments for both kids - Emma needs a cleaning, Jack needs a checkup',
      category: 'Healthcare',
      priority: 'medium',
      assignedTo: 'Mom',
      sharedBy: 'Dad',
      isCompleted: false,
      dueDate: new Date('2024-01-25'),
      createdAt: new Date('2024-01-10'),
    },
    {
      id: '2',
      title: 'Plan birthday party',
      description: 'Emma\'s 8th birthday is coming up - need to plan guest list, decorations, cake, and activities',
      category: 'Events',
      priority: 'high',
      assignedTo: 'Dad',
      sharedBy: 'Mom',
      isCompleted: false,
      dueDate: new Date('2024-02-15'),
      createdAt: new Date('2024-01-12'),
    },
    {
      id: '3',
      title: 'Research summer camps',
      description: 'Look into day camps for the kids during summer break',
      category: 'Education',
      priority: 'low',
      assignedTo: 'Mom',
      sharedBy: 'Mom',
      isCompleted: true,
      createdAt: new Date('2024-01-08'),
    },
  ]);

  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    assignedTo: '',
    dueDate: '',
  });

  // Get current user name
  const currentUserName = user?.user_metadata?.first_name || 'You';
  
  // Create assignable members list including current user and children
  const familyMembers = children.map(child => `${child.first_name} ${child.last_name || ''}`.trim()).filter(Boolean);
  const assignableMembers = [currentUserName, ...familyMembers].filter(Boolean);
  const categories = ['Healthcare', 'Education', 'Events', 'Household', 'Finance', 'Social', 'Other'];

  const handleItemChange = (field: string, value: string) => {
    setNewItem(prev => ({ ...prev, [field]: value }));
  };

  const addItem = () => {
    if (newItem.title.trim() && newItem.description.trim() && newItem.category) {
      const item: MentalLoadItemType = {
        id: Date.now().toString(),
        title: newItem.title,
        description: newItem.description,
        category: newItem.category,
        priority: newItem.priority,
        assignedTo: newItem.assignedTo || 'Unassigned',
        sharedBy: currentUserName,
        isCompleted: false,
        dueDate: newItem.dueDate ? new Date(newItem.dueDate) : undefined,
        createdAt: new Date(),
      };
      setItems([item, ...items]);
      setNewItem({ title: '', description: '', category: '', priority: 'medium', assignedTo: '', dueDate: '' });
      setIsAddingItem(false);
    }
  };

  const toggleCompleted = (id: string) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, isCompleted: !item.isCompleted } : item
    ));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700';
      case 'low': return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700';
      default: return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Healthcare': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'Education': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      'Events': 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
      'Household': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'Finance': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      'Social': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      'Other': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
    };
    return colors[category] || colors['Other'];
  };

  const activeItems = items.filter(item => !item.isCompleted);
  const completedItems = items.filter(item => item.isCompleted);

  const getItemsByAssignee = (assignee: string) => {
    return activeItems.filter(item => item.assignedTo === assignee);
  };

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex flex-col gap-4 items-start justify-between">
        <div className="w-full">
          <h2 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2 mb-2">
            <Brain className="text-purple-500" size={24} />
            Mental Load Sharing
          </h2>
          <p className="text-muted-foreground text-sm">Share the invisible work and mental tasks</p>
        </div>
        <MentalLoadForm
          isVisible={isAddingItem}
          onToggle={() => setIsAddingItem(!isAddingItem)}
          newItem={newItem}
          onItemChange={handleItemChange}
          onSubmit={addItem}
          assignableMembers={assignableMembers}
          categories={categories}
        />
      </div>

      <MentalLoadStats 
        assignableMembers={assignableMembers}
        getItemsByAssignee={getItemsByAssignee}
      />

      <MentalLoadTabs
        activeItems={activeItems}
        completedItems={completedItems}
        assignableMembers={assignableMembers}
        getItemsByAssignee={getItemsByAssignee}
        onToggleCompleted={toggleCompleted}
        getPriorityColor={getPriorityColor}
        getCategoryColor={getCategoryColor}
      />
    </div>
  );
};

export default MentalLoad;
