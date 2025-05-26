import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useHouseholds, Household } from '@/hooks/useHouseholds';
import { Plus, Users, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface HouseholdSelectorProps {
  onHouseholdSelect: (household: Household) => void;
}

const HouseholdSelector: React.FC<HouseholdSelectorProps> = ({ onHouseholdSelect }) => {
  const { households, loading, createHousehold, joinHousehold } = useHouseholds();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [householdName, setHouseholdName] = useState('');
  const [householdDescription, setHouseholdDescription] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const { toast } = useToast();

  const handleCreateHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    const household = await createHousehold(householdName, householdDescription);
    if (household) {
      setShowCreateDialog(false);
      setHouseholdName('');
      setHouseholdDescription('');
    }
  };

  const handleJoinHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await joinHousehold(inviteCode);
    if (success) {
      setShowJoinDialog(false);
      setInviteCode('');
    }
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'Copied!',
      description: 'Invite code copied to clipboard',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading households...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Households</h1>
          <p className="text-gray-600">Select a household to continue, or create/join a new one</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {households.map((household) => (
            <Card key={household.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users size={20} />
                  {household.name}
                </CardTitle>
                <CardDescription>{household.description || 'No description'}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Role: {household.role}</span>
                    <button
                      onClick={() => copyInviteCode(household.invite_code)}
                      className="flex items-center gap-1 hover:text-blue-600"
                      title="Copy invite code"
                    >
                      <Copy size={14} />
                      {household.invite_code}
                    </button>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => onHouseholdSelect(household)}
                  >
                    Enter Household
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-4 justify-center">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus size={20} className="mr-2" />
                Create Household
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Household</DialogTitle>
                <DialogDescription>
                  Create a new household and invite family members to join.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateHousehold} className="space-y-4">
                <Input
                  placeholder="Household Name"
                  value={householdName}
                  onChange={(e) => setHouseholdName(e.target.value)}
                  required
                />
                <Input
                  placeholder="Description (optional)"
                  value={householdDescription}
                  onChange={(e) => setHouseholdDescription(e.target.value)}
                />
                <Button type="submit" className="w-full">Create Household</Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">Join Household</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Join Household</DialogTitle>
                <DialogDescription>
                  Enter the invite code you received to join a household.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleJoinHousehold} className="space-y-4">
                <Input
                  placeholder="Invite Code"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  required
                />
                <Button type="submit" className="w-full">Join Household</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default HouseholdSelector;
