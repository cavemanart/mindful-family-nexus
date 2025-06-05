
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pill, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Medication } from '@/hooks/useMedications';

interface MedicationsCardProps {
  medications: Medication[];
}

const MedicationsCard: React.FC<MedicationsCardProps> = ({ medications }) => {
  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 overflow-x-hidden">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
          <Pill className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500 flex-shrink-0" />
          <span className="truncate">Medications & Health</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {medications.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">No medications listed</p>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {medications.map((medication) => (
              <div key={medication.id} className="w-full border rounded-xl p-3 sm:p-4 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                <div className="space-y-2 sm:space-y-3">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-base sm:text-lg leading-tight break-words">
                    {medication.child_name} - {medication.medication_name}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-white dark:bg-gray-700 text-sm sm:text-base py-1 px-2 sm:px-3 break-all">
                      {medication.dosage}
                    </Badge>
                    <Badge variant="outline" className="bg-white dark:bg-gray-700 text-sm sm:text-base py-1 px-2 sm:px-3 break-all">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      {medication.frequency}
                    </Badge>
                  </div>
                  {medication.instructions && (
                    <div className="bg-white dark:bg-gray-700 p-3 sm:p-4 rounded-lg border text-sm sm:text-base leading-relaxed break-words">
                      <strong>Instructions:</strong> {medication.instructions}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MedicationsCard;
