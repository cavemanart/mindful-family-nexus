
import React from 'react';
import PageLayout from '@/components/PageLayout';
import NannyMode from '@/components/NannyMode';

const NannyModePage = () => {
  return (
    <PageLayout currentPage="nanny-mode">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Nanny Mode</h1>
        </div>
        <NannyMode />
      </div>
    </PageLayout>
  );
};

export default NannyModePage;
