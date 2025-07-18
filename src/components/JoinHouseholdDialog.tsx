
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useHouseholds } from '@/hooks/useHouseholds';
import { UserPlus, Loader2 } from 'lucide-react';

const JoinHouseholdDialog = () => {
  const [joinCode, setJoinCode] = useState('');
  const [selectedRole, setSelectedRole] = useState('member');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const { joinHousehold } = useHouseholds();

  const handleJoinHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) {
      toast({ title: "Error", description: "Please enter a join code", variant: "destructive" });
      return;
    }

    if (!selectedRole) {
      toast({ title: "Error", description: "Please select your role", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('🔗 Attempting to join household with role:', selectedRole);
      const success = await joinHousehold(joinCode.trim(), selectedRole);
      if (success) {
        toast({ title: "Success!", description: `You have joined the household as ${selectedRole}!` });
        setJoinCode('');
        setSelectedRole('member');
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Join household error:', error);
      toast({ title: "Error", description: "Failed to join household. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <UserPlus className="mr-2 h-4 w-4" />
          Join Household
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join Household</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleJoinHousehold} className="space-y-4">
          <div>
            <Input
              placeholder="Enter Join Code (e.g. Blue-Sun-42)"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              required
              spellCheck={false}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="role-select" className="text-sm font-medium">
              Select your role in this household:
            </label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Choose your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Note: Higher roles may require approval from existing household admins.
            </p>
          </div>

          <div className="text-xs text-muted-foreground">
            Ask a household member for a join code to join their household.
          </div>
          
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4 mr-2" />
                  Joining...
                </>
              ) : (
                'Join Household'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JoinHouseholdDialog;
