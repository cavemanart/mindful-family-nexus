
import React from 'react';
import { Calendar, Info } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSimpleCalendarEvents } from '@/hooks/useSimpleCalendarEvents';
import { useAuth } from '@/hooks/useAuth';
import SimpleEventForm from './SimpleEventForm';
import SimpleEventsList from './SimpleEventsList';

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

  const canCreateEvents = userProfile?.role === 'parent' || userProfile?.role === 'grandparent';

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Family Calendar</h2>
        <p className="text-gray-600">{selectedHousehold.name}</p>
      </div>

      {/* Coming Soon Notice */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          📅 Simple calendar view is now available! More advanced calendar features (recurring events, invites, visual calendar grid) coming soon...
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
