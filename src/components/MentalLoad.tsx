import React, { useState } from 'react';
import { Brain, Plus, Clock, User, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useChildren } from '@/hooks/useChildren';

interface MentalLoadItem {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  assignedTo: string;
  sharedBy: string;
  isCompleted: boolean;
  dueDate?: Date;
  createdAt: Date;
}

interface MentalLoadProps {
  householdId?: string;
}

const MentalLoad: React.FC<MentalLoadProps> = ({ householdId }) => {
  const { children } = useChildren(householdId);
  
  const [items, setItems] = useState<MentalLoadItem[]>([
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

  // Get actual family members from children data
  const familyMembers = children.map(child => `${child.first_name} ${child.last_name || ''}`.trim());
  const categories = ['Healthcare', 'Education', 'Events', 'Household', 'Finance', 'Social', 'Other'];

  const addItem = () => {
    if (newItem.title.trim() && newItem.description.trim() && newItem.category && newItem.assignedTo) {
      const item: MentalLoadItem = {
        id: Date.now().toString(),
        title: newItem.title,
        description: newItem.description,
        category: newItem.category,
        priority: newItem.priority,
        assignedTo: newItem.assignedTo,
        sharedBy: 'You',
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

  // ... keep existing code (getPriorityColor, getCategoryColor functions)
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
        <Button 
          onClick={() => setIsAddingItem(true)} 
          className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700"
          size="sm"
        >
          <Plus size={16} className="mr-2" />
          Share Mental Load
        </Button>
      </div>

      {/* Statistics - Mobile optimized grid */}
      <div className="grid grid-cols-2 gap-3">
        {familyMembers.slice(0, 2).map((member) => {
          const memberItems = getItemsByAssignee(member);
          const highPriorityCount = memberItems.filter(item => item.priority === 'high').length;
          
          return (
            <Card key={member} className="p-3">
              <CardContent className="p-0">
                <div className="text-center">
                  <p className="text-xs font-medium text-muted-foreground">{member}</p>
                  <p className="text-lg font-bold text-foreground">{memberItems.length}</p>
                  <p className="text-xs text-muted-foreground">
                    {highPriorityCount > 0 && `${highPriorityCount} high priority`}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {isAddingItem && (
        <Card className="border-2 border-dashed border-purple-300 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30">
          <CardHeader className="pb-4">
            <CardTitle className="text-purple-800 dark:text-purple-200 text-lg">Share a Mental Load Item</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">What needs to be done?</label>
              <Input
                placeholder="e.g., Schedule doctor appointment"
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Details</label>
              <Textarea
                placeholder="Provide more context about this task..."
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Category</label>
                <Select value={newItem.category} onValueChange={(value) => 
                  setNewItem({ ...newItem, category: value })
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Priority</label>
                  <Select value={newItem.priority} onValueChange={(value: 'low' | 'medium' | 'high') => 
                    setNewItem({ ...newItem, priority: value })
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Assign To</label>
                  <Select value={newItem.assignedTo} onValueChange={(value) => 
                    setNewItem({ ...newItem, assignedTo: value })
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Who?" />
                    </SelectTrigger>
                    <SelectContent>
                      {familyMembers.length === 0 ? (
                        <SelectItem value="no-members" disabled>
                          No family members found
                        </SelectItem>
                      ) : (
                        familyMembers.map((member) => (
                          <SelectItem key={member} value={member}>{member}</SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Due Date (Optional)</label>
              <Input
                type="date"
                value={newItem.dueDate}
                onChange={(e) => setNewItem({ ...newItem, dueDate: e.target.value })}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={addItem} className="bg-purple-600 hover:bg-purple-700 flex-1">
                <Brain size={16} className="mr-2" />
                Share Item
              </Button>
              <Button variant="outline" onClick={() => setIsAddingItem(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active" className="text-xs">Active ({activeItems.length})</TabsTrigger>
          <TabsTrigger value="completed" className="text-xs">Done ({completedItems.length})</TabsTrigger>
          <TabsTrigger value="by-person" className="text-xs">By Person</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-3">
          {activeItems.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-start gap-2">
                    <h4 className="font-semibold text-foreground flex-1 min-w-0">{item.title}</h4>
                    <div className="flex flex-wrap gap-1">
                      <Badge className={getPriorityColor(item.priority)} variant="outline">
                        {item.priority}
                      </Badge>
                      <Badge className={getCategoryColor(item.category)} variant="secondary">
                        {item.category}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User size={12} />
                        <span>{item.assignedTo}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>by {item.sharedBy}</span>
                      </div>
                      {item.dueDate && (
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          <span>Due {item.dueDate.toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={() => toggleCompleted(item.id)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                    >
                      <CheckCircle size={14} className="mr-2" />
                      Complete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {activeItems.length === 0 && (
            <div className="text-center py-8">
              <Brain size={48} className="text-purple-300 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">No active mental load items!</p>
              <p className="text-muted-foreground text-sm mt-2">Great job staying on top of everything.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-3">
          {completedItems.map((item) => (
            <Card key={item.id} className="bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-700">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="text-green-600 mt-1 flex-shrink-0" size={20} />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start gap-2 mb-2">
                        <h4 className="font-semibold text-foreground line-through flex-1 min-w-0">{item.title}</h4>
                        <Badge className={getCategoryColor(item.category)} variant="secondary">
                          {item.category}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm mb-2">{item.description}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span>Completed by {item.assignedTo}</span>
                        <span>Shared by {item.sharedBy}</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => toggleCompleted(item.id)}
                      variant="outline"
                      size="sm"
                      className="border-green-600 text-green-600 hover:bg-green-100 dark:hover:bg-green-950/50 flex-shrink-0"
                    >
                      Undo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {completedItems.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-lg">No completed items yet.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="by-person" className="space-y-4">
          {familyMembers.slice(0, 2).map((member) => {
            const memberItems = getItemsByAssignee(member);
            return (
              <Card key={member}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User size={18} />
                    {member} ({memberItems.length} items)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {memberItems.length > 0 ? (
                    memberItems.map((item) => (
                      <div key={item.id} className="p-3 bg-muted rounded-lg">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium text-foreground">{item.title}</h5>
                              <p className="text-sm text-muted-foreground mt-1 break-words">{item.description}</p>
                            </div>
                            <Button
                              onClick={() => toggleCompleted(item.id)}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 flex-shrink-0"
                            >
                              <CheckCircle size={12} className="mr-1" />
                              Done
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge className={getPriorityColor(item.priority)} variant="outline">
                              {item.priority}
                            </Badge>
                            <Badge className={getCategoryColor(item.category)} variant="secondary">
                              {item.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No items assigned to {member}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MentalLoad;
