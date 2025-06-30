
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Star, ShoppingCart } from 'lucide-react';
import { useRewards } from '@/hooks/useRewards';
import { useChorePoints } from '@/hooks/useChorePoints';
import { useAuth } from '@/hooks/useAuth';

interface RewardsShopProps {
  householdId: string;
  childId?: string;
}

export default function RewardsShop({ householdId, childId }: RewardsShopProps) {
  const { userProfile } = useAuth();
  const { rewards, redeemReward, loading } = useRewards(householdId);
  const { getChildPoints } = useChorePoints(householdId);
  
  const isChild = userProfile?.is_child_account;
  const childPoints = childId ? getChildPoints(childId) : null;

  const handleRedeem = async (rewardId: string, pointCost: number) => {
    if (!childId) return;
    await redeemReward(rewardId, childId, pointCost);
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
      {childId && childPoints && (
        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-6 w-6" />
              Available Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{childPoints.total_points}</div>
            <div className="text-sm opacity-90">Level {childPoints.level}</div>
          </CardContent>
        </Card>
      )}

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rewards.map((reward) => (
          <Card key={reward.id} className="transition-all hover:shadow-md">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{reward.name}</CardTitle>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  {reward.point_cost}
                </Badge>
              </div>
              <CardDescription>{reward.description}</CardDescription>
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

                {isChild && childId && childPoints && (
                  <Button 
                    onClick={() => handleRedeem(reward.id, reward.point_cost)}
                    disabled={childPoints.total_points < reward.point_cost}
                    className="w-full"
                    variant={childPoints.total_points >= reward.point_cost ? "default" : "secondary"}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {childPoints.total_points >= reward.point_cost ? "Redeem" : "Need More Points"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
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
