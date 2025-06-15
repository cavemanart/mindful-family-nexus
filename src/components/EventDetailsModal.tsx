
import React, { useState } from 'react';
import { AdvancedCalendarEvent, EventCategory } from '@/types/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Calendar, User, Tag, Edit, Save, X } from 'lucide-react';

// NEW: Import AdvancedEventForm
import AdvancedEventForm from "@/components/AdvancedEventForm";

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: AdvancedCalendarEvent | null;
  categories: EventCategory[];
  onEventUpdate: (eventId: string, updates: Partial<AdvancedCalendarEvent>) => Promise<any>;
  onEventDelete: (eventId: string) => Promise<boolean>;
  canEdit: boolean;
  householdId: string; // required for AdvancedEventForm
}

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  isOpen,
  onClose,
  event,
  categories,
  onEventUpdate,
  onEventDelete,
  canEdit,
  householdId,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  if (!event) return null;

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(c => c.name.toLowerCase() === categoryName?.toLowerCase());
    return category?.color || '#3b82f6';
  };

  const formatDateTime = (datetime: string) => {
    return new Date(datetime).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // NEW: Handler for updating the event from AdvancedEventForm
  const handleUpdateEvent = async (formEventData: Omit<AdvancedCalendarEvent, 'id' | 'creator_id' | 'created_at'>) => {
    await onEventUpdate(event.id, formEventData);
    setIsEditing(false);
    onClose();
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      await onEventDelete(event.id);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            {isEditing ? 'Edit Event' : 'Event Details'}
          </DialogTitle>
        </DialogHeader>
        <div>
          {isEditing ? (
            <AdvancedEventForm
              onEventCreated={handleUpdateEvent}
              onCancel={() => setIsEditing(false)}
              categories={categories}
              householdId={householdId}
              initialEvent={event}
            />
          ) : (
            <Card className="border-l-4" style={{ borderLeftColor: getCategoryColor(event.category || 'general') }}>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{event.title}</h3>
                {event.description && (
                  <p className="text-gray-600 dark:text-gray-400">{event.description}</p>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span>{formatDateTime(event.start_datetime)}</span>
                  {event.end_datetime && (
                    <span> - {new Date(event.end_datetime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                  )}
                </div>
                {event.category && (
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-gray-500" />
                    <Badge 
                      variant="outline" 
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
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Assigned to: {event.assigned_to.join(', ')}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
        <div className="flex justify-between pt-4">
          <div>
            {canEdit && !isEditing && (
              <div className="flex gap-2">
                <Button onClick={() => setIsEditing(true)} variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button onClick={handleDelete} variant="outline" className="text-red-600 hover:text-red-700">
                  <X className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventDetailsModal;
