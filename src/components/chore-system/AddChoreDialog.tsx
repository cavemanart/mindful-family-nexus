
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Calendar, Repeat } from 'lucide-react';
import { useChores } from '@/hooks/useChores';
import { useChildren } from '@/hooks/useChildren';

interface AddChoreDialogProps {
  householdId: string;
}

export default function AddChoreDialog({ householdId }: AddChoreDialogProps) {
  const { createChore } = useChores(householdId);
  const { children } = useChildren(householdId);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    points: 10,
    assigned_to: '',
    due_date: '',
    recurrence_type: 'once',
    recurrence_interval: 1,
    requires_approval: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await createChore({
      title: formData.title,
      description: formData.description,
      points: formData.points,
      assigned_to: formData.assigned_to,
      due_date: formData.due_date,
      completed: false,
      recurrence_type: formData.recurrence_type,
      recurrence_interval: formData.recurrence_interval,
      requires_approval: formData.requires_approval
    });

    if (success) {
      setFormData({
        title: '',
        description: '',
        points: 10,
        assigned_to: '',
        due_date: '',
        recurrence_type: 'once',
        recurrence_interval: 1,
        requires_approval: true
      });
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Chore
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Chore</DialogTitle>
          <DialogDescription>
            Create a new chore and assign it to a family member
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Chore Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Take out trash"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed instructions..."
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="points">Points Reward</Label>
              <Input
                id="points"
                type="number"
                min="1"
                max="100"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 10 })}
              />
            </div>
            
            <div>
              <Label htmlFor="assigned_to">Assign To</Label>
              <Select 
                value={formData.assigned_to} 
                onValueChange={(value) => setFormData({ ...formData, assigned_to: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select child" />
                </SelectTrigger>
                <SelectContent>
                  {children.map((child) => (
                    <SelectItem key={child.id} value={child.first_name}>
                      {child.first_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="due_date" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Due Date
            </Label>
            <Input
              id="due_date"
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="recurrence" className="flex items-center gap-2">
              <Repeat className="h-4 w-4" />
              Recurrence
            </Label>
            <Select 
              value={formData.recurrence_type} 
              onValueChange={(value) => setFormData({ ...formData, recurrence_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="once">Once</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="requires_approval" className="text-sm font-medium">
              Requires Parent Approval
            </Label>
            <Switch
              id="requires_approval"
              checked={formData.requires_approval}
              onCheckedChange={(checked) => setFormData({ ...formData, requires_approval: checked })}
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Chore</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
