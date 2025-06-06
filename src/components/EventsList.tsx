
import React from 'react';
import { Calendar, Clock, Users, Tag, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdvancedCalendarEvent, EventCategory } from '@/types/calendar';
import { format } from 'date-fns';

interface EventsListProps {
  events: AdvancedCalendarEvent[];
  categories: EventCategory[];
  onEventEdit: (eventId: string, updates: Partial<AdvancedCalendarEvent>) => void;
  onEventDelete: (eventId: string) => void;
  onEventClick?: (event: AdvancedCalendarEvent) => void;
  loading: boolean;
  canEdit: boolean;
}

const EventsList: React.FC<EventsListProps> = ({
  events,
  categories,
  onEventEdit,
  onEventDelete,
  onEventClick,
  loading,
  canEdit,
}) => {
  const getCategoryInfo = (categoryName: string) => {
    return categories.find(c => c.name.toLowerCase() === categoryName?.toLowerCase()) || {
      name: categoryName,
      color: '#3b82f6',
      icon: 'calendar'
    };
  };

  const formatEventDate = (dateTime: string) => {
    const date = new Date(dateTime);
    return format(date, 'MMM dd, yyyy h:mm a');
  };

  if (loading) {
    return (
      <Card className="bg-card dark:bg-card border-border dark:border-border">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading events...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card className="bg-card dark:bg-card border-border dark:border-border">
        <CardContent className="p-6">
          <div className="text-center">
            <Calendar className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No events found</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Create your first event to get started
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {events.map(event => {
        const categoryInfo = getCategoryInfo(event.category || 'general');
        
        return (
          <Card 
            key={event.id} 
            className="hover:shadow-md transition-all bg-card dark:bg-card border-border dark:border-border cursor-pointer hover:scale-[1.01]"
            onClick={() => onEventClick?.(event)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{event.title}</h3>
                    <Badge 
                      variant="secondary" 
                      className="text-white"
                      style={{ backgroundColor: categoryInfo.color }}
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {categoryInfo.name}
                    </Badge>
                    {event.is_recurring && (
                      <Badge variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                        Recurring
                      </Badge>
                    )}
                  </div>
                  
                  {event.description && (
                    <p className="text-gray-600 dark:text-gray-400 mb-3">{event.description}</p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatEventDate(event.start_datetime)}
                      {event.end_datetime && (
                        <span> - {format(new Date(event.end_datetime), 'h:mm a')}</span>
                      )}
                    </div>
                    
                    {event.assigned_to && event.assigned_to.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {event.assigned_to.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
                
                {canEdit && (
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick?.(event);
                      }}
                      className="hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventDelete(event.id);
                      }}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default EventsList;
