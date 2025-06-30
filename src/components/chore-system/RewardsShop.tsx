
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Star, ShoppingCart } from 'lucide-react';
import { useRewards } from '@/hooks/useRewards';
import { useChorePoints } from '@/hooks/useChorePoints';

interface RewardsShopProps {
  householdId: string;
  childId?: string;
}

export default function RewardsShop({ householdId, childId }: RewardsShopProps) {
  const { rewards, redeemReward, loading } = useRewards(householdId);
  const { getChildPoints } = useChorePoints(householdId);

  const childPoints = childId ? getChildPoints(childId) : null;
  const availablePoints = childPoints?.total_points || 0;

  const handleRedeem = async (rewardId: string, pointCost: number) => {
    if (!childId) return;
    await redeemReward(rewardId, childId, pointCost);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'experience':
        return '🎪';
      case 'treat':
        return '🍭';
      case 'toy':
        return '🧸';
      case 'privilege':
        return '⭐';
      default:
        return '🎁';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'experience':
        return 'bg-purple-100 text-purple-800';
      case 'treat':
        return 'bg-pink-100 text-pink-800';
      case 'toy':
        return 'bg-blue-100 text-blue-800';
      case 'privilege':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading rewards...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Points Display */}
      {childId && (
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-6 w-6" />
              Rewards Shop
            </CardTitle>
            <CardDescription className="text-blue-100">
              You have <span className="font-bold text-white">{availablePoints} points</span> to spend!
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rewards.map((reward) => {
          const canAfford = availablePoints >= reward.point_cost;
          
          return (
            <Card 
              key={reward.id} 
              className={`transition-all hover:shadow-md ${
                canAfford ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getCategoryIcon(reward.category)}</span>
                    <CardTitle className="text-lg">{reward.name}</CardTitle>
                  </div>
                  <Badge className={getCategoryColor(reward.category)}>
                    {reward.category}
                  </Badge>
                </div>
                {reward.description && (
                  <CardDescription>{reward.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      {reward.point_cost} points
                    </Badge>
                    {reward.age_restriction && (
                      <span className="text-xs text-muted-foreground">
                        Ages: {reward.age_restriction}
                      </span>
                    )}
                  </div>

                  {childId && (
                    <Button
                      onClick={() => handleRedeem(reward.id, reward.point_cost)}
                      disabled={!canAfford}
                      className={`w-full ${
                        canAfford 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-gray-400 cursor-not-allowed'
                      }`}
                      size="sm"
                    >
                      {canAfford ? (
                        <>
                          <Gift className="h-4 w-4 mr-2" />
                          Redeem
                        </>
                      ) : (
                        `Need ${reward.point_cost - availablePoints} more points`
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
            <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Rewards Available</h3>
            <p className="text-muted-foreground">
              Ask your parents to add some rewards to the shop!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
