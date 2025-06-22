
import React from 'react';
import { Calendar, Info } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from '@/hooks/useAuth';
import { useHouseholdSubscription } from '@/hooks/useHouseholdSubscription';
import AdvancedCalendar from './AdvancedCalendar';
import SimpleEventForm from './SimpleEventForm';
import SimpleEventsList from './SimpleEventsList';
import SubscriptionBadge from './SubscriptionBadge';
import { checkFeatureAccess } from '@/lib/feature-access';
import { useSimpleCalendarEvents } from '@/hooks/useSimpleCalendarEvents';

interface Household {
  id: string;
  name: string;
}

interface FamilyCalendarProps {
  selectedHousehold: Household | null;
}

const FamilyCalendar: React.FC<FamilyCalendarProps> = ({ selectedHousehold }) => {
  const { userProfile } = useAuth();
  const { events, loading, error, createEvent, deleteEvent } = useSimpleCalendarEvents(selectedHousehold?.id || null);
  const { subscriptionStatus, loading: subscriptionLoading, hasProAccess } = useHouseholdSubscription();

  const canCreateEvents = userProfile?.role === 'parent' || userProfile?.role === 'grandparent';

  if (!selectedHousehold) {
    return (
      <div className="text-center py-8">
        <Calendar className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Please select a household to view events</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="text-blue-600 dark:text-blue-400 hover:underline">
          Try Again
        </button>
      </div>
    );
  }

  // Use household subscription to determine feature access
  const hasAdvancedCalendar = hasProAccess;

  // Show Advanced Calendar for households with Pro access, Simple Calendar for free households
  if (hasAdvancedCalendar) {
    return <AdvancedCalendar selectedHousehold={selectedHousehold} />;
  }

  // Fallback to simple calendar for free households
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Family Calendar</h2>
          <p className="text-gray-600 dark:text-gray-400">{selectedHousehold.name}</p>
        </div>
        {!subscriptionLoading && (
          <SubscriptionBadge 
            planType={subscriptionStatus.planType}
            isTrialActive={subscriptionStatus.isTrialActive}
            trialEndDate={subscriptionStatus.subscriptionEndDate}
          />
        )}
      </div>

      {/* Feature Info */}
      <Alert className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-blue-800 dark:text-blue-200">
          📅 Simple calendar view available. Upgrade to Pro for advanced features like visual calendar grid, color-coded categories, family member assignments, and recurring events.
        </AlertDescription>
      </Alert>

      {/* Event Creation Form */}
      {canCreateEvents && selectedHousehold && (
        <SimpleEventForm 
          onEventCreated={createEvent}
          householdId={selectedHousehold.id}
        />
      )}

      {/* Events List */}
      <SimpleEventsList 
        events={events}
        onEventDeleted={deleteEvent}
        loading={loading}
      />

      {!canCreateEvents && (
        <Card className="bg-card dark:bg-card border-border dark:border-border">
          <CardContent className="p-4">
            <p className="text-center text-gray-600 dark:text-gray-400">
              Only parents and grandparents can create events. You can view family events above.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FamilyCalendar;
