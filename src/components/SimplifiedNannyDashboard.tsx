
import React from 'react';
import { useEmergencyContacts } from '@/hooks/useEmergencyContacts';
import { useMedications } from '@/hooks/useMedications';
import { useHouseholdInfo } from '@/hooks/useHouseholdInfo';
import { useFamilyNotes } from '@/hooks/useFamilyNotes';
import EmergencyContactsCard from './nanny-dashboard/EmergencyContactsCard';
import MedicationsCard from './nanny-dashboard/MedicationsCard';
import AccessCodesCard from './nanny-dashboard/AccessCodesCard';
import ChildInfoCard from './nanny-dashboard/ChildInfoCard';
import NotesCard from './nanny-dashboard/NotesCard';
import HouseRulesCard from './nanny-dashboard/HouseRulesCard';
import DailySchedules from './DailySchedules';
import { Button } from '@/components/ui/button';
import { LogOut, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useState } from 'react';

interface SimplifiedNannyDashboardProps {
  householdId: string;
  onLogout: () => void;
}

const SimplifiedNannyDashboard: React.FC<SimplifiedNannyDashboardProps> = ({ 
  householdId, 
  onLogout 
}) => {
  const { contacts } = useEmergencyContacts(householdId);
  const { medications, addMedication, updateMedication, deleteMedication } = useMedications(householdId);
  const { householdInfo, addHouseholdInfo, updateHouseholdInfo, deleteHouseholdInfo } = useHouseholdInfo(householdId);
  const { notes } = useFamilyNotes(householdId);
  const [showCodes, setShowCodes] = useState(false);

  const nannyNotes = notes.filter(note => 
    note.content.toLowerCase().includes('nanny') || 
    note.content.toLowerCase().includes('caregiver') ||
    note.title.toLowerCase().includes('nanny') ||
    note.title.toLowerCase().includes('caregiver') ||
    note.title.toLowerCase().includes('routine') ||
    note.title.toLowerCase().includes('schedule')
  );

  const houseRules = householdInfo.filter(info => info.info_type === 'house_rule');
  const emergencyNumbers = householdInfo.filter(info => info.info_type === 'emergency_number');
  const accessCodes = householdInfo.filter(info => info.info_type === 'access_code');
  const childInfo = householdInfo.filter(info => info.info_type === 'child_info');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
      {/* Header - Mobile Optimized */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 sticky top-0 z-10">
        <div className="w-full max-w-none px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4 min-h-[60px]">
            <div className="min-w-0 flex-1 mr-3">
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 truncate leading-tight">
                Nanny Dashboard
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1 leading-tight">Important family information</p>
            </div>
            <Button
              onClick={onLogout}
              variant="outline"
              size="sm"
              className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 min-h-[44px] px-3 sm:px-4 flex-shrink-0"
            >
              <LogOut className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="text-sm">Out</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="w-full max-w-none px-3 sm:px-4 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 overflow-x-hidden">
        {/* Emergency Alert - Mobile Optimized */}
        <Alert className="border-red-300 bg-red-50 dark:bg-red-950/30 mx-0">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <AlertDescription className="text-red-800 dark:text-red-200 text-sm sm:text-base font-medium leading-relaxed">
              <strong>Emergency:</strong> Call 911 first, then contact parents immediately.
            </AlertDescription>
          </div>
        </Alert>

        <EmergencyContactsCard contacts={contacts} />
        
        <MedicationsCard 
          medications={medications} 
          onUpdate={updateMedication}
          onDelete={deleteMedication}
          onAdd={addMedication}
          canEdit={true}
        />
        
        <AccessCodesCard 
          accessCodes={accessCodes} 
          showCodes={showCodes} 
          setShowCodes={setShowCodes}
          onUpdate={updateHouseholdInfo}
          onDelete={deleteHouseholdInfo}
          onAdd={addHouseholdInfo}
          canEdit={true}
        />
        
        {childInfo.length > 0 && (
          <ChildInfoCard 
            childInfo={childInfo}
            onUpdate={updateHouseholdInfo}
            onDelete={deleteHouseholdInfo}
            onAdd={addHouseholdInfo}
            canEdit={true}
          />
        )}
        
        <NotesCard nannyNotes={nannyNotes} />
        
        <HouseRulesCard 
          houseRules={houseRules} 
          emergencyNumbers={emergencyNumbers}
          onUpdate={updateHouseholdInfo}
          onDelete={deleteHouseholdInfo}
          onAdd={addHouseholdInfo}
          canEdit={true}
        />

        <DailySchedules householdId={householdId} canEdit={true} />
      </div>
    </div>
  );
};

export default SimplifiedNannyDashboard;
