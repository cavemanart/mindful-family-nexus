
import React from 'react';
import { User, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MentalLoadItemType {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  assignedTo: string;
  sharedBy: string;
  isCompleted: boolean;
  dueDate?: Date;
  createdAt: Date;
}

interface MentalLoadItemProps {
  item: MentalLoadItemType;
  onToggleCompleted: (id: string) => void;
  isCompleted?: boolean;
}

const MentalLoadItem: React.FC<MentalLoadItemProps> = ({ 
  item, 
  onToggleCompleted, 
  isCompleted = false 
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700';
      case 'low': return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700';
      default: return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Healthcare': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'Education': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      'Events': 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
      'Household': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'Finance': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      'Social': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      'Other': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
    };
    return colors[category] || colors['Other'];
  };

  if (isCompleted) {
    return (
      <Card className="bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-700">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="text-green-600 mt-1 flex-shrink-0" size={20} />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start gap-2 mb-2">
                  <h4 className="font-semibold text-foreground line-through flex-1 min-w-0">{item.title}</h4>
                  <Badge className={getCategoryColor(item.category)} variant="secondary">
                    {item.category}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm mb-2">{item.description}</p>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span>Completed by {item.assignedTo}</span>
                  <span>Shared by {item.sharedBy}</span>
                </div>
              </div>
              <Button
                onClick={() => onToggleCompleted(item.id)}
                variant="outline"
                size="sm"
                className="border-green-600 text-green-600 hover:bg-green-100 dark:hover:bg-green-950/50 flex-shrink-0"
              >
                Undo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex flex-wrap items-start gap-2">
            <h4 className="font-semibold text-foreground flex-1 min-w-0">{item.title}</h4>
            <div className="flex flex-wrap gap-1">
              <Badge className={getPriorityColor(item.priority)} variant="outline">
                {item.priority}
              </Badge>
              <Badge className={getCategoryColor(item.category)} variant="secondary">
                {item.category}
              </Badge>
            </div>
          </div>
          <p className="text-muted-foreground text-sm">{item.description}</p>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <User size={12} />
                <span>{item.assignedTo}</span>
              </div>
              <div className="flex items-center gap-1">
                <span>by {item.sharedBy}</span>
              </div>
              {item.dueDate && (
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  <span>Due {item.dueDate.toLocaleDateString()}</span>
                </div>
              )}
            </div>
            <Button
              onClick={() => onToggleCompleted(item.id)}
              size="sm"
              className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
            >
              <CheckCircle size={14} className="mr-2" />
              Complete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MentalLoadItem;
export type { MentalLoadItemType };
