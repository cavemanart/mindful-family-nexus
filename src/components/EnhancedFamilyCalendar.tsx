
import React, { useState } from 'react';
import { Calendar, Plus, Filter, Users, Clock, MapPin } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useAuth } from '@/hooks/useAuth';
import CreateEventDialog from './CreateEventDialog';
import EventDetailsDialog from './EventDetailsDialog';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';

interface Household {
  id: string;
  name: string;
}

interface EnhancedFamilyCalendarProps {
  selectedHousehold: Household | null;
}

const EnhancedFamilyCalendar: React.FC<EnhancedFamilyCalendarProps> = ({ selectedHousehold }) => {
  const { userProfile } = useAuth();
  const { events, eventTypes, loading, error, createEvent, updateEvent, deleteEvent } = useCalendarEvents(selectedHousehold?.id || null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);

  const canCreateEvents = userProfile?.role === 'parent' || userProfile?.role === 'grandparent';

  // Get calendar month data
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Filter events based on selected filter
  const filteredEvents = filterType 
    ? events.filter(event => event.event_type === filterType)
    : events;

  // Get events for a specific day
  const getEventsForDay = (date: Date) => {
    return filteredEvents.filter(event => {
      const eventDate = new Date(event.start_datetime);
      return isSameDay(eventDate, date);
    });
  };

  // Get event type info
  const getEventTypeInfo = (typeKey: string) => {
    return eventTypes.find(type => type.type_key === typeKey) || {
      name: typeKey,
      icon: 'Calendar',
      color: 'bg-gray-500'
    };
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    if (canCreateEvents) {
      setShowCreateDialog(true);
    }
  };

  const handleEventClick = (eventId: string) => {
    setSelectedEvent(eventId);
  };

  if (!selectedHousehold) {
    return (
      <div className="text-center py-8">
        <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">Please select a household to view the calendar</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading calendar...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Family Calendar</h2>
          <p className="text-gray-600">{selectedHousehold.name}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Event type filters */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={filterType || ''}
              onChange={(e) => setFilterType(e.target.value || null)}
              className="text-sm border rounded-md px-2 py-1"
            >
              <option value="">All Events</option>
              {eventTypes.map(type => (
                <option key={type.type_key} value={type.type_key}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
          
          {canCreateEvents && (
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Event
            </Button>
          )}
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
        >
          Previous
        </Button>
        <h3 className="text-xl font-semibold">
          {format(currentDate, 'MMMM yyyy')}
        </h3>
        <Button 
          variant="outline"
          onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
        >
          Next
        </Button>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-4">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map(date => {
              const dayEvents = getEventsForDay(date);
              const isCurrentMonth = isSameMonth(date, currentDate);
              const isDayToday = isToday(date);
              
              return (
                <div
                  key={date.toISOString()}
                  className={`min-h-[100px] p-2 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                    !isCurrentMonth ? 'text-gray-400 bg-gray-50' : ''
                  } ${isDayToday ? 'bg-blue-50 border-blue-200' : ''}`}
                  onClick={() => handleDateClick(date)}
                >
                  <div className={`text-sm font-medium mb-1 ${isDayToday ? 'text-blue-600' : ''}`}>
                    {format(date, 'd')}
                  </div>
                  
                  {/* Events for this day */}
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map(event => {
                      const typeInfo = getEventTypeInfo(event.event_type);
                      return (
                        <div
                          key={event.id}
                          className={`text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 ${typeInfo.color} text-white`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEventClick(event.id);
                          }}
                        >
                          {event.title}
                        </div>
                      );
                    })}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredEvents
              .filter(event => new Date(event.start_datetime) >= new Date())
              .slice(0, 5)
              .map(event => {
                const typeInfo = getEventTypeInfo(event.event_type);
                return (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleEventClick(event.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${typeInfo.color}`}></div>
                      <div>
                        <h4 className="font-medium">{event.title}</h4>
                        <p className="text-sm text-gray-600">
                          {format(new Date(event.start_datetime), 'MMM d, yyyy h:mm a')}
                        </p>
                        {event.location && (
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline">
                      {typeInfo.name}
                    </Badge>
                  </div>
                );
              })}
            
            {filteredEvents.filter(event => new Date(event.start_datetime) >= new Date()).length === 0 && (
              <p className="text-gray-500 text-center py-4">No upcoming events</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      {showCreateDialog && (
        <CreateEventDialog
          isOpen={showCreateDialog}
          onClose={() => {
            setShowCreateDialog(false);
            setSelectedDate(null);
          }}
          householdId={selectedHousehold.id}
          eventTypes={eventTypes}
          selectedDate={selectedDate}
          onEventCreated={createEvent}
        />
      )}

      {selectedEvent && (
        <EventDetailsDialog
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          eventId={selectedEvent}
          events={events}
          eventTypes={eventTypes}
          onEventUpdated={updateEvent}
          onEventDeleted={deleteEvent}
          canEdit={canCreateEvents}
        />
      )}
    </div>
  );
};

export default EnhancedFamilyCalendar;
