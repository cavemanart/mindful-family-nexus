
export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  createdBy: string;
  color: string;
}

export const eventColors = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-red-500',
  'bg-yellow-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-orange-500'
];
