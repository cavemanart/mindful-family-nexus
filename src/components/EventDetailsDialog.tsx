
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarEvent, EventType } from '@/hooks/useCalendarEvents';
import { useEventRSVPs } from '@/hooks/useEventRSVPs';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, Users, Trash2, Edit } from 'lucide-react';

interface EventDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  events: CalendarEvent[];
  eventTypes: EventType[];
  onEventUpdated: (eventId: string, updates: Partial<CalendarEvent>) => Promise<CalendarEvent | null>;
  onEventDeleted: (eventId: string) => Promise<boolean>;
  canEdit: boolean;
}

const EventDetailsDialog: React.FC<EventDetailsDialogProps> = ({
  isOpen,
  onClose,
  eventId,
  events,
  eventTypes,
  onEventDeleted,
  canEdit
}) => {
  const event = events.find(e => e.id === eventId);
  const { rsvps, userRSVP, updateRSVP, loading: rsvpLoading } = useEventRSVPs(eventId);

  if (!event) return null;

  const eventType = eventTypes.find(type => type.type_key === event.event_type);

  const handleRSVPUpdate = async (status: 'accepted' | 'declined' | 'maybe') => {
    await updateRSVP(status);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      const success = await onEventDeleted(eventId);
      if (success) {
        onClose();
      }
    }
  };

  const getRSVPCounts = () => {
    const counts = rsvps.reduce((acc, rsvp) => {
      acc[rsvp.status] = (acc[rsvp.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      accepted: counts.accepted || 0,
      declined: counts.declined || 0,
      maybe: counts.maybe || 0,
      pending: counts.pending || 0,
    };
  };

  const rsvpCounts = getRSVPCounts();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${eventType?.color || 'bg-gray-500'}`}></div>
            {event.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Details */}
          <div className="space-y-4">
            {event.description && (
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-gray-600">{event.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Date</p>
                  <p className="text-sm text-gray-600">
                    {event.all_day 
                      ? format(new Date(event.start_datetime), 'MMM d, yyyy')
                      : format(new Date(event.start_datetime), 'MMM d, yyyy')
                    }
                  </p>
                </div>
              </div>

              {!event.all_day && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Time</p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(event.start_datetime), 'h:mm a')} - {format(new Date(event.end_datetime!), 'h:mm a')}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-sm text-gray-600">{event.location}</p>
                </div>
              </div>
            )}

            {event.assigned_to && event.assigned_to.length > 0 && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Assigned To</p>
                  <p className="text-sm text-gray-600">{event.assigned_to.join(', ')}</p>
                </div>
              </div>
            )}
          </div>

          {/* RSVP Section */}
          <div className="space-y-4">
            <h4 className="font-medium">RSVP</h4>
            
            {/* User's RSVP */}
            <div className="flex items-center gap-2">
              <span className="text-sm">Your response:</span>
              {userRSVP ? (
                <Badge 
                  variant={userRSVP.status === 'accepted' ? 'default' : 'outline'}
                  className={
                    userRSVP.status === 'accepted' ? 'bg-green-500' :
                    userRSVP.status === 'declined' ? 'bg-red-500' :
                    userRSVP.status === 'maybe' ? 'bg-yellow-500' : ''
                  }
                >
                  {userRSVP.status}
                </Badge>
              ) : (
                <Badge variant="outline">Not responded</Badge>
              )}
            </div>

            {/* RSVP Actions */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={userRSVP?.status === 'accepted' ? 'default' : 'outline'}
                onClick={() => handleRSVPUpdate('accepted')}
                disabled={rsvpLoading}
                className="flex-1"
              >
                Accept
              </Button>
              <Button
                size="sm"
                variant={userRSVP?.status === 'maybe' ? 'default' : 'outline'}
                onClick={() => handleRSVPUpdate('maybe')}
                disabled={rsvpLoading}
                className="flex-1"
              >
                Maybe
              </Button>
              <Button
                size="sm"
                variant={userRSVP?.status === 'declined' ? 'default' : 'outline'}
                onClick={() => handleRSVPUpdate('declined')}
                disabled={rsvpLoading}
                className="flex-1"
              >
                Decline
              </Button>
            </div>

            {/* RSVP Summary */}
            {rsvps.length > 0 && (
              <div className="text-sm text-gray-600">
                <p>
                  {rsvpCounts.accepted} accepted, {rsvpCounts.declined} declined, {rsvpCounts.maybe} maybe, {rsvpCounts.pending} pending
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t">
            <div className="flex gap-2">
              {canEdit && (
                <>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDelete}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </>
              )}
            </div>
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventDetailsDialog;
