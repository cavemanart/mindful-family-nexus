import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, Users, Baby } from 'lucide-react';
import { useChildrenManagement } from '@/hooks/useChildrenManagement';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Household } from '@/hooks/useHouseholds';

interface ChildManagementProps {
  selectedHousehold: Household;
}

const avatarOptions = [
  { value: 'bear', label: '🧸 Bear', emoji: '🧸' },
  { value: 'cat', label: '🐱 Cat', emoji: '🐱' },
  { value: 'dog', label: '🐶 Dog', emoji: '🐶' },
  { value: 'rabbit', label: '🐰 Rabbit', emoji: '🐰' },
  { value: 'lion', label: '🦁 Lion', emoji: '🦁' },
  { value: 'elephant', label: '🐘 Elephant', emoji: '🐘' },
  { value: 'penguin', label: '🐧 Penguin', emoji: '🐧' },
  { value: 'owl', label: '🦉 Owl', emoji: '🦉' },
];

const ChildManagement: React.FC<ChildManagementProps> = ({ selectedHousehold }) => {
  const { user } = useAuth();
  const { children, loading, createChild, updateChild, deleteChild, refetch } = useChildrenManagement(selectedHousehold.id);
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    pin: '',
    avatarSelection: 'bear'
  });

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      pin: '',
      avatarSelection: 'bear'
    });
  };

  const handleCreateChild = async () => {
    if (!user || !formData.firstName.trim() || !formData.lastName.trim() || !formData.pin.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.pin.length !== 4 || !/^\d{4}$/.test(formData.pin)) {
      toast.error('PIN must be exactly 4 digits');
      return;
    }

    setIsSubmitting(true);
    try {
      await createChild({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        pin: formData.pin,
        avatarSelection: formData.avatarSelection,
        parentId: user.id,
        householdId: selectedHousehold.id
      });
      
      setIsCreateDialogOpen(false);
      resetForm();
      
      // Force refetch to show the new child immediately
      setTimeout(() => {
        refetch();
      }, 500);
      
    } catch (error: any) {
      toast.error(error.message || 'Failed to create child account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditChild = async () => {
    if (!editingChild || !formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.pin && (formData.pin.length !== 4 || !/^\d{4}$/.test(formData.pin))) {
      toast.error('PIN must be exactly 4 digits');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateChild(editingChild.id, {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        pin: formData.pin || undefined,
        avatarSelection: formData.avatarSelection
      });
      
      setEditingChild(null);
      resetForm();
      
      // Force refetch to show updated data
      setTimeout(() => {
        refetch();
      }, 500);
      
    } catch (error: any) {
      toast.error(error.message || 'Failed to update child account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteChild = async (childId: string) => {
    if (window.confirm('Are you sure you want to delete this child account? This action cannot be undone.')) {
      try {
        await deleteChild(childId);
        // Refetch will be called automatically by the deleteChild function
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete child account');
      }
    }
  };

  const openEditDialog = (child: any) => {
    setEditingChild(child);
    setFormData({
      firstName: child.first_name || '',
      lastName: child.last_name || '',
      pin: '',
      avatarSelection: child.avatar_selection || 'bear'
    });
  };

  const closeEditDialog = () => {
    setEditingChild(null);
    resetForm();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin h-6 w-6 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Baby className="h-5 w-5 text-purple-500" />
          <h3 className="text-lg font-semibold">Children ({children.length})</h3>
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
              <DialogTitle>Create Child Account</DialogTitle>
              <DialogDescription>
                Create a new child account with PIN access for your household.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Enter first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Enter last name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pin">4-Digit PIN *</Label>
                <Input
                  id="pin"
                  type="password"
                  maxLength={4}
                  value={formData.pin}
                  onChange={(e) => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '') })}
                  placeholder="1234"
                />
              </div>
              <div className="space-y-2">
                <Label>Avatar</Label>
                <div className="grid grid-cols-4 gap-2">
                  {avatarOptions.map((avatar) => (
                    <button
                      key={avatar.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, avatarSelection: avatar.value })}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        formData.avatarSelection === avatar.value
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="text-2xl">{avatar.emoji}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateChild} disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Child'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Children List */}
      {children.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Baby className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">No Children Yet</p>
            <p className="text-gray-500 mb-4">
              Create child accounts to give your kids safe access to family features.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {children.map((child) => {
            const avatar = avatarOptions.find(a => a.value === child.avatar_selection) || avatarOptions[0];
            return (
              <Card key={child.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{avatar.emoji}</div>
                      <div>
                        <h4 className="font-medium">{child.first_name} {child.last_name}</h4>
                        <p className="text-sm text-gray-500">Child Account</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(child)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteChild(child.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingChild} onOpenChange={(open) => !open && closeEditDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Child Account</DialogTitle>
            <DialogDescription>
              Update the child's information. Leave PIN blank to keep current PIN.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editFirstName">First Name *</Label>
                <Input
                  id="editFirstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Enter first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editLastName">Last Name *</Label>
                <Input
                  id="editLastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Enter last name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editPin">New 4-Digit PIN (optional)</Label>
              <Input
                id="editPin"
                type="password"
                maxLength={4}
                value={formData.pin}
                onChange={(e) => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '') })}
                placeholder="Leave blank to keep current PIN"
              />
            </div>
            <div className="space-y-2">
              <Label>Avatar</Label>
              <div className="grid grid-cols-4 gap-2">
                {avatarOptions.map((avatar) => (
                  <button
                    key={avatar.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, avatarSelection: avatar.value })}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      formData.avatarSelection === avatar.value
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="text-2xl">{avatar.emoji}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeEditDialog}>
              Cancel
            </Button>
            <Button onClick={handleEditChild} disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Child'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChildManagement;
