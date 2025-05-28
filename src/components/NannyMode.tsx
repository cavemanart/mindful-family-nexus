
import React, { useState } from 'react';
import { Baby, Shield, Phone, Pill, Utensils, Clock, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import NannyTokenGenerator from './NannyTokenGenerator';
import { useAuth } from '@/hooks/useAuth';
import { useHouseholds } from '@/hooks/useHouseholds';

interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

interface Medication {
  name: string;
  dosage: string;
  time: string;
  notes: string;
}

interface AccessCode {
  location: string;
  code: string;
  description: string;
}

const NannyMode = () => {
  const [isLocked, setIsLocked] = useState(true);
  const [accessPin, setAccessPin] = useState('');
  const [showCodes, setShowCodes] = useState(false);
  const { userProfile } = useAuth();
  const { households } = useHouseholds();
  
  const correctPin = '1234'; // In a real app, this would be stored securely
  const selectedHousehold = households[0]; // For demo purposes

  const emergencyContacts: EmergencyContact[] = [
    { name: 'Mom (Sarah)', relationship: 'Mother', phone: '(555) 123-4567' },
    { name: 'Dad (Mike)', relationship: 'Father', phone: '(555) 987-6543' },
    { name: 'Grandma Betty', relationship: 'Grandmother', phone: '(555) 456-7890' },
    { name: 'Dr. Johnson', relationship: 'Pediatrician', phone: '(555) 234-5678' },
    { name: '911', relationship: 'Emergency', phone: '911' },
  ];

  const medications: Medication[] = [
    {
      name: 'Emma - Allergy Medicine',
      dosage: '1 tablet',
      time: '8:00 AM daily',
      notes: 'With food. For seasonal allergies.',
    },
    {
      name: 'Jack - Inhaler',
      dosage: '2 puffs',
      time: 'As needed',
      notes: 'For asthma. Shake before use. Call parents if used more than 2x.',
    },
  ];

  const accessCodes: AccessCode[] = [
    { location: 'Front Door', code: '4829', description: 'Main entrance keypad' },
    { location: 'Garage', code: '1357', description: 'Side garage entrance' },
    { location: 'WiFi', code: 'FamilyTime2024!', description: 'Home WiFi password' },
    { location: 'iPad', code: '2468', description: 'Kids tablet for emergencies' },
  ];

  const handlePinSubmit = () => {
    if (accessPin === correctPin) {
      setIsLocked(false);
      setAccessPin('');
    } else {
      alert('Incorrect PIN. Please try again.');
      setAccessPin('');
    }
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  if (isLocked) {
    return (
      <div className="space-y-6 px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center justify-center gap-2 mb-2">
            <Shield className="text-blue-500" size={28} />
            Nanny Mode - Protected
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">Enter PIN to access important family information</p>
        </div>

        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center text-lg sm:text-xl">Enter Access PIN</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Enter 4-digit PIN"
              value={accessPin}
              onChange={(e) => setAccessPin(e.target.value)}
              maxLength={4}
              className="text-center text-lg tracking-widest"
            />
            <Button 
              onClick={handlePinSubmit} 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={accessPin.length !== 4}
            >
              <Shield size={16} className="mr-2" />
              Access Nanny Mode
            </Button>
            <p className="text-xs text-center text-gray-500 mt-4">
              Demo PIN: 1234 (In real use, this would be set by parents)
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Baby className="text-blue-500" size={28} />
            Nanny Mode - Active
          </h2>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Important information for caregivers</p>
        </div>
        <Button 
          onClick={() => setIsLocked(true)} 
          variant="outline"
          className="border-red-300 text-red-600 hover:bg-red-50 w-full sm:w-auto"
        >
          <Shield size={16} className="mr-2" />
          Lock Mode
        </Button>
      </div>

      <Alert className="border-yellow-300 bg-yellow-50">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          <strong>Important:</strong> In case of emergency, always call 911 first, then contact parents.
        </AlertDescription>
      </Alert>

      {/* Token Generator for authenticated users */}
      {userProfile && selectedHousehold && (
        <NannyTokenGenerator householdId={selectedHousehold.id} />
      )}

      <Tabs defaultValue="contacts" className="space-y-4">
        <div className="overflow-x-auto">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 min-w-max">
            <TabsTrigger value="contacts" className="text-xs sm:text-sm">Contacts</TabsTrigger>
            <TabsTrigger value="medications" className="text-xs sm:text-sm">Meds</TabsTrigger>
            <TabsTrigger value="codes" className="text-xs sm:text-sm">Codes</TabsTrigger>
            <TabsTrigger value="info" className="text-xs sm:text-sm">Info</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="contacts" className="space-y-4">
          <div className="grid gap-4">
            {emergencyContacts.map((contact, index) => (
              <Card key={index} className={`hover:shadow-md transition-shadow ${
                contact.phone === '911' ? 'border-red-300 bg-red-50' : ''
              }`}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{contact.name}</h4>
                      <p className="text-sm text-gray-600">{contact.relationship}</p>
                      <p className="text-lg font-mono text-gray-800 mt-1">{contact.phone}</p>
                    </div>
                    <Button
                      onClick={() => handleCall(contact.phone)}
                      className={`w-full sm:w-auto ${
                        contact.phone === '911' 
                          ? 'bg-red-600 hover:bg-red-700' 
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      <Phone size={16} className="mr-2" />
                      Call
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="medications" className="space-y-4">
          {medications.map((medication, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Pill className="text-blue-500 mt-1 flex-shrink-0" size={20} />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{medication.name}</h4>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="bg-blue-50">
                        Dosage: {medication.dosage}
                      </Badge>
                      <Badge variant="outline" className="bg-green-50">
                        <Clock size={12} className="mr-1" />
                        {medication.time}
                      </Badge>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <strong>Notes:</strong> {medication.notes}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {medications.length === 0 && (
            <div className="text-center py-12">
              <Pill size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No medications to track</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="codes" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Access Codes</h3>
            <Button
              onClick={() => setShowCodes(!showCodes)}
              variant="outline"
              size="sm"
            >
              {showCodes ? <EyeOff size={16} /> : <Eye size={16} />}
              <span className="ml-2">{showCodes ? 'Hide' : 'Show'} Codes</span>
            </Button>
          </div>
          
          <div className="grid gap-4">
            {accessCodes.map((item, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{item.location}</h4>
                      <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                      <p className={`text-lg font-mono break-all ${showCodes ? 'text-gray-800' : 'text-transparent bg-gray-300 rounded select-none'}`}>
                        {showCodes ? item.code : '••••••••'}
                      </p>
                    </div>
                    {showCodes && (
                      <Button
                        onClick={() => navigator.clipboard.writeText(item.code)}
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto"
                      >
                        Copy
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="info" className="space-y-4">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Utensils className="text-green-500" size={20} />
                  Meal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h5 className="font-medium text-gray-900">Emma (Age 8)</h5>
                  <p className="text-sm text-gray-600">
                    • Allergic to peanuts and tree nuts<br/>
                    • Loves pasta and chicken<br/>
                    • No sugar after 6 PM
                  </p>
                </div>
                <div>
                  <h5 className="font-medium text-gray-900">Jack (Age 6)</h5>
                  <p className="text-sm text-gray-600">
                    • Has mild asthma - avoid dusty areas<br/>
                    • Loves pizza and fruit<br/>
                    • Needs to drink water regularly
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="text-blue-500" size={20} />
                  Daily Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between flex-wrap gap-2">
                    <span className="font-medium">3:30 PM</span>
                    <span>Kids arrive home from school</span>
                  </div>
                  <div className="flex justify-between flex-wrap gap-2">
                    <span className="font-medium">4:00 PM</span>
                    <span>Snack time</span>
                  </div>
                  <div className="flex justify-between flex-wrap gap-2">
                    <span className="font-medium">4:30 PM</span>
                    <span>Homework time</span>
                  </div>
                  <div className="flex justify-between flex-wrap gap-2">
                    <span className="font-medium">5:30 PM</span>
                    <span>Play time / Activities</span>
                  </div>
                  <div className="flex justify-between flex-wrap gap-2">
                    <span className="font-medium">6:30 PM</span>
                    <span>Dinner preparation</span>
                  </div>
                  <div className="flex justify-between flex-wrap gap-2">
                    <span className="font-medium">8:00 PM</span>
                    <span>Bath time & bedtime routine</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">House Rules</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• No TV/screens until homework is done</li>
                  <li>• Wash hands before snacks and meals</li>
                  <li>• Clean up toys before getting new ones out</li>
                  <li>• Be kind to each other and use indoor voices</li>
                  <li>• Ask permission before going outside</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NannyMode;
