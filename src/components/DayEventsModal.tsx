
import React from 'react';
import { AdvancedCalendarEvent, EventCategory } from '@/types/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Calendar, User, Tag, Plus, ChevronLeft, ChevronRight, Edit, Copy, UserPlus } from 'lucide-react';

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
  onEditEvent?: (event: AdvancedCalendarEvent) => void;
  onDuplicateEvent?: (event: AdvancedCalendarEvent) => void;
  onAssignEvent?: (event: AdvancedCalendarEvent) => void;
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
  canCreateEvents,
  onEditEvent,
  onDuplicateEvent,
  onAssignEvent
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

  const handleQuickAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[95vh] w-[95vw] sm:w-full overflow-hidden flex flex-col p-0">
        <DialogHeader className="flex-shrink-0 px-4 sm:px-6 py-4 border-b bg-gray-50 dark:bg-gray-900">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigateDate('prev')}
                className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Prev</span>
              </Button>
              
              <div className="flex items-center gap-2 min-w-0">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                <DialogTitle className={`text-sm sm:text-lg font-semibold truncate ${isToday ? 'text-blue-600' : ''}`}>
                  {formatDate(selectedDate)}
                </DialogTitle>
                {isToday && (
                  <Badge variant="outline" className="text-xs text-blue-600 border-blue-300 hidden sm:inline-flex">
                    Today
                  </Badge>
                )}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigateDate('next')}
                className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
              >
                <ChevronRight className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Next</span>
              </Button>
            </div>
            
            {canCreateEvents && onCreateEvent && (
              <Button onClick={onCreateEvent} size="sm" className="flex items-center gap-2 text-xs sm:text-sm px-2 sm:px-4">
                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Add Event</span>
                <span className="sm:hidden">Add</span>
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full px-4 sm:px-6 py-4">
            <div className="space-y-3 sm:space-y-4 pb-4">
              {sortedEvents.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <Calendar className="h-8 w-8 sm:h-12 sm:w-12 mx-auto text-gray-400 mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No events scheduled
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 sm:mb-4">
                    {isToday ? "You have no events today" : "No events scheduled for this day"}
                  </p>
                  {canCreateEvents && onCreateEvent && (
                    <Button onClick={onCreateEvent} variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Event
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {sortedEvents.length} {sortedEvents.length === 1 ? 'Event' : 'Events'}
                    </h3>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-xs">
                      {formatDate(selectedDate).split(',')[0]}
                    </Badge>
                  </div>

                  {sortedEvents.map((event) => (
                    <Card 
                      key={event.id} 
                      className="cursor-pointer hover:shadow-md transition-all duration-200 border-l-4 hover:scale-[1.01]"
                      style={{ borderLeftColor: getCategoryColor(event.category || 'general') }}
                      onClick={() => onEventClick(event)}
                    >
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                              <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                                {formatTime(event.start_datetime)}
                                {event.end_datetime && (
                                  <> - {formatTime(event.end_datetime)}</>
                                )}
                              </span>
                            </div>
                            
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 text-sm sm:text-base truncate">
                              {event.title}
                            </h4>
                            
                            {event.description && (
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                                {event.description}
                              </p>
                            )}
                            
                            <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-2 sm:mb-0">
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

                            {/* Quick Action Buttons - Mobile */}
                            {canCreateEvents && (
                              <div className="flex gap-1 mt-2 sm:hidden">
                                {onEditEvent && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 px-2 text-xs"
                                    onClick={(e) => handleQuickAction(e, () => onEditEvent(event))}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                )}
                                {onDuplicateEvent && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 px-2 text-xs"
                                    onClick={(e) => handleQuickAction(e, () => onDuplicateEvent(event))}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                )}
                                {onAssignEvent && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 px-2 text-xs"
                                    onClick={(e) => handleQuickAction(e, () => onAssignEvent(event))}
                                  >
                                    <UserPlus className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {/* Quick Action Buttons - Desktop */}
                            {canCreateEvents && (
                              <div className="hidden sm:flex gap-1">
                                {onEditEvent && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 px-2"
                                    onClick={(e) => handleQuickAction(e, () => onEditEvent(event))}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                )}
                                {onDuplicateEvent && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 px-2"
                                    onClick={(e) => handleQuickAction(e, () => onDuplicateEvent(event))}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                )}
                                {onAssignEvent && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 px-2"
                                    onClick={(e) => handleQuickAction(e, () => onAssignEvent(event))}
                                  >
                                    <UserPlus className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            )}
                            
                            <div 
                              className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
                              style={{ backgroundColor: getCategoryColor(event.category || 'general') }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DayEventsModal;
