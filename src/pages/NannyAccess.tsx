
import React, { useState } from 'react';
import NannyLogin from './NannyLogin';
import SimplifiedNannyDashboard from '@/components/SimplifiedNannyDashboard';

const NannyAccess = () => {
  const [householdId, setHouseholdId] = useState<string | null>(null);

  const handleLoginSuccess = (id: string) => {
    setHouseholdId(id);
  };

  const handleLogout = () => {
    setHouseholdId(null);
  };

  if (householdId) {
    return (
      <SimplifiedNannyDashboard 
        householdId={householdId} 
        onLogout={handleLogout}
      />
    );
  }

  return <NannyLogin onSuccess={handleLoginSuccess} />;
};

export default NannyAccess;
