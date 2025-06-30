import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Star, MessageCircle, Calendar, Repeat } from 'lucide-react';
import { useChores } from '@/hooks/useChores';
import { useChorePoints } from '@/hooks/useChorePoints';
import ChoreCompletionDialog from './ChoreCompletionDialog';

interface ChoreBoardProps {
  householdId: string;
  childId?: string;
  childName?: string;
  isParentView?: boolean;
}

export default function ChoreBoard({ householdId, childId, childName, isParentView = false }: ChoreBoardProps) {
  const { chores, toggleChore, loading } = useChores(householdId);
  const { addPointsToChild } = useChorePoints(householdId);
  const [completionDialog, setCompletionDialog] = useState<{
    isOpen: boolean;
    chore: any;
  }>({ isOpen: false, chore: null });

  // Filter chores for specific child
  const filteredChores = React.useMemo(() => {
    console.log('ChoreBoard filtering - childId:', childId, 'childName:', childName);
    console.log('All chores:', chores.map(c => ({ id: c.id, title: c.title, assigned_to: c.assigned_to })));
    
    if (!childId && !childName) {
      console.log('No child filter - showing all chores');
      return chores;
    }

    const filtered = chores.filter(chore => {
      const assignedTo = chore.assigned_to?.toLowerCase().trim() || '';
      
      // If we have childName (from parent dashboard), match against it
      if (childName) {
        const nameToMatch = childName.toLowerCase().trim();
        const isMatch = assignedTo === nameToMatch;
        console.log('Checking chore:', chore.title, 'assigned_to:', assignedTo, 'matching against:', nameToMatch, 'match:', isMatch);
        return isMatch;
      }
      
      // If we have childId (from child dashboard), this is more complex since chores store names not IDs
      // For now, return all chores when filtering by ID - this needs to be handled by the parent component
      return true;
    });
    
    console.log('Filtered chores count:', filtered.length);
    return filtered;
  }, [chores, childId, childName]);

  const handleChoreComplete = async (chore: any, comment?: string) => {
    const success = await toggleChore(chore.id);
    
    if (success && !chore.completed && childId) {
      // Award points to the child
      await addPointsToChild(
        childId,
        chore.points,
        'chore_completion',
        `Completed: ${chore.title}${comment ? ` - Comment: ${comment}` : ''}`,
        chore.id
      );
    }
  };

  const openCompletionDialog = (chore: any) => {
    setCompletionDialog({ isOpen: true, chore });
  };

  const closeCompletionDialog = () => {
    setCompletionDialog({ isOpen: false, chore: null });
  };

  const handleDialogComplete = (comment?: string) => {
    if (completionDialog.chore) {
      handleChoreComplete(completionDialog.chore, comment);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // ... keep existing code (getRecurrenceIcon and getRecurrenceText functions)
  const getRecurrenceIcon = (recurrenceType: string) => {
    switch (recurrenceType) {
      case 'daily':
        return <Calendar className="h-3 w-3" />;
      case 'weekly':
        return <Repeat className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getRecurrenceText = (recurrenceType: string) => {
    switch (recurrenceType) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        return 'Weekly';
      default:
        return 'One-time';
    }
  };

  return (
    <div className="space-y-4">
      {filteredChores.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <div className="text-muted-foreground">
              {childName ? `No chores assigned to ${childName} yet!` : 'No chores created yet!'}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredChores.map((chore) => (
            <Card key={chore.id} className={`transition-all hover:shadow-md ${
              chore.completed ? 'bg-green-50 dark:bg-green-950/30 border-green-200' : ''
            }`}>
              <CardHeader>
                <CardTitle className={`text-lg ${
                  chore.completed ? 'text-green-800 dark:text-green-400 line-through' : ''
                }`}>
                  {chore.title}
                  {chore.completed && <CheckCircle className="h-4 w-4 ml-2 inline text-green-600" />}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{chore.description}</p>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Due: {new Date(chore.due_date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    {getRecurrenceIcon(chore.recurrence_type)}
                    {getRecurrenceText(chore.recurrence_type)}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {chore.points} points
                  </Badge>
                  <Badge variant="outline">
                    {chore.assigned_to}
                  </Badge>
                </div>
                
                {!isParentView && !chore.completed && (
                  <Button 
                    onClick={() => openCompletionDialog(chore)}
                    className="w-full"
                    size="sm"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Complete
                  </Button>
                )}
                
                {chore.completed && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    Completed!
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      <ChoreCompletionDialog
        isOpen={completionDialog.isOpen}
        onClose={closeCompletionDialog}
        onComplete={handleDialogComplete}
        choreName={completionDialog.chore?.title || ''}
        points={completionDialog.chore?.points || 0}
      />
    </div>
  );
}
