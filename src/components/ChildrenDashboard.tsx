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
import { UserPlus } from "lucide-react";

interface ChildrenDashboardProps {
  selectedHousehold: { id: string } | null;
}

const ChildrenDashboard = ({ selectedHousehold }: ChildrenDashboardProps) => {
  const { chores, loading: choresLoading, toggleChore } = useChores(selectedHousehold?.id || null);
  const { messages, loading: messagesLoading } = useFamilyMessages(selectedHousehold?.id || null);
  const { 
    children, 
    loading: childrenLoading, 
    refreshChildren, 
    isRefreshing,
    subscriptionStatus 
  } = useChildren(selectedHousehold?.id);
  
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

      <AddKidModal
        open={addKidOpen}
        onOpenChange={setAddKidOpen}
        householdId={selectedHousehold?.id}
      />

      {/* Child Selector and top actions */}
      <div className="text-center py-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-xl">
        <h2 className="text-3xl font-bold text-foreground mb-4">
          Kid's Dashboard 🎈
        </h2>
        <div className="flex justify-center gap-2 flex-wrap mb-4">
          {children.map((child) => (
            <Button
              key={child.id}
              variant={selectedChild === child.first_name ? "default" : "outline"}
              onClick={() => setSelectedChild(child.first_name)}
              className={selectedChild === child.first_name ? "bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600" : ""}
            >
              {child.first_name}
              {child.id.startsWith('temp-') && (
                <AlertCircle className="ml-1 h-3 w-3 text-amber-500" />
              )}
            </Button>
          ))}
        </div>
        <div className="flex gap-2 justify-center mb-4">
          {selectedHousehold && (
            <Button variant="outline" size="sm" onClick={() => setAddKidOpen(true)}>
              <UserPlus className="mr-2 h-3 w-3" />
              Add Kid
            </Button>
          )}
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
            Force Refresh
          </Button>
        </div>
        <div className="max-w-md mx-auto bg-white/40 dark:bg-gray-900/30 rounded-md shadow-sm p-3 mb-4">
          <strong>To add a child:</strong>
          <ol className="list-decimal list-inside text-xs text-muted-foreground mt-1 space-y-1 text-left">
            <li>Tap <span className="font-medium">Add Kid</span>.</li>
            <li>Get a one-hour join code, then use it on your child’s device.</li>
            <li>The new child will appear instantly here.</li>
          </ol>
        </div>
        {/* Connection Status */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-2">
          <connectionStatus.icon className={`h-3 w-3 ${connectionStatus.color} ${subscriptionStatus === 'connecting' ? 'animate-spin' : ''}`} />
          <span>{connectionStatus.text}</span>
        </div>

        {lastRefreshTime && (
          <p className="text-xs text-muted-foreground">
            Last refresh: {lastRefreshTime.toLocaleTimeString()}
          </p>
        )}
      </div>

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
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 border-yellow-200 dark:border-yellow-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
            <Star className="text-yellow-600 dark:text-yellow-400" size={24} />
            {selectedChild}'s Rewards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{totalPoints} Points</p>
              <p className="text-sm text-muted-foreground">This week</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">{reward.icon}</div>
              <Badge className={`${reward.color} font-semibold bg-white dark:bg-gray-800 border`}>
                {reward.level}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-foreground">
              <span>Next reward at 30 points</span>
              <span>{Math.max(0, 30 - totalPoints)} points to go!</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-yellow-500 dark:bg-yellow-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (totalPoints / 30) * 100)}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chores Section */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <CheckCircle className="text-green-500" size={24} />
          {selectedChild}'s Chores
        </h3>

        <div className="grid gap-4">
          {childChores.length === 0 ? (
            <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-700">
              <CardContent className="p-6 text-center">
                <CheckCircle className="text-blue-300 mx-auto mb-4" size={48} />
                <p className="text-muted-foreground text-lg">No tasks assigned yet!</p>
                <p className="text-muted-foreground text-sm mt-2">Tasks assigned to {selectedChild} will appear here.</p>
              </CardContent>
            </Card>
          ) : (
            childChores.map((chore) => (
              <Card 
                key={chore.id} 
                className={`${
                  chore.completed 
                    ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-700' 
                    : 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-700 hover:shadow-md transition-shadow'
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {!chore.completed && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCompleteChore(chore.id)}
                          className="text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/50 mt-1"
                        >
                          <CheckCircle size={20} />
                        </Button>
                      )}
                      {chore.completed && (
                        <div className="text-green-600 dark:text-green-400 mt-1">
                          <CheckCircle size={20} />
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className={`font-semibold ${chore.completed ? 'text-green-800 dark:text-green-200 line-through' : 'text-foreground'}`}>
                          {chore.title}
                        </h4>
                        <p className={`text-sm mb-2 ${chore.completed ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                          {chore.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            Due: {new Date(chore.due_date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star size={12} className="text-yellow-500 dark:text-yellow-400" />
                            {chore.points} points
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge variant={chore.completed ? "default" : "secondary"} className="text-xs">
                      {chore.completed ? 'Done!' : 'To Do'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Messages Section */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Heart className="text-pink-500" size={24} />
          Messages for {selectedChild}
        </h3>

        <div className="grid gap-4">
          {childMessages.length === 0 ? (
            <Card className="bg-pink-50 dark:bg-pink-950/30 border-pink-200 dark:border-pink-700">
              <CardContent className="p-6 text-center">
                <Heart className="text-pink-300 mx-auto mb-4" size={48} />
                <p className="text-muted-foreground text-lg">No messages yet!</p>
                <p className="text-muted-foreground text-sm mt-2">Messages for {selectedChild} will appear here.</p>
              </CardContent>
            </Card>
          ) : (
            childMessages.map((message) => (
              <Card 
                key={message.id} 
                className={`${
                  message.is_special 
                    ? 'bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/30 dark:to-purple-950/30 border-pink-200 dark:border-pink-700' 
                    : 'bg-card border-border'
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.is_special ? 'bg-pink-100 dark:bg-pink-800' : 'bg-muted'
                      }`}>
                        {message.is_special ? '💝' : '📝'}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">From {message.from_member}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(message.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {message.is_special && (
                      <Badge className="bg-pink-100 dark:bg-pink-800 text-pink-600 dark:text-pink-200">Special</Badge>
                    )}
                  </div>
                  <p className="text-foreground">{message.message}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ChildrenDashboard;
