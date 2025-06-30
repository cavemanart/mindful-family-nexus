
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Star, ShoppingCart, CheckCircle } from 'lucide-react';
import { useRewards } from '@/hooks/useRewards';
import { useChorePoints } from '@/hooks/useChorePoints';
import { useAuth } from '@/hooks/useAuth';
import { pushNotificationService } from '@/lib/push-notifications';
import { supabase } from '@/integrations/supabase/client';

interface RewardsShopProps {
  householdId: string;
  childId?: string;
}

export default function RewardsShop({ householdId, childId }: RewardsShopProps) {
  const { userProfile } = useAuth();
  const { rewards, redemptions, redeemReward, loading } = useRewards(householdId);
  const { getChildPoints, refetch: refetchPoints } = useChorePoints(householdId);
  
  const isChild = userProfile?.is_child_account;
  const childPoints = childId ? getChildPoints(childId) : null;

  // Get redemptions for current child
  const childRedemptions = redemptions.filter(r => r.child_id === (childId || userProfile?.id));

  const handleRedeem = async (rewardId: string, pointCost: number, rewardName: string) => {
    if (!childId && !userProfile?.id) return;
    
    const targetChildId = childId || userProfile?.id;
    if (!targetChildId) return;

    const success = await redeemReward(rewardId, targetChildId, pointCost);
    
    if (success) {
      // Force refresh points data to reflect the reduction
      await refetchPoints();
      
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

  // Get fresh child points after potential redemption
  const currentChildPoints = childId ? getChildPoints(childId) : null;

  return (
    <div className="space-y-6">
      {/* Child Points Display */}
      {childId && currentChildPoints && (
        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-6 w-6" />
              Available Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{currentChildPoints.total_points}</div>
            <div className="text-sm opacity-90">Level {currentChildPoints.level}</div>
          </CardContent>
        </Card>
      )}

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rewards.map((reward) => {
          const isRedeemed = isRewardRedeemed(reward.id);
          const canAfford = currentChildPoints ? currentChildPoints.total_points >= reward.point_cost : false;
          
          return (
            <Card key={reward.id} className={`transition-all hover:shadow-md ${
              isRedeemed ? 'bg-green-50 dark:bg-green-950/30 border-green-200' : ''
            }`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className={`text-lg ${isRedeemed ? 'text-green-800 dark:text-green-400' : ''}`}>
                    {reward.name}
                    {isRedeemed && <CheckCircle className="h-4 w-4 ml-2 inline text-green-600" />}
                  </CardTitle>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {reward.point_cost}
                  </Badge>
                </div>
                <CardDescription className={isRedeemed ? 'text-green-700 dark:text-green-300' : ''}>
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

                  {isChild && childId && currentChildPoints && (
                    <Button 
                      onClick={() => handleRedeem(reward.id, reward.point_cost, reward.name)}
                      disabled={!canAfford || isRedeemed}
                      className="w-full"
                      variant={isRedeemed ? "outline" : canAfford ? "default" : "secondary"}
                    >
                      {isRedeemed ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Redeemed
                        </>
                      ) : canAfford ? (
                        <>
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Redeem
                        </>
                      ) : (
                        "Need More Points"
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
