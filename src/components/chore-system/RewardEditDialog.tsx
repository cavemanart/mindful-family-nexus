
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit } from 'lucide-react';
import { Reward } from '@/hooks/useRewards';

interface RewardEditDialogProps {
  reward: Reward;
  onUpdate: (rewardData: Partial<Reward>) => Promise<boolean>;
}

export default function RewardEditDialog({ reward, onUpdate }: RewardEditDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: reward.name,
    description: reward.description || '',
    point_cost: reward.point_cost.toString(),
    category: reward.category,
    age_restriction: reward.age_restriction || '',
    is_active: reward.is_active
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await onUpdate({
      name: formData.name,
      description: formData.description || null,
      point_cost: parseInt(formData.point_cost),
      category: formData.category,
      age_restriction: formData.age_restriction || null,
      is_active: formData.is_active
    });

    if (success) {
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Edit className="h-3 w-3" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Reward</DialogTitle>
          <DialogDescription>Update the reward details</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Reward Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Point Cost</label>
              <Input
                type="number"
                value={formData.point_cost}
                onChange={(e) => setFormData(prev => ({ ...prev, point_cost: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="experience">Experience</SelectItem>
                  <SelectItem value="treat">Treat</SelectItem>
                  <SelectItem value="toy">Toy</SelectItem>
                  <SelectItem value="privilege">Privilege</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Age Restriction (optional)</label>
              <Input
                value={formData.age_restriction}
                onChange={(e) => setFormData(prev => ({ ...prev, age_restriction: e.target.value }))}
                placeholder="e.g., 8+"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit">Update Reward</Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
