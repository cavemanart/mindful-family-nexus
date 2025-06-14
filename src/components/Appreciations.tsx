
import React from 'react';
import AppreciationsOptimized from './appreciations/AppreciationsOptimized';
import { Household } from '@/hooks/useHouseholds';

interface AppreciationsProps {
  selectedHousehold: Household;
}

const Appreciations: React.FC<AppreciationsProps> = ({ selectedHousehold }) => {
  return <AppreciationsOptimized selectedHousehold={selectedHousehold} />;
};

export default Appreciations;
