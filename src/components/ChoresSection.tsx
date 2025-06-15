
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Chore {
  id: string;
  title: string;
  description: string;
  points: number;
  completed: boolean;
  due_date: string;
}

interface ChoresSectionProps {
  selectedChild: string;
  childChores: Chore[];
  handleCompleteChore: (id: string) => void;
}

const ChoresSection: React.FC<ChoresSectionProps> = ({
  selectedChild,
  childChores,
  handleCompleteChore,
}) => (
  <div className="space-y-4">
    <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
      <CheckCircle className="text-green-500" size={24} />
      {selectedChild}&apos;s Chores
    </h3>
    <div className="grid gap-4">
      {childChores.length === 0 ? (
        <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-700">
          <CardContent className="p-6 text-center">
            <CheckCircle className="text-blue-300 mx-auto mb-4" size={48} />
            <p className="text-muted-foreground text-lg">No tasks assigned yet!</p>
            <p className="text-muted-foreground text-sm mt-2">Tasks assigned to {selectedChild} will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        childChores.map((chore) => (
          <Card 
            key={chore.id} 
            className={`${
              chore.completed 
                ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-700' 
                : 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-700 hover:shadow-md transition-shadow'
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {!chore.completed && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCompleteChore(chore.id)}
                      className="text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/50 mt-1"
                    >
                      <CheckCircle size={20} />
                    </Button>
                  )}
                  {chore.completed && (
                    <div className="text-green-600 dark:text-green-400 mt-1">
                      <CheckCircle size={20} />
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className={`font-semibold ${chore.completed ? 'text-green-800 dark:text-green-200 line-through' : 'text-foreground'}`}>
                      {chore.title}
                    </h4>
                    <p className={`text-sm mb-2 ${chore.completed ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                      {chore.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        Due: {new Date(chore.due_date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star size={12} className="text-yellow-500 dark:text-yellow-400" />
                        {chore.points} points
                      </span>
                    </div>
                  </div>
                </div>
                <Badge variant={chore.completed ? "default" : "secondary"} className="text-xs">
                  {chore.completed ? 'Done!' : 'To Do'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  </div>
);

export default ChoresSection;
