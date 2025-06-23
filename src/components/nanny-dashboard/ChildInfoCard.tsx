
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Utensils, Edit, Trash2, Plus } from 'lucide-react';
import type { HouseholdInfo } from '@/hooks/useHouseholdInfo';

interface ChildInfoCardProps {
  childInfo: HouseholdInfo[];
  onUpdate?: (id: string, updates: Partial<HouseholdInfo>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onAdd?: (info: Omit<HouseholdInfo, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  canEdit?: boolean;
}

const ChildInfoCard: React.FC<ChildInfoCardProps> = ({ 
  childInfo, 
  onUpdate, 
  onDelete, 
  onAdd, 
  canEdit = false 
}) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingInfo, setEditingInfo] = useState<HouseholdInfo | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    value: '',
    description: ''
  });

  const handleEdit = (info: HouseholdInfo) => {
    setEditingInfo(info);
    setFormData({
      title: info.title,
      value: info.value,
      description: info.description || ''
    });
    setShowEditDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.value) return;

    if (editingInfo && onUpdate) {
      await onUpdate(editingInfo.id, formData);
    } else if (!editingInfo && onAdd) {
      await onAdd({
        ...formData,
        household_id: editingInfo?.household_id || childInfo[0]?.household_id || '',
        info_type: 'child_info'
      });
    }

    closeDialog();
  };

  const handleDelete = async (infoId: string) => {
    if (window.confirm('Are you sure you want to delete this child information?')) {
      await onDelete?.(infoId);
    }
  };

  const closeDialog = () => {
    setShowEditDialog(false);
    setEditingInfo(null);
    setFormData({
      title: '',
      value: '',
      description: ''
    });
  };

  const handleAddNew = () => {
    setEditingInfo(null);
    setFormData({
      title: '',
      value: '',
      description: ''
    });
    setShowEditDialog(true);
  };

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 overflow-x-hidden">
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
            <Utensils className="h-5 w-5 sm:h-6 sm:w-6 text-purple-500 flex-shrink-0" />
            <span className="truncate">Child Information</span>
          </CardTitle>
          {canEdit && onAdd && (
            <Button onClick={handleAddNew} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Info
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3 sm:space-y-4">
          {childInfo.map((info) => (
            <div key={info.id} className="w-full border rounded-xl p-3 sm:p-4 bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800">
              <div className="flex items-start justify-between mb-2 sm:mb-3">
                <h4 className="font-semibold text-purple-900 dark:text-purple-100 text-base sm:text-lg break-words flex-1">
                  {info.title}
                </h4>
                {canEdit && (
                  <div className="flex gap-2 ml-2">
                    <Button
                      onClick={() => handleEdit(info)}
                      variant="ghost"
                      size="sm"
                      className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    {onDelete && (
                      <Button
                        onClick={() => handleDelete(info.id)}
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
              {info.description && (
                <div className="text-sm sm:text-base text-purple-600 dark:text-purple-300 mb-2 sm:mb-3 leading-relaxed break-words">
                  {info.description}
                </div>
              )}
              <div className="text-sm sm:text-base text-purple-800 dark:text-purple-200 leading-relaxed">
                {info.value.split('\n').map((line, index) => (
                  <div key={index} className="mb-2 flex items-start">
                    <span className="text-purple-500 mr-2 flex-shrink-0 mt-1">•</span>
                    <span className="break-words min-w-0 flex-1">{line}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      {/* Edit/Add Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingInfo ? 'Edit Child Information' : 'Add Child Information'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Dietary Restrictions, Allergies"
                required
              />
            </div>
            <div>
              <Label htmlFor="value">Information</Label>
              <Textarea
                id="value"
                value={formData.value}
                onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                placeholder="Enter details (use new lines to separate items)"
                rows={4}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Additional context or details"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                {editingInfo ? 'Update Information' : 'Add Information'}
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

export default ChildInfoCard;
