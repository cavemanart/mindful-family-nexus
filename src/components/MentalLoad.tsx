
import React, { useState } from 'react';
import { Brain, Plus, Clock, User, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

const MentalLoad = () => {
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

  const familyMembers = ['Mom', 'Dad', 'Emma', 'Jack'];
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Healthcare': 'bg-blue-100 text-blue-800',
      'Education': 'bg-purple-100 text-purple-800',
      'Events': 'bg-pink-100 text-pink-800',
      'Household': 'bg-green-100 text-green-800',
      'Finance': 'bg-yellow-100 text-yellow-800',
      'Social': 'bg-orange-100 text-orange-800',
      'Other': 'bg-gray-100 text-gray-800',
    };
    return colors[category] || colors['Other'];
  };

  const activeItems = items.filter(item => !item.isCompleted);
  const completedItems = items.filter(item => item.isCompleted);

  const getItemsByAssignee = (assignee: string) => {
    return activeItems.filter(item => item.assignedTo === assignee);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Brain className="text-purple-500" size={28} />
            Mental Load Sharing
          </h2>
          <p className="text-gray-600 mt-1">Share the invisible work and mental tasks</p>
        </div>
        <Button 
          onClick={() => setIsAddingItem(true)} 
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus size={16} className="mr-2" />
          Share Mental Load
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {familyMembers.slice(0, 2).map((member) => {
          const memberItems = getItemsByAssignee(member);
          const highPriorityCount = memberItems.filter(item => item.priority === 'high').length;
          
          return (
            <Card key={member}>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600">{member}</p>
                  <p className="text-2xl font-bold text-gray-900">{memberItems.length}</p>
                  <p className="text-xs text-gray-500">
                    {highPriorityCount > 0 && `${highPriorityCount} high priority`}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {isAddingItem && (
        <Card className="border-2 border-dashed border-purple-300 bg-gradient-to-r from-purple-50 to-blue-50">
          <CardHeader>
            <CardTitle className="text-purple-800">Share a Mental Load Item</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">What needs to be done?</label>
              <Input
                placeholder="e.g., Schedule doctor appointment"
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Details</label>
              <Textarea
                placeholder="Provide more context about this task..."
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
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
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Priority</label>
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
                <label className="text-sm font-medium text-gray-700 mb-2 block">Assign To</label>
                <Select value={newItem.assignedTo} onValueChange={(value) => 
                  setNewItem({ ...newItem, assignedTo: value })
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Who should handle this?" />
                  </SelectTrigger>
                  <SelectContent>
                    {familyMembers.map((member) => (
                      <SelectItem key={member} value={member}>{member}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Due Date (Optional)</label>
              <Input
                type="date"
                value={newItem.dueDate}
                onChange={(e) => setNewItem({ ...newItem, dueDate: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={addItem} className="bg-purple-600 hover:bg-purple-700">
                <Brain size={16} className="mr-2" />
                Share Item
              </Button>
              <Button variant="outline" onClick={() => setIsAddingItem(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Items ({activeItems.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedItems.length})</TabsTrigger>
          <TabsTrigger value="by-person">By Person</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeItems.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <Badge className={getPriorityColor(item.priority)} variant="outline">
                        {item.priority}
                      </Badge>
                      <Badge className={getCategoryColor(item.category)} variant="secondary">
                        {item.category}
                      </Badge>
                    </div>
                    <p className="text-gray-700 mb-3">{item.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <User size={14} />
                        <span>Assigned to {item.assignedTo}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>Shared by {item.sharedBy}</span>
                      </div>
                      {item.dueDate && (
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          <span>Due {item.dueDate.toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => toggleCompleted(item.id)}
                    size="sm"
                    className="ml-4 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle size={16} className="mr-2" />
                    Complete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {activeItems.length === 0 && (
            <div className="text-center py-12">
              <Brain size={48} className="text-purple-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No active mental load items!</p>
              <p className="text-gray-400 text-sm mt-2">Great job staying on top of everything.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedItems.map((item) => (
            <Card key={item.id} className="bg-green-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle className="text-green-600" size={20} />
                      <h4 className="font-semibold text-gray-900 line-through">{item.title}</h4>
                      <Badge className={getCategoryColor(item.category)} variant="secondary">
                        {item.category}
                      </Badge>
                    </div>
                    <p className="text-gray-700 mb-3">{item.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Completed by {item.assignedTo}</span>
                      <span>Shared by {item.sharedBy}</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => toggleCompleted(item.id)}
                    variant="outline"
                    size="sm"
                    className="ml-4 border-green-600 text-green-600 hover:bg-green-100"
                  >
                    Undo
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {completedItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No completed items yet.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="by-person" className="space-y-6">
          {familyMembers.slice(0, 2).map((member) => {
            const memberItems = getItemsByAssignee(member);
            return (
              <Card key={member}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User size={20} />
                    {member} ({memberItems.length} items)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {memberItems.length > 0 ? (
                    memberItems.map((item) => (
                      <div key={item.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium text-gray-900">{item.title}</h5>
                            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                            <div className="flex gap-2 mt-2">
                              <Badge className={getPriorityColor(item.priority)} variant="outline">
                                {item.priority}
                              </Badge>
                              <Badge className={getCategoryColor(item.category)} variant="secondary">
                                {item.category}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            onClick={() => toggleCompleted(item.id)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle size={14} className="mr-1" />
                            Done
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No items assigned to {member}</p>
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
