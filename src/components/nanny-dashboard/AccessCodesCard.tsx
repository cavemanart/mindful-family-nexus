
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Key, Eye, EyeOff, Edit, Trash2, Plus } from 'lucide-react';
import type { HouseholdInfo } from '@/hooks/useHouseholdInfo';

interface AccessCodesCardProps {
  accessCodes: HouseholdInfo[];
  showCodes: boolean;
  setShowCodes: (show: boolean) => void;
  onUpdate?: (id: string, updates: Partial<HouseholdInfo>) => Promise<any>;
  onDelete?: (id: string) => Promise<any>;
  onAdd?: (info: Omit<HouseholdInfo, 'id' | 'created_at' | 'updated_at'>) => Promise<any>;
  canEdit?: boolean;
}

const AccessCodesCard: React.FC<AccessCodesCardProps> = ({ 
  accessCodes, 
  showCodes, 
  setShowCodes, 
  onUpdate, 
  onDelete, 
  onAdd, 
  canEdit = false 
}) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingCode, setEditingCode] = useState<HouseholdInfo | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    value: '',
    description: ''
  });

  const handleEdit = (code: HouseholdInfo) => {
    setEditingCode(code);
    setFormData({
      title: code.title,
      value: code.value,
      description: code.description || ''
    });
    setShowEditDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.value) return;

    if (editingCode && onUpdate) {
      await onUpdate(editingCode.id, formData);
    } else if (!editingCode && onAdd) {
      await onAdd({
        ...formData,
        household_id: editingCode?.household_id || accessCodes[0]?.household_id || '',
        info_type: 'access_code'
      });
    }

    closeDialog();
  };

  const handleDelete = async (codeId: string) => {
    if (window.confirm('Are you sure you want to delete this access code?')) {
      await onDelete?.(codeId);
    }
  };

  const closeDialog = () => {
    setShowEditDialog(false);
    setEditingCode(null);
    setFormData({
      title: '',
      value: '',
      description: ''
    });
  };

  const handleAddNew = () => {
    setEditingCode(null);
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
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl min-w-0 flex-1">
              <Key className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 flex-shrink-0" />
              <span className="truncate">Access Codes</span>
            </CardTitle>
            {canEdit && onAdd && (
              <Button onClick={handleAddNew} size="sm" className="flex-shrink-0">
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            )}
          </div>
          <Button
            onClick={() => setShowCodes(!showCodes)}
            variant="outline"
            size="lg"
            className="min-h-[44px] px-3 sm:px-4 text-sm sm:text-base flex-shrink-0"
          >
            {showCodes ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
            <span className="ml-1 sm:ml-2">{showCodes ? 'Hide' : 'Show'}</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {accessCodes.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">No access codes available</p>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {accessCodes.map((info) => (
              <div key={info.id} className="w-full border rounded-xl p-3 sm:p-4 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-base sm:text-lg break-words flex-1">
                    {info.title}
                  </h4>
                  {canEdit && (
                    <div className="flex gap-2 ml-2">
                      <Button
                        onClick={() => handleEdit(info)}
                        variant="ghost"
                        size="sm"
                        className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
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
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3 leading-relaxed break-words">{info.description}</p>
                <div className="bg-gray-100 dark:bg-gray-600 p-3 sm:p-4 rounded-lg font-mono text-base sm:text-lg font-semibold tracking-wider break-all">
                  {showCodes ? info.value : '••••••••'}
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
              {editingCode ? 'Edit Access Code' : 'Add Access Code'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., WiFi Password, Door Code"
                required
              />
            </div>
            <div>
              <Label htmlFor="value">Code/Password</Label>
              <Input
                id="value"
                value={formData.value}
                onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                placeholder="Enter the actual code or password"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Additional details about this code"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                {editingCode ? 'Update Code' : 'Add Code'}
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

export default AccessCodesCard;
