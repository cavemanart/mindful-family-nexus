
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useHouseholds } from '@/hooks/useHouseholds';
import { UserPlus, Loader2 } from 'lucide-react';

const JoinHouseholdDialog = () => {
  const [joinCode, setJoinCode] = useState('');
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

    setIsSubmitting(true);
    
    try {
      const success = await joinHousehold(joinCode.trim());
      if (success) {
        toast({ title: "Success!", description: "You have joined the household!" });
        setJoinCode('');
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
