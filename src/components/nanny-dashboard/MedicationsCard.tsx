
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Pill, Clock, Edit, Trash2, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Medication } from '@/hooks/useMedications';

interface MedicationsCardProps {
  medications: Medication[];
  onUpdate?: (medicationId: string, updates: Partial<Medication>) => Promise<any>;
  onDelete?: (medicationId: string) => Promise<any>;
  onAdd?: (medication: Omit<Medication, 'id' | 'created_at' | 'updated_at'>) => Promise<any>;
  canEdit?: boolean;
}

const MedicationsCard: React.FC<MedicationsCardProps> = ({ 
  medications, 
  onUpdate, 
  onDelete, 
  onAdd, 
  canEdit = false 
}) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [formData, setFormData] = useState({
    child_name: '',
    medication_name: '',
    dosage: '',
    frequency: '',
    instructions: '',
    prescribing_doctor: ''
  });

  const handleEdit = (medication: Medication) => {
    setEditingMedication(medication);
    setFormData({
      child_name: medication.child_name,
      medication_name: medication.medication_name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      instructions: medication.instructions || '',
      prescribing_doctor: medication.prescribing_doctor || ''
    });
    setShowEditDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.child_name || !formData.medication_name || !formData.dosage || !formData.frequency) return;

    if (editingMedication && onUpdate) {
      await onUpdate(editingMedication.id, formData);
    } else if (!editingMedication && onAdd) {
      await onAdd({
        ...formData,
        household_id: editingMedication?.household_id || medications[0]?.household_id || ''
      });
    }

    closeDialog();
  };

  const handleDelete = async (medicationId: string) => {
    if (window.confirm('Are you sure you want to delete this medication?')) {
      await onDelete?.(medicationId);
    }
  };

  const closeDialog = () => {
    setShowEditDialog(false);
    setEditingMedication(null);
    setFormData({
      child_name: '',
      medication_name: '',
      dosage: '',
      frequency: '',
      instructions: '',
      prescribing_doctor: ''
    });
  };

  const handleAddNew = () => {
    setEditingMedication(null);
    setFormData({
      child_name: '',
      medication_name: '',
      dosage: '',
      frequency: '',
      instructions: '',
      prescribing_doctor: ''
    });
    setShowEditDialog(true);
  };

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 overflow-x-hidden">
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
            <Pill className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500 flex-shrink-0" />
            <span className="truncate">Medications & Health</span>
          </CardTitle>
          {canEdit && onAdd && (
            <Button onClick={handleAddNew} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {medications.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">No medications listed</p>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {medications.map((medication) => (
              <div key={medication.id} className="w-full border rounded-xl p-3 sm:p-4 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-start justify-between">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-base sm:text-lg leading-tight break-words">
                      {medication.child_name} - {medication.medication_name}
                    </h4>
                    {canEdit && (
                      <div className="flex gap-2 ml-2">
                        <Button
                          onClick={() => handleEdit(medication)}
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        {onDelete && (
                          <Button
                            onClick={() => handleDelete(medication.id)}
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
                  {medication.prescribing_doctor && (
                    <div className="text-sm text-blue-600 dark:text-blue-300">
                      <strong>Doctor:</strong> {medication.prescribing_doctor}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Edit/Add Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingMedication ? 'Edit Medication' : 'Add Medication'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="child_name">Child Name</Label>
              <Input
                id="child_name"
                value={formData.child_name}
                onChange={(e) => setFormData(prev => ({ ...prev, child_name: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="medication_name">Medication Name</Label>
              <Input
                id="medication_name"
                value={formData.medication_name}
                onChange={(e) => setFormData(prev => ({ ...prev, medication_name: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="dosage">Dosage</Label>
              <Input
                id="dosage"
                value={formData.dosage}
                onChange={(e) => setFormData(prev => ({ ...prev, dosage: e.target.value }))}
                placeholder="e.g., 5ml, 1 tablet"
                required
              />
            </div>
            <div>
              <Label htmlFor="frequency">Frequency</Label>
              <Input
                id="frequency"
                value={formData.frequency}
                onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
                placeholder="e.g., Twice daily, With meals"
                required
              />
            </div>
            <div>
              <Label htmlFor="instructions">Instructions (optional)</Label>
              <Textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                placeholder="Additional instructions"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="prescribing_doctor">Prescribing Doctor (optional)</Label>
              <Input
                id="prescribing_doctor"
                value={formData.prescribing_doctor}
                onChange={(e) => setFormData(prev => ({ ...prev, prescribing_doctor: e.target.value }))}
                placeholder="Dr. Smith"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                {editingMedication ? 'Update Medication' : 'Add Medication'}
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

export default MedicationsCard;
