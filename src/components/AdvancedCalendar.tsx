import React, { useState } from 'react';
import { Calendar as CalendarIcon, Plus, Filter, Grid3X3, List, ChevronLeft, ChevronRight } from 'lucide-react';
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

  const canCreateEvents = userProfile?.role === 'parent' || userProfile?.role === 'grandparent';

  // Filter events by categories and keywords
  const filteredEvents = events.filter(event => {
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(event.category || 'general');
    const matchesKeyword = searchKeyword === '' || 
      event.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchKeyword.toLowerCase());
    
    return matchesCategory && matchesKeyword;
  });

  // Get events for selected date in day modal
  const selectedDateEvents = selectedDate ? filteredEvents.filter(event => {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Advanced Family Calendar</h2>
          <p className="text-gray-600 dark:text-gray-400">{selectedHousehold.name}</p>
        </div>
        <div className="flex items-center gap-2">
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
          >
            {isGridView ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
            {isGridView ? 'List View' : 'Grid View'}
          </Button>
          {canCreateEvents && (
            <Button onClick={() => setShowEventForm(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Event
            </Button>
          )}
        </div>
      </div>

      {/* Navigation and Filters */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold min-w-48 text-center text-gray-900 dark:text-gray-100">{currentMonth}</h3>
          <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
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
      {isGridView ? (
        <CalendarGrid
          events={filteredEvents}
          categories={categories}
          view={view}
          onEventClick={handleEventClick}
          onDateClick={handleDateClick}
        />
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
        events={selectedDateEvents}
        categories={categories}
        onEventClick={handleEventClick}
        onCreateEvent={canCreateEvents ? handleCreateEventForDate : undefined}
        onNavigateDate={handleDayNavigation}
        canCreateEvents={canCreateEvents}
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

      {/* Alert for non-creators */}
      {!canCreateEvents && (
        <Alert className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            Only parents and grandparents can create events. You can view family events above.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default AdvancedCalendar;
