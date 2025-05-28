import React, { useState } from 'react';
import { Baby, Shield, Phone, Pill, Utensils, Clock, AlertTriangle, Eye, EyeOff, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import NannyTokenGenerator from './NannyTokenGenerator';
import { useAuth } from '@/hooks/useAuth';
import { useHouseholds } from '@/hooks/useHouseholds';
import { useEmergencyContacts } from '@/hooks/useEmergencyContacts';
import { useMedications } from '@/hooks/useMedications';
import { useHouseholdInfo } from '@/hooks/useHouseholdInfo';

const NannyMode = () => {
  const [isLocked, setIsLocked] = useState(true);
  const [accessPin, setAccessPin] = useState('');
  const [showCodes, setShowCodes] = useState(false);
  const [showEmergencyForm, setShowEmergencyForm] = useState(false);
  const [showMedicationForm, setShowMedicationForm] = useState(false);
  const [showAccessCodeForm, setShowAccessCodeForm] = useState(false);
  const { userProfile } = useAuth();
  const { households } = useHouseholds();
  
  const correctPin = '1234';
  const selectedHousehold = households[0];

  const { contacts, addContact, deleteContact } = useEmergencyContacts(selectedHousehold?.id);
  const { medications, addMedication, deleteMedication } = useMedications(selectedHousehold?.id);
  const { householdInfo, addHouseholdInfo, deleteHouseholdInfo } = useHouseholdInfo(selectedHousehold?.id);

  const [emergencyForm, setEmergencyForm] = useState({
    name: '',
    relationship: '',
    phone: '',
    is_primary: false
  });

  const [medicationForm, setMedicationForm] = useState({
    child_name: '',
    medication_name: '',
    dosage: '',
    frequency: '',
    instructions: '',
    prescribing_doctor: ''
  });

  const [accessCodeForm, setAccessCodeForm] = useState({
    title: '',
    value: '',
    description: '',
    info_type: 'access_code'
  });

  const isParent = userProfile?.role === 'parent';

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

  const handleAddEmergencyContact = async () => {
    if (!selectedHousehold) return;
    
    await addContact({
      household_id: selectedHousehold.id,
      ...emergencyForm
    });
    
    setEmergencyForm({ name: '', relationship: '', phone: '', is_primary: false });
    setShowEmergencyForm(false);
  };

  const handleAddMedication = async () => {
    if (!selectedHousehold) return;
    
    await addMedication({
      household_id: selectedHousehold.id,
      ...medicationForm
    });
    
    setMedicationForm({
      child_name: '',
      medication_name: '',
      dosage: '',
      frequency: '',
      instructions: '',
      prescribing_doctor: ''
    });
    setShowMedicationForm(false);
  };

  const handleAddAccessCode = async () => {
    if (!selectedHousehold) return;
    
    await addHouseholdInfo({
      household_id: selectedHousehold.id,
      ...accessCodeForm
    });
    
    setAccessCodeForm({ title: '', value: '', description: '', info_type: 'access_code' });
    setShowAccessCodeForm(false);
  };

  if (isLocked) {
    return (
      <div className="space-y-6 px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center justify-center gap-2 mb-2">
            <Shield className="text-blue-500" size={28} />
            Nanny Mode - Protected
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">Enter PIN to access important family information</p>
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
            <p className="text-xs text-center text-muted-foreground mt-4">
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
          <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <Baby className="text-blue-500" size={28} />
            Nanny Mode - Active
          </h2>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Important information for caregivers</p>
        </div>
        <Button 
          onClick={() => setIsLocked(true)} 
          variant="outline"
          className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 w-full sm:w-auto"
        >
          <Shield size={16} className="mr-2" />
          Lock Mode
        </Button>
      </div>

      <Alert className="border-yellow-300 bg-yellow-50 dark:bg-yellow-950/30">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800 dark:text-yellow-200">
          <strong>Important:</strong> In case of emergency, always call 911 first, then contact parents.
        </AlertDescription>
      </Alert>

      {/* Token Generator for authenticated users */}
      {userProfile && selectedHousehold && (
        <div className="bg-card rounded-2xl border shadow-sm p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Nanny Access</h2>
          <NannyTokenGenerator householdId={selectedHousehold.id} />
        </div>
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
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-foreground">Emergency Contacts</h3>
            {isParent && (
              <Dialog open={showEmergencyForm} onOpenChange={setShowEmergencyForm}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Contact
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Emergency Contact</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={emergencyForm.name}
                        onChange={(e) => setEmergencyForm(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="relationship">Relationship</Label>
                      <Input
                        id="relationship"
                        value={emergencyForm.relationship}
                        onChange={(e) => setEmergencyForm(prev => ({ ...prev, relationship: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={emergencyForm.phone}
                        onChange={(e) => setEmergencyForm(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="primary"
                        checked={emergencyForm.is_primary}
                        onCheckedChange={(checked) => setEmergencyForm(prev => ({ ...prev, is_primary: checked }))}
                      />
                      <Label htmlFor="primary">Primary Contact</Label>
                    </div>
                    <Button onClick={handleAddEmergencyContact} className="w-full">
                      Add Contact
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
          
          <div className="grid gap-4">
            {contacts.length === 0 ? (
              <div className="text-center py-8">
                <Phone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No emergency contacts added yet</p>
                {isParent && (
                  <p className="text-sm text-muted-foreground mt-2">Add contacts to help caregivers in emergencies</p>
                )}
              </div>
            ) : (
              contacts.map((contact) => (
                <Card key={contact.id} className={`hover:shadow-md transition-shadow ${
                  contact.phone === '911' ? 'border-red-300 bg-red-50 dark:bg-red-950/30' : ''
                }`}>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-foreground">{contact.name}</h4>
                          {contact.is_primary && (
                            <Badge variant="destructive" className="text-xs">Primary</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{contact.relationship}</p>
                        <p className="text-lg font-mono text-foreground mt-1">{contact.phone}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleCall(contact.phone)}
                          className={`${
                            contact.phone === '911' 
                              ? 'bg-red-600 hover:bg-red-700' 
                              : 'bg-green-600 hover:bg-green-700'
                          }`}
                        >
                          <Phone size={16} className="mr-2" />
                          Call
                        </Button>
                        {isParent && contact.phone !== '911' && (
                          <Button
                            onClick={() => deleteContact(contact.id)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-950/30"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="medications" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-foreground">Medications & Health</h3>
            {isParent && (
              <Dialog open={showMedicationForm} onOpenChange={setShowMedicationForm}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Medication
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Medication</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    <div>
                      <Label htmlFor="child_name">Child Name</Label>
                      <Input
                        id="child_name"
                        value={medicationForm.child_name}
                        onChange={(e) => setMedicationForm(prev => ({ ...prev, child_name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="medication_name">Medication Name</Label>
                      <Input
                        id="medication_name"
                        value={medicationForm.medication_name}
                        onChange={(e) => setMedicationForm(prev => ({ ...prev, medication_name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="dosage">Dosage</Label>
                      <Input
                        id="dosage"
                        value={medicationForm.dosage}
                        onChange={(e) => setMedicationForm(prev => ({ ...prev, dosage: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="frequency">Frequency</Label>
                      <Input
                        id="frequency"
                        value={medicationForm.frequency}
                        onChange={(e) => setMedicationForm(prev => ({ ...prev, frequency: e.target.value }))}
                        placeholder="e.g., Daily, As needed"
                      />
                    </div>
                    <div>
                      <Label htmlFor="instructions">Instructions</Label>
                      <Textarea
                        id="instructions"
                        value={medicationForm.instructions}
                        onChange={(e) => setMedicationForm(prev => ({ ...prev, instructions: e.target.value }))}
                        placeholder="Special instructions, precautions, etc."
                      />
                    </div>
                    <div>
                      <Label htmlFor="prescribing_doctor">Prescribing Doctor (Optional)</Label>
                      <Input
                        id="prescribing_doctor"
                        value={medicationForm.prescribing_doctor}
                        onChange={(e) => setMedicationForm(prev => ({ ...prev, prescribing_doctor: e.target.value }))}
                      />
                    </div>
                    <Button onClick={handleAddMedication} className="w-full">
                      Add Medication
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {medications.length === 0 ? (
            <div className="text-center py-12">
              <Pill size={48} className="text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">No medications to track</p>
              {isParent && (
                <p className="text-sm text-muted-foreground mt-2">Add medications to help caregivers manage health needs</p>
              )}
            </div>
          ) : (
            medications.map((medication) => (
              <Card key={medication.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Pill className="text-blue-500 mt-1 flex-shrink-0" size={20} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-foreground">
                            {medication.child_name} - {medication.medication_name}
                          </h4>
                          {isParent && (
                            <Button
                              onClick={() => deleteMedication(medication.id)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-950/30"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/30">
                          Dosage: {medication.dosage}
                        </Badge>
                        <Badge variant="outline" className="bg-green-50 dark:bg-green-950/30">
                          <Clock size={12} className="mr-1" />
                          {medication.frequency}
                        </Badge>
                      </div>
                      {medication.instructions && (
                        <div className="bg-muted p-3 rounded-lg">
                          <strong>Notes:</strong> {medication.instructions}
                        </div>
                      )}
                      {medication.prescribing_doctor && (
                        <div className="text-sm text-muted-foreground">
                          <strong>Doctor:</strong> {medication.prescribing_doctor}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="codes" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold text-foreground">Access Codes</h3>
              <Button
                onClick={() => setShowCodes(!showCodes)}
                variant="outline"
                size="sm"
              >
                {showCodes ? <EyeOff size={16} /> : <Eye size={16} />}
                <span className="ml-2">{showCodes ? 'Hide' : 'Show'} Codes</span>
              </Button>
            </div>
            {isParent && (
              <Dialog open={showAccessCodeForm} onOpenChange={setShowAccessCodeForm}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Code
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Access Code</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="code_title">Title</Label>
                      <Input
                        id="code_title"
                        value={accessCodeForm.title}
                        onChange={(e) => setAccessCodeForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., Front Door, WiFi"
                      />
                    </div>
                    <div>
                      <Label htmlFor="code_value">Code/Password</Label>
                      <Input
                        id="code_value"
                        value={accessCodeForm.value}
                        onChange={(e) => setAccessCodeForm(prev => ({ ...prev, value: e.target.value }))}
                        placeholder="Enter the code or password"
                      />
                    </div>
                    <div>
                      <Label htmlFor="code_description">Description</Label>
                      <Input
                        id="code_description"
                        value={accessCodeForm.description}
                        onChange={(e) => setAccessCodeForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Additional details"
                      />
                    </div>
                    <Button onClick={handleAddAccessCode} className="w-full">
                      Add Access Code
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
          
          <div className="grid gap-4">
            {householdInfo.length === 0 ? (
              <div className="text-center py-8">
                <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No access codes added yet</p>
                {isParent && (
                  <p className="text-sm text-muted-foreground mt-2">Add WiFi passwords, door codes, and other access information</p>
                )}
              </div>
            ) : (
              householdInfo.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-foreground">{item.title}</h4>
                          {isParent && (
                            <Button
                              onClick={() => deleteHouseholdInfo(item.id)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-950/30"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                        <p className={`text-lg font-mono break-all ${showCodes ? 'text-foreground' : 'text-transparent bg-muted rounded select-none'}`}>
                          {showCodes ? item.value : '••••••••'}
                        </p>
                      </div>
                      {showCodes && (
                        <Button
                          onClick={() => navigator.clipboard.writeText(item.value)}
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
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="info" className="space-y-4">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Utensils className="text-green-500" size={20} />
                  Sample Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h5 className="font-medium text-foreground">Emma (Age 8)</h5>
                  <p className="text-sm text-muted-foreground">
                    • Allergic to peanuts and tree nuts<br/>
                    • Loves pasta and chicken<br/>
                    • No sugar after 6 PM
                  </p>
                </div>
                <div>
                  <h5 className="font-medium text-foreground">Jack (Age 6)</h5>
                  <p className="text-sm text-muted-foreground">
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
                    <span className="text-muted-foreground">Kids arrive home from school</span>
                  </div>
                  <div className="flex justify-between flex-wrap gap-2">
                    <span className="font-medium">4:00 PM</span>
                    <span className="text-muted-foreground">Snack time</span>
                  </div>
                  <div className="flex justify-between flex-wrap gap-2">
                    <span className="font-medium">4:30 PM</span>
                    <span className="text-muted-foreground">Homework time</span>
                  </div>
                  <div className="flex justify-between flex-wrap gap-2">
                    <span className="font-medium">5:30 PM</span>
                    <span className="text-muted-foreground">Play time / Activities</span>
                  </div>
                  <div className="flex justify-between flex-wrap gap-2">
                    <span className="font-medium">6:30 PM</span>
                    <span className="text-muted-foreground">Dinner preparation</span>
                  </div>
                  <div className="flex justify-between flex-wrap gap-2">
                    <span className="font-medium">8:00 PM</span>
                    <span className="text-muted-foreground">Bath time & bedtime routine</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">House Rules</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
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
