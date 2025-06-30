
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMiniCoach } from '@/hooks/useMiniCoach';
import { Sparkles, Brain, Target, Trophy, Eye, Zap } from 'lucide-react';

interface MiniCoachCardProps {
  householdId: string;
}

const MiniCoachCard: React.FC<MiniCoachCardProps> = ({ householdId }) => {
  const { moments, loading, markAsRead } = useMiniCoach(householdId);

  const getCoachingIcon = (type: string) => {
    switch (type) {
      case 'celebration': return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 'motivation': return <Target className="h-5 w-5 text-blue-500" />;
      case 'improvement': return <Brain className="h-5 w-5 text-green-500" />;
      default: return <Sparkles className="h-5 w-5 text-purple-500" />;
    }
  };

  const getCoachingColor = (type: string) => {
    switch (type) {
      case 'celebration': return 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800';
      case 'motivation': return 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800';
      case 'improvement': return 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800';
      default: return 'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800';
    }
  };

  if (loading) {
    return (
      <Card className="bg-card text-card-foreground border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="ml-2 text-sm text-muted-foreground">Loading daily insight...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const unreadMoments = moments.filter(m => !m.is_read);
  const todaysMoment = moments[0]; // Since we only fetch today's moment

  return (
    <Card className="bg-card text-card-foreground border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Mini Coach
            <Badge className="bg-green-500 text-white text-xs flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Daily
            </Badge>
            {unreadMoments.length > 0 && (
              <Badge className="bg-purple-500 text-white text-xs">
                New
              </Badge>
            )}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {!todaysMoment ? (
          <div className="text-center py-6">
            <Brain className="h-12 w-12 mx-auto text-purple-400 mb-3" />
            <p className="text-sm text-muted-foreground mb-2">
              Your daily insight is being prepared...
            </p>
            <p className="text-xs text-muted-foreground">
              Check back in a moment for your personalized daily coaching
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div
              className={`p-3 rounded-lg border-2 transition-all ${
                todaysMoment.is_read 
                  ? 'bg-muted/50 border-border opacity-70' 
                  : getCoachingColor(todaysMoment.coaching_type)
              }`}
            >
              <div className="flex items-start gap-3">
                {getCoachingIcon(todaysMoment.coaching_type)}
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground mb-1">
                    {todaysMoment.content}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs capitalize">
                      Daily {todaysMoment.coaching_type}
                    </Badge>
                    {!todaysMoment.is_read && (
                      <button
                        onClick={() => markAsRead(todaysMoment.id)}
                        className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        Mark Read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-4 p-2 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-xs text-green-700 dark:text-green-400 text-center">
            ✨ Fresh daily insights - automatically generated each day!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MiniCoachCard;
