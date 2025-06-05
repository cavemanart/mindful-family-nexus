
import React from 'react';
import { useEmergencyContacts } from '@/hooks/useEmergencyContacts';
import { useMedications } from '@/hooks/useMedications';
import { useHouseholdInfo } from '@/hooks/useHouseholdInfo';
import { useFamilyNotes } from '@/hooks/useFamilyNotes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, Pill, Key, StickyNote, AlertTriangle, Clock, Utensils, Eye, EyeOff, LogOut, Home } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
  const { medications } = useMedications(householdId);
  const { householdInfo } = useHouseholdInfo(householdId);
  const { notes } = useFamilyNotes(householdId);
  const [showCodes, setShowCodes] = useState(false);

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">
                Nanny Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Important family information</p>
            </div>
            <Button
              onClick={onLogout}
              variant="outline"
              size="sm"
              className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs sm:text-sm"
            >
              <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
              <span className="sm:hidden">Out</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-6 space-y-4 sm:space-y-6">
        {/* Emergency Alert */}
        <Alert className="border-red-300 bg-red-50 dark:bg-red-950/30">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200 text-sm">
            <strong>Emergency:</strong> Call 911 first, then contact parents immediately.
          </AlertDescription>
        </Alert>

        {/* Emergency Contacts */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
              Emergency Contacts
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {contacts.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No emergency contacts available</p>
              ) : (
                contacts.map((contact) => (
                  <div key={contact.id} className={`border rounded-lg p-3 sm:p-4 bg-white dark:bg-gray-700 ${contact.phone === '911' ? 'border-red-300 bg-red-50 dark:bg-red-950/30' : 'border-gray-200 dark:border-gray-600'}`}>
                    <div className="flex flex-col space-y-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate text-sm sm:text-base">{contact.name}</h4>
                          {contact.is_primary && (
                            <Badge variant="destructive" className="text-xs flex-shrink-0">Primary</Badge>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">{contact.relationship}</p>
                        <p className="text-sm sm:text-base font-mono text-gray-800 dark:text-gray-200">{contact.phone}</p>
                      </div>
                      <Button
                        onClick={() => handleCall(contact.phone)}
                        size="sm"
                        className={`w-full ${
                          contact.phone === '911' 
                            ? 'bg-red-600 hover:bg-red-700' 
                            : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                        Call {contact.name}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Medications */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Pill className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
              Medications & Health
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {medications.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No medications listed</p>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {medications.map((medication) => (
                  <div key={medication.id} className="border rounded-lg p-3 sm:p-4 bg-blue-50 dark:bg-blue-950/30">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-sm sm:text-base">
                        {medication.child_name} - {medication.medication_name}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="bg-white dark:bg-gray-700 text-xs">
                          {medication.dosage}
                        </Badge>
                        <Badge variant="outline" className="bg-white dark:bg-gray-700 text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {medication.frequency}
                        </Badge>
                      </div>
                      {medication.instructions && (
                        <div className="bg-white dark:bg-gray-700 p-2 sm:p-3 rounded border text-xs sm:text-sm">
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

        {/* Access Codes */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3 sm:pb-6">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Key className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                Access Codes
              </CardTitle>
              <Button
                onClick={() => setShowCodes(!showCodes)}
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm"
              >
                {showCodes ? <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" /> : <Eye className="h-3 w-3 sm:h-4 sm:w-4" />}
                <span className="ml-1 sm:ml-2">{showCodes ? 'Hide' : 'Show'}</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {accessCodes.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No access codes available</p>
            ) : (
              <div className="space-y-3">
                {accessCodes.map((info) => (
                  <div key={info.id} className="border rounded-lg p-3 sm:p-4 bg-white dark:bg-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 text-sm sm:text-base">{info.title}</h4>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">{info.description}</p>
                    <div className="bg-gray-100 dark:bg-gray-600 p-2 rounded font-mono text-xs sm:text-sm">
                      {showCodes ? info.value : '••••••••'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Child Information */}
        {childInfo.length > 0 && (
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Utensils className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                Child Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 sm:space-y-4">
                {childInfo.map((info) => (
                  <div key={info.id} className="border rounded-lg p-3 sm:p-4 bg-purple-50 dark:bg-purple-950/30">
                    <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2 text-sm sm:text-base">
                      {info.title}
                    </h4>
                    {info.description && (
                      <div className="text-xs text-purple-600 dark:text-purple-300 mb-2">
                        {info.description}
                      </div>
                    )}
                    <div className="text-xs sm:text-sm text-purple-800 dark:text-purple-200">
                      {info.value.split('\n').map((line, index) => (
                        <div key={index} className="mb-1">• {line}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Family Notes & Routines */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <StickyNote className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
              Important Notes & Routines
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {nannyNotes.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <StickyNote className="h-8 w-8 sm:h-12 sm:w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3 sm:mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">No specific notes for caregivers</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {nannyNotes.map((note) => (
                  <div key={note.id} className={`${note.color} p-3 sm:p-4 rounded-lg shadow-sm`}>
                    <h3 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">{note.title}</h3>
                    <p className="text-gray-700 text-xs sm:text-sm whitespace-pre-wrap mb-3">{note.content}</p>
                    <div className="text-xs text-gray-500">
                      By {note.author} • {new Date(note.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* House Rules & Emergency Numbers */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Home className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
              House Rules & Quick Reference
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4 sm:space-y-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base">House Rules</h4>
                {houseRules.length === 0 ? (
                  <div className="space-y-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                    <div>• Wash hands before meals</div>
                    <div>• Clean up toys before getting new ones</div>
                    <div>• Ask permission before going outside</div>
                    <div>• Use indoor voices</div>
                  </div>
                ) : (
                  <ul className="space-y-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                    {houseRules.map((rule) => (
                      <li key={rule.id}>• {rule.value}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base">Emergency Numbers</h4>
                <div className="space-y-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                  <div>911 - Emergency</div>
                  <div>Poison Control: 1-800-222-1222</div>
                  <div>Non-Emergency Police: 311</div>
                  {emergencyNumbers.map((number) => (
                    <div key={number.id}>{number.title}: {number.value}</div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SimplifiedNannyDashboard;
