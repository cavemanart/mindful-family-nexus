
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useChildren } from '@/hooks/useChildren';
import { useChores } from '@/hooks/useChores';

interface EditableChoreDialogProps {
  householdId: string;
  initialData?: any;
  onSubmit: () => void;
  trigger?: React.ReactNode;
}

const EditableChoreDialog: React.FC<EditableChoreDialogProps> = ({ householdId, initialData, onSubmit, trigger }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    points: 10,
    due_date: '',
    assigned_to: '',
    completed: false
  });

  const { children } = useChildren(householdId);
  const { createChore, updateChore } = useChores(householdId);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        points: initialData.points || 10,
        due_date: initialData.due_date || '',
        assigned_to: initialData.assigned_to || '',
        completed: initialData.completed || false
      });
    }
  }, [initialData]);

  const handleSubmit = async () => {
    if (initialData?.id) {
      await updateChore(initialData.id, formData);
    } else {
      await createChore(formData);
    }
    setOpen(false);
    onSubmit();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Chore' : 'Add Chore'}</DialogTitle>
        </DialogHeader>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Title"
        />
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Description"
        />
        <Input
          type="number"
          value={formData.points}
          onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
          placeholder="Points"
        />
        <Input
          type="date"
          value={formData.due_date}
          onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
        />
        <select
          value={formData.assigned_to}
          onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
        >
          <option value="">Assign to...</option>
          {children.map((child: any) => (
            <option key={child.id} value={child.id}>{child.first_name}</option>
          ))}
        </select>
        <Button onClick={handleSubmit}>{initialData ? 'Save Changes' : 'Create Chore'}</Button>
      </DialogContent>
    </Dialog>
  );
};

export default EditableChoreDialog;
