
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Gift, Trash2 } from 'lucide-react';
import { useRewards } from '@/hooks/useRewards';
import RewardEditDialog from './RewardEditDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface RewardsAdminProps {
  householdId: string;
}

export default function RewardsAdmin({ householdId }: RewardsAdminProps) {
  const { rewards, createReward, updateReward, deleteReward, loading } = useRewards(householdId);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    point_cost: '',
    category: 'experience' as string,
    age_restriction: '',
    is_active: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await createReward({
      name: formData.name,
      description: formData.description || null,
      point_cost: parseInt(formData.point_cost),
      category: formData.category,
      age_restriction: formData.age_restriction || null,
      is_active: formData.is_active
    });

    if (success) {
      setIsCreating(false);
      setFormData({
        name: '',
        description: '',
        point_cost: '',
        category: 'experience',
        age_restriction: '',
        is_active: true
      });
    }
  };

  const handleDelete = async (rewardId: string) => {
    await deleteReward(rewardId);
  };

  const createDefaultRewards = async () => {
    const defaultRewards = [
      { name: 'Extra Screen Time', description: '30 minutes of extra screen time', point_cost: 25, category: 'privilege', is_active: true, age_restriction: null },
      { name: 'Choose Family Movie', description: 'Pick the movie for family night', point_cost: 50, category: 'privilege', is_active: true, age_restriction: null },
      { name: 'Special Treat', description: 'Ice cream or special snack', point_cost: 30, category: 'treat', is_active: true, age_restriction: null },
      { name: 'Stay Up Late', description: '30 minutes past bedtime on weekend', point_cost: 40, category: 'privilege', is_active: true, age_restriction: null },
      { name: 'Friend Playdate', description: 'Invite a friend over to play', point_cost: 75, category: 'experience', is_active: true, age_restriction: null },
      { name: 'Small Toy', description: 'Choose a small toy under $10', point_cost: 100, category: 'toy', is_active: true, age_restriction: null },
    ];

    for (const reward of defaultRewards) {
      await createReward(reward);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'experience': return 'bg-purple-100 text-purple-800';
      case 'treat': return 'bg-pink-100 text-pink-800';
      case 'toy': return 'bg-blue-100 text-blue-800';
      case 'privilege': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading rewards...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Rewards Management</h2>
          <p className="text-muted-foreground">Create and manage rewards for your family</p>
        </div>
        <div className="flex gap-2">
          {rewards.length === 0 && (
            <Button onClick={createDefaultRewards} variant="outline">
              Add Default Rewards
            </Button>
          )}
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Reward
          </Button>
        </div>
      </div>

      {/* Create Reward Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Reward</CardTitle>
            <CardDescription>Add a new reward to your family's catalog</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Reward Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Extra Screen Time"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Point Cost</label>
                  <Input
                    type="number"
                    value={formData.point_cost}
                    onChange={(e) => setFormData(prev => ({ ...prev, point_cost: e.target.value }))}
                    placeholder="25"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the reward..."
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
                <Button type="submit">Create Reward</Button>
                <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Rewards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rewards.map((reward) => (
          <Card key={reward.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{reward.name}</CardTitle>
                <Badge className={getCategoryColor(reward.category)}>
                  {reward.category}
                </Badge>
              </div>
              {reward.description && (
                <CardDescription>{reward.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Gift className="h-3 w-3" />
                    {reward.point_cost} points
                  </Badge>
                  {reward.age_restriction && (
                    <span className="text-xs text-muted-foreground">
                      Ages: {reward.age_restriction}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <RewardEditDialog 
                    reward={reward} 
                    onUpdate={(data) => updateReward(reward.id, data)}
                  />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Reward</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{reward.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(reward.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {rewards.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Rewards Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create rewards for your children to redeem with their earned points.
            </p>
            <Button onClick={createDefaultRewards}>
              Add Default Rewards
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
