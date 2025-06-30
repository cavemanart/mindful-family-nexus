
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import SubscriptionManager from '@/components/SubscriptionManager';

const Subscription: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    // Try to go back, but fallback to dashboard if no history
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription Management</h1>
            <p className="text-gray-600">Manage your Hublie subscription and billing</p>
          </div>
        </div>
        
        <SubscriptionManager />
      </div>
    </div>
  );
};

export default Subscription;
