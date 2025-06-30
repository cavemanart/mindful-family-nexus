
import { parse, addDays, startOfWeek, addWeeks, setHours, setMinutes, isValid } from 'date-fns';

export interface ParsedEventData {
  title: string;
  start_datetime: string;
  end_datetime?: string;
  category?: string;
  confidence: number;
  suggestions?: string[];
}

export interface ParsingResult {
  success: boolean;
  data?: ParsedEventData;
  error?: string;
  ambiguities?: string[];
}

// Common time patterns
const TIME_PATTERNS = [
  { pattern: /(\d{1,2}):(\d{2})\s*(am|pm)/i, format: '12-hour' },
  { pattern: /(\d{1,2})\s*(am|pm)/i, format: '12-hour-simple' },
  { pattern: /(\d{1,2}):(\d{2})/i, format: '24-hour' },
  { pattern: /(\d{1,2})(\d{2})/i, format: '24-hour-compact' }
];

// Common date patterns
const DATE_PATTERNS = [
  { pattern: /\b(today)\b/i, type: 'relative', offset: 0 },
  { pattern: /\b(tomorrow)\b/i, type: 'relative', offset: 1 },
  { pattern: /\b(yesterday)\b/i, type: 'relative', offset: -1 },
  { pattern: /\b(monday|mon)\b/i, type: 'weekday', day: 1 },
  { pattern: /\b(tuesday|tue)\b/i, type: 'weekday', day: 2 },
  { pattern: /\b(wednesday|wed)\b/i, type: 'weekday', day: 3 },
  { pattern: /\b(thursday|thu)\b/i, type: 'weekday', day: 4 },
  { pattern: /\b(friday|fri)\b/i, type: 'weekday', day: 5 },
  { pattern: /\b(saturday|sat)\b/i, type: 'weekday', day: 6 },
  { pattern: /\b(sunday|sun)\b/i, type: 'weekday', day: 0 },
  { pattern: /\b(next)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i, type: 'next-weekday' },
  { pattern: /\b(this)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i, type: 'this-weekday' }
];

// Event categories based on keywords
const CATEGORY_KEYWORDS = {
  medical: ['doctor', 'appointment', 'dentist', 'checkup', 'medical', 'hospital', 'clinic'],
  work: ['meeting', 'work', 'conference', 'call', 'presentation', 'office'],
  personal: ['birthday', 'anniversary', 'party', 'celebration', 'dinner', 'lunch'],
  kids: ['school', 'pickup', 'dropoff', 'practice', 'lesson', 'playground', 'daycare'],
  household: ['grocery', 'shopping', 'cleaning', 'maintenance', 'repair', 'utilities'],
  social: ['coffee', 'drinks', 'hangout', 'visit', 'catch up', 'date night']
};

function extractTime(text: string): { hour: number; minute: number } | null {
  for (const { pattern, format } of TIME_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      let hour = parseInt(match[1]);
      let minute = 0;
      
      if (format === '12-hour' || format === '12-hour-simple') {
        minute = match[2] ? parseInt(match[2]) : 0;
        const period = match[3] || match[2];
        if (period && period.toLowerCase() === 'pm' && hour < 12) {
          hour += 12;
        } else if (period && period.toLowerCase() === 'am' && hour === 12) {
          hour = 0;
        }
      } else if (format === '24-hour') {
        minute = parseInt(match[2]);
      } else if (format === '24-hour-compact') {
        const timeStr = match[1] + match[2];
        if (timeStr.length === 4) {
          hour = parseInt(timeStr.slice(0, 2));
          minute = parseInt(timeStr.slice(2, 4));
        }
      }
      
      if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
        return { hour, minute };
      }
    }
  }
  return null;
}

function extractDate(text: string): Date | null {
  const today = new Date();
  
  for (const { pattern, type, offset, day } of DATE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      if (type === 'relative' && typeof offset === 'number') {
        return addDays(today, offset);
      } else if (type === 'weekday' && typeof day === 'number') {
        const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 0 });
        const targetDate = addDays(startOfCurrentWeek, day);
        // If the day has already passed this week, go to next week
        return targetDate < today ? addDays(targetDate, 7) : targetDate;
      } else if (type === 'next-weekday') {
        const weekdayName = match[2].toLowerCase();
        const weekdayMap: Record<string, number> = {
          monday: 1, tuesday: 2, wednesday: 3, thursday: 4,
          friday: 5, saturday: 6, sunday: 0
        };
        const targetDay = weekdayMap[weekdayName];
        if (targetDay !== undefined) {
          const nextWeek = addWeeks(startOfWeek(today, { weekStartsOn: 0 }), 1);
          return addDays(nextWeek, targetDay);
        }
      } else if (type === 'this-weekday') {
        const weekdayName = match[2].toLowerCase();
        const weekdayMap: Record<string, number> = {
          monday: 1, tuesday: 2, wednesday: 3, thursday: 4,
          friday: 5, saturday: 6, sunday: 0
        };
        const targetDay = weekdayMap[weekdayName];
        if (targetDay !== undefined) {
          const thisWeek = startOfWeek(today, { weekStartsOn: 0 });
          const targetDate = addDays(thisWeek, targetDay);
          return targetDate < today ? addDays(targetDate, 7) : targetDate;
        }
      }
    }
  }
  
  return null;
}

function detectCategory(text: string): string | null {
  const lowerText = text.toLowerCase();
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        return category;
      }
    }
  }
  
  return null;
}

function extractTitle(text: string): string {
  // Remove time and date patterns to get cleaner title
  let title = text;
  
  // Remove time patterns
  for (const { pattern } of TIME_PATTERNS) {
    title = title.replace(pattern, '');
  }
  
  // Remove date patterns
  for (const { pattern } of DATE_PATTERNS) {
    title = title.replace(pattern, '');
  }
  
  // Clean up extra spaces and common prepositions
  title = title
    .replace(/\b(at|on|for|with|in)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Capitalize first letter
  return title.charAt(0).toUpperCase() + title.slice(1);
}

export function parseNaturalLanguage(input: string): ParsingResult {
  if (!input.trim()) {
    return {
      success: false,
      error: 'Please enter an event description'
    };
  }

  try {
    const text = input.trim();
    
    // Extract components
    const extractedDate = extractDate(text);
    const extractedTime = extractTime(text);
    const title = extractTitle(text);
    const category = detectCategory(text);
    
    if (!title) {
      return {
        success: false,
        error: 'Could not extract event title'
      };
    }
    
    // Default to today if no date found
    const eventDate = extractedDate || new Date();
    
    // Default to 9 AM if no time found
    const { hour = 9, minute = 0 } = extractedTime || {};
    
    // Create start datetime
    const startDateTime = setMinutes(setHours(eventDate, hour), minute);
    
    if (!isValid(startDateTime)) {
      return {
        success: false,
        error: 'Invalid date or time detected'
      };
    }
    
    // Create end datetime (1 hour later by default)
    const endDateTime = addDays(startDateTime, 0);
    endDateTime.setHours(startDateTime.getHours() + 1);
    
    const confidence = calculateConfidence(text, extractedDate, extractedTime, title);
    
    return {
      success: true,
      data: {
        title,
        start_datetime: startDateTime.toISOString(),
        end_datetime: endDateTime.toISOString(),
        category: category || 'general',
        confidence,
        suggestions: generateSuggestions(text, title, category)
      }
    };
    
  } catch (error) {
    console.error('Error parsing natural language:', error);
    return {
      success: false,
      error: 'Failed to parse event description'
    };
  }
}

function calculateConfidence(text: string, date: Date | null, time: any, title: string): number {
  let confidence = 0.5; // Base confidence
  
  if (date) confidence += 0.2;
  if (time) confidence += 0.2;
  if (title.length > 3) confidence += 0.1;
  
  return Math.min(confidence, 1.0);
}

function generateSuggestions(text: string, title: string, category: string | null): string[] {
  const suggestions = [];
  
  if (!category) {
    suggestions.push('Consider adding a category keyword (e.g., "doctor appointment", "team meeting")');
  }
  
  if (!text.match(/\d/)) {
    suggestions.push('Add a specific time (e.g., "at 3pm", "2:30")');
  }
  
  return suggestions;
}
