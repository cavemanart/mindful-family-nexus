
import React from 'react';
import { Household } from '@/hooks/useHouseholds';
import MVPOfTheDay from './mvp/MVPOfTheDay';

interface MVPOfTheDayWrapperProps {
  selectedHousehold: Household;
}

const MVPOfTheDayWrapper: React.FC<MVPOfTheDayWrapperProps> = ({ selectedHousehold }) => {
  return <MVPOfTheDay selectedHousehold={selectedHousehold} />;
};

export default MVPOfTheDayWrapper;
