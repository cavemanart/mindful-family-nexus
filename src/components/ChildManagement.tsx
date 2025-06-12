
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useChildrenManagement } from '@/hooks/useChildrenManagement';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Edit, Plus, Users, Baby } from 'lucide-react';
import { toast } from 'sonner';

interface ChildManagementProps {
  selectedHousehold: {
    id: string;
    name: string;
    role: string;
  };
}

const ChildManagement: React.FC<ChildManagementProps> = ({ selectedHousehold }) => {
  const { userProfile } = useAuth();
  const { children, loading, createChild, updateChild, deleteChild } = useChildrenManagement(selectedHousehold.id);
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [pin, setPin] = useState('');
  const [avatarSelection, setAvatarSelection] = useState('child-1');

  const avatarOptions = [
    { value: 'child-1', label: '👶 Baby', emoji: '👶' },
    { value: 'child-2', label: '👧 Girl', emoji: '👧' },
    { value: 'child-3', label: '👦 Boy', emoji: '👦' },
    { value: 'child-4', label: '🧒 Child', emoji: '🧒' },
    { value: 'child-5', label: '👨‍🦱 Teen Boy', emoji: '👨‍🦱' },
    { value: 'child-6', label: '👩‍🦱 Teen Girl', emoji: '👩‍🦱' },
  ];

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setPin('');
    setAvatarSelection('child-1');
    setEditingChild(null);
  };

  const handleCreateChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile?.id) {
      toast.error('User profile not found. Please refresh and try again.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createChild({
        firstName,
        lastName,
        pin,
        avatarSelection,
        parentId: userProfile.id,
        householdId: selectedHousehold.id
      });

      resetForm();
      setIsCreateDialogOpen(false);
      toast.success(`${firstName} has been added to your family! 🎉`);
    } catch (error: any) {
      console.error('Error creating child:', error);
      toast.error(error.message || 'Failed to create child account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChild) return;

    setIsSubmitting(true);
    try {
      await updateChild(editingChild.id, {
        firstName,
        lastName,
        pin: pin || undefined, // Only update PIN if provided
        avatarSelection
      });

      resetForm();
      setIsEditDialogOpen(false);
      toast.success(`${firstName}'s profile has been updated! ✨`);
    } catch (error: any) {
      console.error('Error updating child:', error);
      toast.error(error.message || 'Failed to update child account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteChild = async (childId: string, childName: string) => {
    if (!confirm(`Are you sure you want to remove ${childName} from your household? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteChild(childId);
      toast.success(`${childName} has been removed from your household.`);
    } catch (error: any) {
      console.error('Error deleting child:', error);
      toast.error(error.message || 'Failed to delete child account');
    }
  };

  const openEditDialog = (child: any) => {
    setEditingChild(child);
    setFirstName(child.first_name);
    setLastName(child.last_name);
    setAvatarSelection(child.avatar_selection);
    setPin(''); // Don't pre-fill PIN for security
    setIsEditDialogOpen(true);
  };

  const getAvatarEmoji = (selection: string) => {
    return avatarOptions.find(option => option.value === selection)?.emoji || '👶';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Baby className="h-8 w-8 animate-pulse mx-auto mb-2 text-blue-500" />
          <p className="text-sm text-muted-foreground">Loading children...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Children in {selectedHousehold.name}</h3>
          <p className="text-sm text-muted-foreground">
            {children.length === 0 ? 'No children added yet' : `${children.length} child${children.length === 1 ? '' : 'ren'} in your household`}
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Child
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Child</DialogTitle>
              <DialogDescription>
                Create a child account with PIN access for your household.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateChild}>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Child's first name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Child's last name"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pin">PIN (4 digits)</Label>
                  <Input
                    id="pin"
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="0000"
                    maxLength={4}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    This PIN will be used for the child to access their account
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avatar">Avatar</Label>
                  <Select value={avatarSelection} onValueChange={setAvatarSelection}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {avatarOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <span className="flex items-center gap-2">
                            <span>{option.emoji}</span>
                            <span>{option.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Child Account'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Children List */}
      {children.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No children added yet</h3>
            <p className="text-sm text-muted-foreground mb-4 text-center">
              Add your first child to get started with family management features.
            </p>
            <Button onClick={() => {resetForm(); setIsCreateDialogOpen(true);}}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Child
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {children.map((child) => (
            <Card key={child.id}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="text-2xl">
                      {getAvatarEmoji(child.avatar_selection)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{child.first_name} {child.last_name}</h4>
                    <p className="text-sm text-muted-foreground">Child Account</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(child)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteChild(child.id, child.first_name)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Child Profile</DialogTitle>
            <DialogDescription>
              Update {editingChild?.first_name}'s information.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditChild}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editFirstName">First Name</Label>
                  <Input
                    id="editFirstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editLastName">Last Name</Label>
                  <Input
                    id="editLastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editPin">New PIN (optional)</Label>
                <Input
                  id="editPin"
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="Leave blank to keep current PIN"
                  maxLength={4}
                />
                <p className="text-xs text-muted-foreground">
                  Only enter a new PIN if you want to change it
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editAvatar">Avatar</Label>
                <Select value={avatarSelection} onValueChange={setAvatarSelection}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {avatarOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <span className="flex items-center gap-2">
                          <span>{option.emoji}</span>
                          <span>{option.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update Profile'}
              </Button>
            </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChildManagement;
