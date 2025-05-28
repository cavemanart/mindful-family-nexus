
import React, { useState } from 'react';
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
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useHouseholds, Household } from '@/hooks/useHouseholds';
import { useNavigate } from 'react-router-dom';

interface LeaveHouseholdDialogProps {
  household: Household;
  onLeave?: () => void;
}

const LeaveHouseholdDialog: React.FC<LeaveHouseholdDialogProps> = ({ 
  household, 
  onLeave 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { leaveHousehold } = useHouseholds();
  const navigate = useNavigate();

  const handleLeaveHousehold = async () => {
    setIsLoading(true);
    try {
      const success = await leaveHousehold(household.id);
      if (success && onLeave) {
        onLeave();
        // Navigate to home page after leaving
        navigate('/');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isAdminOrOwner = household.role === 'admin' || household.role === 'owner';

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <LogOut className="mr-2 h-4 w-4" />
          Leave Household
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Leave Household</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Are you sure you want to leave "{household.name}"? This action cannot be undone.
            </p>
            {isAdminOrOwner && (
              <p className="text-orange-600 font-medium">
                ⚠️ As an admin, you can only leave if there is at least one other admin in the household.
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              You will need a new invite code to rejoin this household.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleLeaveHousehold}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? 'Leaving...' : 'Yes, Leave Household'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LeaveHouseholdDialog;
