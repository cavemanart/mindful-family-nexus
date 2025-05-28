
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SimpleCalendarEvent } from '@/hooks/useSimpleCalendarEvents';
import { format } from 'date-fns';

interface SimpleEventFormProps {
  onEventCreated: (eventData: Omit<SimpleCalendarEvent, 'id' | 'creator_id' | 'created_at'>) => Promise<SimpleCalendarEvent | null>;
  householdId: string;
}

const SimpleEventForm: React.FC<SimpleEventFormProps> = ({ onEventCreated, householdId }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [time, setTime] = useState('09:00');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);

    try {
      const startDateTime = new Date(`${date}T${time}:00`);

      const eventData: Omit<SimpleCalendarEvent, 'id' | 'creator_id' | 'created_at'> = {
        household_id: householdId,
        title: title.trim(),
        description: description.trim() || undefined,
        start_datetime: startDateTime.toISOString(),
      };

      const result = await onEventCreated(eventData);
      if (result) {
        // Reset form
        setTitle('');
        setDescription('');
        setDate(format(new Date(), 'yyyy-MM-dd'));
        setTime('09:00');
      }
    } catch (error) {
      console.error('Error creating event:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Event</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's happening?"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add any additional details..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="time">Time (optional)</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <Button type="submit" disabled={loading || !title.trim()} className="w-full">
            {loading ? 'Adding Event...' : 'Add Event'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SimpleEventForm;
