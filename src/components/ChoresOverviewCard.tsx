
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, User } from 'lucide-react';
import { useChores } from '@/hooks/useChores';
import { useChildren } from '@/hooks/useChildren';
import EditableChoreDialog from './EditableChoreDialog';

interface ChoresOverviewCardProps {
  householdId: string;
  onNavigateToChildren: () => void;
}

const ChoresOverviewCard: React.FC<ChoresOverviewCardProps> = ({ 
  householdId, 
  onNavigateToChildren 
}) => {
  const { chores, loading } = useChores(householdId);
  const { children } = useChildren(householdId);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-blue-500" />
            Chores Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Loading chores...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const pendingChores = chores.filter(chore => !chore.completed);
  const completedChores = chores.filter(chore => chore.completed);
  const overduechores = pendingChores.filter(chore => new Date(chore.due_date) < new Date());

  // Group pending chores by child
  const choresByChild = pendingChores.reduce((acc, chore) => {
    if (!acc[chore.assigned_to]) {
      acc[chore.assigned_to] = [];
    }
    acc[chore.assigned_to].push(chore);
    return acc;
  }, {} as Record<string, typeof chores>);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-blue-500" />
          Chores Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-yellow-50 dark:bg-yellow-950/30 p-3 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-yellow-600 dark:text-yellow-400 mb-1">
              <Clock className="h-4 w-4" />
            </div>
            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{pendingChores.length}</div>
            <div className="text-xs text-yellow-600 dark:text-yellow-400">Pending</div>
          </div>
          
          <div className="bg-red-50 dark:bg-red-950/30 p-3 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-red-600 dark:text-red-400 mb-1">
              <Clock className="h-4 w-4" />
            </div>
            <div className="text-2xl font-bold text-red-700 dark:text-red-300">{overduechores.length}</div>
            <div className="text-xs text-red-600 dark:text-red-400">Overdue</div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-green-600 dark:text-green-400 mb-1">
              <CheckCircle className="h-4 w-4" />
            </div>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">{completedChores.length}</div>
            <div className="text-xs text-green-600 dark:text-green-400">Complete</div>
          </div>
        </div>

        {/* Children with pending chores */}
        {Object.keys(choresByChild).length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Children with pending chores:</h4>
            <div className="space-y-1">
              {Object.entries(choresByChild).map(([childName, childChores]) => (
                <div key={childName} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{childName}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {childChores.length} chore{childChores.length !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Editable Chore Cards */}
        {Object.entries(choresByChild).map(([childId, childChores]) => (
          <div key={childId} className="space-y-2">
            <h4 className="text-sm font-medium">
              {children.find(c => c.id === childId)?.first_name || 'Unknown'}'s Chores:
            </h4>
            {childChores.map((chore) => (
              <div
                key={chore.id}
                className="flex items-center justify-between border rounded p-2 bg-white dark:bg-gray-900"
              >
                <div>
                  <p className="font-medium">{chore.title}</p>
                  <p className="text-sm text-muted-foreground">{chore.description}</p>
                </div>
                <div className="flex gap-2">
                  <EditableChoreDialog
                    householdId={householdId}
                    initialData={chore}
                    onSubmit={() => window.location.reload()}
                    trigger={<Button size="sm" variant="outline">Edit</Button>}
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this chore?")) {
                        console.log("Call deleteChore here for ID:", chore.id);
                      }
                    }}
                  >
                    🗑
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ))}

        {/* No chores message */}
        {chores.length === 0 && (
          <div className="text-center py-6">
            <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground mb-2">No chores assigned yet</p>
            <p className="text-sm text-muted-foreground">Start by assigning some chores to your children</p>
          </div>
        )}

        {/* Action button */}
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={onNavigateToChildren}
          disabled={children.length === 0}
        >
          {children.length === 0 ? 'Add children first' : 'View Children Dashboard'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ChoresOverviewCard;
