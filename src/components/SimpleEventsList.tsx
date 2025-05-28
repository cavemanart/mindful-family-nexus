
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SimpleCalendarEvent } from '@/hooks/useSimpleCalendarEvents';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { Calendar, Clock, Trash2, Edit2 } from 'lucide-react';

interface SimpleEventsListProps {
  events: SimpleCalendarEvent[];
  onEventDeleted: (eventId: string) => Promise<boolean>;
  loading: boolean;
}

const SimpleEventsList: React.FC<SimpleEventsListProps> = ({ 
  events, 
  onEventDeleted, 
  loading 
}) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      setDeletingId(eventId);
      await onEventDeleted(eventId);
      setDeletingId(null);
    }
  };

  const getDateBadge = (date: Date) => {
    if (isToday(date)) {
      return <Badge className="bg-blue-500">Today</Badge>;
    }
    if (isTomorrow(date)) {
      return <Badge className="bg-green-500">Tomorrow</Badge>;
    }
    if (isPast(date)) {
      return <Badge variant="outline" className="text-gray-500">Past</Badge>;
    }
    return <Badge variant="outline">Upcoming</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading events...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No events yet</p>
            <p className="text-sm text-gray-500">Add your first event above!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Your Events
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map(event => {
            const eventDate = new Date(event.start_datetime);
            
            return (
              <div
                key={event.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">{event.title}</h3>
                      {getDateBadge(eventDate)}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        {format(eventDate, 'MMM d, yyyy')} at {format(eventDate, 'h:mm a')}
                      </span>
                    </div>
                    
                    {event.description && (
                      <p className="text-sm text-gray-700">{event.description}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(event.id)}
                      disabled={deletingId === event.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleEventsList;
