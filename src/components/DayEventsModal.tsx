
import React from 'react';
import { AdvancedCalendarEvent, EventCategory } from '@/types/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Calendar, User, Tag, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

interface DayEventsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  events: AdvancedCalendarEvent[];
  categories: EventCategory[];
  onEventClick: (event: AdvancedCalendarEvent) => void;
  onCreateEvent?: () => void;
  onNavigateDate: (direction: 'prev' | 'next') => void;
  canCreateEvents: boolean;
}

const DayEventsModal: React.FC<DayEventsModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  events,
  categories,
  onEventClick,
  onCreateEvent,
  onNavigateDate,
  canCreateEvents
}) => {
  if (!selectedDate) return null;

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(c => c.name.toLowerCase() === categoryName?.toLowerCase());
    return category?.color || '#3b82f6';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (datetime: string) => {
    return new Date(datetime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  // Sort events by start time
  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime()
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigateDate('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span className={isToday ? 'text-blue-600' : ''}>
                  {formatDate(selectedDate)}
                </span>
                {isToday && <Badge variant="outline" className="text-blue-600 border-blue-300">Today</Badge>}
              </DialogTitle>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigateDate('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            {canCreateEvents && onCreateEvent && (
              <Button onClick={onCreateEvent} size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Event
              </Button>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-2">
          <div className="space-y-4">
            {sortedEvents.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No events scheduled
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {isToday ? "You have no events today" : "No events scheduled for this day"}
                </p>
                {canCreateEvents && onCreateEvent && (
                  <Button onClick={onCreateEvent} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Event
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {sortedEvents.length} {sortedEvents.length === 1 ? 'Event' : 'Events'}
                  </h3>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    {formatDate(selectedDate).split(',')[0]}
                  </Badge>
                </div>

                {sortedEvents.map((event) => (
                  <Card 
                    key={event.id} 
                    className="cursor-pointer hover:shadow-md transition-all duration-200 border-l-4 hover:scale-[1.02]"
                    style={{ borderLeftColor: getCategoryColor(event.category || 'general') }}
                    onClick={() => onEventClick(event)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-gray-500 flex-shrink-0" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {formatTime(event.start_datetime)}
                              {event.end_datetime && (
                                <> - {formatTime(event.end_datetime)}</>
                              )}
                            </span>
                          </div>
                          
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 truncate">
                            {event.title}
                          </h4>
                          
                          {event.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                              {event.description}
                            </p>
                          )}
                          
                          <div className="flex flex-wrap items-center gap-2">
                            {event.category && (
                              <div className="flex items-center gap-1">
                                <Tag className="h-3 w-3 text-gray-500" />
                                <Badge 
                                  variant="outline" 
                                  className="text-xs"
                                  style={{ 
                                    borderColor: getCategoryColor(event.category),
                                    color: getCategoryColor(event.category)
                                  }}
                                >
                                  {event.category}
                                </Badge>
                              </div>
                            )}
                            
                            {event.assigned_to && event.assigned_to.length > 0 && (
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3 text-gray-500" />
                                <span className="text-xs text-gray-500">
                                  {event.assigned_to.length} assigned
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div 
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: getCategoryColor(event.category || 'general') }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default DayEventsModal;
