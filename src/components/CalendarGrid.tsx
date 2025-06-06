
import React from 'react';
import { AdvancedCalendarEvent, EventCategory, CalendarView } from '@/types/calendar';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MoreHorizontal } from 'lucide-react';

interface CalendarGridProps {
  events: AdvancedCalendarEvent[];
  categories: EventCategory[];
  view: CalendarView;
  onEventClick: (event: AdvancedCalendarEvent) => void;
  onDateClick: (date: Date) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  events,
  categories,
  view,
  onEventClick,
  onDateClick,
}) => {
  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(c => c.name.toLowerCase() === categoryName?.toLowerCase());
    return category?.color || '#3b82f6';
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => {
      const eventDate = new Date(event.start_datetime).toISOString().split('T')[0];
      return eventDate === dateStr;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const formatEventTime = (datetime: string) => {
    return new Date(datetime).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const days = getDaysInMonth(view.date);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card className="overflow-hidden shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header with days of week */}
      <div className="grid grid-cols-7 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-b border-gray-200 dark:border-gray-700">
        {weekDays.map(day => (
          <div key={day} className="p-4 text-center font-semibold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wide">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {days.map((date, index) => {
          if (!date) {
            return (
              <div 
                key={index} 
                className="h-32 md:h-36 lg:h-40 border-r border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50"
              />
            );
          }
          
          const dayEvents = getEventsForDate(date);
          const today = isToday(date);
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
          
          return (
            <div
              key={date.toISOString()}
              className={`h-32 md:h-36 lg:h-40 border-r border-b border-gray-100 dark:border-gray-800 cursor-pointer transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-950/30 group relative ${
                today ? 'bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50' : 
                isWeekend ? 'bg-gray-50/70 dark:bg-gray-900/30' : 'bg-white dark:bg-gray-900'
              }`}
              onClick={() => onDateClick(date)}
            >
              {/* Date number */}
              <div className="p-2 flex justify-between items-start">
                <span className={`text-sm font-semibold transition-colors ${
                  today ? 'text-blue-700 dark:text-blue-300' : 
                  isWeekend ? 'text-gray-500 dark:text-gray-400' : 
                  'text-gray-900 dark:text-gray-100'
                }`}>
                  {date.getDate()}
                </span>
                {dayEvents.length > 0 && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    {dayEvents.length}
                  </Badge>
                )}
              </div>

              {/* Events */}
              <div className="px-2 pb-2 space-y-1 overflow-hidden">
                {dayEvents.slice(0, 3).map(event => (
                  <div
                    key={event.id}
                    className="group/event relative cursor-pointer transition-all duration-200 hover:scale-105"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                  >
                    <div
                      className="text-xs p-1.5 rounded-md shadow-sm border-l-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:shadow-md transition-shadow"
                      style={{ borderLeftColor: getCategoryColor(event.category || 'general') }}
                    >
                      <div className="flex items-center gap-1 mb-0.5">
                        <Clock className="h-2.5 w-2.5 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400 text-xs">
                          {formatEventTime(event.start_datetime)}
                        </span>
                      </div>
                      <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {event.title}
                      </div>
                      {event.category && (
                        <div 
                          className="inline-block mt-1 px-1 py-0.5 rounded text-xs text-white text-center"
                          style={{ backgroundColor: getCategoryColor(event.category) }}
                        >
                          {event.category}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 px-1.5 py-1 bg-gray-100 dark:bg-gray-800 rounded flex items-center gap-1 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    <MoreHorizontal className="h-3 w-3" />
                    <span>+{dayEvents.length - 3} more</span>
                  </div>
                )}
              </div>

              {/* Hover effect */}
              <div className="absolute inset-0 bg-blue-100/20 dark:bg-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default CalendarGrid;
