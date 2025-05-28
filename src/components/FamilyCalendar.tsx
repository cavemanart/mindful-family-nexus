
import React from 'react';
import EnhancedFamilyCalendar from './EnhancedFamilyCalendar';

interface Household {
  id: string;
  name: string;
}

interface FamilyCalendarProps {
  selectedHousehold: Household | null;
}

const FamilyCalendar: React.FC<FamilyCalendarProps> = ({ selectedHousehold }) => {
  return <EnhancedFamilyCalendar selectedHousehold={selectedHousehold} />;
};

export default FamilyCalendar;
