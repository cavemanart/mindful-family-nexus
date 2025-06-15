
import React from 'react';
import { Trophy, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface OverviewCardsProps {
  setActiveSection: (section: string) => void;
}

const OverviewCards: React.FC<OverviewCardsProps> = ({ setActiveSection }) => {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg text-foreground">
            <Trophy className="text-yellow-500" size={20} />
            MVP of the Day
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg">
              <p className="text-sm text-foreground">"Amazing work on the presentation! 🏆"</p>
              <p className="text-xs text-muted-foreground mt-1">Today's MVP: Sarah</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-950/30"
              onClick={() => setActiveSection('mvp')}
            >
              View MVPs
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg text-foreground">
            <Calendar className="text-blue-500" size={20} />
            Weekly Sync
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
              <p className="text-sm text-foreground">3 wins shared this week</p>
              <p className="text-xs text-muted-foreground mt-1">2 goals in progress</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
              onClick={() => setActiveSection('weekly-sync')}
            >
              View Sync
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg text-foreground">
            <Users className="text-purple-500" size={20} />
            Kids Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
              <p className="text-sm text-foreground">Emma: 15 points earned</p>
              <p className="text-xs text-muted-foreground mt-1">Jack: 14 points earned</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/30"
              onClick={() => setActiveSection('kids')}
            >
              View Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewCards;

