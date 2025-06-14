
import React from 'react';
import { Trophy, RefreshCw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MVPNomination } from '@/hooks/useMVPOfTheDay';

interface MVPDisplayProps {
  mvp: MVPNomination;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

const MVPDisplay: React.FC<MVPDisplayProps> = ({ mvp, onRefresh, isRefreshing = false }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    
    if (date.toDateString() === today) {
      return "Today's MVP";
    } else if (date.toDateString() === yesterday) {
      return "Yesterday's MVP";
    } else {
      return `MVP from ${date.toLocaleDateString()}`;
    }
  };

  const isFromToday = () => {
    const mvpDate = new Date(mvp.nomination_date).toDateString();
    const today = new Date().toDateString();
    return mvpDate === today;
  };

  return (
    <Card className={`relative overflow-hidden ${
      isFromToday() 
        ? 'bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-100 dark:from-yellow-950/40 dark:via-orange-950/40 dark:to-yellow-900/40 border-yellow-300 dark:border-yellow-700'
        : 'bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 dark:from-gray-950/40 dark:via-slate-950/40 dark:to-gray-900/40 border-gray-300 dark:border-gray-700'
    } shadow-lg hover:shadow-xl transition-all duration-300`}>
      
      {/* Decorative elements */}
      <div className="absolute top-4 right-4 text-6xl opacity-20">
        {mvp.emoji}
      </div>
      <div className="absolute top-2 left-2 text-2xl opacity-30">
        <Trophy />
      </div>
      
      <CardContent className="p-8 relative z-10">
        <div className="text-center space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
              {!isFromToday() && <Clock size={16} />}
              {formatDate(mvp.nomination_date)}
            </div>
            <div className="text-4xl">{mvp.emoji}</div>
          </div>

          {/* MVP Name */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-foreground">
              {mvp.nominated_for}
            </h2>
            <div className="text-sm text-muted-foreground">
              Nominated by {mvp.nominated_by}
            </div>
          </div>

          {/* Reason Quote */}
          <div className="max-w-md mx-auto">
            <div className="text-lg italic text-foreground leading-relaxed relative">
              <span className="text-3xl text-yellow-500 absolute -top-2 -left-4">"</span>
              <span className="pl-4">{mvp.reason}</span>
              <span className="text-3xl text-yellow-500 absolute -bottom-4 -right-2">"</span>
            </div>
          </div>

          {/* Refresh Button */}
          <div className="pt-4">
            <Button
              onClick={onRefresh}
              disabled={isRefreshing}
              variant="outline"
              size="sm"
              className="bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-700/80"
            >
              <RefreshCw size={16} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MVPDisplay;
