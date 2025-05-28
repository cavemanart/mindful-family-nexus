
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Household } from '@/hooks/useHouseholds';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import AddEventDialog from '@/components/calendar/AddEventDialog';
import EventList from '@/components/calendar/EventList';

interface FamilyCalendarProps {
  selectedHousehold?: Household | null;
}

const FamilyCalendar: React.FC<FamilyCalendarProps> = ({ selectedHousehold }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { getEventsForDate, getDatesWithEvents, addEvent, getUpcomingEvents } = useCalendarEvents();

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];
  const upcomingEvents = getUpcomingEvents();

  if (!selectedHousehold) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Household Selected</h3>
          <p className="text-muted-foreground">Please select a household to view the family calendar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Family Calendar</h1>
          <p className="text-muted-foreground">Stay organized with your family schedule</p>
        </div>
        <AddEventDialog selectedDate={selectedDate} onAddEvent={addEvent} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {selectedDate ? format(selectedDate, 'MMMM yyyy') : 'Calendar'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className={cn("w-full pointer-events-auto")}
              modifiers={{
                hasEvents: getDatesWithEvents(),
              }}
              modifiersStyles={{
                hasEvents: { 
                  backgroundColor: 'rgb(59 130 246 / 0.1)',
                  color: 'rgb(59 130 246)',
                  fontWeight: 'bold'
                }
              }}
            />
          </CardContent>
        </Card>

        {/* Events for Selected Date */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'Select a date'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EventList 
              events={selectedDateEvents}
              title="Events for Selected Date"
              emptyMessage="No events for this date"
              emptySubMessage="Click 'Add Event' to create one"
            />
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          <EventList 
            events={upcomingEvents}
            title="Upcoming Events"
            showDate={true}
            emptyMessage="No upcoming events"
            emptySubMessage="Add your first family event to get started!"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default FamilyCalendar;
