
import React from 'react';
import SubscriptionManager from '@/components/SubscriptionManager';

const Subscription: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription Management</h1>
          <p className="text-gray-600">Manage your Hublie subscription and billing</p>
        </div>
        
        <SubscriptionManager />
      </div>
    </div>
  );
};

export default Subscription;
