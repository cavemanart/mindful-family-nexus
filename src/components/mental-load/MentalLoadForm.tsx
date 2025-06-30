
import React from 'react';
import { Plus, Brain, Loader2 } from 'lucide-react';
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
  isSubmitting?: boolean;
}

const MentalLoadForm: React.FC<MentalLoadFormProps> = ({
  isVisible,
  onToggle,
  newItem,
  onItemChange,
  onSubmit,
  assignableMembers,
  categories,
  isSubmitting = false
}) => {
  if (!isVisible) {
    return (
      <Button 
        onClick={onToggle} 
        className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700"
        size="sm"
        disabled={isSubmitting}
      >
        <Plus size={16} className="mr-2" />
        Share Mental Load
      </Button>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Card className="border-2 border-dashed border-purple-300 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30">
      <CardHeader className="pb-4">
        <CardTitle className="text-purple-800 dark:text-purple-200 text-lg">Share a Mental Load Item</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              What needs to be done? <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="e.g., Schedule doctor appointment"
              value={newItem.title}
              onChange={(e) => onItemChange('title', e.target.value)}
              required
              className={!newItem.title.trim() ? 'border-red-300 focus:border-red-500' : ''}
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
              <label className="text-sm font-medium text-foreground mb-2 block">
                Category <span className="text-red-500">*</span>
              </label>
              <Select 
                value={newItem.category} 
                onValueChange={(value) => onItemChange('category', value)}
                required
              >
                <SelectTrigger className={!newItem.category ? 'border-red-300' : ''}>
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
            <Button 
              type="submit" 
              className="bg-purple-600 hover:bg-purple-700 flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 size={16} className="mr-2 animate-spin" />
              ) : (
                <Brain size={16} className="mr-2" />
              )}
              {isSubmitting ? 'Sharing...' : 'Share Item'}
            </Button>
            <Button 
              variant="outline" 
              onClick={onToggle} 
              className="flex-1"
              type="button"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default MentalLoadForm;
