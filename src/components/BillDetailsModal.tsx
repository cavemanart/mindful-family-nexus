
import React, { useState } from 'react';
import { Bill } from '@/hooks/useBills';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Calendar, User, Edit, Save, X, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

interface BillDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: Bill | null;
  onBillUpdate: (billId: string, updates: Partial<Bill>) => Promise<boolean>;
  onBillDelete: (billId: string) => Promise<boolean>;
  onTogglePaid: (billId: string) => Promise<boolean>;
  canEdit: boolean;
}

const BillDetailsModal: React.FC<BillDetailsModalProps> = ({
  isOpen,
  onClose,
  bill,
  onBillUpdate,
  onBillDelete,
  onTogglePaid,
  canEdit
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedBill, setEditedBill] = useState<Partial<Bill>>({});

  if (!bill) return null;

  const categoryColors = {
    utilities: '#3b82f6',
    rent: '#ef4444',
    groceries: '#10b981',
    entertainment: '#f59e0b',
    transportation: '#8b5cf6',
    healthcare: '#ec4899',
    other: '#6b7280'
  };

  const getCategoryColor = (category: string) => {
    return categoryColors[category as keyof typeof categoryColors] || categoryColors.other;
  };

  const handleEdit = () => {
    setEditedBill({
      name: bill.name,
      amount: bill.amount,
      category: bill.category,
      assigned_to: bill.assigned_to
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (editedBill.name?.trim() && editedBill.amount) {
      await onBillUpdate(bill.id, editedBill);
      setIsEditing(false);
      onClose();
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      await onBillDelete(bill.id);
      onClose();
    }
  };

  const handleTogglePaid = async () => {
    await onTogglePaid(bill.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            {isEditing ? 'Edit Bill' : 'Bill Details'}
          </DialogTitle>
        </DialogHeader>

        <Card className={`border-l-4 ${bill.is_paid ? 'bg-green-50 dark:bg-green-950/20' : 'bg-red-50 dark:bg-red-950/20'}`} 
              style={{ borderLeftColor: getCategoryColor(bill.category) }}>
          <CardContent className="p-6 space-y-4">
            {isEditing ? (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Bill Name</label>
                  <Input
                    value={editedBill.name || ''}
                    onChange={(e) => setEditedBill({ ...editedBill, name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editedBill.amount || ''}
                    onChange={(e) => setEditedBill({ ...editedBill, amount: parseFloat(e.target.value) })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Assigned To</label>
                  <Input
                    value={editedBill.assigned_to || ''}
                    onChange={(e) => setEditedBill({ ...editedBill, assigned_to: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start justify-between">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{bill.name}</h3>
                  <Badge variant={bill.is_paid ? 'default' : 'destructive'} className="ml-2">
                    {bill.is_paid ? 'Paid' : 'Pending'}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
                  <DollarSign className="h-6 w-6" />
                  ${bill.amount.toFixed(2)}
                </div>
              </>
            )}

            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Calendar className="h-4 w-4" />
              <span>Due: {format(new Date(bill.due_date), 'MMM dd, yyyy')}</span>
            </div>

            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                style={{ 
                  borderColor: getCategoryColor(bill.category),
                  color: getCategoryColor(bill.category)
                }}
              >
                {bill.category}
              </Badge>
            </div>

            {bill.assigned_to && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <User className="h-4 w-4" />
                <span>Assigned to: {bill.assigned_to}</span>
              </div>
            )}

            {bill.recurrence_type && bill.recurrence_type !== 'none' && (
              <Badge variant="secondary">
                Recurring {bill.recurrence_type}
              </Badge>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-between pt-4">
          <div>
            {canEdit && !isEditing && (
              <div className="flex gap-2">
                <Button 
                  onClick={handleTogglePaid} 
                  variant={bill.is_paid ? "outline" : "default"}
                  className={bill.is_paid ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {bill.is_paid ? 'Mark Unpaid' : 'Mark Paid'}
                </Button>
                <Button onClick={handleEdit} variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button onClick={handleDelete} variant="outline" className="text-red-600 hover:text-red-700">
                  <X className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button onClick={() => setIsEditing(false)} variant="outline">
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BillDetailsModal;
