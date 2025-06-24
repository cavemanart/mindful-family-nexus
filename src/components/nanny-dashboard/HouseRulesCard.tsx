
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Home, Edit, Trash2, Plus } from 'lucide-react';
import type { HouseholdInfo } from '@/hooks/useHouseholdInfo';

interface HouseRulesCardProps {
  houseRules: HouseholdInfo[];
  emergencyNumbers: HouseholdInfo[];
  onUpdate?: (id: string, updates: Partial<HouseholdInfo>) => Promise<any>;
  onDelete?: (id: string) => Promise<any>;
  onAdd?: (info: Omit<HouseholdInfo, 'id' | 'created_at' | 'updated_at'>) => Promise<any>;
  canEdit?: boolean;
}

const HouseRulesCard: React.FC<HouseRulesCardProps> = ({ 
  houseRules, 
  emergencyNumbers, 
  onUpdate, 
  onDelete, 
  onAdd, 
  canEdit = false 
}) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<HouseholdInfo | null>(null);
  const [editType, setEditType] = useState<'rule' | 'emergency'>('rule');
  const [formData, setFormData] = useState({
    title: '',
    value: ''
  });

  const handleEdit = (item: HouseholdInfo, type: 'rule' | 'emergency') => {
    setEditingItem(item);
    setEditType(type);
    setFormData({
      title: item.title,
      value: item.value
    });
    setShowEditDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.value) return;

    const infoType = editType === 'rule' ? 'house_rule' : 'emergency_number';

    if (editingItem && onUpdate) {
      await onUpdate(editingItem.id, {
        title: formData.title || (editType === 'rule' ? 'House Rule' : 'Emergency Contact'),
        value: formData.value
      });
    } else if (!editingItem && onAdd) {
      await onAdd({
        title: formData.title || (editType === 'rule' ? 'House Rule' : 'Emergency Contact'),
        value: formData.value,
        description: editType === 'rule' ? 'Family house rule' : 'Emergency contact information',
        household_id: houseRules[0]?.household_id || emergencyNumbers[0]?.household_id || '',
        info_type: infoType
      });
    }

    closeDialog();
  };

  const handleDelete = async (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      await onDelete?.(itemId);
    }
  };

  const closeDialog = () => {
    setShowEditDialog(false);
    setEditingItem(null);
    setFormData({
      title: '',
      value: ''
    });
  };

  const handleAddNew = (type: 'rule' | 'emergency') => {
    setEditingItem(null);
    setEditType(type);
    setFormData({
      title: '',
      value: ''
    });
    setShowEditDialog(true);
  };

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 overflow-x-hidden">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
          <Home className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500 flex-shrink-0" />
          <span className="truncate">House Rules & Quick Reference</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4 sm:space-y-6">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-base sm:text-lg">House Rules</h4>
              {canEdit && onAdd && (
                <Button onClick={() => handleAddNew('rule')} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Rule
                </Button>
              )}
            </div>
            {houseRules.length === 0 ? (
              <div className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                <div className="flex items-start">
                  <span className="text-orange-500 mr-2 sm:mr-3 flex-shrink-0 mt-1">•</span>
                  <span className="break-words">Wash hands before meals</span>
                </div>
                <div className="flex items-start">
                  <span className="text-orange-500 mr-2 sm:mr-3 flex-shrink-0 mt-1">•</span>
                  <span className="break-words">Clean up toys before getting new ones</span>
                </div>
                <div className="flex items-start">
                  <span className="text-orange-500 mr-2 sm:mr-3 flex-shrink-0 mt-1">•</span>
                  <span className="break-words">Ask permission before going outside</span>
                </div>
                <div className="flex items-start">
                  <span className="text-orange-500 mr-2 sm:mr-3 flex-shrink-0 mt-1">•</span>
                  <span className="break-words">Use indoor voices</span>
                </div>
              </div>
            ) : (
              <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                {houseRules.map((rule) => (
                  <li key={rule.id} className="flex items-start justify-between">
                    <div className="flex items-start flex-1">
                      <span className="text-orange-500 mr-2 sm:mr-3 flex-shrink-0 mt-1">•</span>
                      <span className="break-words min-w-0 flex-1">{rule.value}</span>
                    </div>
                    {canEdit && (
                      <div className="flex gap-1 ml-2">
                        <Button
                          onClick={() => handleEdit(rule, 'rule')}
                          variant="ghost"
                          size="sm"
                          className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        {onDelete && (
                          <Button
                            onClick={() => handleDelete(rule.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-base sm:text-lg">Emergency Numbers</h4>
              {canEdit && onAdd && (
                <Button onClick={() => handleAddNew('emergency')} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Number
                </Button>
              )}
            </div>
            <div className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              <div className="flex items-start">
                <span className="text-orange-500 mr-2 sm:mr-3 flex-shrink-0 mt-1">•</span>
                <span className="break-words"><strong>911</strong> - Emergency</span>
              </div>
              <div className="flex items-start">
                <span className="text-orange-500 mr-2 sm:mr-3 flex-shrink-0 mt-1">•</span>
                <span className="break-words"><strong>Poison Control:</strong> 1-800-222-1222</span>
              </div>
              <div className="flex items-start">
                <span className="text-orange-500 mr-2 sm:mr-3 flex-shrink-0 mt-1">•</span>
                <span className="break-words"><strong>Non-Emergency Police:</strong> 311</span>
              </div>
              {emergencyNumbers.map((number) => (
                <div key={number.id} className="flex items-start justify-between">
                  <div className="flex items-start flex-1">
                    <span className="text-orange-500 mr-2 sm:mr-3 flex-shrink-0 mt-1">•</span>
                    <span className="break-words"><strong>{number.title}:</strong> {number.value}</span>
                  </div>
                  {canEdit && (
                    <div className="flex gap-1 ml-2">
                      <Button
                        onClick={() => handleEdit(number, 'emergency')}
                        variant="ghost"
                        size="sm"
                        className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      {onDelete && (
                        <Button
                          onClick={() => handleDelete(number.id)}
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
              ))}
            </div>
          </div>
        </div>
      </CardContent>

      {/* Edit/Add Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem 
                ? `Edit ${editType === 'rule' ? 'House Rule' : 'Emergency Number'}`
                : `Add ${editType === 'rule' ? 'House Rule' : 'Emergency Number'}`
              }
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {editType === 'emergency' && (
              <div>
                <Label htmlFor="title">Contact Name</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Mom's Work, Dad's Cell"
                  required
                />
              </div>
            )}
            <div>
              <Label htmlFor="value">
                {editType === 'rule' ? 'Rule' : 'Phone Number'}
              </Label>
              <Input
                id="value"
                value={formData.value}
                onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                placeholder={editType === 'rule' ? 'e.g., No shoes in the house' : 'e.g., (555) 123-4567'}
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                {editingItem 
                  ? `Update ${editType === 'rule' ? 'Rule' : 'Number'}`
                  : `Add ${editType === 'rule' ? 'Rule' : 'Number'}`
                }
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

export default HouseRulesCard;
