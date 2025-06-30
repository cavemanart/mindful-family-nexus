
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMiniCoach } from '@/hooks/useMiniCoach';
import { useHouseholdSubscription } from '@/hooks/useHouseholdSubscription';
import { Sparkles, Brain, Target, Trophy, RefreshCw, Eye, Zap } from 'lucide-react';

interface MiniCoachCardProps {
  householdId: string;
}

const MiniCoachCard: React.FC<MiniCoachCardProps> = ({ householdId }) => {
  const { moments, loading, generating, markAsRead, generateNewMoments } = useMiniCoach(householdId);

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
            <span className="ml-2 text-sm text-muted-foreground">Loading coaching insights...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const unreadMoments = moments.filter(m => !m.is_read);

  return (
    <Card className="bg-card text-card-foreground border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Mini Coach AI
            <Badge className="bg-green-500 text-white text-xs flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Free
            </Badge>
            {unreadMoments.length > 0 && (
              <Badge className="bg-purple-500 text-white text-xs">
                {unreadMoments.length} new
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={generateNewMoments}
            disabled={generating}
            className="text-xs"
          >
            {generating ? (
              <RefreshCw className="h-3 w-3 animate-spin mr-1" />
            ) : (
              <Brain className="h-3 w-3 mr-1" />
            )}
            {generating ? 'Generating...' : 'Generate'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {moments.length === 0 ? (
          <div className="text-center py-6">
            <Brain className="h-12 w-12 mx-auto text-purple-400 mb-3" />
            <p className="text-sm text-muted-foreground mb-2">
              No coaching insights yet this week
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              Get personalized insights based on your family's activities
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={generateNewMoments}
              disabled={generating}
            >
              {generating ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Generate Your First Insights
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {moments.slice(0, 3).map((moment) => (
              <div
                key={moment.id}
                className={`p-3 rounded-lg border-2 transition-all ${
                  moment.is_read 
                    ? 'bg-muted/50 border-border opacity-70' 
                    : getCoachingColor(moment.coaching_type)
                }`}
              >
                <div className="flex items-start gap-3">
                  {getCoachingIcon(moment.coaching_type)}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground mb-1">
                      {moment.content}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs capitalize">
                        {moment.coaching_type}
                      </Badge>
                      {!moment.is_read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(moment.id)}
                          className="text-xs h-6 px-2"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Mark Read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {moments.length > 3 && (
              <p className="text-xs text-center text-muted-foreground mt-2">
                +{moments.length - 3} more insights available
              </p>
            )}
          </div>
        )}
        
        <div className="mt-4 p-2 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-xs text-green-700 dark:text-green-400 text-center">
            ✨ Powered by free AI - no API keys required!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MiniCoachCard;
