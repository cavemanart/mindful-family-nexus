
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Utensils } from 'lucide-react';
import type { HouseholdInfo } from '@/hooks/useHouseholdInfo';

interface ChildInfoCardProps {
  childInfo: HouseholdInfo[];
}

const ChildInfoCard: React.FC<ChildInfoCardProps> = ({ childInfo }) => {
  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 overflow-x-hidden">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
          <Utensils className="h-5 w-5 sm:h-6 sm:w-6 text-purple-500 flex-shrink-0" />
          <span className="truncate">Child Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3 sm:space-y-4">
          {childInfo.map((info) => (
            <div key={info.id} className="w-full border rounded-xl p-3 sm:p-4 bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800">
              <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2 sm:mb-3 text-base sm:text-lg break-words">
                {info.title}
              </h4>
              {info.description && (
                <div className="text-sm sm:text-base text-purple-600 dark:text-purple-300 mb-2 sm:mb-3 leading-relaxed break-words">
                  {info.description}
                </div>
              )}
              <div className="text-sm sm:text-base text-purple-800 dark:text-purple-200 leading-relaxed">
                {info.value.split('\n').map((line, index) => (
                  <div key={index} className="mb-2 flex items-start">
                    <span className="text-purple-500 mr-2 flex-shrink-0 mt-1">•</span>
                    <span className="break-words min-w-0 flex-1">{line}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChildInfoCard;
