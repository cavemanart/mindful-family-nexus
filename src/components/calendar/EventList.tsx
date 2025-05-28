
import React from 'react';
import { CalendarEvent } from '@/types/calendar';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import EventCard from './EventCard';

interface EventListProps {
  events: CalendarEvent[];
  title: string;
  showDate?: boolean;
  emptyMessage?: string;
  emptySubMessage?: string;
}

const EventList: React.FC<EventListProps> = ({ 
  events, 
  title, 
  showDate = false,
  emptyMessage = "No events",
  emptySubMessage = "No events to display"
}) => {
  if (events.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">{emptyMessage}</p>
        <p className="text-xs">{emptySubMessage}</p>
      </div>
    );
  }

  if (showDate) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => (
          <EventCard key={event.id} event={event} showDate={showDate} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} showDate={showDate} />
      ))}
    </div>
  );
};

export default EventList;
