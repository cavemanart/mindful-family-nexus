
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, Clock, Gift, Trophy, Users } from 'lucide-react';
import ChoreBoard from './ChoreBoard';
import ApprovalCenter from './ApprovalCenter';
import RewardsShop from './RewardsShop';
import { useChorePoints } from '@/hooks/useChorePoints';
import { useChildren } from '@/hooks/useChildren';
import { useAuth } from '@/hooks/useAuth';

interface ChoreSystemDashboardProps {
  householdId: string;
}

export default function ChoreSystemDashboard({ householdId }: ChoreSystemDashboardProps) {
  const { userProfile } = useAuth();
  const { children } = useChildren(householdId);
  const { getPendingSubmissions, childPoints } = useChorePoints(householdId);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  const pendingCount = getPendingSubmissions().length;
  const isParent = userProfile?.role === 'parent';
  const isChild = userProfile?.is_child_account;

  // If user is a child, find their child ID
  const currentChildId = isChild ? userProfile?.id : selectedChildId;

  const getChildStats = () => {
    return childPoints.reduce((acc, cp) => {
      acc.totalPoints += cp.total_points;
      acc.activeChildren += 1;
      return acc;
    }, { totalPoints: 0, activeChildren: 0 });
  };

  const stats = getChildStats();

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

        {isParent && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingCount}</div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rewards Available</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue={isChild ? "my-chores" : "chores"} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chores" className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            {isChild ? "My Chores" : "Chores"}
          </TabsTrigger>
          <TabsTrigger value="rewards" className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            Rewards
          </TabsTrigger>
          {isParent && (
            <TabsTrigger value="approvals" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Approvals
              {pendingCount > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
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
          <TabsContent value="approvals" className="space-y-4">
            <ApprovalCenter householdId={householdId} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
