
import React, { useState } from 'react';
import ChildLogin from '@/components/ChildLogin';
import ChildDashboardContainer from '@/components/ChildDashboardContainer';
import { useParams, useNavigate } from 'react-router-dom';

const ChildAccess: React.FC = () => {
  const { householdId } = useParams<{ householdId: string }>();
  const navigate = useNavigate();
  const [authenticatedChild, setAuthenticatedChild] = useState<any>(null);

  const handleLoginSuccess = (childData: any) => {
    setAuthenticatedChild(childData);
  };

  const handleLogout = () => {
    setAuthenticatedChild(null);
  };

  const handleBack = () => {
    navigate('/auth');
  };

  if (!householdId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Access</h1>
          <p className="text-muted-foreground">No household ID provided</p>
        </div>
      </div>
    );
  }

  if (authenticatedChild) {
    return (
      <ChildDashboardContainer
        childData={authenticatedChild}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <ChildLogin
      householdId={householdId}
      onLoginSuccess={handleLoginSuccess}
      onBack={handleBack}
    />
  );
};

export default ChildAccess;
