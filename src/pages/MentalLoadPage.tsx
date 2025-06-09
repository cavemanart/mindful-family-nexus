
import React from 'react';
import PageLayout from '@/components/PageLayout';
import MentalLoad from '@/components/MentalLoad';

const MentalLoadPage = () => {
  return (
    <PageLayout currentPage="mental-load">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Mental Load</h1>
        </div>
        <MentalLoad />
      </div>
    </PageLayout>
  );
};

export default MentalLoadPage;
