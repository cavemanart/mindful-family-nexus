
import React, { useState } from 'react';
import { Users, Plus, Edit, Trash2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useChildrenManagement } from '@/hooks/useChildrenManagement';
import { useAuth } from '@/hooks/useAuth';
import { Household } from '@/hooks/useHouseholds';
import { useToast } from '@/hooks/use-toast';

interface ChildManagementProps {
  selectedHousehold: Household;
}

const avatarOptions = [
  { id: 'child-1', emoji: '😊', name: 'Happy Kid' },
  { id: 'child-2', emoji: '🌟', name: 'Star Child' },
  { id: 'child-3', emoji: '🦄', name: 'Unicorn' },
  { id: 'child-4', emoji: '🎈', name: 'Balloon' },
  { id: 'child-5', emoji: '🚀', name: 'Rocket' },
  { id: 'child-6', emoji: '🎨', name: 'Artist' },
  { id: 'child-7', emoji: '⚽', name: 'Soccer' },
  { id: 'child-8', emoji: '🎵', name: 'Music' },
];

const ChildManagement: React.FC<ChildManagementProps> = ({ selectedHousehold }) => {
  const { user, userProfile } = useAuth();
  const { children, loading, createChild, updateChild, deleteChild } = useChildrenManagement(selectedHousehold?.id);
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<any>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    pin: '',
    avatarSelection: 'child-1'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.pin.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    if (formData.pin.length < 4 || formData.pin.length > 6) {
      toast({
        title: "Invalid PIN",
        description: "PIN must be 4-6 digits",
        variant: "destructive"
      });
      return;
    }

    if (!/^\d+$/.test(formData.pin)) {
      toast({
        title: "Invalid PIN",
        description: "PIN must contain only numbers",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingChild) {
        await updateChild(editingChild.id, formData);
      } else {
        await createChild({
          ...formData,
          parentId: user!.id,
          householdId: selectedHousehold.id
        });
      }
      
      setFormData({ firstName: '', lastName: '', pin: '', avatarSelection: 'child-1' });
      setEditingChild(null);
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save child profile",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (child: any) => {
    setEditingChild(child);
    setFormData({
      firstName: child.first_name,
      lastName: child.last_name,
      pin: '', // Don't pre-fill PIN for security
      avatarSelection: child.avatar_selection || 'child-1'
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (childId: string) => {
    if (window.confirm('Are you sure you want to delete this child profile?')) {
      await deleteChild(childId);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="text-purple-500" size={28} />
            Manage Children
          </h2>
          <p className="text-muted-foreground mt-1">Create and manage child accounts with PIN access</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setEditingChild(null);
                setFormData({ firstName: '', lastName: '', pin: '', avatarSelection: 'child-1' });
              }}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus size={16} className="mr-2" />
              Add Child
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingChild ? 'Edit Child' : 'Add New Child'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Enter last name"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="pin">PIN (4-6 digits)</Label>
                <Input
                  id="pin"
                  type="password"
                  value={formData.pin}
                  onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                  placeholder="Enter 4-6 digit PIN"
                  maxLength={6}
                />
              </div>
              
              <div>
                <Label>Choose Avatar</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {avatarOptions.map((avatar) => (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, avatarSelection: avatar.id })}
                      className={`p-3 rounded-lg border-2 text-center transition-colors ${
                        formData.avatarSelection === avatar.id
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30'
                          : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{avatar.emoji}</div>
                      <div className="text-xs text-muted-foreground">{avatar.name}</div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700">
                  {editingChild ? 'Update Child' : 'Create Child'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {children.length === 0 ? (
          <Card className="bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-700">
            <CardContent className="p-8 text-center">
              <User className="text-purple-300 mx-auto mb-4" size={48} />
              <p className="text-muted-foreground text-lg">No children added yet!</p>
              <p className="text-muted-foreground text-sm mt-2">Create child accounts so they can access the family dashboard with a PIN.</p>
            </CardContent>
          </Card>
        ) : (
          children.map((child) => {
            const avatar = avatarOptions.find(a => a.id === child.avatar_selection) || avatarOptions[0];
            return (
              <Card key={child.id} className="border-purple-200 dark:border-purple-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center text-2xl">
                        {avatar.emoji}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {child.first_name} {child.last_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Avatar: {avatar.name} • PIN: Set
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(child)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(child.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChildManagement;
