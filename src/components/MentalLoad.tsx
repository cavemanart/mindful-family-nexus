
import React, { useState } from 'react';
import { Brain } from 'lucide-react';
import { useChildren } from '@/hooks/useChildren';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import MentalLoadForm from './mental-load/MentalLoadForm';
import MentalLoadStats from './mental-load/MentalLoadStats';
import MentalLoadTabs from './mental-load/MentalLoadTabs';
import { MentalLoadItemType } from './mental-load/MentalLoadItem';

interface MentalLoadProps {
  householdId: string;
}

const MentalLoad: React.FC<MentalLoadProps> = ({ householdId }) => {
  const { children, loading: childrenLoading } = useChildren(householdId);
  const { user } = useAuth();
  const { toast } = useToast();
  
  console.log('🧠 MentalLoad: Component rendered with:', { householdId, childrenCount: children.length, user: !!user });
  
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    assignedTo: 'unassigned',
    dueDate: '',
  });

  // Get current user name with better fallback handling
  const currentUserName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'You';
  
  // Create assignable members list with proper error handling
  const familyMembers = React.useMemo(() => {
    try {
      if (!children || children.length === 0) {
        console.log('🧠 MentalLoad: No children found');
        return [];
      }
      
      const members = children
        .filter(child => child && child.first_name) // Filter out invalid entries
        .map(child => `${child.first_name} ${child.last_name || ''}`.trim())
        .filter(name => name.length > 0); // Filter out empty names
      
      console.log('🧠 MentalLoad: Family members:', members);
      return members;
    } catch (error) {
      console.error('🧠 MentalLoad: Error processing family members:', error);
      return [];
    }
  }, [children]);

  const assignableMembers = React.useMemo(() => {
    const members = [currentUserName, ...familyMembers].filter(Boolean);
    console.log('🧠 MentalLoad: Assignable members:', members);
    return members;
  }, [currentUserName, familyMembers]);

  const categories = ['Healthcare', 'Education', 'Events', 'Household', 'Finance', 'Social', 'Other'];

  const handleItemChange = (field: string, value: string) => {
    console.log('🧠 MentalLoad: Item field changed:', { field, value });
    setNewItem(prev => ({ ...prev, [field]: value }));
  };

  const addItem = async () => {
    console.log('🧠 MentalLoad: Adding item started', { newItem, householdId });
    
    // Reset any previous errors
    setIsSubmitting(true);

    try {
      // Comprehensive validation
      const validationErrors: string[] = [];
      
      if (!newItem.title || !newItem.title.trim()) {
        validationErrors.push('Title is required');
      }
      
      if (!newItem.category || !newItem.category.trim()) {
        validationErrors.push('Category is required');
      }
      
      if (!householdId) {
        validationErrors.push('Household ID is missing');
      }

      console.log('🧠 MentalLoad: Validation check:', { 
        errors: validationErrors, 
        titleLength: newItem.title?.length || 0,
        categoryLength: newItem.category?.length || 0,
        householdId: !!householdId,
        assignedTo: newItem.assignedTo
      });

      if (validationErrors.length > 0) {
        console.error('🧠 MentalLoad: Validation failed:', validationErrors);
        toast({
          title: "Please fill in required fields",
          description: validationErrors.join(', '),
          variant: "destructive"
        });
        return;
      }

      // Handle assignment - convert "unassigned" to "Unassigned" for display
      const assignedTo = newItem.assignedTo === 'unassigned' ? 'Unassigned' : newItem.assignedTo;

      // Create the item
      const item: MentalLoadItemType = {
        id: `mental_load_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: newItem.title.trim(),
        description: newItem.description.trim() || 'No additional details provided',
        category: newItem.category,
        priority: newItem.priority,
        assignedTo: assignedTo,
        sharedBy: currentUserName,
        isCompleted: false,
        dueDate: newItem.dueDate ? new Date(newItem.dueDate) : undefined,
        createdAt: new Date(),
      };

      console.log('🧠 MentalLoad: Created item object:', item);

      // Add to state
      setItems(prevItems => {
        const updated = [item, ...prevItems];
        console.log('🧠 MentalLoad: Updated items list:', updated.length);
        return updated;
      });
      
      // Reset form
      setNewItem({ 
        title: '', 
        description: '', 
        category: '', 
        priority: 'medium', 
        assignedTo: 'unassigned', 
        dueDate: '' 
      });
      setIsAddingItem(false);

      // Success feedback
      toast({
        title: "Mental load item shared!",
        description: `"${item.title}" has been added to your family's mental load tracker.`,
      });

      console.log('✅ MentalLoad: Item added successfully:', item.id);

    } catch (error) {
      console.error('❌ MentalLoad: Error adding mental load item:', error);
      
      // More detailed error logging
      if (error instanceof Error) {
        console.error('❌ MentalLoad: Error message:', error.message);
        console.error('❌ MentalLoad: Error stack:', error.stack);
      }
      
      toast({
        title: "Failed to add item",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
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

  // Show loading state while children are loading
  if (childrenLoading) {
    return (
      <div className="space-y-4 p-4 md:p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex flex-col gap-4 items-start justify-between">
        <div className="w-full">
          <h2 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2 mb-2">
            <Brain className="text-purple-500" size={24} />
            Mental Load Sharing
          </h2>
          <p className="text-muted-foreground text-sm">Share the invisible work and mental tasks</p>
          {assignableMembers.length === 0 && (
            <p className="text-yellow-600 text-xs mt-1">
              Note: Add family members to assign tasks to them
            </p>
          )}
        </div>
        <MentalLoadForm
          isVisible={isAddingItem}
          onToggle={() => setIsAddingItem(!isAddingItem)}
          newItem={newItem}
          onItemChange={handleItemChange}
          onSubmit={addItem}
          assignableMembers={assignableMembers}
          categories={categories}
          isSubmitting={isSubmitting}
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
