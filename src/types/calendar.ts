export interface AdvancedCalendarEvent {
  id: string;
  household_id: string;
  creator_id: string;
  title: string;
  description?: string;
  start_datetime: string;
  end_datetime?: string;
  category?: string;
  color?: string;
  assigned_to?: string[];
  is_recurring?: boolean;
  recurrence_pattern?: string;
  recurrence_end?: string;
  created_at: string;
  updated_at: string;
}

export interface EventCategory {
  id: string;
  household_id: string;
  name: string;
  color: string;
  icon?: string;
  created_at: string;
  updated_at: string;
}

export interface EventReminder {
  id: string;
  event_id: string;
  user_id: string;
  reminder_time: string;
  is_sent: boolean;
  created_at: string;
}

export interface CalendarView {
  type: 'month' | 'week' | 'day';
  date: Date;
}
