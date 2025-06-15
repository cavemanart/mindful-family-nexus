
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

interface RewardProps {
  selectedChild: string;
  totalPoints: number;
  reward: {
    icon: string;
    level: string;
    color: string;
  };
}

const RewardsCard: React.FC<RewardProps> = ({ selectedChild, totalPoints, reward }) => (
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
);

export default RewardsCard;
