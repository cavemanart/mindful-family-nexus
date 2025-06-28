import React, { useState } from 'react';
import { Baby, Shield, Phone, Pill, Utensils, Clock, AlertTriangle, Eye, EyeOff, Plus, Edit, Trash2, Settings } from 'lucide-react';
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
import HouseRulesManager from './HouseRulesManager';
import { useAuth } from '@/hooks/useAuth';
import { Household } from '@/hooks/useHouseholds';
import { useEmergencyContacts } from '@/hooks/useEmergencyContacts';
import { useMedications } from '@/hooks/useMedications';
import { useHouseholdInfo } from '@/hooks/useHouseholdInfo';
import { useFamilyNotes } from '@/hooks/useFamilyNotes';
import { useNannyTokens } from '@/hooks/useNannyTokens';

interface NannyModeProps {
  selectedHousehold: Household;
}

const NannyMode = ({ selectedHousehold }: NannyModeProps) => {
  const [isLocked, setIsLocked] = useState(true);
  const [accessPin, setAccessPin] = useState('');
  const [showCodes, setShowCodes] = useState(false);
  const [showEmergencyForm, setShowEmergencyForm] = useState(false);
  const [showMedicationForm, setShowMedicationForm] = useState(false);
  const [showAccessCodeForm, setShowAccessCodeForm] = useState(false);
  const [showChildInfoForm, setShowChildInfoForm] = useState(false);
  const [showPinSettings, setShowPinSettings] = useState(false);
  const [newPin, setNewPin] = useState('');
  const { userProfile } = useAuth();
  const { resetNannyPin, loading: pinLoading } = useNannyTokens();
  
  const { contacts, addContact, deleteContact } = useEmergencyContacts(selectedHousehold?.id);
  const { medications, addMedication, deleteMedication } = useMedications(selectedHousehold?.id);
  const { householdInfo, addHouseholdInfo, deleteHouseholdInfo, fetchHouseholdInfo } = useHouseholdInfo(selectedHousehold?.id);
  const { notes } = useFamilyNotes(selectedHousehold?.id);

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

  const [childInfoForm, setChildInfoForm] = useState({
    title: '',
    value: '',
    description: '',
    info_type: 'child_info'
  });

  const isParent = userProfile?.role === 'parent';

  // Get dynamic PIN from household info - require parents to set one initially
  const storedPinInfo = householdInfo.find(info => info.info_type === 'nanny_pin');
  const storedPin = storedPinInfo?.value;
  const hasCustomPin = !!storedPin;

  const handlePinSubmit = () => {
    if (accessPin === storedPin) {
      setIsLocked(false);
      setAccessPin('');
    } else {
      alert('Incorrect PIN. Please try again.');
      setAccessPin('');
    }
  };

  const handleUpdatePin = async () => {
    if (newPin.length === 4 && selectedHousehold) {
      const success = await resetNannyPin(selectedHousehold.id, newPin);
      if (success) {
        // Refresh household info to get the new PIN
        await fetchHouseholdInfo();
        setShowPinSettings(false);
        setNewPin('');
      }
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

  const handleAddChildInfo = async () => {
    if (!selectedHousehold) return;
    
    await addHouseholdInfo({
      household_id: selectedHousehold.id,
      ...childInfoForm
    });
    
    setChildInfoForm({ title: '', value: '', description: '', info_type: 'child_info' });
    setShowChildInfoForm(false);
  };

  // Filter household info by type
  const accessCodes = householdInfo.filter(info => info.info_type === 'access_code');
  const childInfo = householdInfo.filter(info => info.info_type === 'child_info');

  // If parent hasn't set a PIN yet, show PIN setup
  if (isParent && !hasCustomPin) {
    return (
      <div className="space-y-6 px-4 sm:px-6 max-w-2xl mx-auto">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center justify-center gap-2 mb-2">
            <Shield className="text-blue-500" size={28} />
            Set Up Nanny Mode PIN
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">Create a 4-digit PIN to secure nanny mode access</p>
        </div>

        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center text-lg sm:text-xl">Create Access PIN</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="setup-pin">New 4-digit PIN</Label>
              <Input
                id="setup-pin"
                type="password"
                placeholder="Enter 4-digit PIN"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                maxLength={4}
                className="text-center text-lg tracking-widest"
              />
            </div>
            <Button 
              onClick={handleUpdatePin} 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={newPin.length !== 4 || pinLoading}
            >
              {pinLoading ? 'Setting up...' : 'Create PIN'}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              This PIN will be required to access nanny mode information
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="space-y-6 px-4 sm:px-6 max-w-2xl mx-auto">
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
              disabled={accessPin.length !== 4 || !hasCustomPin}
            >
              <Shield size={16} className="mr-2" />
              Access Nanny Mode
            </Button>
            {!isParent && (
              <p className="text-xs text-center text-muted-foreground mt-4">
                Contact the family if you need the access PIN
              </p>
            )}
            {!hasCustomPin && isParent && (
              <p className="text-xs text-center text-red-600 mt-4">
                No PIN has been set up yet. Please set one up first.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <Baby className="text-blue-500" size={28} />
            Nanny Mode - Active
          </h2>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Important information for caregivers</p>
        </div>
        <div className="flex gap-2">
          {isParent && (
            <Dialog open={showPinSettings} onOpenChange={setShowPinSettings}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings size={16} className="mr-2" />
                  Change PIN
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Nanny Access PIN</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="current-pin">Current PIN: {storedPin ? '****' : 'Not Set'}</Label>
                  </div>
                  <div>
                    <Label htmlFor="new-pin">New 4-digit PIN</Label>
                    <Input
                      id="new-pin"
                      type="password"
                      placeholder="Enter new PIN"
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      maxLength={4}
                      className="text-center text-lg tracking-widest"
                    />
                  </div>
                  <Button 
                    onClick={handleUpdatePin} 
                    className="w-full"
                    disabled={newPin.length !== 4 || pinLoading}
                  >
                    {pinLoading ? 'Updating...' : 'Update PIN'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
          <Button 
            onClick={() => setIsLocked(true)} 
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            <Shield size={16} className="mr-2" />
            Lock Mode
          </Button>
        </div>
      </div>

      <Alert className="border-yellow-300 bg-yellow-50 dark:bg-yellow-950/30">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800 dark:text-yellow-200">
          <strong>Important:</strong> In case of emergency, always call 911 first, then contact parents.
        </AlertDescription>
      </Alert>

      {/* Token Generation for authenticated users - SINGLE SECTION */}
      {userProfile && selectedHousehold && isParent && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Parent Controls</h2>
          <NannyTokenGenerator householdId={selectedHousehold.id} />
        </div>
      )}

      <Tabs defaultValue="contacts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 h-auto">
          <TabsTrigger value="contacts" className="text-sm py-3">
            <Phone className="h-4 w-4 mr-2" />
            Contacts
          </TabsTrigger>
          <TabsTrigger value="medications" className="text-sm py-3">
            <Pill className="h-4 w-4 mr-2" />
            Meds
          </TabsTrigger>
          <TabsTrigger value="codes" className="text-sm py-3">
            <Eye className="h-4 w-4 mr-2" />
            Codes
          </TabsTrigger>
          <TabsTrigger value="info" className="text-sm py-3">
            <Utensils className="h-4 w-4 mr-2" />
            Info
          </TabsTrigger>
        </TabsList>

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

          <div className="min-h-[300px]">
            {medications.length === 0 ? (
              <div className="text-center py-12">
                <Pill size={48} className="text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">No medications to track</p>
                {isParent && (
                  <p className="text-sm text-muted-foreground mt-2">Add medications to help caregivers manage health needs</p>
                )}
              </div>
            ) : (
              <div className="grid gap-4">
                {medications.map((medication) => (
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
                ))}
              </div>
            )}
          </div>
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
          
          <div className="min-h-[300px]">
            {accessCodes.length === 0 ? (
              <div className="text-center py-8">
                <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No access codes added yet</p>
                {isParent && (
                  <p className="text-sm text-muted-foreground mt-2">Add WiFi passwords, door codes, and other access information</p>
                )}
              </div>
            ) : (
              <div className="grid gap-4">
                {accessCodes.map((item) => (
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
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="info" className="space-y-4">
          <div className="space-y-6">
            <HouseRulesManager 
              householdId={selectedHousehold?.id || ''} 
              canEdit={isParent}
            />

            {/* Child Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Utensils className="h-5 w-5 text-purple-500" />
                    Child Information
                  </CardTitle>
                  {isParent && (
                    <Dialog open={showChildInfoForm} onOpenChange={setShowChildInfoForm}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Info
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Child Information</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="info_title">Title</Label>
                            <Input
                              id="info_title"
                              value={childInfoForm.title}
                              onChange={(e) => setChildInfoForm(prev => ({ ...prev, title: e.target.value }))}
                              placeholder="e.g., Emma (Age 8), Jack's Allergies"
                            />
                          </div>
                          <div>
                            <Label htmlFor="info_value">Information</Label>
                            <Textarea
                              id="info_value"
                              value={childInfoForm.value}
                              onChange={(e) => setChildInfoForm(prev => ({ ...prev, value: e.target.value }))}
                              placeholder="e.g., Allergic to peanuts and tree nuts, Loves pasta and chicken"
                              rows={4}
                            />
                          </div>
                          <div>
                            <Label htmlFor="info_description">Category (Optional)</Label>
                            <Input
                              id="info_description"
                              value={childInfoForm.description}
                              onChange={(e) => setChildInfoForm(prev => ({ ...prev, description: e.target.value }))}
                              placeholder="e.g., Allergies, Preferences, Medical"
                            />
                          </div>
                          <Button onClick={handleAddChildInfo} className="w-full">
                            Add Information
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {childInfo.length === 0 ? (
                  <div className="text-center py-8">
                    <Utensils className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No child information added yet</p>
                    {isParent && (
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                        Add information about children's preferences, allergies, and important details
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {childInfo.map((info) => (
                      <div key={info.id} className="border rounded-lg p-4 bg-purple-50 dark:bg-purple-950/30">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                              {info.title}
                            </h4>
                            {info.description && (
                              <div className="text-xs text-purple-600 dark:text-purple-300 mb-2">
                                {info.description}
                              </div>
                            )}
                            <div className="text-sm text-purple-800 dark:text-purple-200 whitespace-pre-wrap">
                              {info.value.split('\n').map((line, index) => (
                                <div key={index}>• {line}</div>
                              ))}
                            </div>
                          </div>
                          {isParent && (
                            <Button
                              onClick={() => deleteHouseholdInfo(info.id)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-950/30"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Daily Schedule from Family Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="text-blue-500" size={20} />
                  Daily Schedule & Routines
                </CardTitle>
              </CardHeader>
              <CardContent>
                {notes.filter(note => 
                  note.title.toLowerCase().includes('schedule') || 
                  note.title.toLowerCase().includes('routine') ||
                  note.content.toLowerCase().includes('schedule')
                ).length > 0 ? (
                  <div className="grid gap-4">
                    {notes.filter(note => 
                      note.title.toLowerCase().includes('schedule') || 
                      note.title.toLowerCase().includes('routine') ||
                      note.content.toLowerCase().includes('schedule')
                    ).map(note => (
                      <div key={note.id} className={`${note.color} p-4 rounded-lg`}>
                        <h4 className="font-semibold text-gray-800 mb-2">{note.title}</h4>
                        <div className="text-gray-700 text-sm whitespace-pre-wrap">{note.content}</div>
                        <div className="mt-3 text-xs text-gray-500">
                          By {note.author} • {new Date(note.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 mb-2">No schedules or routines added yet</p>
                    {isParent && (
                      <p className="text-sm text-gray-400 dark:text-gray-500">
                        Add family notes with "schedule" or "routine" in the title to display them here
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NannyMode;
