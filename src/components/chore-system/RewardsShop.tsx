
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Star, ShoppingCart, CheckCircle, Lock, History } from 'lucide-react';
import { useRewards } from '@/hooks/useRewards';
import { useChorePoints } from '@/hooks/useChorePoints';
import { useAuth } from '@/hooks/useAuth';
import { pushNotificationService } from '@/lib/push-notifications';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface RewardsShopProps {
  householdId: string;
  childId?: string;
}

export default function RewardsShop({ householdId, childId }: RewardsShopProps) {
  const { userProfile } = useAuth();
  const { rewards, redemptions, redeemReward, loading } = useRewards(householdId);
  const { getChildPoints, refetch: refetchPoints } = useChorePoints(householdId);
  const [currentPoints, setCurrentPoints] = useState(0);
  const [showRedemptionLog, setShowRedemptionLog] = useState(false);
  
  const isChild = userProfile?.is_child_account;
  const targetChildId = childId || userProfile?.id;

  // Get and update current points
  useEffect(() => {
    if (targetChildId) {
      const childPointsData = getChildPoints(targetChildId);
      setCurrentPoints(childPointsData?.total_points || 0);
    }
  }, [targetChildId, getChildPoints]);

  // Get redemptions for current child
  const childRedemptions = redemptions.filter(r => r.child_id === targetChildId);

  const handleRedeem = async (rewardId: string, pointCost: number, rewardName: string) => {
    if (!targetChildId) return;

    // Check if user has enough points
    if (currentPoints < pointCost) {
      return;
    }

    const success = await redeemReward(rewardId, targetChildId, pointCost);
    
    if (success) {
      // Update local points immediately
      setCurrentPoints(prev => prev - pointCost);
      
      // Force refresh points data
      await refetchPoints();
      
      // Update current points from fresh data
      const updatedChildPoints = getChildPoints(targetChildId);
      setCurrentPoints(updatedChildPoints?.total_points || 0);
      
      // Send push notification to parents
      try {
        await pushNotificationService.sendRewardRedemptionNotification(
          householdId,
          rewardName,
          userProfile?.first_name || 'Child'
        );
      } catch (error) {
        console.warn('Failed to send redemption notification:', error);
      }
    }
  };

  const isRewardRedeemed = (rewardId: string) => {
    return childRedemptions.some(r => r.reward_id === rewardId && r.status === 'pending');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Child Points Display */}
      {targetChildId && (
        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-6 w-6" />
              Available Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{currentPoints}</div>
            <div className="text-sm opacity-90">
              Level {Math.floor(currentPoints / 100) + 1}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Redemption Log Button */}
      {childRedemptions.length > 0 && (
        <div className="flex justify-end">
          <Dialog open={showRedemptionLog} onOpenChange={setShowRedemptionLog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <History className="h-4 w-4 mr-2" />
                Redemption History
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Redemption History</DialogTitle>
                <DialogDescription>
                  Your reward redemption history
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {childRedemptions.map((redemption) => {
                  const reward = rewards.find(r => r.id === redemption.reward_id);
                  return (
                    <div key={redemption.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <div className="font-medium">{reward?.name || 'Unknown Reward'}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(redemption.redeemed_at).toLocaleDateString()} at {new Date(redemption.redeemed_at).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{redemption.points_spent} points</div>
                        <Badge variant={redemption.status === 'fulfilled' ? 'default' : 'secondary'}>
                          {redemption.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rewards.map((reward) => {
          const isRedeemed = isRewardRedeemed(reward.id);
          const canAfford = currentPoints >= reward.point_cost;
          const isLocked = !canAfford && !isRedeemed;
          
          return (
            <Card key={reward.id} className={`transition-all hover:shadow-md ${
              isRedeemed ? 'bg-green-50 dark:bg-green-950/30 border-green-200' : 
              isLocked ? 'bg-gray-50 dark:bg-gray-950/30 border-gray-200 opacity-60' : ''
            }`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className={`text-lg ${
                    isRedeemed ? 'text-green-800 dark:text-green-400' : 
                    isLocked ? 'text-gray-500' : ''
                  }`}>
                    {reward.name}
                    {isRedeemed && <CheckCircle className="h-4 w-4 ml-2 inline text-green-600" />}
                    {isLocked && <Lock className="h-4 w-4 ml-2 inline text-gray-400" />}
                  </CardTitle>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {reward.point_cost}
                  </Badge>
                </div>
                <CardDescription className={
                  isRedeemed ? 'text-green-700 dark:text-green-300' : 
                  isLocked ? 'text-gray-500' : ''
                }>
                  {reward.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{reward.category}</Badge>
                    {reward.age_restriction && (
                      <span className="text-xs text-muted-foreground">
                        Age: {reward.age_restriction}
                      </span>
                    )}
                  </div>

                  {isChild && targetChildId && (
                    <Button 
                      onClick={() => handleRedeem(reward.id, reward.point_cost, reward.name)}
                      disabled={!canAfford || isRedeemed}
                      className="w-full"
                      variant={
                        isRedeemed ? "outline" : 
                        isLocked ? "secondary" : "default"
                      }
                    >
                      {isRedeemed ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Redeemed
                        </>
                      ) : isLocked ? (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Locked
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Redeem
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {rewards.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <div className="text-muted-foreground">
              No rewards available yet. Parents can add rewards in the admin section.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
