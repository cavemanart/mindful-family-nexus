
import React, { useState, useEffect } from 'react';
import { Calendar, Info } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSimpleCalendarEvents } from '@/hooks/useSimpleCalendarEvents';
import { useAuth } from '@/hooks/useAuth';
import SimpleEventForm from './SimpleEventForm';
import SimpleEventsList from './SimpleEventsList';
import SubscriptionBadge from './SubscriptionBadge';
import { getUserSubscription, checkFeatureAccess, isTrialActive } from '@/lib/subscription-utils';

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
  const [subscription, setSubscription] = useState<any>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

  const canCreateEvents = userProfile?.role === 'parent' || userProfile?.role === 'grandparent';

  useEffect(() => {
    const loadSubscription = async () => {
      if (userProfile?.id) {
        try {
          const sub = await getUserSubscription(userProfile.id);
          setSubscription(sub);
        } catch (error) {
          console.error('Error loading subscription:', error);
        } finally {
          setSubscriptionLoading(false);
        }
      }
    };

    loadSubscription();
  }, [userProfile?.id]);

  if (!selectedHousehold) {
    return (
      <div className="text-center py-8">
        <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">Please select a household to view events</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="text-blue-600 hover:underline">
          Try Again
        </button>
      </div>
    );
  }

  const trialActive = subscription ? isTrialActive(subscription) : false;
  const planType = subscription?.plan_type || 'free';
  const hasAdvancedCalendar = checkFeatureAccess(planType, 'advanced_calendar', trialActive);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Family Calendar</h2>
          <p className="text-gray-600">{selectedHousehold.name}</p>
        </div>
        {!subscriptionLoading && (
          <SubscriptionBadge 
            planType={planType}
            isTrialActive={trialActive}
            trialEndDate={subscription?.trial_end_date}
          />
        )}
      </div>

      {/* Feature Info */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          {hasAdvancedCalendar 
            ? "🎉 Advanced calendar features available! Enjoy shared views, reminders, and event categories."
            : "📅 Simple calendar view available. Upgrade to Pro for advanced features like shared views, reminders, and event categories."
          }
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
        <Card>
          <CardContent className="p-4">
            <p className="text-center text-gray-600">
              Only parents and grandparents can create events. You can view family events above.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FamilyCalendar;
