
import React from 'react';
import { Brain, User, CheckCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MentalLoadItem, { MentalLoadItemType } from './MentalLoadItem';

interface MentalLoadTabsProps {
  activeItems: MentalLoadItemType[];
  completedItems: MentalLoadItemType[];
  assignableMembers: string[];
  getItemsByAssignee: (assignee: string) => MentalLoadItemType[];
  onToggleCompleted: (id: string) => void;
  getPriorityColor: (priority: string) => string;
  getCategoryColor: (category: string) => string;
}

const MentalLoadTabs: React.FC<MentalLoadTabsProps> = ({
  activeItems,
  completedItems,
  assignableMembers,
  getItemsByAssignee,
  onToggleCompleted,
  getPriorityColor,
  getCategoryColor
}) => {
  return (
    <Tabs defaultValue="active" className="space-y-4">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="active" className="text-xs">Active ({activeItems.length})</TabsTrigger>
        <TabsTrigger value="completed" className="text-xs">Done ({completedItems.length})</TabsTrigger>
        <TabsTrigger value="by-person" className="text-xs">By Person</TabsTrigger>
      </TabsList>

      <TabsContent value="active" className="space-y-3">
        {activeItems.map((item) => (
          <MentalLoadItem 
            key={item.id} 
            item={item} 
            onToggleCompleted={onToggleCompleted}
          />
        ))}
        {activeItems.length === 0 && (
          <div className="text-center py-8">
            <Brain size={48} className="text-purple-300 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">No active mental load items!</p>
            <p className="text-muted-foreground text-sm mt-2">Great job staying on top of everything.</p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="completed" className="space-y-3">
        {completedItems.map((item) => (
          <MentalLoadItem 
            key={item.id} 
            item={item} 
            onToggleCompleted={onToggleCompleted}
            isCompleted
          />
        ))}
        {completedItems.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-lg">No completed items yet.</p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="by-person" className="space-y-4">
        {assignableMembers.map((member) => {
          const memberItems = getItemsByAssignee(member);
          return (
            <Card key={member}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User size={18} />
                  {member} ({memberItems.length} items)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {memberItems.length > 0 ? (
                  memberItems.map((item) => (
                    <div key={item.id} className="p-3 bg-muted rounded-lg">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-foreground">{item.title}</h5>
                            <p className="text-sm text-muted-foreground mt-1 break-words">{item.description}</p>
                          </div>
                          <Button
                            onClick={() => onToggleCompleted(item.id)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 flex-shrink-0"
                          >
                            <CheckCircle size={12} className="mr-1" />
                            Done
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge className={getPriorityColor(item.priority)} variant="outline">
                            {item.priority}
                          </Badge>
                          <Badge className={getCategoryColor(item.category)} variant="secondary">
                            {item.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">No items assigned to {member}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </TabsContent>
    </Tabs>
  );
};

export default MentalLoadTabs;
