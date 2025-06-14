
import React, { useState } from 'react';
import { Trophy, Plus, Wifi, WifiOff, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMVPOfTheDay } from '@/hooks/useMVPOfTheDay';
import { useAuth } from '@/hooks/useAuth';
import { Household } from '@/hooks/useHouseholds';
import MVPNominationForm from './MVPNominationForm';
import MVPDisplay from './MVPDisplay';

interface MVPOfTheDayProps {
  selectedHousehold: Household;
}

const MVPOfTheDay: React.FC<MVPOfTheDayProps> = ({ selectedHousehold }) => {
  const { user } = useAuth();
  const [isNominating, setIsNominating] = useState(false);
  
  const { 
    todaysMVP,
    householdMembers,
    loading,
    error,
    hasNominatedToday,
    currentUserName,
    nominateMVP,
    refreshMVP
  } = useMVPOfTheDay(selectedHousehold?.id);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const availableMembers = householdMembers.filter(member => member.full_name !== currentUserName);

  const handleNominate = async (data: { nominated_for: string; nominated_for_user_id: string; reason: string; emoji: string }) => {
    const success = await nominateMVP(data);
    if (success) {
      setIsNominating(false);
    }
    return success;
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshMVP();
    setIsRefreshing(false);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Trophy className="text-yellow-300 mx-auto mb-4" size={48} />
          <p className="text-muted-foreground">Please log in to view MVP nominations</p>
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
          <Trophy className="text-yellow-300 mx-auto mb-4" size={48} />
          <p className="text-muted-foreground">Please select a household to view MVPs</p>
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
              <Trophy className="text-yellow-500" size={28} />
              MVP of the Day
            </h2>
            <p className="text-muted-foreground mt-1">Celebrate your family's daily heroes</p>
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
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
              <Trophy className="text-yellow-500" size={28} />
              MVP of the Day
            </h2>
            <p className="text-muted-foreground mt-1">Celebrate your family's daily heroes</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center max-w-md">
            <div className="mb-4">
              {navigator.onLine ? (
                <Trophy className="text-red-400 mx-auto" size={48} />
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
            <Trophy className="text-yellow-500" size={28} />
            MVP of the Day
          </h2>
          <p className="text-muted-foreground mt-1">Celebrate your family's daily heroes</p>
          {!navigator.onLine && (
            <div className="flex items-center gap-1 text-xs text-amber-600 mt-1">
              <WifiOff size={12} />
              <span>Offline - changes will sync when reconnected</span>
            </div>
          )}
        </div>
        {availableMembers.length > 0 && !isNominating && !hasNominatedToday && (
          <Button 
            onClick={() => setIsNominating(true)} 
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            <Plus size={16} className="mr-2" />
            Nominate MVP
          </Button>
        )}
      </div>

      {isNominating && (
        <MVPNominationForm
          householdMembers={householdMembers}
          currentUserName={currentUserName}
          onSubmit={handleNominate}
          onCancel={() => setIsNominating(false)}
        />
      )}

      <div className="space-y-4">
        {todaysMVP ? (
          <MVPDisplay 
            mvp={todaysMVP} 
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
          />
        ) : (
          <div className="text-center py-12">
            <Trophy size={48} className="text-yellow-300 mx-auto mb-4" />
            {availableMembers.length === 0 ? (
              <>
                <p className="text-muted-foreground text-lg">No family members to nominate yet!</p>
                <p className="text-muted-foreground text-sm mt-2">Invite family members to start celebrating MVPs.</p>
              </>
            ) : hasNominatedToday ? (
              <>
                <p className="text-muted-foreground text-lg">No MVP selected yet today!</p>
                <p className="text-muted-foreground text-sm mt-2">You've already nominated someone. Check back later to see who becomes today's MVP!</p>
              </>
            ) : (
              <>
                <p className="text-muted-foreground text-lg">No MVP selected yet today!</p>
                <p className="text-muted-foreground text-sm mt-2">Be the first to nominate someone special as today's MVP.</p>
                <Button 
                  onClick={() => setIsNominating(true)} 
                  className="mt-4 bg-yellow-600 hover:bg-yellow-700"
                >
                  <Star size={16} className="mr-2" />
                  Nominate First MVP
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MVPOfTheDay;
