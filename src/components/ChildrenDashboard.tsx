import React, { useState } from 'react';
import { Star, CheckCircle, Clock, Heart, Loader2, UserPlus, RefreshCw, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useChores } from '@/hooks/useChores';
import { useFamilyMessages } from '@/hooks/useFamilyMessages';
import { useChildren } from '@/hooks/useChildren';
import AddChildDialog from './AddChildDialog';
import AddKidModal from "./AddKidModal";
import ChildSelector from './ChildSelector';
import RewardsCard from './RewardsCard';
import ChoresSection from './ChoresSection';
import MessagesSection from './MessagesSection';

interface ChildrenDashboardProps {
  selectedHousehold: { id: string } | null;
}

const ChildrenDashboard = ({ selectedHousehold }: ChildrenDashboardProps) => {
  // Use allowUnauthenticated for device-child accounts
  const { 
    children, 
    loading: childrenLoading, 
    refreshChildren, 
    isRefreshing,
    subscriptionStatus 
  } = useChildren(selectedHousehold?.id, true /* allow even without parent login */);

  // ADDED HOOKS TO FIX BUILD ERRORS:
  const {
    chores,
    loading: choresLoading,
    toggleChore,
  } = useChores(selectedHousehold?.id || null);

  const {
    messages,
    loading: messagesLoading,
  } = useFamilyMessages(selectedHousehold?.id || null);

  const [selectedChild, setSelectedChild] = useState('');
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  
  const [addKidOpen, setAddKidOpen] = useState(false);

  console.log(`🔍 ChildrenDashboard: Rendering with ${children.length} children for household:`, selectedHousehold?.id);
  console.log('🔍 ChildrenDashboard: Children data:', children.map(c => ({ id: c.id, name: c.first_name })));

  // Update selected child when children list changes
  React.useEffect(() => {
    if (children.length > 0 && !selectedChild) {
      console.log('🔍 ChildrenDashboard: Setting selected child to:', children[0].first_name);
      setSelectedChild(children[0].first_name);
    }
  }, [children, selectedChild]);

  // Handle successful child addition
  const handleChildAdded = async () => {
    console.log('🔍 ChildrenDashboard: Child added, performing force refresh');
    await handleManualRefresh();
  };

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

  // Get the selected child's full name for matching
  const selectedChildData = children.find(child => child.first_name === selectedChild);
  const childFullName = selectedChildData ? `${selectedChildData.first_name} ${selectedChildData.last_name}` : selectedChild;

  const childChores = chores.filter(chore => 
    chore.assigned_to === selectedChild || 
    chore.assigned_to === childFullName ||
    chore.assigned_to.toLowerCase() === selectedChild.toLowerCase()
  );

  const childMessages = messages.filter(message => 
    message.to_member === selectedChild || 
    message.to_member === childFullName ||
    message.to_member === null
  );

  const completedChores = childChores.filter(chore => chore.completed);
  const totalPoints = completedChores.reduce((sum, chore) => sum + chore.points, 0);

  const handleCompleteChore = async (choreId: string) => {
    await toggleChore(choreId);
  };

  const getRewardLevel = (points: number) => {
    if (points >= 50) return { level: 'Super Star', color: 'text-purple-600 dark:text-purple-400', icon: '🌟' };
    if (points >= 30) return { level: 'Champion', color: 'text-blue-600 dark:text-blue-400', icon: '🏆' };
    if (points >= 15) return { level: 'Helper', color: 'text-green-600 dark:text-green-400', icon: '⭐' };
    return { level: 'Getting Started', color: 'text-gray-600 dark:text-gray-400', icon: '👍' };
  };

  const reward = getRewardLevel(totalPoints);

  if (choresLoading || messagesLoading || childrenLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="animate-spin" size={24} />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  if (children.length === 0) {
    console.log('🔍 ChildrenDashboard: No children found, showing empty state');
    return (
      <div className="space-y-6">
        <div className="text-center py-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-xl">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Kid's Dashboard 🎈
          </h2>
          <p className="text-muted-foreground mb-4">No children in this household yet!</p>
          <p className="text-muted-foreground text-sm mb-6">Add children to your household to see their tasks and progress.</p>
          <div className="flex gap-2 justify-center mb-4">
            {selectedHousehold && (
              <>
                <Button
                  className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
                  onClick={() => setAddKidOpen(true)}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Kid
                </Button>
              </>
            )}
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
              Force Refresh
            </Button>
          </div>
          <div className="max-w-md mx-auto bg-white/40 dark:bg-gray-900/30 rounded-md shadow-sm p-4 mb-4">
            <strong>How to add your child:</strong>
            <ol className="list-decimal list-inside text-sm text-muted-foreground mt-1 space-y-1 text-left">
              <li>Click <span className="font-medium">Add Kid</span> below.</li>
              <li>Share the code with your child or enter it on their device on the <span className="font-medium">Join Household</span> page.</li>
              <li>Your child’s profile will appear here the moment they join.</li>
            </ol>
          </div>
          {/* Connection Status */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-4">
            <connectionStatus.icon className={`h-3 w-3 ${connectionStatus.color} ${subscriptionStatus === 'connecting' ? 'animate-spin' : ''}`} />
            <span>{connectionStatus.text}</span>
          </div>
          
          {selectedHousehold && (
            <div className="mt-4 space-y-2 text-xs text-muted-foreground">
              <p>Household ID: {selectedHousehold.id}</p>
              {lastRefreshTime && (
                <p>Last refresh: {lastRefreshTime.toLocaleTimeString()}</p>
              )}
            </div>
          )}
          <AddKidModal
            open={addKidOpen}
            onOpenChange={setAddKidOpen}
            householdId={selectedHousehold?.id}
          />
        </div>
      </div>
    );
  }

  // main dashboard case with children
  return (
    <div className="space-y-6">
      {/* Child Selector and top actions */}
      <ChildSelector
        childrenList={children}
        selectedChild={selectedChild}
        setSelectedChild={setSelectedChild}
        selectedHousehold={selectedHousehold}
        setAddKidOpen={setAddKidOpen}
        addKidOpen={addKidOpen}
        handleManualRefresh={handleManualRefresh}
        isRefreshing={isRefreshing}
        connectionStatus={connectionStatus}
        subscriptionStatus={subscriptionStatus}
        lastRefreshTime={lastRefreshTime}
        householdId={selectedHousehold?.id}
      />

      {/* Debug Information - Enhanced */}
      <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-700">
        <CardContent className="p-4">
          <div className="text-sm space-y-1">
            <p><strong>Household ID:</strong> {selectedHousehold?.id}</p>
            <p><strong>Children Count:</strong> {children.length}</p>
            <p><strong>Children:</strong> {children.map(c => `${c.first_name} (${c.id.startsWith('temp-') ? 'syncing' : 'saved'})`).join(', ') || 'None'}</p>
            <p><strong>Selected Child:</strong> {selectedChild || 'None'}</p>
            <p><strong>Real-time Status:</strong> 
              <span className={connectionStatus.color.replace('text-', 'text-')}>
                {connectionStatus.text}
              </span>
            </p>
            {lastRefreshTime && (
              <p><strong>Last Refresh:</strong> {lastRefreshTime.toLocaleString()}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Points and Rewards */}
      <RewardsCard
        selectedChild={selectedChild}
        totalPoints={totalPoints}
        reward={reward}
      />

      {/* Chores Section */}
      <ChoresSection
        selectedChild={selectedChild}
        childChores={childChores}
        handleCompleteChore={handleCompleteChore}
      />

      {/* Messages Section */}
      <MessagesSection
        selectedChild={selectedChild}
        childMessages={childMessages}
      />
    </div>
  );
};

export default ChildrenDashboard;
