
import React, { useState, useMemo } from 'react';
import { Heart, Plus, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppreciationsOptimized } from '@/hooks/useAppreciationsOptimized';
import { useAuth } from '@/hooks/useAuth';
import { Household } from '@/hooks/useHouseholds';
import AppreciationForm from './AppreciationForm';
import AppreciationCardOptimized from './AppreciationCardOptimized';

interface AppreciationsOptimizedProps {
  selectedHousehold: Household;
}

const AppreciationsOptimized: React.FC<AppreciationsOptimizedProps> = ({ selectedHousehold }) => {
  const { user, userProfile } = useAuth();
  const [isAddingAppreciation, setIsAddingAppreciation] = useState(false);
  
  const { 
    appreciations, 
    comments, 
    reactions, 
    householdMembers,
    loading, 
    error,
    addAppreciation, 
    toggleReaction,
    addComment,
    deleteAppreciation,
    fetchComments,
    fetchReactions,
    currentUserName
  } = useAppreciationsOptimized(selectedHousehold?.id);

  const availableMembers = useMemo(() => 
    householdMembers.filter(member => member.full_name !== currentUserName),
    [householdMembers, currentUserName]
  );

  const handleAddAppreciation = async (data: { message: string; to_member: string; to_user_id: string }) => {
    const success = await addAppreciation(data);
    if (success) {
      setIsAddingAppreciation(false);
    }
    return success;
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Heart className="text-pink-300 mx-auto mb-4" size={48} />
          <p className="text-muted-foreground">Please log in to view appreciations</p>
          <Button onClick={() => window.location.href = '/auth'} className="mt-4">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  if (!selectedHousehold) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Heart className="text-pink-300 mx-auto mb-4" size={48} />
          <p className="text-muted-foreground">Please select a household to view appreciations</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Heart className="text-pink-500" size={28} />
              Family Appreciations
            </h2>
            <p className="text-muted-foreground mt-1">Share love and gratitude with your family</p>
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-32 w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Heart className="text-pink-500" size={28} />
              Family Appreciations
            </h2>
            <p className="text-muted-foreground mt-1">Share love and gratitude with your family</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center max-w-md">
            <div className="mb-4">
              {navigator.onLine ? (
                <Heart className="text-red-400 mx-auto" size={48} />
              ) : (
                <WifiOff className="text-gray-400 mx-auto" size={48} />
              )}
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {navigator.onLine ? "Something went wrong" : "You're offline"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {error || "Please check your connection and try again"}
            </p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Heart className="text-pink-500" size={28} />
            Family Appreciations
          </h2>
          <p className="text-muted-foreground mt-1">Share love and gratitude with your family</p>
          {!navigator.onLine && (
            <div className="flex items-center gap-1 text-xs text-amber-600 mt-1">
              <WifiOff size={12} />
              <span>Offline - changes will sync when reconnected</span>
            </div>
          )}
        </div>
        {availableMembers.length > 0 && !isAddingAppreciation && (
          <Button 
            onClick={() => setIsAddingAppreciation(true)} 
            className="bg-pink-600 hover:bg-pink-700"
          >
            <Plus size={16} className="mr-2" />
            Add Appreciation
          </Button>
        )}
      </div>

      {isAddingAppreciation && (
        <AppreciationForm
          householdMembers={householdMembers}
          currentUserName={currentUserName}
          onSubmit={handleAddAppreciation}
          onCancel={() => setIsAddingAppreciation(false)}
        />
      )}

      <div className="space-y-4">
        {appreciations.map((appreciation) => (
          <AppreciationCardOptimized
            key={appreciation.id}
            appreciation={appreciation}
            comments={comments[appreciation.id] || []}
            currentUser={currentUserName}
            currentUserId={user?.id}
            onToggleReaction={toggleReaction}
            onAddComment={addComment}
            onDeleteAppreciation={deleteAppreciation}
            onLoadComments={fetchComments}
          />
        ))}
      </div>

      {appreciations.length === 0 && (
        <div className="text-center py-12">
          <Heart size={48} className="text-pink-300 mx-auto mb-4" />
          {availableMembers.length === 0 ? (
            <>
              <p className="text-muted-foreground text-lg">No family members to appreciate yet!</p>
              <p className="text-muted-foreground text-sm mt-2">Invite family members to start sharing appreciations.</p>
            </>
          ) : (
            <>
              <p className="text-muted-foreground text-lg">No appreciations yet!</p>
              <p className="text-muted-foreground text-sm mt-2">Start spreading love by sharing your first appreciation.</p>
              <Button 
                onClick={() => setIsAddingAppreciation(true)} 
                className="mt-4 bg-pink-600 hover:bg-pink-700"
              >
                <Plus size={16} className="mr-2" />
                Share First Appreciation
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AppreciationsOptimized;
