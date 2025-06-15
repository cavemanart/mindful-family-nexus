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

const getEventSegmentType = (
  event: AdvancedCalendarEvent,
  targetDate: Date
): 'single' | 'start' | 'middle' | 'end' => {
  // Handle missing end date (single day event)
  if (!event.end_datetime) return 'single';

  // Start and end as midnight for comparison
  const start = new Date(event.start_datetime);
  const end = new Date(event.end_datetime);
  // Zero time on targetDate for comparison
  const date = new Date(targetDate);
  date.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  if (start.getTime() === end.getTime()) return 'single';
  if (date.getTime() === start.getTime()) return 'start';
  if (date.getTime() === end.getTime()) return 'end';
  if (date > start && date < end) return 'middle';
  return 'single'; // defensive
};

const getEventsForDate = (date: Date, events: AdvancedCalendarEvent[]) => {
  const dateStr = date.toISOString().split('T')[0];
  // Include both single-day and multi-day events spanning this date
  return events.filter(event => {
    const eventStart = new Date(event.start_datetime);
    const eventEnd = event.end_datetime
      ? new Date(event.end_datetime)
      : eventStart;
    // Set all to midnight for comparison
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    eventStart.setHours(0, 0, 0, 0);
    eventEnd.setHours(0, 0, 0, 0);
    return compareDate >= eventStart && compareDate <= eventEnd;
  });
};

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
          
          const dayEvents = getEventsForDate(date, events);
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
                {dayEvents
                  .sort((a, b) => 
                    new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime()
                  )
                  .slice(0, 3)
                  .map(event => {
                    const segment = getEventSegmentType(event, date);
                    const isMultiDay = !!event.end_datetime && (
                      new Date(event.start_datetime).toDateString() !==
                      new Date(event.end_datetime!).toDateString()
                    );
                    const color = getCategoryColor(event.category || 'general');
                    // Set style based on segment
                    let style = {};
                    let classes =
                      'text-xs p-1.5 shadow-sm border-l-2 border-r-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:shadow-md transition-all hover:bg-white dark:hover:bg-gray-800 flex items-center gap-2';
                    if (isMultiDay) {
                      if (segment === 'start') {
                        classes += ' rounded-l-md rounded-r-none pr-2';
                        style = { borderLeftColor: color, borderRightWidth: 0 };
                      } else if (segment === 'middle') {
                        classes += ' rounded-none border-l-0 border-r-0 pl-2 pr-2';
                        style = { borderLeftWidth: 0, borderRightWidth: 0, backgroundColor: color + '20' };
                      } else if (segment === 'end') {
                        classes += ' rounded-r-md rounded-l-none pl-2';
                        style = { borderLeftWidth: 0, backgroundColor: color + '20' };
                      }
                    } else {
                      // single-day
                      style = { borderLeftColor: color };
                    }
                    return (
                      <div
                        key={event.id}
                        className="group/event relative cursor-pointer transition-all duration-200 hover:scale-105"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event);
                        }}
                      >
                        <div
                          className={classes}
                          style={style}
                        >
                          <div className="flex items-center gap-1 mb-0.5">
                            <Clock className="h-2.5 w-2.5 text-gray-500" />
                            <span className="text-gray-600 dark:text-gray-400 text-xs">
                              {formatEventTime(event.start_datetime)}
                              {isMultiDay && segment === 'end' && event.end_datetime ? <> - {formatEventTime(event.end_datetime)}</> : null}
                            </span>
                          </div>
                          <div className="font-medium text-gray-900 dark:text-gray-100 truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400">
                            {event.title}
                          </div>
                          {event.category && (
                            <div 
                              className="inline-block mt-1 px-1 py-0.5 rounded text-xs text-white text-center"
                              style={{ backgroundColor: color }}
                            >
                              {event.category}
                            </div>
                          )}
                        </div>
                        {/* indicator bar for multi-day */}
                        {isMultiDay && segment === 'start' && (
                          <span className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-1 rounded-r-full bg-[var(--event-color,theme(colors.blue.500))]" style={{ backgroundColor: color }} />
                        )}
                        {isMultiDay && segment === 'end' && (
                          <span className="absolute left-0 top-1/2 transform -translate-y-1/2 w-2 h-1 rounded-l-full bg-[var(--event-color,theme(colors.blue.500))]" style={{ backgroundColor: color }} />
                        )}
                        {isMultiDay && segment === 'middle' && (
                          <>
                            <span className="absolute left-0 top-1/2 transform -translate-y-1/2 w-2 h-1 bg-[var(--event-color,theme(colors.blue.500))]" style={{ backgroundColor: color }} />
                            <span className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-1 bg-[var(--event-color,theme(colors.blue.500))]" style={{ backgroundColor: color }} />
                          </>
                        )}
                      </div>
                    );
                  })}
                
                {dayEvents.length > 3 && (
                  <div 
                    className="text-xs text-gray-500 dark:text-gray-400 px-1.5 py-1 bg-gray-100 dark:bg-gray-800 rounded flex items-center gap-1 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDateClick(date);
                    }}
                  >
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
