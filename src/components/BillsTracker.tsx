import React, { useState } from 'react';
import { Receipt, Plus, Calendar, DollarSign, AlertCircle, CheckCircle, Repeat, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useBills } from '@/hooks/useBills';
import { Household } from '@/hooks/useHouseholds';

interface BillsTrackerProps {
  selectedHousehold: Household;
}

const BillsTracker: React.FC<BillsTrackerProps> = ({ selectedHousehold }) => {
  const { bills, loading, addBill, togglePaid, generateNextInstance, processRecurringBills } = useBills(selectedHousehold?.id);
  const [isAddingBill, setIsAddingBill] = useState(false);
  const [newBill, setNewBill] = useState({
    name: '',
    amount: '',
    due_date: '',
    category: '',
    assigned_to: '',
    recurrence_type: 'none' as 'none' | 'weekly' | 'monthly',
    recurrence_interval: 1,
    is_template: false,
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

  const upcomingBills = bills.filter(bill => !bill.is_paid);
  const paidBills = bills.filter(bill => bill.is_paid);
  const recurringBills = bills.filter(bill => bill.recurrence_type !== 'none');

  const totalAmount = bills.reduce((sum, bill) => sum + bill.amount, 0);
  const paidAmount = paidBills.reduce((sum, bill) => sum + bill.amount, 0);
  const progressPercentage = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Utilities': 'bg-blue-100 text-blue-800',
      'Insurance': 'bg-green-100 text-green-800',
      'Housing': 'bg-purple-100 text-purple-800',
      'Healthcare': 'bg-red-100 text-red-800',
      'Transportation': 'bg-yellow-100 text-yellow-800',
      'Entertainment': 'bg-pink-100 text-pink-800',
      'Other': 'bg-gray-100 text-gray-800',
    };
    return colors[category] || colors['Other'];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Receipt className="text-green-500" size={28} />
            Bills Tracker
          </h2>
          <p className="text-gray-600 mt-1">Keep track of family expenses and due dates</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleProcessRecurring} 
            variant="outline"
            className="border-green-600 text-green-600 hover:bg-green-50"
          >
            <Repeat size={16} className="mr-2" />
            Process Recurring
          </Button>
          <Button 
            onClick={() => setIsAddingBill(true)} 
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus size={16} className="mr-2" />
            Add Bill
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bills</p>
                <p className="text-2xl font-bold text-gray-900">${totalAmount.toFixed(2)}</p>
              </div>
              <DollarSign className="text-gray-400" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Paid</p>
                <p className="text-2xl font-bold text-green-600">${paidAmount.toFixed(2)}</p>
              </div>
              <CheckCircle className="text-green-400" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Remaining</p>
                <p className="text-2xl font-bold text-red-600">${(totalAmount - paidAmount).toFixed(2)}</p>
              </div>
              <AlertCircle className="text-red-400" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Recurring</p>
                <p className="text-2xl font-bold text-blue-600">{recurringBills.length}</p>
              </div>
              <Repeat className="text-blue-400" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700">Payment Progress</span>
              <span className="text-gray-600">{progressPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {isAddingBill && (
        <Card className="border-2 border-dashed border-green-300 bg-gradient-to-r from-green-50 to-blue-50">
          <CardHeader>
            <CardTitle className="text-green-800">Add New Bill</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Bill Name</label>
                <Input
                  placeholder="e.g., Electric Bill"
                  value={newBill.name}
                  onChange={(e) => setNewBill({ ...newBill, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Amount</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newBill.amount}
                  onChange={(e) => setNewBill({ ...newBill, amount: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Due Date</label>
                <Input
                  type="date"
                  value={newBill.due_date}
                  onChange={(e) => setNewBill({ ...newBill, due_date: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
                <Select value={newBill.category} onValueChange={(value) => 
                  setNewBill({ ...newBill, category: value })
                }>
                  <SelectTrigger>
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
                <label className="text-sm font-medium text-gray-700 mb-2 block">Assigned To</label>
                <Select value={newBill.assigned_to} onValueChange={(value) => 
                  setNewBill({ ...newBill, assigned_to: value })
                }>
                  <SelectTrigger>
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
                <label className="text-sm font-medium text-gray-700 mb-2 block">Recurrence</label>
                <Select value={newBill.recurrence_type} onValueChange={(value: 'none' | 'weekly' | 'monthly') => 
                  setNewBill({ ...newBill, recurrence_type: value })
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select recurrence" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newBill.recurrence_type !== 'none' && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Interval</label>
                  <Input
                    type="number"
                    min="1"
                    value={newBill.recurrence_interval}
                    onChange={(e) => setNewBill({ ...newBill, recurrence_interval: parseInt(e.target.value) || 1 })}
                    placeholder="e.g., every 2 weeks"
                  />
                </div>
              )}
            </div>
            {newBill.recurrence_type !== 'none' && (
              <div className="flex items-center space-x-2">
                <Switch
                  id="is-template"
                  checked={newBill.is_template}
                  onCheckedChange={(checked) => setNewBill({ ...newBill, is_template: checked })}
                />
                <Label htmlFor="is-template">Make this a recurring template</Label>
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={handleAddBill} className="bg-green-600 hover:bg-green-700">
                <Receipt size={16} className="mr-2" />
                Add Bill
              </Button>
              <Button variant="outline" onClick={() => setIsAddingBill(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Bills */}
      {upcomingBills.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Upcoming Bills</h3>
          <div className="space-y-3">
            {upcomingBills.map((bill) => {
              const daysUntilDue = getDaysUntilDue(bill.due_date);
              const isOverdue = daysUntilDue < 0;
              const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0;

              return (
                <Card 
                  key={bill.id} 
                  className={`hover:shadow-md transition-shadow ${
                    isOverdue ? 'border-red-300 bg-red-50' : 
                    isDueSoon ? 'border-yellow-300 bg-yellow-50' : 
                    'border-gray-200'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            {bill.name}
                            {bill.recurrence_type !== 'none' && (
                              <Badge variant="outline" className="text-xs">
                                <Repeat size={12} className="mr-1" />
                                {bill.recurrence_type}
                              </Badge>
                            )}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getCategoryColor(bill.category)} variant="secondary">
                              {bill.category}
                            </Badge>
                            <span className="text-sm text-gray-600">Assigned to {bill.assigned_to}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">${bill.amount.toFixed(2)}</p>
                        <p className={`text-sm ${
                          isOverdue ? 'text-red-600 font-semibold' :
                          isDueSoon ? 'text-yellow-600 font-semibold' :
                          'text-gray-600'
                        }`}>
                          {isOverdue ? `Overdue by ${Math.abs(daysUntilDue)} days` :
                           daysUntilDue === 0 ? 'Due today' :
                           `Due in ${daysUntilDue} days`}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Button
                            onClick={() => handleTogglePaid(bill.id)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Mark as Paid
                          </Button>
                          {bill.recurrence_type !== 'none' && (
                            <Button
                              onClick={() => handleGenerateNext(bill.id)}
                              size="sm"
                              variant="outline"
                              className="border-blue-600 text-blue-600 hover:bg-blue-50"
                            >
                              <Clock size={14} className="mr-1" />
                              Generate Next
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Paid Bills */}
      {paidBills.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Paid Bills</h3>
          <div className="space-y-3">
            {paidBills.map((bill) => (
              <Card key={bill.id} className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <CheckCircle className="text-green-600" size={20} />
                      <div>
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                          {bill.name}
                          {bill.recurrence_type !== 'none' && (
                            <Badge variant="outline" className="text-xs">
                              <Repeat size={12} className="mr-1" />
                              {bill.recurrence_type}
                            </Badge>
                          )}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getCategoryColor(bill.category)} variant="secondary">
                            {bill.category}
                          </Badge>
                          <span className="text-sm text-gray-600">Paid by {bill.assigned_to}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">${bill.amount.toFixed(2)}</p>
                      <p className="text-sm text-green-600">Paid</p>
                      <Button
                        onClick={() => handleTogglePaid(bill.id)}
                        variant="outline"
                        size="sm"
                        className="mt-2 border-green-600 text-green-600 hover:bg-green-100"
                      >
                        Mark as Unpaid
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {bills.length === 0 && (
        <div className="text-center py-12">
          <Receipt size={48} className="text-green-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No bills tracked yet!</p>
          <p className="text-gray-400 text-sm mt-2">Add your first bill to start tracking family expenses.</p>
        </div>
      )}
    </div>
  );
};

export default BillsTracker;
