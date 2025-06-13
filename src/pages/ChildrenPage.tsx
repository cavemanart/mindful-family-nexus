
import React from 'react';
import { useHouseholds } from '@/hooks/useHouseholds';
import PageLayout from '@/components/PageLayout';
import ChildrenDashboard from '@/components/ChildrenDashboard';
import { Card, CardContent } from '@/components/ui/card';
import { Baby } from 'lucide-react';

const ChildrenPage = () => {
  const { households, loading } = useHouseholds();
  
  // Get the first available household or use saved preference
  const savedHouseholdId = localStorage.getItem('selectedHouseholdId');
  const selectedHousehold = savedHouseholdId 
    ? households.find(h => h.id === savedHouseholdId) || households[0] || null
    : households[0] || null;

  if (loading) {
    return (
      <PageLayout currentPage="children">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-foreground">Children Dashboard</h1>
          </div>
          <div className="text-center py-8">
            <div className="animate-spin h-6 w-6 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading households...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout currentPage="children">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Children Dashboard</h1>
        </div>
        {selectedHousehold ? (
          <ChildrenDashboard selectedHousehold={selectedHousehold} />
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Baby className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-xl font-semibold mb-2">No Household Available</h2>
              <p className="text-muted-foreground mb-4">
                You need to create or join a household to manage children.
              </p>
              <p className="text-sm text-muted-foreground">
                Go to your profile to create a new household or ask someone to invite you to theirs.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
};

export default ChildrenPage;
