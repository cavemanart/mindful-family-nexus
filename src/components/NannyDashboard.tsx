
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Household } from '@/hooks/useHouseholds';
import { useEmergencyContacts } from '@/hooks/useEmergencyContacts';
import { useMedications } from '@/hooks/useMedications';
import { useHouseholdInfo } from '@/hooks/useHouseholdInfo';
import { useFamilyNotes } from '@/hooks/useFamilyNotes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Pill, Key, StickyNote, AlertTriangle } from 'lucide-react';

interface NannyDashboardProps {
  selectedHousehold?: Household | null;
}

const NannyDashboard: React.FC<NannyDashboardProps> = ({ selectedHousehold }) => {
  const { userProfile } = useAuth();
  const { contacts } = useEmergencyContacts(selectedHousehold?.id);
  const { medications } = useMedications(selectedHousehold?.id);
  const { householdInfo } = useHouseholdInfo(selectedHousehold?.id);
  const { notes } = useFamilyNotes(selectedHousehold?.id);

  if (!selectedHousehold) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">No Household Selected</h2>
          <p className="text-muted-foreground">Please select a household to continue</p>
        </div>
      </div>
    );
  }

  const notesForNanny = notes.filter(note => 
    note.content.toLowerCase().includes('nanny') || 
    note.content.toLowerCase().includes('caregiver') ||
    note.title.toLowerCase().includes('nanny') ||
    note.title.toLowerCase().includes('caregiver')
  );

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      <div className="text-center py-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome, {userProfile?.first_name || 'Caregiver'}! 👋
        </h1>
        <p className="text-muted-foreground text-lg">
          Caring for {selectedHousehold.name}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Emergency Contacts */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-red-500" />
              Emergency Contacts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {contacts.length === 0 ? (
                <p className="text-muted-foreground text-sm">No emergency contacts added yet</p>
              ) : (
                contacts.map((contact) => (
                  <div key={contact.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{contact.name}</h4>
                        <p className="text-sm text-muted-foreground">{contact.relationship}</p>
                        <p className="text-sm font-mono mt-1">{contact.phone}</p>
                      </div>
                      {contact.is_primary && (
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                          Primary
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Medications */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-blue-500" />
              Medications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {medications.length === 0 ? (
                <p className="text-muted-foreground text-sm">No medications listed</p>
              ) : (
                medications.map((medication) => (
                  <div key={medication.id} className="border rounded-lg p-3">
                    <h4 className="font-medium">{medication.child_name}</h4>
                    <p className="text-sm font-medium text-blue-600">{medication.medication_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {medication.dosage} - {medication.frequency}
                    </p>
                    {medication.instructions && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {medication.instructions}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Access Codes & Important Info */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-green-500" />
              Access Codes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {householdInfo.length === 0 ? (
                <p className="text-muted-foreground text-sm">No access codes added yet</p>
              ) : (
                householdInfo.map((info) => (
                  <div key={info.id} className="border rounded-lg p-3">
                    <h4 className="font-medium">{info.title}</h4>
                    <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded mt-1">
                      {info.value}
                    </p>
                    {info.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {info.description}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes for Nanny */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StickyNote className="h-5 w-5 text-yellow-500" />
            Notes for You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notesForNanny.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">No specific notes for caregivers yet</p>
              </div>
            ) : (
              notesForNanny.map((note) => (
                <div key={note.id} className={`${note.color} p-4 rounded-lg shadow-sm`}>
                  <h3 className="font-semibold text-gray-800 mb-2">{note.title}</h3>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">{note.content}</p>
                  <div className="mt-3 text-xs text-gray-500">
                    By {note.author} • {new Date(note.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NannyDashboard;
