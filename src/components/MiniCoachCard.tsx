
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMiniCoach } from '@/hooks/useMiniCoach';
import { useHouseholdSubscription } from '@/hooks/useHouseholdSubscription';
import { Sparkles, Brain, Target, Trophy, RefreshCw, Eye } from 'lucide-react';

interface MiniCoachCardProps {
  householdId: string;
}

const MiniCoachCard: React.FC<MiniCoachCardProps> = ({ householdId }) => {
  const { moments, loading, generating, markAsRead, generateNewMoments } = useMiniCoach(householdId);
  const { hasProAccess } = useHouseholdSubscription();

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
      case 'celebration': return 'bg-yellow-50 border-yellow-200';
      case 'motivation': return 'bg-blue-50 border-blue-200';
      case 'improvement': return 'bg-green-50 border-green-200';
      default: return 'bg-purple-50 border-purple-200';
    }
  };

  if (!hasProAccess) {
    return (
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Mini Coach AI
            <Badge variant="outline" className="text-xs">Pro Feature</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-3">
            Get personalized AI coaching insights based on your family's weekly activities and goals.
          </p>
          <p className="text-xs text-purple-600 font-medium">
            Upgrade to Pro to unlock AI-powered family coaching!
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="ml-2 text-sm text-gray-600">Loading coaching insights...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const unreadMoments = moments.filter(m => !m.is_read);

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Mini Coach AI
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
            <p className="text-sm text-gray-600 mb-3">
              No coaching insights yet this week
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={generateNewMoments}
              disabled={generating}
            >
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
                    ? 'bg-gray-50 border-gray-200 opacity-70' 
                    : getCoachingColor(moment.coaching_type)
                }`}
              >
                <div className="flex items-start gap-3">
                  {getCoachingIcon(moment.coaching_type)}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800 mb-1">
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
              <p className="text-xs text-center text-gray-500 mt-2">
                +{moments.length - 3} more insights available
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MiniCoachCard;
