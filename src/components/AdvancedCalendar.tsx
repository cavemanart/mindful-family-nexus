
import React, { useState } from 'react';
import { Calendar as CalendarIcon, Plus, Filter, Grid3X3, List, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAdvancedCalendar } from '@/hooks/useAdvancedCalendar';
import { useAuth } from '@/hooks/useAuth';
import { useHouseholdSubscription } from '@/hooks/useHouseholdSubscription';
import AdvancedEventForm from './AdvancedEventForm';
import CalendarGrid from './CalendarGrid';
import EventsList from './EventsList';
import CategoryFilter from './CategoryFilter';
import KeywordSearch from './KeywordSearch';
import DayEventsModal from './DayEventsModal';
import SubscriptionBadge from './SubscriptionBadge';
import { CalendarView, AdvancedCalendarEvent } from '@/types/calendar';
import EventDetailsModal from './EventDetailsModal';
import { toast } from 'sonner';
import QuickAddFloatingButton from './QuickAddFloatingButton';
import QuickAddEventInput from './QuickAddEventInput';
import { ParsedEventData } from '@/utils/naturalLanguageParser';

interface Household {
  id: string;
  name: string;
}

interface AdvancedCalendarProps {
  selectedHousehold: Household | null;
}

const AdvancedCalendar: React.FC<AdvancedCalendarProps> = ({ selectedHousehold }) => {
  const { userProfile } = useAuth();
  const { events, categories, loading, error, createEvent, updateEvent, deleteEvent } = useAdvancedCalendar(selectedHousehold?.id || null);
  const { subscriptionStatus, loading: subscriptionLoading } = useHouseholdSubscription();
  const [view, setView] = useState<CalendarView>({ type: 'month', date: new Date() });
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isGridView, setIsGridView] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDayModal, setShowDayModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AdvancedCalendarEvent | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  // Allow all authenticated users (including children) to create events
  const canCreateEvents = !!userProfile;

  // Filter events by categories and keywords for calendar display
  const filteredEvents = events.filter(event => {
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(event.category || 'general');
    const matchesKeyword = searchKeyword === '' || 
      event.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchKeyword.toLowerCase());
    
    return matchesCategory && matchesKeyword;
  });

  // Get ALL events for selected date in day modal (unfiltered)
  const selectedDateAllEvents = selectedDate ? events.filter(event => {
    const eventDate = new Date(event.start_datetime).toISOString().split('T')[0];
    const selectedDateStr = selectedDate.toISOString().split('T')[0];
    return eventDate === selectedDateStr;
  }) : [];

  const navigateMonth = (direction: 'prev' | 'next') => {
    setView(prev => {
      const newDate = new Date(prev.date);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return { ...prev, date: newDate };
    });
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowDayModal(true);
  };

  const handleDayNavigation = (direction: 'prev' | 'next') => {
    if (!selectedDate) return;
    
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setSelectedDate(newDate);
  };

  const handleCreateEventForDate = () => {
    setShowDayModal(false);
    setShowEventForm(true);
  };

  const handleEventClick = (event: AdvancedCalendarEvent) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  const handleEditEvent = (event: AdvancedCalendarEvent) => {
    setSelectedEvent(event);
    setShowDayModal(false);
    setShowEventDetails(true);
  };

  const handleAssignEvent = (event: AdvancedCalendarEvent) => {
    // For now, just open the event details modal where assignment can be handled
    setSelectedEvent(event);
    setShowDayModal(false);
    setShowEventDetails(true);
  };

  const handleQuickAddEvent = async (parsedData: ParsedEventData) => {
    if (!selectedHousehold) return;

    console.log('🚀 Quick adding event:', parsedData);

    // Convert parsed data to event format
    const eventData = {
      household_id: selectedHousehold.id,
      title: parsedData.title,
      description: `Created via quick add (${Math.round(parsedData.confidence * 100)}% confidence)`,
      start_datetime: parsedData.start_datetime,
      end_datetime: parsedData.end_datetime || null,
      category: parsedData.category || 'general',
      color: null,
      assigned_to: [],
      is_recurring: false,
      recurrence_pattern: null,
      recurrence_end: null,
    };

    const result = await createEvent(eventData);
    if (result) {
      toast.success(`Event "${parsedData.title}" created successfully!`);
      if (parsedData.suggestions && parsedData.suggestions.length > 0) {
        toast.info('Check the event details to refine the information');
      }
    }
  };

  if (!selectedHousehold) {
    return (
      <div className="text-center py-8">
        <CalendarIcon className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Please select a household to view calendar</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  const currentMonth = view.date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Advanced Family Calendar</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">{selectedHousehold.name}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!subscriptionLoading && (
            <SubscriptionBadge 
              planType={subscriptionStatus.planType}
              isTrialActive={subscriptionStatus.isTrialActive}
              trialEndDate={subscriptionStatus.subscriptionEndDate}
            />
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsGridView(!isGridView)}
            className="text-xs sm:text-sm"
          >
            {isGridView ? <List className="h-3 w-3 sm:h-4 sm:w-4" /> : <Grid3X3 className="h-3 w-3 sm:h-4 sm:w-4" />}
            <span className="hidden sm:inline ml-1">{isGridView ? 'List View' : 'Grid View'}</span>
          </Button>
          {canCreateEvents && (
            <>
              <Button 
                onClick={() => setShowQuickAdd(true)} 
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm"
              >
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline ml-1">Quick Add</span>
              </Button>
              <Button 
                onClick={() => setShowEventForm(true)} 
                size="sm"
                className="text-xs sm:text-sm"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline ml-1">Add Event</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Quick Add Modal */}
      {showQuickAdd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <QuickAddEventInput
            onEventParsed={(data) => {
              handleQuickAddEvent(data);
              setShowQuickAdd(false);
            }}
            onCancel={() => setShowQuickAdd(false)}
          />
        </div>
      )}

      {/* Navigation and Filters */}
      <div className="space-y-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-base sm:text-lg font-semibold text-center text-gray-900 dark:text-gray-100 min-w-0 flex-1 sm:min-w-48 sm:flex-none">
            {currentMonth}
          </h3>
          <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-center sm:space-y-0 gap-3">
          <div className="w-full sm:w-64">
            <KeywordSearch
              searchKeyword={searchKeyword}
              onSearchChange={setSearchKeyword}
              placeholder="Search events..."
            />
          </div>
          
          <CategoryFilter
            categories={categories}
            selectedCategories={selectedCategories}
            onCategoryChange={setSelectedCategories}
          />
        </div>
      </div>

      {/* Search/Filter Results Summary */}
      {(searchKeyword || selectedCategories.length > 0) && (
        <div className="flex flex-wrap items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <span className="text-sm text-blue-800 dark:text-blue-200">
            Showing {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
          </span>
          {searchKeyword && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              "{searchKeyword}"
            </Badge>
          )}
          {selectedCategories.map(category => (
            <Badge key={category} variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              {category}
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchKeyword('');
              setSelectedCategories([]);
            }}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
          >
            Clear filters
          </Button>
        </div>
      )}

      {/* Calendar Content */}
      <div className="min-w-0 overflow-hidden">
        {isGridView ? (
          <div className="overflow-x-auto">
            <CalendarGrid
              events={filteredEvents}
              categories={categories}
              view={view}
              onEventClick={handleEventClick}
              onDateClick={handleDateClick}
            />
          </div>
        ) : (
          <EventsList
            events={filteredEvents}
            categories={categories}
            onEventEdit={updateEvent}
            onEventDelete={deleteEvent}
            onEventClick={handleEventClick}
            loading={loading}
            canEdit={canCreateEvents}
          />
        )}
      </div>

      {/* Event Details Modal */}
      <EventDetailsModal
        isOpen={showEventDetails}
        onClose={() => setShowEventDetails(false)}
        event={selectedEvent}
        categories={categories}
        onEventUpdate={updateEvent}
        onEventDelete={deleteEvent}
        canEdit={canCreateEvents}
        householdId={selectedHousehold.id}
      />

      {/* Day Events Modal */}
      <DayEventsModal
        isOpen={showDayModal}
        onClose={() => setShowDayModal(false)}
        selectedDate={selectedDate}
        events={selectedDateAllEvents}
        categories={categories}
        onEventClick={handleEventClick}
        onCreateEvent={canCreateEvents ? handleCreateEventForDate : undefined}
        onNavigateDate={handleDayNavigation}
        canCreateEvents={canCreateEvents}
        onEditEvent={canCreateEvents ? handleEditEvent : undefined}
        onAssignEvent={canCreateEvents ? handleAssignEvent : undefined}
      />

      {/* Event Creation Form */}
      {showEventForm && (
        <AdvancedEventForm
          onEventCreated={(event) => {
            createEvent(event);
            setShowEventForm(false);
          }}
          onCancel={() => setShowEventForm(false)}
          categories={categories}
          householdId={selectedHousehold.id}
        />
      )}

      {/* Alert for non-authenticated users */}
      {!canCreateEvents && (
        <Alert className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            You need to be signed in to create events.
          </AlertDescription>
        </Alert>
      )}

      {/* Floating Quick Add Button */}
      {canCreateEvents && !showQuickAdd && !showEventForm && !showEventDetails && !showDayModal && (
        <QuickAddFloatingButton onEventParsed={handleQuickAddEvent} />
      )}
    </div>
  );
};

export default AdvancedCalendar;
