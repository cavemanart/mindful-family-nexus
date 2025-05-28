
import React, { useState } from 'react';
import { Receipt, Plus, Calendar, DollarSign, AlertCircle, CheckCircle, Repeat, Clock, Edit, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useBills } from '@/hooks/useBills';
import { Household } from '@/hooks/useHouseholds';

interface BillsTrackerProps {
  selectedHousehold: Household;
}

const BillsTracker: React.FC<BillsTrackerProps> = ({ selectedHousehold }) => {
  const { bills, loading, addBill, togglePaid, generateNextInstance, processRecurringBills } = useBills(selectedHousehold?.id);
  const [isAddingBill, setIsAddingBill] = useState(false);
  const [editingBill, setEditingBill] = useState<string | null>(null);
  const [newBill, setNewBill] = useState({
    name: '',
    amount: '',
    due_date: '',
    category: '',
    assigned_to: '',
    recurrence_type: 'none' as 'none' | 'weekly' | 'monthly',
    recurrence_interval: 1,
    is_template: false,
    reminder_enabled: false,
  });

  const familyMembers = ['Mom', 'Dad', 'Emma', 'Jack'];
  const categories = ['Utilities', 'Insurance', 'Housing', 'Healthcare', 'Transportation', 'Entertainment', 'Other'];

  const handleAddBill = async () => {
    if (newBill.name.trim() && newBill.amount && newBill.due_date && newBill.category && newBill.assigned_to) {
      const success = await addBill({
        name: newBill.name,
        amount: parseFloat(newBill.amount),
        due_date: newBill.due_date,
        category: newBill.category,
        is_paid: false,
        assigned_to: newBill.assigned_to,
        recurrence_type: newBill.recurrence_type,
        recurrence_interval: newBill.recurrence_interval,
        is_template: newBill.is_template,
      });
      
      if (success) {
        setNewBill({ 
          name: '', 
          amount: '', 
          due_date: '', 
          category: '', 
          assigned_to: '',
          recurrence_type: 'none',
          recurrence_interval: 1,
          is_template: false,
          reminder_enabled: false,
        });
        setIsAddingBill(false);
      }
    }
  };

  const handleTogglePaid = async (id: string) => {
    await togglePaid(id);
  };

  const handleGenerateNext = async (billId: string) => {
    await generateNextInstance(billId);
  };

  const handleProcessRecurring = async () => {
    await processRecurringBills();
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getBillStatusColor = (bill: any) => {
    if (bill.is_paid) return 'bg-green-50 border-green-200';
    
    const daysUntilDue = getDaysUntilDue(bill.due_date);
    if (daysUntilDue < 0) return 'bg-red-50 border-red-200';
    if (daysUntilDue <= 3) return 'bg-yellow-50 border-yellow-200';
    return 'bg-white border-gray-200';
  };

  const getBillStatusBadge = (bill: any) => {
    if (bill.is_paid) return { text: 'Paid', color: 'bg-green-100 text-green-800' };
    
    const daysUntilDue = getDaysUntilDue(bill.due_date);
    if (daysUntilDue < 0) return { text: `Overdue ${Math.abs(daysUntilDue)}d`, color: 'bg-red-100 text-red-800' };
    if (daysUntilDue === 0) return { text: 'Due Today', color: 'bg-orange-100 text-orange-800' };
    if (daysUntilDue <= 3) return { text: `Due in ${daysUntilDue}d`, color: 'bg-yellow-100 text-yellow-800' };
    return { text: `Due in ${daysUntilDue}d`, color: 'bg-blue-100 text-blue-800' };
  };

  const upcomingBills = bills.filter(bill => !bill.is_paid);
  const paidBills = bills.filter(bill => bill.is_paid);
  const totalAmount = bills.reduce((sum, bill) => sum + bill.amount, 0);
  const paidAmount = paidBills.reduce((sum, bill) => sum + bill.amount, 0);
  const progressPercentage = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Receipt className="text-green-600" size={32} />
            Bills
          </h2>
          <p className="text-gray-600 mt-1">Manage your family expenses</p>
        </div>
        <Button 
          onClick={handleProcessRecurring} 
          variant="outline"
          className="border-green-600 text-green-600 hover:bg-green-50"
        >
          <Repeat size={16} className="mr-2" />
          Process Recurring
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 text-center">
            <DollarSign className="mx-auto mb-2 text-blue-600" size={24} />
            <p className="text-sm text-blue-700 font-medium">Total</p>
            <p className="text-xl font-bold text-blue-900">${totalAmount.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 text-center">
            <CheckCircle className="mx-auto mb-2 text-green-600" size={24} />
            <p className="text-sm text-green-700 font-medium">Paid</p>
            <p className="text-xl font-bold text-green-900">${paidAmount.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4 text-center">
            <AlertCircle className="mx-auto mb-2 text-red-600" size={24} />
            <p className="text-sm text-red-700 font-medium">Remaining</p>
            <p className="text-xl font-bold text-red-900">${(totalAmount - paidAmount).toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4 text-center">
            <Repeat className="mx-auto mb-2 text-purple-600" size={24} />
            <p className="text-sm text-purple-700 font-medium">Recurring</p>
            <p className="text-xl font-bold text-purple-900">{bills.filter(b => b.recurrence_type !== 'none').length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-800">Payment Progress</span>
              <span className="text-green-600 font-bold">{progressPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Bills List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800">All Bills</h3>
        
        {bills.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="p-12 text-center">
              <Receipt size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No bills yet!</p>
              <p className="text-gray-400 text-sm">Add your first bill to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="h-[500px] w-full rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="space-y-3">
              {bills.map((bill) => {
                const statusBadge = getBillStatusBadge(bill);
                return (
                  <Card 
                    key={bill.id} 
                    className={`${getBillStatusColor(bill)} hover:shadow-md transition-all duration-200 cursor-pointer`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-gray-900 text-lg">{bill.name}</h4>
                            <Badge className={statusBadge.color} variant="secondary">
                              {statusBadge.text}
                            </Badge>
                            {bill.recurrence_type !== 'none' && (
                              <Badge variant="outline" className="text-xs">
                                <Repeat size={12} className="mr-1" />
                                {bill.recurrence_type}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <DollarSign size={14} />
                              <span className="font-semibold text-lg text-gray-900">${bill.amount.toFixed(2)}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              {new Date(bill.due_date).toLocaleDateString()}
                            </span>
                            <span>{bill.assigned_to}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {!bill.is_paid && (
                            <Button
                              onClick={() => handleTogglePaid(bill.id)}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              Mark Paid
                            </Button>
                          )}
                          {bill.is_paid && (
                            <Button
                              onClick={() => handleTogglePaid(bill.id)}
                              size="sm"
                              variant="outline"
                              className="border-green-600 text-green-600 hover:bg-green-50"
                            >
                              Unpaid
                            </Button>
                          )}
                          {bill.recurrence_type !== 'none' && (
                            <Button
                              onClick={() => handleGenerateNext(bill.id)}
                              size="sm"
                              variant="outline"
                              className="border-blue-600 text-blue-600 hover:bg-blue-50"
                            >
                              <Clock size={14} className="mr-1" />
                              Next
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-600 hover:text-blue-600"
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-600 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Floating Add Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsAddingBill(true)}
          className="h-14 w-14 rounded-full bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl transition-all duration-200"
          size="icon"
        >
          <Plus size={24} />
        </Button>
      </div>

      {/* Slide-up Form */}
      {isAddingBill && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end justify-center">
          <div className="bg-white w-full max-w-lg rounded-t-3xl shadow-2xl animate-slide-in-bottom max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Add New Bill</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAddingBill(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Bill Name</Label>
                  <Input
                    placeholder="e.g., Electric Bill"
                    value={newBill.name}
                    onChange={(e) => setNewBill({ ...newBill, name: e.target.value })}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newBill.amount}
                    onChange={(e) => setNewBill({ ...newBill, amount: e.target.value })}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Due Date</Label>
                  <Input
                    type="date"
                    value={newBill.due_date}
                    onChange={(e) => setNewBill({ ...newBill, due_date: e.target.value })}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Category</Label>
                  <Select value={newBill.category} onValueChange={(value) => 
                    setNewBill({ ...newBill, category: value })
                  }>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Assigned To</Label>
                  <Select value={newBill.assigned_to} onValueChange={(value) => 
                    setNewBill({ ...newBill, assigned_to: value })
                  }>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Who's responsible?" />
                    </SelectTrigger>
                    <SelectContent>
                      {familyMembers.map((member) => (
                        <SelectItem key={member} value={member}>{member}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Frequency</Label>
                  <Select value={newBill.recurrence_type} onValueChange={(value: 'none' | 'weekly' | 'monthly') => 
                    setNewBill({ ...newBill, recurrence_type: value })
                  }>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="How often?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">One-time</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-3 py-2">
                  <Switch
                    id="reminder"
                    checked={newBill.reminder_enabled}
                    onCheckedChange={(checked) => setNewBill({ ...newBill, reminder_enabled: checked })}
                  />
                  <Label htmlFor="reminder" className="text-sm font-medium text-gray-700">
                    Send reminders
                  </Label>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button
                  onClick={() => setIsAddingBill(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddBill}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Add Bill
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillsTracker;
