
import React from 'react';
import { Plus, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MentalLoadFormProps {
  isVisible: boolean;
  onToggle: () => void;
  newItem: {
    title: string;
    description: string;
    category: string;
    priority: 'low' | 'medium' | 'high';
    assignedTo: string;
    dueDate: string;
  };
  onItemChange: (field: string, value: string) => void;
  onSubmit: () => void;
  assignableMembers: string[];
  categories: string[];
}

const MentalLoadForm: React.FC<MentalLoadFormProps> = ({
  isVisible,
  onToggle,
  newItem,
  onItemChange,
  onSubmit,
  assignableMembers,
  categories
}) => {
  if (!isVisible) {
    return (
      <Button 
        onClick={onToggle} 
        className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700"
        size="sm"
      >
        <Plus size={16} className="mr-2" />
        Share Mental Load
      </Button>
    );
  }

  return (
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
            onChange={(e) => onItemChange('title', e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Details</label>
          <Textarea
            placeholder="Provide more context about this task..."
            value={newItem.description}
            onChange={(e) => onItemChange('description', e.target.value)}
            rows={3}
          />
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Category</label>
            <Select value={newItem.category} onValueChange={(value) => 
              onItemChange('category', value)
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
                onItemChange('priority', value)
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
              <label className="text-sm font-medium text-foreground mb-2 block">Assign To (Optional)</label>
              <Select value={newItem.assignedTo} onValueChange={(value) => 
                onItemChange('assignedTo', value)
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Leave unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Leave unassigned</SelectItem>
                  {assignableMembers.map((member) => (
                    <SelectItem key={member} value={member}>{member}</SelectItem>
                  ))}
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
            onChange={(e) => onItemChange('dueDate', e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={onSubmit} className="bg-purple-600 hover:bg-purple-700 flex-1">
            <Brain size={16} className="mr-2" />
            Share Item
          </Button>
          <Button variant="outline" onClick={onToggle} className="flex-1">
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MentalLoadForm;
