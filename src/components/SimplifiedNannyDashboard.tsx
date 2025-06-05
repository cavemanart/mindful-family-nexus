
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
      {/* Header - Mobile Optimized */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 truncate">
                Nanny Dashboard
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">Important family information</p>
            </div>
            <Button
              onClick={onLogout}
              variant="outline"
              size="sm"
              className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 min-h-[44px] px-4"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden xs:inline">Logout</span>
              <span className="xs:hidden">Out</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
        {/* Emergency Alert - Mobile Optimized */}
        <Alert className="border-red-300 bg-red-50 dark:bg-red-950/30">
          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <AlertDescription className="text-red-800 dark:text-red-200 text-base font-medium ml-2">
            <strong>Emergency:</strong> Call 911 first, then contact parents immediately.
          </AlertDescription>
        </Alert>

        {/* Emergency Contacts - Mobile Optimized */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <Phone className="h-6 w-6 text-red-500 flex-shrink-0" />
              Emergency Contacts
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {contacts.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-base">No emergency contacts available</p>
              ) : (
                contacts.map((contact) => (
                  <div key={contact.id} className={`border rounded-xl p-4 ${contact.phone === '911' ? 'border-red-300 bg-red-50 dark:bg-red-950/30' : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700'}`}>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-lg leading-tight">{contact.name}</h4>
                          {contact.is_primary && (
                            <Badge variant="destructive" className="text-sm font-medium flex-shrink-0">Primary</Badge>
                          )}
                        </div>
                        <p className="text-base text-gray-600 dark:text-gray-400 mb-2">{contact.relationship}</p>
                        <p className="text-lg font-mono text-gray-800 dark:text-gray-200 font-semibold tracking-wide">{contact.phone}</p>
                      </div>
                      <Button
                        onClick={() => handleCall(contact.phone)}
                        size="lg"
                        className={`w-full min-h-[52px] text-lg font-semibold ${
                          contact.phone === '911' 
                            ? 'bg-red-600 hover:bg-red-700 text-white' 
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        <Phone className="h-5 w-5 mr-3" />
                        Call {contact.name}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Medications - Mobile Optimized */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <Pill className="h-6 w-6 text-blue-500 flex-shrink-0" />
              Medications & Health
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {medications.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-base">No medications listed</p>
            ) : (
              <div className="space-y-4">
                {medications.map((medication) => (
                  <div key={medication.id} className="border rounded-xl p-4 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-lg leading-tight">
                        {medication.child_name} - {medication.medication_name}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="bg-white dark:bg-gray-700 text-base py-1 px-3">
                          {medication.dosage}
                        </Badge>
                        <Badge variant="outline" className="bg-white dark:bg-gray-700 text-base py-1 px-3">
                          <Clock className="h-4 w-4 mr-1" />
                          {medication.frequency}
                        </Badge>
                      </div>
                      {medication.instructions && (
                        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border text-base leading-relaxed">
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

        {/* Access Codes - Mobile Optimized */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-xl">
                <Key className="h-6 w-6 text-green-500 flex-shrink-0" />
                Access Codes
              </CardTitle>
              <Button
                onClick={() => setShowCodes(!showCodes)}
                variant="outline"
                size="lg"
                className="min-h-[44px] px-4 text-base"
              >
                {showCodes ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                <span className="ml-2">{showCodes ? 'Hide' : 'Show'}</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {accessCodes.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-base">No access codes available</p>
            ) : (
              <div className="space-y-4">
                {accessCodes.map((info) => (
                  <div key={info.id} className="border rounded-xl p-4 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 text-lg">{info.title}</h4>
                    <p className="text-base text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">{info.description}</p>
                    <div className="bg-gray-100 dark:bg-gray-600 p-4 rounded-lg font-mono text-lg font-semibold tracking-wider">
                      {showCodes ? info.value : '••••••••'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Child Information - Mobile Optimized */}
        {childInfo.length > 0 && (
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <Utensils className="h-6 w-6 text-purple-500 flex-shrink-0" />
                Child Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                {childInfo.map((info) => (
                  <div key={info.id} className="border rounded-xl p-4 bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800">
                    <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-3 text-lg">
                      {info.title}
                    </h4>
                    {info.description && (
                      <div className="text-base text-purple-600 dark:text-purple-300 mb-3 leading-relaxed">
                        {info.description}
                      </div>
                    )}
                    <div className="text-base text-purple-800 dark:text-purple-200 leading-relaxed">
                      {info.value.split('\n').map((line, index) => (
                        <div key={index} className="mb-2 flex items-start">
                          <span className="text-purple-500 mr-2 flex-shrink-0 mt-1">•</span>
                          <span>{line}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Family Notes & Routines - Mobile Optimized */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <StickyNote className="h-6 w-6 text-yellow-500 flex-shrink-0" />
              Important Notes & Routines
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {nannyNotes.length === 0 ? (
              <div className="text-center py-8">
                <StickyNote className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-base">No specific notes for caregivers</p>
              </div>
            ) : (
              <div className="space-y-4">
                {nannyNotes.map((note) => (
                  <div key={note.id} className={`${note.color} p-4 rounded-xl shadow-sm border`}>
                    <h3 className="font-semibold text-gray-800 mb-3 text-lg leading-tight">{note.title}</h3>
                    <p className="text-gray-700 text-base whitespace-pre-wrap mb-4 leading-relaxed">{note.content}</p>
                    <div className="text-sm text-gray-500 font-medium">
                      By {note.author} • {new Date(note.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* House Rules & Emergency Numbers - Mobile Optimized */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <Home className="h-6 w-6 text-orange-500 flex-shrink-0" />
              House Rules & Quick Reference
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">House Rules</h4>
                {houseRules.length === 0 ? (
                  <div className="space-y-3 text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                    <div className="flex items-start">
                      <span className="text-orange-500 mr-3 flex-shrink-0 mt-1">•</span>
                      <span>Wash hands before meals</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-orange-500 mr-3 flex-shrink-0 mt-1">•</span>
                      <span>Clean up toys before getting new ones</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-orange-500 mr-3 flex-shrink-0 mt-1">•</span>
                      <span>Ask permission before going outside</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-orange-500 mr-3 flex-shrink-0 mt-1">•</span>
                      <span>Use indoor voices</span>
                    </div>
                  </div>
                ) : (
                  <ul className="space-y-3 text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                    {houseRules.map((rule) => (
                      <li key={rule.id} className="flex items-start">
                        <span className="text-orange-500 mr-3 flex-shrink-0 mt-1">•</span>
                        <span>{rule.value}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">Emergency Numbers</h4>
                <div className="space-y-3 text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                  <div className="flex items-start">
                    <span className="text-orange-500 mr-3 flex-shrink-0 mt-1">•</span>
                    <span><strong>911</strong> - Emergency</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-orange-500 mr-3 flex-shrink-0 mt-1">•</span>
                    <span><strong>Poison Control:</strong> 1-800-222-1222</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-orange-500 mr-3 flex-shrink-0 mt-1">•</span>
                    <span><strong>Non-Emergency Police:</strong> 311</span>
                  </div>
                  {emergencyNumbers.map((number) => (
                    <div key={number.id} className="flex items-start">
                      <span className="text-orange-500 mr-3 flex-shrink-0 mt-1">•</span>
                      <span><strong>{number.title}:</strong> {number.value}</span>
                    </div>
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
