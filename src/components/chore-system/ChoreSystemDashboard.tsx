
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckSquare, Gift, Trophy, Users, BarChart3 } from 'lucide-react';
import ChoreBoard from './ChoreBoard';
import RewardsShop from './RewardsShop';
import RewardsAdmin from './RewardsAdmin';
import ChildPointsTracker from './ChildPointsTracker';
import AddChoreDialog from './AddChoreDialog';
import { useChorePoints } from '@/hooks/useChorePoints';
import { useChildren } from '@/hooks/useChildren';
import { useRewards } from '@/hooks/useRewards';
import { useAuth } from '@/hooks/useAuth';

interface ChoreSystemDashboardProps {
  householdId: string;
}

export default function ChoreSystemDashboard({ householdId }: ChoreSystemDashboardProps) {
  const { userProfile } = useAuth();
  const { children } = useChildren(householdId);
  const { childPoints } = useChorePoints(householdId);
  const { rewards } = useRewards(householdId);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  const isParent = userProfile?.role === 'parent';
  const isChild = userProfile?.is_child_account;

  // If user is a child, find their child ID
  const currentChildId = isChild ? userProfile?.id : selectedChildId;

  const getChildStats = () => {
    return {
      totalPoints: childPoints.reduce((acc, cp) => acc + cp.total_points, 0),
      activeChildren: children.length,
      rewardsAvailable: rewards.length
    };
  };

  const stats = getChildStats();

  return (
    <div className="space-y-6">
      {/* Header with Add Chore Button for Parents */}
      {isParent && (
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Chore System</h1>
            <p className="text-muted-foreground">Manage chores, track progress, and reward achievements</p>
          </div>
          <AddChoreDialog householdId={householdId} />
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Children</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeChildren}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPoints}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rewards Available</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rewardsAvailable}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue={isChild ? "my-chores" : "chores"} className="w-full">
        <TabsList className={`grid w-full ${isParent ? 'grid-cols-4' : 'grid-cols-2'}`}>
          <TabsTrigger value="chores" className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            {isChild ? "My Chores" : "Chores"}
          </TabsTrigger>
          <TabsTrigger value="rewards" className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            Rewards
          </TabsTrigger>
          {isParent && (
            <>
              <TabsTrigger value="points-tracker" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Points Tracker
              </TabsTrigger>
              <TabsTrigger value="rewards-admin" className="flex items-center gap-2">
                <Gift className="h-4 w-4" />
                Rewards Admin
              </TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="chores" className="space-y-4">
          {/* Child Selector for Parents */}
          {isParent && children.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Select Child</CardTitle>
                <CardDescription>View chores for a specific child</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedChildId(null)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedChildId === null
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    All Children
                  </button>
                  {children.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => setSelectedChildId(child.id)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        selectedChildId === child.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      }`}
                    >
                      {child.first_name}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <ChoreBoard 
            householdId={householdId} 
            childId={currentChildId || undefined}
            isParentView={isParent}
          />
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <RewardsShop 
            householdId={householdId} 
            childId={currentChildId || undefined}
          />
        </TabsContent>

        {isParent && (
          <>
            <TabsContent value="points-tracker" className="space-y-4">
              <ChildPointsTracker householdId={householdId} />
            </TabsContent>
            
            <TabsContent value="rewards-admin" className="space-y-4">
              <RewardsAdmin householdId={householdId} />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
