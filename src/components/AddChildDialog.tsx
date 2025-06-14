
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus } from 'lucide-react';
import { useChildren } from '@/hooks/useChildren';

interface AddChildDialogProps {
  householdId: string;
  trigger?: React.ReactNode;
}

const avatarOptions = [
  { value: 'child-1', label: '👶 Baby', emoji: '👶' },
  { value: 'child-2', label: '🧒 Child', emoji: '🧒' },
  { value: 'child-3', label: '👧 Girl', emoji: '👧' },
  { value: 'child-4', label: '👦 Boy', emoji: '👦' },
  { value: 'child-5', label: '🧑 Teen', emoji: '🧑' },
];

const AddChildDialog: React.FC<AddChildDialogProps> = ({ householdId, trigger }) => {
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [pin, setPin] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('child-1');
  
  const { createChild, creating } = useChildren(householdId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName.trim() || !lastName.trim() || !pin.trim()) {
      return;
    }

    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return;
    }

    const success = await createChild({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      pin,
      avatarSelection: selectedAvatar
    });

    if (success) {
      setOpen(false);
      setFirstName('');
      setLastName('');
      setPin('');
      setSelectedAvatar('child-1');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="w-full">
            <UserPlus className="mr-2 h-4 w-4" />
            Add Child
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Child to Family</DialogTitle>
          <DialogDescription>
            Create a child account that can log in with a PIN instead of email.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter first name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter last name"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="pin">4-Digit PIN</Label>
            <Input
              id="pin"
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="1234"
              maxLength={4}
              required
            />
            <p className="text-xs text-muted-foreground">
              This PIN will be used for the child to log in
            </p>
          </div>

          <div className="space-y-2">
            <Label>Choose Avatar</Label>
            <div className="grid grid-cols-5 gap-2">
              {avatarOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedAvatar(option.value)}
                  className={`p-3 rounded-lg border-2 text-2xl transition-colors ${
                    selectedAvatar === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {option.emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={creating || !firstName.trim() || !lastName.trim() || pin.length !== 4}
              className="flex-1"
            >
              {creating ? 'Adding...' : 'Add Child'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddChildDialog;
