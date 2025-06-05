
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Key, Eye, EyeOff } from 'lucide-react';
import type { HouseholdInfo } from '@/hooks/useHouseholdInfo';

interface AccessCodesCardProps {
  accessCodes: HouseholdInfo[];
  showCodes: boolean;
  setShowCodes: (show: boolean) => void;
}

const AccessCodesCard: React.FC<AccessCodesCardProps> = ({ accessCodes, showCodes, setShowCodes }) => {
  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 overflow-x-hidden">
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl min-w-0 flex-1">
            <Key className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 flex-shrink-0" />
            <span className="truncate">Access Codes</span>
          </CardTitle>
          <Button
            onClick={() => setShowCodes(!showCodes)}
            variant="outline"
            size="lg"
            className="min-h-[44px] px-3 sm:px-4 text-sm sm:text-base flex-shrink-0"
          >
            {showCodes ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
            <span className="ml-1 sm:ml-2">{showCodes ? 'Hide' : 'Show'}</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {accessCodes.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">No access codes available</p>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {accessCodes.map((info) => (
              <div key={info.id} className="w-full border rounded-xl p-3 sm:p-4 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 text-base sm:text-lg break-words">{info.title}</h4>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3 leading-relaxed break-words">{info.description}</p>
                <div className="bg-gray-100 dark:bg-gray-600 p-3 sm:p-4 rounded-lg font-mono text-base sm:text-lg font-semibold tracking-wider break-all">
                  {showCodes ? info.value : '••••••••'}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AccessCodesCard;
