
import React from 'react';
import { useHouseholds } from '@/hooks/useHouseholds';
import PageLayout from '@/components/PageLayout';
import WeeklySync from '@/components/WeeklySync';

const WeeklySyncPage = () => {
  const { households } = useHouseholds();
  const selectedHousehold = households.length > 0 ? households[0] : null;

  return (
    <PageLayout currentPage="weekly-sync">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Weekly Goals</h1>
        </div>
        {selectedHousehold ? (
          <WeeklySync selectedHousehold={selectedHousehold} />
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Please select a household to view weekly goals.</p>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default WeeklySyncPage;
