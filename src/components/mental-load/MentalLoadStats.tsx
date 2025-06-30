
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface MentalLoadStatsProps {
  assignableMembers: string[];
  getItemsByAssignee: (assignee: string) => any[];
}

const MentalLoadStats: React.FC<MentalLoadStatsProps> = ({ 
  assignableMembers, 
  getItemsByAssignee 
}) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      {assignableMembers.slice(0, 4).map((member) => {
        const memberItems = getItemsByAssignee(member);
        const highPriorityCount = memberItems.filter(item => item.priority === 'high').length;
        
        return (
          <Card key={member} className="p-3">
            <CardContent className="p-0">
              <div className="text-center">
                <p className="text-xs font-medium text-muted-foreground">{member}</p>
                <p className="text-lg font-bold text-foreground">{memberItems.length}</p>
                <p className="text-xs text-muted-foreground">
                  {highPriorityCount > 0 && `${highPriorityCount} high priority`}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default MentalLoadStats;
