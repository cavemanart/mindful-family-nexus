
import React, { useState } from 'react';
import { Star, CheckCircle, Clock, Loader2, RefreshCw, AlertCircle, Wifi, WifiOff, Trophy, Target, Users, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useChores } from '@/hooks/useChores';
import { useChildren } from '@/hooks/useChildren';
import { useWeeklyData } from '@/hooks/useWeeklyData';
import ChildSelector from './ChildSelector';
import HouseholdJoinCodeCard from "./HouseholdJoinCodeCard";
import EditableChoreDialog from './EditableChoreDialog';
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
} from "@/components/ui/alert-dialog";

interface ChildrenDashboardProps {
  selectedHousehold: { id: string } | null;
}

const ChildrenDashboard = ({ selectedHousehold }: ChildrenDashboardProps) => {
  const { 
    children, 
    loading: childrenLoading, 
    refreshChildren, 
    isRefreshing,
    subscriptionStatus 
  } = useChildren(selectedHousehold?.id, true);

  const {
    chores,
    loading: choresLoading,
    toggleChore,
    deleteChore,
  } = useChores(selectedHousehold?.id || null);

  const {
    goals,
    wins,
    loading: weeklyLoading,
    toggleGoal,
    deleteGoal,
  } = useWeeklyData(selectedHousehold?.id || null);

  const [selectedChild, setSelectedChild] = useState('');
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);

  console.log(`🔍 ChildrenDashboard: Rendering with ${children.length} children for household:`, selectedHousehold?.id);

  // Update selected child when children list changes
  React.useEffect(() => {
    if (children.length > 0 && !selectedChild) {
      console.log('🔍 ChildrenDashboard: Setting selected child to:', children[0].first_name);
      setSelectedChild(children[0].first_name);
    }
  }, [children, selectedChild]);

  // Manual refresh function
  const handleManualRefresh = async () => {
    console.log('🔍 ChildrenDashboard: Manual refresh triggered');
    try {
      await refreshChildren();
      setLastRefreshTime(new Date());
      console.log('✅ ChildrenDashboard: Manual refresh completed');
    } catch (error) {
      console.error('❌ ChildrenDashboard: Manual refresh failed:', error);
    }
  };

  // Get connection status indicator
  const getConnectionStatus = () => {
    switch (subscriptionStatus) {
      case 'SUBSCRIBED':
        return { icon: Wifi, color: 'text-green-500', text: 'Real-time connected' };
      case 'SUBSCRIPTION_ERROR':
        return { icon: WifiOff, color: 'text-red-500', text: 'Real-time error' };
      case 'connecting':
        return { icon: Loader2, color: 'text-yellow-500', text: 'Connecting...' };
      default:
        return { icon: WifiOff, color: 'text-gray-500', text: 'Disconnected' };
    }
  };

  const connectionStatus = getConnectionStatus();

  if (choresLoading || childrenLoading || weeklyLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="animate-spin" size={24} />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  if (!selectedHousehold) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">No Household Selected</h2>
        <p className="text-muted-foreground">Please select a household to view children's dashboard</p>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-xl">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Kids Dashboard 👨‍👩‍👧‍👦
          </h2>
          <p className="text-muted-foreground mb-4">No children in this household yet!</p>
          
          <div className="flex gap-2 justify-center mb-4">
            <Button 
              variant="outline" 
              onClick={handleManualRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>

          <div className="max-w-md mx-auto bg-white/40 dark:bg-gray-900/30 rounded-md shadow-sm p-4 mb-4">
            <strong>How to add children to your household:</strong>
            <ol className="list-decimal list-inside text-sm text-muted-foreground mt-1 space-y-1 text-left">
              <li>Child creates an account at the main sign-up page (role: Child)</li>
              <li>You generate a join code from your Profile → Join Household section</li>
              <li>Child uses "Join Household" from their profile and enters the code</li>
              <li>Child will appear here automatically!</li>
            </ol>
          </div>

          {/* Generate Join Code Section */}
          {selectedHousehold && (
            <div className="mt-6">
              <HouseholdJoinCodeCard householdId={selectedHousehold.id} />
            </div>
          )}

          {/* Connection Status */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-4">
            <connectionStatus.icon className={`h-3 w-3 ${connectionStatus.color} ${subscriptionStatus === 'connecting' ? 'animate-spin' : ''}`} />
            <span>{connectionStatus.text}</span>
          </div>
        </div>
      </div>
    );
  }

  // Get the selected child's data for detailed view
  const selectedChildData = children.find(child => child.first_name === selectedChild);
  
  console.log('🔍 ChildrenDashboard: Selected child data:', selectedChildData);
  console.log('🔍 ChildrenDashboard: All chores:', chores.map(c => ({ title: c.title, assigned_to: c.assigned_to })));

  // Filter data for the selected child using first name only (to match how chores are assigned)
  const childChores = chores.filter(chore => {
    if (!selectedChild) return false;
    
    const assignedTo = chore.assigned_to?.toLowerCase().trim() || '';
    const childFirstName = selectedChild.toLowerCase().trim();
    const isMatch = assignedTo === childFirstName;
    
    console.log('🔍 Chore filtering:', {
      chore: chore.title,
      assigned_to: assignedTo,
      child_name: childFirstName,
      selected_child: selectedChild,
      match: isMatch
    });
    
    return isMatch;
  });

  const childGoals = goals.filter(goal => {
    if (!selectedChild) return false;
    
    const assignedTo = goal.assigned_to?.toLowerCase().trim() || '';
    const childFirstName = selectedChild.toLowerCase().trim();
    const isMatch = assignedTo === childFirstName;
    
    console.log('🔍 Goal filtering:', {
      goal: goal.title,
      assigned_to: assignedTo,
      child_name: childFirstName,
      selected_child: selectedChild,
      match: isMatch
    });
    
    return isMatch;
  });

  console.log('🔍 ChildrenDashboard: Filtered chores for', selectedChild, ':', childChores.length);
  console.log('🔍 ChildrenDashboard: Filtered goals for', selectedChild, ':', childGoals.length);

  // Calculate child's progress
  const completedChores = childChores.filter(chore => chore.completed);
  const totalPoints = completedChores.reduce((sum, chore) => sum + chore.points, 0);
  const completedGoals = childGoals.filter(goal => goal.completed);

  const handleDeleteChore = async (choreId: string) => {
    await deleteChore(choreId);
  };

  const handleDeleteGoal = async (goalId: string) => {
    await deleteGoal(goalId);
  };

  return (
    <div className="space-y-6">
      {/* Header with Child Selector */}
      <div className="text-center py-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-xl">
        <h2 className="text-3xl font-bold text-foreground mb-4">
          Kids Dashboard 👨‍👩‍👧‍👦
        </h2>
        <p className="text-muted-foreground mb-4">Found {children.length} children in this household</p>
        <div className="flex justify-center gap-2 flex-wrap mb-4">
          {children.map((child) => (
            <Button
              key={child.id}
              variant={selectedChild === child.first_name ? "default" : "outline"}
              onClick={() => {
                console.log('🔍 Setting selected child to:', child.first_name);
                setSelectedChild(child.first_name);
              }}
              className={selectedChild === child.first_name ? "bg-purple-600 hover:bg-purple-700" : ""}
            >
              {child.first_name}
              {child.id.startsWith('temp-') && (
                <AlertCircle className="ml-1 h-3 w-3 text-amber-500" />
              )}
            </Button>
          ))}
        </div>
        
        <div className="flex gap-2 justify-center mb-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-3 w-3" />
            )}
            Refresh
          </Button>
        </div>

        {selectedHousehold && (
          <div className="mt-6 max-w-md mx-auto">
            <HouseholdJoinCodeCard householdId={selectedHousehold.id} />
          </div>
        )}
      </div>

      {/* Show selected child info */}
      {selectedChild && (
        <div className="text-center mb-4">
          <h3 className="text-xl font-semibold text-foreground">
            Viewing: {selectedChild}'s Progress
          </h3>
        </div>
      )}

      {/* Child Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-800">Tasks</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">{completedChores.length}/{childChores.length}</p>
            <p className="text-sm text-blue-600">Completed</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="h-5 w-5 text-yellow-600" />
              <span className="font-semibold text-yellow-800">Points</span>
            </div>
            <p className="text-2xl font-bold text-yellow-900">{totalPoints}</p>
            <p className="text-sm text-yellow-600">Total Earned</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Target className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-800">Goals</span>
            </div>
            <p className="text-2xl font-bold text-green-900">{completedGoals.length}/{childGoals.length}</p>
            <p className="text-sm text-green-600">Achieved</p>
          </CardContent>
        </Card>
      </div>

      {/* Child's Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="text-blue-500" size={20} />
            {selectedChild ? `${selectedChild}'s Tasks` : 'Tasks'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {childChores.length === 0 ? (
            <div className="text-center py-6">
              <CheckCircle className="text-gray-300 mx-auto mb-2" size={32} />
              <p className="text-muted-foreground">
                {selectedChild ? `No tasks assigned to ${selectedChild}` : 'No tasks assigned'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {childChores.map((chore) => (
                <div key={chore.id} className={`p-3 rounded-lg border ${
                  chore.completed 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={`font-medium ${
                        chore.completed ? 'text-green-800 line-through' : 'text-gray-900'
                      }`}>
                        {chore.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">{chore.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          Due: {new Date(chore.due_date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star size={12} className="text-yellow-500" />
                          {chore.points} points
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={chore.completed ? "default" : "secondary"}>
                        {chore.completed ? 'Done!' : 'To Do'}
                      </Badge>
                      <EditableChoreDialog
                        householdId={selectedHousehold.id}
                        initialData={chore}
                        onSubmit={() => window.location.reload()}
                        trigger={
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Task</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{chore.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteChore(chore.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Child's Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="text-green-500" size={20} />
            {selectedChild ? `${selectedChild}'s Goals` : 'Goals'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {childGoals.length === 0 ? (
            <div className="text-center py-6">
              <Target className="text-gray-300 mx-auto mb-2" size={32} />
              <p className="text-muted-foreground">
                {selectedChild ? `No goals assigned to ${selectedChild}` : 'No goals assigned'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {childGoals.map((goal) => (
                <div key={goal.id} className={`p-3 rounded-lg border ${
                  goal.completed 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={`font-medium ${
                        goal.completed ? 'text-green-800 line-through' : 'text-gray-900'
                      }`}>
                        {goal.title}
                      </h4>
                      <p className="text-sm text-gray-600">{goal.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={goal.completed ? "default" : "secondary"}>
                        {goal.completed ? 'Achieved!' : 'In Progress'}
                      </Badge>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Goal</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{goal.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteGoal(goal.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Family Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="text-purple-500" size={20} />
            Family Activity This Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                Recent Wins ({wins.length})
              </h4>
              {wins.slice(0, 3).map((win) => (
                <div key={win.id} className="text-sm text-gray-600 mb-1">
                  • {win.title} (by {win.added_by})
                </div>
              ))}
            </div>
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-500" />
                Active Goals ({goals.filter(g => !g.completed).length})
              </h4>
              {goals.filter(g => !g.completed).slice(0, 3).map((goal) => (
                <div key={goal.id} className="text-sm text-gray-600 mb-1">
                  • {goal.title} (for {goal.assigned_to})
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChildrenDashboard;
