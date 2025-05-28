
import React from 'react';
import { useEmergencyContacts } from '@/hooks/useEmergencyContacts';
import { useMedications } from '@/hooks/useMedications';
import { useHouseholdInfo } from '@/hooks/useHouseholdInfo';
import { useFamilyNotes } from '@/hooks/useFamilyNotes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, Pill, Key, StickyNote, AlertTriangle, Clock, Utensils, Eye, EyeOff, LogOut } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Nanny Dashboard
              </h1>
              <p className="text-sm text-gray-600">Important family information</p>
            </div>
            <Button
              onClick={onLogout}
              variant="outline"
              size="sm"
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Emergency Alert */}
        <Alert className="border-red-300 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Emergency:</strong> Call 911 first, then contact parents immediately.
          </AlertDescription>
        </Alert>

        {/* Emergency Contacts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Phone className="h-5 w-5 text-red-500" />
              Emergency Contacts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {contacts.length === 0 ? (
                <p className="text-gray-500 col-span-2">No emergency contacts available</p>
              ) : (
                contacts.map((contact) => (
                  <div key={contact.id} className={`border rounded-lg p-4 ${contact.phone === '911' ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">{contact.name}</h4>
                          {contact.is_primary && (
                            <Badge variant="destructive" className="text-xs">Primary</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{contact.relationship}</p>
                        <p className="text-base font-mono text-gray-800 mt-1">{contact.phone}</p>
                      </div>
                      <Button
                        onClick={() => handleCall(contact.phone)}
                        size="sm"
                        className={`w-full sm:w-auto ${
                          contact.phone === '911' 
                            ? 'bg-red-600 hover:bg-red-700' 
                            : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Medications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Pill className="h-5 w-5 text-blue-500" />
                Medications & Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {medications.length === 0 ? (
                  <p className="text-gray-500">No medications listed</p>
                ) : (
                  medications.map((medication) => (
                    <div key={medication.id} className="border rounded-lg p-4 bg-blue-50">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-blue-900">
                          {medication.child_name} - {medication.medication_name}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="bg-white">
                            {medication.dosage}
                          </Badge>
                          <Badge variant="outline" className="bg-white">
                            <Clock className="h-3 w-3 mr-1" />
                            {medication.frequency}
                          </Badge>
                        </div>
                        {medication.instructions && (
                          <div className="bg-white p-3 rounded border text-sm">
                            <strong>Instructions:</strong> {medication.instructions}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Access Codes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Key className="h-5 w-5 text-green-500" />
                  Access Codes
                </CardTitle>
                <Button
                  onClick={() => setShowCodes(!showCodes)}
                  variant="outline"
                  size="sm"
                >
                  {showCodes ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="ml-2 hidden sm:inline">{showCodes ? 'Hide' : 'Show'}</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {householdInfo.length === 0 ? (
                  <p className="text-gray-500">No access codes available</p>
                ) : (
                  householdInfo.map((info) => (
                    <div key={info.id} className="border rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-1">{info.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{info.description}</p>
                      <div className="bg-gray-100 p-2 rounded font-mono text-sm">
                        {showCodes ? info.value : '••••••••'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Family Notes & Routines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <StickyNote className="h-5 w-5 text-yellow-500" />
              Important Notes & Routines
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nannyNotes.length === 0 ? (
              <div className="text-center py-8">
                <StickyNote className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No specific notes for caregivers</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {nannyNotes.map((note) => (
                  <div key={note.id} className={`${note.color} p-4 rounded-lg shadow-sm`}>
                    <h3 className="font-semibold text-gray-800 mb-2">{note.title}</h3>
                    <p className="text-gray-700 text-sm whitespace-pre-wrap mb-3">{note.content}</p>
                    <div className="text-xs text-gray-500">
                      By {note.author} • {new Date(note.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Reference */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Utensils className="h-5 w-5 text-orange-500" />
              Quick Reference
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">House Rules</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Wash hands before meals</li>
                  <li>• Clean up toys before getting new ones</li>
                  <li>• Ask permission before going outside</li>
                  <li>• Use indoor voices</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Emergency Numbers</h4>
                <div className="text-sm text-gray-700 space-y-1">
                  <div>911 - Emergency</div>
                  <div>Poison Control: 1-800-222-1222</div>
                  <div>Non-Emergency Police: 311</div>
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
