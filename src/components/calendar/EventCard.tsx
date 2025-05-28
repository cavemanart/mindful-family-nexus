
import React from 'react';
import { CalendarEvent } from '@/types/calendar';
import { Clock, User, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface EventCardProps {
  event: CalendarEvent;
  showDate?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ event, showDate = false }) => {
  return (
    <div className="border rounded-lg p-3 space-y-2">
      <div className="flex items-center gap-2">
        <div className={cn("w-3 h-3 rounded-full", event.color)} />
        <h4 className="font-semibold text-sm">{event.title}</h4>
      </div>
      {showDate && (
        <p className="text-sm text-muted-foreground flex items-center gap-1">
          <CalendarIcon className="h-3 w-3" />
          {format(event.date, 'MMM d, yyyy')}
        </p>
      )}
      {event.time && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {event.time}
        </p>
      )}
      {event.description && (
        <p className="text-xs text-muted-foreground">{event.description}</p>
      )}
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        <User className="h-3 w-3" />
        Added by {event.createdBy}
      </p>
    </div>
  );
};

export default EventCard;
