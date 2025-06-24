
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Phone, Edit, Trash2, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { EmergencyContact } from '@/hooks/useEmergencyContacts';

interface EmergencyContactsCardProps {
  contacts: EmergencyContact[];
  onUpdate?: (contactId: string, updates: Partial<EmergencyContact>) => Promise<any>;
  onDelete?: (contactId: string) => Promise<any>;
  onAdd?: (contact: Omit<EmergencyContact, 'id' | 'created_at'>) => Promise<any>;
  canEdit?: boolean;
}

const EmergencyContactsCard: React.FC<EmergencyContactsCardProps> = ({ 
  contacts, 
  onUpdate, 
  onDelete, 
  onAdd, 
  canEdit = false 
}) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    relationship: '',
    is_primary: false
  });

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleEdit = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      phone: contact.phone,
      relationship: contact.relationship,
      is_primary: contact.is_primary
    });
    setShowEditDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.relationship) return;

    try {
      if (editingContact && onUpdate) {
        await onUpdate(editingContact.id, formData);
      } else if (!editingContact && onAdd) {
        await onAdd({
          ...formData,
          household_id: editingContact?.household_id || contacts[0]?.household_id || ''
        });
      }
      closeDialog();
    } catch (error) {
      console.error('Error saving contact:', error);
    }
  };

  const handleDelete = async (contactId: string) => {
    if (window.confirm('Are you sure you want to delete this emergency contact?')) {
      try {
        await onDelete?.(contactId);
      } catch (error) {
        console.error('Error deleting contact:', error);
      }
    }
  };

  const closeDialog = () => {
    setShowEditDialog(false);
    setEditingContact(null);
    setFormData({
      name: '',
      phone: '',
      relationship: '',
      is_primary: false
    });
  };

  const handleAddNew = () => {
    setEditingContact(null);
    setFormData({
      name: '',
      phone: '',
      relationship: '',
      is_primary: false
    });
    setShowEditDialog(true);
  };

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 overflow-x-hidden">
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
            <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 flex-shrink-0" />
            <span className="truncate">Emergency Contacts</span>
          </CardTitle>
          {canEdit && onAdd && (
            <Button onClick={handleAddNew} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3 sm:space-y-4">
        {contacts.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">No emergency contacts available</p>
        ) : (
          contacts.map((contact) => (
            <div key={contact.id} className={`w-full border rounded-xl p-3 sm:p-4 ${contact.phone === '911' ? 'border-red-300 bg-red-50 dark:bg-red-950/30' : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700'}`}>
              <div className="space-y-2 sm:space-y-3">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1 sm:mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-base sm:text-lg leading-tight break-words min-w-0 flex-1">{contact.name}</h4>
                    <div className="flex items-center gap-2">
                      {contact.is_primary && (
                        <Badge variant="destructive" className="text-xs sm:text-sm font-medium flex-shrink-0">Primary</Badge>
                      )}
                      {canEdit && (
                        <div className="flex gap-1">
                          <Button
                            onClick={() => handleEdit(contact)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          {onDelete && contact.phone !== '911' && (
                            <Button
                              onClick={() => handleDelete(contact.id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-1 sm:mb-2 break-words">{contact.relationship}</p>
                  <p className="text-base sm:text-lg font-mono text-gray-800 dark:text-gray-200 font-semibold tracking-wide break-all">{contact.phone}</p>
                </div>
                <Button
                  onClick={() => handleCall(contact.phone)}
                  size="lg"
                  className={`w-full min-h-[48px] sm:min-h-[52px] text-base sm:text-lg font-semibold ${
                    contact.phone === '911' 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
                  <span className="truncate">Call {contact.name}</span>
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>

      {/* Edit/Add Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingContact ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Contact name"
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Phone number"
                required
              />
            </div>
            <div>
              <Label htmlFor="relationship">Relationship</Label>
              <Input
                id="relationship"
                value={formData.relationship}
                onChange={(e) => setFormData(prev => ({ ...prev, relationship: e.target.value }))}
                placeholder="e.g., Parent, Neighbor, Doctor"
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_primary"
                checked={formData.is_primary}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_primary: checked }))}
              />
              <Label htmlFor="is_primary">Primary Contact</Label>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                {editingContact ? 'Update Contact' : 'Add Contact'}
              </Button>
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default EmergencyContactsCard;
