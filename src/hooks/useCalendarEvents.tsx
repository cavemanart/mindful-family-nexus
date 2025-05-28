
import { useState } from 'react';
import { CalendarEvent } from '@/types/calendar';
import { isSameDay } from 'date-fns';

export const useCalendarEvents = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: '1',
      title: 'Soccer Practice',
      description: 'Emma\'s soccer practice at the local field',
      date: new Date(2024, 11, 15),
      time: '16:00',
      createdBy: 'Mom',
      color: 'bg-blue-500'
    },
    {
      id: '2',
      title: 'Family Dinner',
      description: 'Weekly family dinner with grandparents',
      date: new Date(2024, 11, 17),
      time: '18:00',
      createdBy: 'Dad',
      color: 'bg-green-500'
    }
  ]);

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(event.date, date));
  };

  const getDatesWithEvents = () => {
    return events.map(event => event.date);
  };

  const addEvent = (event: CalendarEvent) => {
    setEvents([...events, event]);
  };

  const getUpcomingEvents = () => {
    return events
      .filter(event => event.date >= new Date())
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 6);
  };

  return {
    events,
    getEventsForDate,
    getDatesWithEvents,
    addEvent,
    getUpcomingEvents
  };
};
