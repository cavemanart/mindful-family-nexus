
import React from 'react';
import { useHouseholds } from '@/hooks/useHouseholds';
import PageLayout from '@/components/PageLayout';
import FamilyCalendar from '@/components/FamilyCalendar';

const CalendarPage = () => {
  const { households } = useHouseholds();
  const selectedHousehold = households.length > 0 ? households[0] : null;

  return (
    <PageLayout currentPage="calendar">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Family Calendar</h1>
        </div>
        {selectedHousehold ? (
          <FamilyCalendar selectedHousehold={selectedHousehold} />
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Please select a household to view the calendar.</p>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default CalendarPage;
