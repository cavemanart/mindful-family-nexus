
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home } from 'lucide-react';
import type { HouseholdInfo } from '@/hooks/useHouseholdInfo';

interface HouseRulesCardProps {
  houseRules: HouseholdInfo[];
  emergencyNumbers: HouseholdInfo[];
}

const HouseRulesCard: React.FC<HouseRulesCardProps> = ({ houseRules, emergencyNumbers }) => {
  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 overflow-x-hidden">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
          <Home className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500 flex-shrink-0" />
          <span className="truncate">House Rules & Quick Reference</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4 sm:space-y-6">
          <div className="space-y-3 sm:space-y-4">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-base sm:text-lg">House Rules</h4>
            {houseRules.length === 0 ? (
              <div className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                <div className="flex items-start">
                  <span className="text-orange-500 mr-2 sm:mr-3 flex-shrink-0 mt-1">•</span>
                  <span className="break-words">Wash hands before meals</span>
                </div>
                <div className="flex items-start">
                  <span className="text-orange-500 mr-2 sm:mr-3 flex-shrink-0 mt-1">•</span>
                  <span className="break-words">Clean up toys before getting new ones</span>
                </div>
                <div className="flex items-start">
                  <span className="text-orange-500 mr-2 sm:mr-3 flex-shrink-0 mt-1">•</span>
                  <span className="break-words">Ask permission before going outside</span>
                </div>
                <div className="flex items-start">
                  <span className="text-orange-500 mr-2 sm:mr-3 flex-shrink-0 mt-1">•</span>
                  <span className="break-words">Use indoor voices</span>
                </div>
              </div>
            ) : (
              <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                {houseRules.map((rule) => (
                  <li key={rule.id} className="flex items-start">
                    <span className="text-orange-500 mr-2 sm:mr-3 flex-shrink-0 mt-1">•</span>
                    <span className="break-words min-w-0 flex-1">{rule.value}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="space-y-3 sm:space-y-4">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-base sm:text-lg">Emergency Numbers</h4>
            <div className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              <div className="flex items-start">
                <span className="text-orange-500 mr-2 sm:mr-3 flex-shrink-0 mt-1">•</span>
                <span className="break-words"><strong>911</strong> - Emergency</span>
              </div>
              <div className="flex items-start">
                <span className="text-orange-500 mr-2 sm:mr-3 flex-shrink-0 mt-1">•</span>
                <span className="break-words"><strong>Poison Control:</strong> 1-800-222-1222</span>
              </div>
              <div className="flex items-start">
                <span className="text-orange-500 mr-2 sm:mr-3 flex-shrink-0 mt-1">•</span>
                <span className="break-words"><strong>Non-Emergency Police:</strong> 311</span>
              </div>
              {emergencyNumbers.map((number) => (
                <div key={number.id} className="flex items-start">
                  <span className="text-orange-500 mr-2 sm:mr-3 flex-shrink-0 mt-1">•</span>
                  <span className="break-words"><strong>{number.title}:</strong> {number.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HouseRulesCard;
