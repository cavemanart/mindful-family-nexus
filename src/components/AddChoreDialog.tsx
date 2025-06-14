
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calendar } from 'lucide-react';
import { useChildren } from '@/hooks/useChildren';
import { useChores } from '@/hooks/useChores';
import { useToast } from '@/hooks/use-toast';

interface AddChoreDialogProps {
  householdId: string;
  trigger?: React.ReactNode;
}

const AddChoreDialog: React.FC<AddChoreDialogProps> = ({ householdId, trigger }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    points: 10,
    due_date: '',
    assigned_to: ''
  });

  const { children, loading: childrenLoading } = useChildren(householdId);
  const { addChore } = useChores(householdId);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.assigned_to) {
      toast({
        title: "Missing Information",
        description: "Please fill in the title and assign to a child",
        variant: "destructive"
      });
      return;
    }

    const success = await addChore({
      title: formData.title,
      description: formData.description,
      points: formData.points,
      due_date: formData.due_date,
      assigned_to: formData.assigned_to,
      completed: false
    });

    if (success) {
      setFormData({
        title: '',
        description: '',
        points: 10,
        due_date: '',
        assigned_to: ''
      });
      setOpen(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Set default due date to tomorrow
  React.useEffect(() => {
    if (!formData.due_date) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setFormData(prev => ({ ...prev, due_date: tomorrow.toISOString().split('T')[0] }));
    }
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="w-full">
            <Calendar className="h-4 w-4 mr-2" />
            Assign Chore
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign New Chore</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Chore Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Clean your room"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Any specific instructions..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="points">Points</Label>
              <Input
                id="points"
                type="number"
                min="1"
                max="100"
                value={formData.points}
                onChange={(e) => handleInputChange('points', parseInt(e.target.value) || 10)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => handleInputChange('due_date', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assigned_to">Assign To</Label>
            <Select
              value={formData.assigned_to}
              onValueChange={(value) => handleInputChange('assigned_to', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a child" />
              </SelectTrigger>
              <SelectContent>
                {childrenLoading ? (
                  <SelectItem value="loading" disabled>Loading children...</SelectItem>
                ) : children.length === 0 ? (
                  <SelectItem value="no-children" disabled>No children added yet</SelectItem>
                ) : (
                  children.map((child) => (
                    <SelectItem key={child.id} value={`${child.first_name} ${child.last_name}`}>
                      {child.first_name} {child.last_name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={childrenLoading || children.length === 0}>
              Assign Chore
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddChoreDialog;
