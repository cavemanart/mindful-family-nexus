import React, { useState, useEffect } from 'react';
import { Receipt, Plus, Calendar, DollarSign, AlertCircle, CheckCircle, Repeat, Clock, HelpCircle, Info, Trash2 } from 'lucide-react';
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
import { useAuth } from '@/hooks/useAuth';
import { useChildren } from '@/hooks/useChildren';
import { useIsMobile } from '@/hooks/use-mobile';
import { getUserSubscription, isTrialActive, getFeatureLimits } from '@/lib/subscription-utils';
import BillUsageIndicator from './BillUsageIndicator';
import BillDeleteDialog from './BillDeleteDialog';
import SubscriptionLimitAlert from './SubscriptionLimitAlert';

interface BillsTrackerProps {
  selectedHousehold: Household;
}

const BillsTracker: React.FC<BillsTrackerProps> = ({ selectedHousehold }) => {
  const { userProfile } = useAuth();
  const { children } = useChildren(selectedHousehold?.id);
  const { bills, loading, billsThisMonth, error, addBill, deleteBill, togglePaid, generateNextInstance, processRecurringBills } = useBills(selectedHousehold?.id);
  const [isAddingBill, setIsAddingBill] = useState(false);
  const [showRecurringHelp, setShowRecurringHelp] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{isOpen: boolean, billId: string, billName: string}>({
    isOpen: false,
    billId: '',
    billName: ''
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const isMobile = useIsMobile();
  const [newBill, setNewBill] = useState({
    name: '',
    amount: '',
    due_date: '',
    category: '',
    assigned_to: 'unassigned',
    recurrence_type: 'none' as 'none' | 'weekly' | 'monthly',
    recurrence_interval: 1,
    is_template: false,
  });

  console.log('🧾 BillsTracker render:', { 
    selectedHousehold: selectedHousehold?.id, 
    billsCount: bills.length, 
    loading, 
    error,
    userProfile: !!userProfile,
    isMobile
  });

  useEffect(() => {
    const loadSubscription = async () => {
      if (userProfile?.id) {
        try {
          console.log('🧾 Loading subscription for user:', userProfile.id);
          const sub = await getUserSubscription(userProfile.id);
          setSubscription(sub);
          console.log('🧾 Subscription loaded:', sub?.plan_type);
        } catch (error) {
          console.error('🧾 Error loading subscription:', error);
        } finally {
          setSubscriptionLoading(false);
        }
      } else {
        setSubscriptionLoading(false);
      }
    };

    loadSubscription();
  }, [userProfile?.id]);

  // Safety checks
  if (!selectedHousehold) {
    return (
      <Card className="m-6">
        <CardContent className="p-6 text-center">
          <Receipt size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">Please select a household to view bills.</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="m-6">
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center gap-2">
            <AlertCircle size={24} />
            Bills Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Create family members list from actual household data
  const familyMembers = [
    ...(userProfile?.first_name ? [userProfile.first_name] : []),
    ...children.map(child => child.first_name)
  ].filter(Boolean);

  const categories = ['Utilities', 'Insurance', 'Housing', 'Healthcare', 'Transportation', 'Entertainment', 'Other'];

  const planType = subscription?.plan_type || 'free';
  const trialActive = subscription ? isTrialActive(subscription) : false;
  const limits = getFeatureLimits(planType, trialActive);
  const billLimit = limits.bills_per_month;
  
  // Proper unlimited check and bill creation permission
  const isUnlimitedBills = billLimit === -1;
  const canCreateMoreBills = isUnlimitedBills || billsThisMonth < billLimit;

  const handleAddBill = async () => {
    if (newBill.name.trim() && newBill.amount && newBill.due_date && newBill.category) {
      const success = await addBill({
        name: newBill.name,
        amount: parseFloat(newBill.amount),
        due_date: newBill.due_date,
        category: newBill.category,
        is_paid: false,
        assigned_to: newBill.assigned_to === 'unassigned' ? '' : newBill.assigned_to,
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
          assigned_to: 'unassigned',
          recurrence_type: 'none',
          recurrence_interval: 1,
          is_template: false,
        });
        setIsAddingBill(false);
      }
    }
  };

  const handleDeleteBill = async () => {
    if (!deleteDialog.billId) return;
    
    setIsDeleting(true);
    const success = await deleteBill(deleteDialog.billId);
    setIsDeleting(false);
    
    if (success) {
      setDeleteDialog({ isOpen: false, billId: '', billName: '' });
    }
  };

  const openDeleteDialog = (billId: string, billName: string) => {
    setDeleteDialog({ isOpen: true, billId, billName });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ isOpen: false, billId: '', billName: '' });
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

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Utilities': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Insurance': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Housing': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Healthcare': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Transportation': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Entertainment': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      'Other': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    };
    return colors[category] || colors['Other'];
  };

  if (loading || subscriptionLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Calculate derived data from bills
  const recurringBills = bills.filter(bill => bill.recurrence_type !== 'none');
  const upcomingBills = bills.filter(bill => !bill.is_paid);
  const paidBills = bills.filter(bill => bill.is_paid);
  
  const totalAmount = bills.reduce((sum, bill) => sum + bill.amount, 0);
  const paidAmount = paidBills.reduce((sum, bill) => sum + bill.amount, 0);
  const progressPercentage = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header Section - Mobile Optimized */}
      <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-4 items-start ${isMobile ? '' : 'sm:items-center'} justify-between`}>
        <div className={isMobile ? 'w-full' : ''}>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Receipt className="text-green-500" size={isMobile ? 24 : 28} />
            Family Bills Tracker
          </h2>
          <p className="text-muted-foreground mt-1">Keep track of your household expenses and never miss a payment</p>
        </div>
        <div className={`flex ${isMobile ? 'flex-col w-full' : 'flex-row'} gap-2`}>
          <Button 
            onClick={() => setShowRecurringHelp(!showRecurringHelp)}
            variant="outline"
            size={isMobile ? "sm" : "default"}
            className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
          >
            <HelpCircle size={16} className="mr-2" />
            How it Works
          </Button>
          <Button 
            onClick={() => setIsAddingBill(true)} 
            size={isMobile ? "sm" : "default"}
            className="bg-green-600 hover:bg-green-700"
            disabled={!canCreateMoreBills}
          >
            <Plus size={16} className="mr-2" />
            Add Bill
          </Button>
        </div>
      </div>

      {/* Usage Indicator - only show for non-unlimited plans */}
      {!isUnlimitedBills && (
        <BillUsageIndicator 
          currentCount={billsThisMonth}
          maxCount={billLimit}
          planType={planType}
          isTrialActive={trialActive}
        />
      )}

      {/* Subscription Limit Alert */}
      {!canCreateMoreBills && (
        <SubscriptionLimitAlert 
          feature="bills per month"
          currentPlan={planType}
          isTrialActive={trialActive}
        />
      )}

      {/* Help Section */}
      {showRecurringHelp && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <CardHeader>
            <CardTitle className="text-blue-800 dark:text-blue-200 flex items-center gap-2">
              <Info size={20} />
              How Bills Tracking Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">📋 Regular Bills</h4>
              <p className="text-blue-700 dark:text-blue-300">Add one-time bills like credit card payments or irregular expenses. Just enter the details and mark as paid when complete.</p>
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">🔄 Recurring Bills</h4>
              <p className="text-blue-700 dark:text-blue-300">For bills that repeat (like rent, utilities, subscriptions), set up recurring bills. The system will automatically create new instances when they're due.</p>
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">⚡ Auto-Generate Feature</h4>
              <p className="text-blue-700 dark:text-blue-300">Use "Generate Next Bills" to automatically create the next month's recurring bills. This saves time and ensures you don't forget any regular payments.</p>
            </div>
            <Button 
              onClick={() => setShowRecurringHelp(false)}
              variant="outline"
              size="sm"
              className="border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
            >
              Got it!
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add Bill Form - Mobile Optimized */}
      {isAddingBill && canCreateMoreBills && (
        <Card className="border-2 border-dashed border-green-300 bg-gradient-to-r from-green-50 to-blue-50 dark:border-green-700 dark:from-green-950 dark:to-blue-950">
          <CardHeader className={isMobile ? 'p-4' : 'p-6'}>
            <CardTitle className="text-green-800 dark:text-green-200">Add New Bill</CardTitle>
            <p className="text-sm text-muted-foreground">Enter your bill details below. For bills that repeat monthly (like rent or utilities), enable the recurring option.</p>
          </CardHeader>
          <CardContent className={`space-y-4 ${isMobile ? 'p-4 pt-0' : 'p-6 pt-0'}`}>
            <div className={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-2'} gap-4`}>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Bill Name *</label>
                <Input
                  placeholder={isMobile ? "Electric Bill" : "e.g., Electric Bill, Rent, Netflix"}
                  value={newBill.name}
                  onChange={(e) => setNewBill({ ...newBill, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Amount *</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newBill.amount}
                  onChange={(e) => setNewBill({ ...newBill, amount: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Due Date *</label>
                <Input
                  type="date"
                  value={newBill.due_date}
                  onChange={(e) => setNewBill({ ...newBill, due_date: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Category *</label>
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
                <label className="text-sm font-medium text-foreground mb-2 block">Assigned To (Optional)</label>
                <Select value={newBill.assigned_to} onValueChange={(value) => 
                  setNewBill({ ...newBill, assigned_to: value })
                }>
                  <SelectTrigger>
                    <SelectValue placeholder={isMobile ? "Who pays?" : "Who pays this bill? (optional)"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">No assignment</SelectItem>
                    {familyMembers.map((member) => (
                      <SelectItem key={member} value={member}>{member}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Repeats</label>
                <Select value={newBill.recurrence_type} onValueChange={(value: 'none' | 'weekly' | 'monthly') => 
                  setNewBill({ ...newBill, recurrence_type: value })
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Does this bill repeat?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">One-time only</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newBill.recurrence_type !== 'none' && (
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Every {newBill.recurrence_type === 'weekly' ? 'weeks' : 'months'}
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={newBill.recurrence_interval}
                    onChange={(e) => setNewBill({ ...newBill, recurrence_interval: parseInt(e.target.value) || 1 })}
                    placeholder={isMobile ? "1" : "e.g., 1 for every month, 2 for every 2 months"}
                  />
                </div>
              )}
            </div>
            {newBill.recurrence_type !== 'none' && (
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is-template"
                    checked={newBill.is_template}
                    onCheckedChange={(checked) => setNewBill({ ...newBill, is_template: checked })}
                  />
                  <Label htmlFor="is-template" className="text-blue-800 dark:text-blue-200">Make this a recurring template</Label>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                  Recurring templates automatically generate new bills when due. Perfect for monthly rent, utilities, etc.
                </p>
              </div>
            )}
            <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-2`}>
              <Button onClick={handleAddBill} className="bg-green-600 hover:bg-green-700" size={isMobile ? "sm" : "default"}>
                <Receipt size={16} className="mr-2" />
                Add Bill
              </Button>
              <Button variant="outline" onClick={() => setIsAddingBill(false)} size={isMobile ? "sm" : "default"}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards - Mobile Optimized */}
      <div className={`grid grid-cols-1 ${isMobile ? 'gap-3' : 'md:grid-cols-4 gap-6'}`}>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className={isMobile ? 'p-4' : 'p-6'}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total This Month</p>
                <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-foreground`}>${totalAmount.toFixed(2)}</p>
              </div>
              <DollarSign className="text-muted-foreground" size={isMobile ? 20 : 24} />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className={isMobile ? 'p-4' : 'p-6'}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Paid So Far</p>
                <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-green-600`}>${paidAmount.toFixed(2)}</p>
              </div>
              <CheckCircle className="text-green-400" size={isMobile ? 20 : 24} />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className={isMobile ? 'p-4' : 'p-6'}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Still to Pay</p>
                <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-red-600`}>${(totalAmount - paidAmount).toFixed(2)}</p>
              </div>
              <AlertCircle className="text-red-400" size={isMobile ? 20 : 24} />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className={isMobile ? 'p-4' : 'p-6'}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recurring Bills</p>
                <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-blue-600`}>{recurringBills.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Auto-repeating</p>
              </div>
              <Repeat className="text-blue-400" size={isMobile ? 20 : 24} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className={isMobile ? 'p-4' : 'p-6'}>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-foreground">Monthly Payment Progress</span>
              <span className="text-muted-foreground">{progressPercentage.toFixed(1)}% Complete</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <p className="text-xs text-muted-foreground mt-2">Track how much of this month's bills you've paid</p>
          </div>
        </CardContent>
      </Card>

      {/* Recurring Bills Management */}
      {recurringBills.length > 0 && (
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader className={isMobile ? 'p-4' : 'p-6'}>
            <CardTitle className="text-blue-800 dark:text-blue-200 flex items-center gap-2">
              <Repeat size={20} />
              Recurring Bills Management
            </CardTitle>
          </CardHeader>
          <CardContent className={isMobile ? 'p-4 pt-0' : 'p-6 pt-0'}>
            <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} items-start ${isMobile ? 'gap-3' : 'items-center'} justify-between mb-4`}>
              <p className="text-sm text-foreground">
                You have {recurringBills.length} recurring bills set up. Generate next month's bills automatically.
              </p>
              <Button 
                onClick={handleProcessRecurring} 
                className="bg-blue-600 hover:bg-blue-700"
                size={isMobile ? "sm" : "default"}
              >
                <Clock size={16} className="mr-2" />
                Generate Next Bills
              </Button>
            </div>
            <div className={`grid grid-cols-1 ${isMobile ? 'gap-3' : 'md:grid-cols-2 gap-3'}`}>
              {recurringBills.slice(0, 4).map((bill) => (
                <div key={bill.id} className={`flex items-center justify-between ${isMobile ? 'p-3' : 'p-3'} bg-blue-50 dark:bg-blue-950 rounded-lg`}>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-blue-800 dark:text-blue-200 truncate">{bill.name}</p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      Every {bill.recurrence_interval} {bill.recurrence_type}(s) • ${bill.amount}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-blue-600 border-blue-300 dark:text-blue-400 dark:border-blue-600 ml-2 flex-shrink-0">
                    <Repeat size={12} className="mr-1" />
                    Auto
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Bills - Mobile Optimized */}
      {upcomingBills.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Calendar className="text-orange-500" size={20} />
            Bills to Pay ({upcomingBills.length})
          </h3>
          <div className="space-y-3">
            {upcomingBills.map((bill) => {
              const daysUntilDue = getDaysUntilDue(bill.due_date);
              const isOverdue = daysUntilDue < 0;
              const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0;

              return (
                <Card 
                  key={bill.id} 
                  className={`hover:shadow-md transition-shadow overflow-hidden ${
                    isOverdue ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950' : 
                    isDueSoon ? 'border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-950' : 
                    'border-border'
                  }`}
                >
                  <CardContent className={isMobile ? 'p-4' : 'p-4'}>
                    <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} ${isMobile ? 'gap-3' : 'items-center justify-between'}`}>
                      <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} ${isMobile ? 'gap-2' : 'items-center space-x-4'} flex-1 min-w-0`}>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-foreground flex items-center gap-2 truncate">
                            <span className="truncate">{bill.name}</span>
                            {bill.recurrence_type !== 'none' && (
                              <Badge variant="outline" className="text-xs flex-shrink-0">
                                <Repeat size={12} className="mr-1" />
                                Recurring
                              </Badge>
                            )}
                          </h4>
                          <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} ${isMobile ? 'gap-1' : 'items-center gap-2'} mt-1`}>
                            <Badge className={`${getCategoryColor(bill.category)} flex-shrink-0`} variant="secondary">
                              {bill.category}
                            </Badge>
                            {bill.assigned_to && (
                              <span className="text-sm text-muted-foreground truncate">{bill.assigned_to} pays this</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className={`${isMobile ? 'flex flex-col' : 'text-right'}`}>
                        <p className={`${isMobile ? 'text-lg' : 'text-lg'} font-bold text-foreground`}>${bill.amount.toFixed(2)}</p>
                        <p className={`text-sm ${
                          isOverdue ? 'text-red-600 font-semibold' :
                          isDueSoon ? 'text-yellow-600 font-semibold' :
                          'text-muted-foreground'
                        }`}>
                          {isOverdue ? `⚠️ Overdue by ${Math.abs(daysUntilDue)} days` :
                           daysUntilDue === 0 ? '📅 Due today' :
                           `📅 Due in ${daysUntilDue} days`}
                        </p>
                        <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-2 mt-2`}>
                          <Button
                            onClick={() => handleTogglePaid(bill.id)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            ✓ {isMobile ? 'Paid' : 'Mark Paid'}
                          </Button>
                          {bill.recurrence_type !== 'none' && (
                            <Button
                              onClick={() => handleGenerateNext(bill.id)}
                              size="sm"
                              variant="outline"
                              className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
                            >
                              <Clock size={14} className="mr-1" />
                              {isMobile ? 'Next' : 'Next Bill'}
                            </Button>
                          )}
                          <Button
                            onClick={() => openDeleteDialog(bill.id, bill.name)}
                            size="sm"
                            variant="outline"
                            className="border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                          >
                            <Trash2 size={14} />
                          </Button>
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

      {/* Paid Bills - Mobile Optimized */}
      {paidBills.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <CheckCircle className="text-green-500" size={20} />
            Paid This Month ({paidBills.length})
          </h3>
          <div className="space-y-3">
            {paidBills.map((bill) => (
              <Card key={bill.id} className="bg-green-50 border-green-200 hover:shadow-md transition-shadow dark:bg-green-950 dark:border-green-800 overflow-hidden">
                <CardContent className={isMobile ? 'p-4' : 'p-4'}>
                  <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} ${isMobile ? 'gap-3' : 'items-center justify-between'}`}>
                    <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} ${isMobile ? 'gap-2' : 'items-center space-x-4'} flex-1 min-w-0`}>
                      <CheckCircle className={`text-green-600 ${isMobile ? 'self-start' : ''}`} size={20} />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground flex items-center gap-2 truncate">
                          <span className="truncate">{bill.name}</span>
                          {bill.recurrence_type !== 'none' && (
                            <Badge variant="outline" className="text-xs flex-shrink-0">
                              <Repeat size={12} className="mr-1" />
                              Recurring
                            </Badge>
                          )}
                        </h4>
                        <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} ${isMobile ? 'gap-1' : 'items-center gap-2'} mt-1`}>
                          <Badge className={`${getCategoryColor(bill.category)} flex-shrink-0`} variant="secondary">
                            {bill.category}
                          </Badge>
                          {bill.assigned_to && (
                            <span className="text-sm text-muted-foreground truncate">✓ Paid by {bill.assigned_to}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className={`${isMobile ? 'flex flex-col' : 'text-right'}`}>
                      <p className={`${isMobile ? 'text-lg' : 'text-lg'} font-bold text-green-600`}>${bill.amount.toFixed(2)}</p>
                      <p className="text-sm text-green-600">✓ Paid</p>
                      <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-2 mt-2`}>
                        <Button
                          onClick={() => handleTogglePaid(bill.id)}
                          variant="outline"
                          size="sm"
                          className="border-green-600 text-green-600 hover:bg-green-100 dark:hover:bg-green-900"
                        >
                          {isMobile ? 'Undo' : 'Undo Payment'}
                        </Button>
                        <Button
                          onClick={() => openDeleteDialog(bill.id, bill.name)}
                          size="sm"
                          variant="outline"
                          className="border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {bills.length === 0 && (
        <div className="text-center py-12">
          <Receipt size={48} className="text-green-300 mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">No bills added yet!</p>
          <p className="text-muted-foreground text-sm mt-2 mb-4">Start tracking your family's expenses by adding your first bill.</p>
          <Button 
            onClick={() => setIsAddingBill(true)}
            className="bg-green-600 hover:bg-green-700"
            disabled={!canCreateMoreBills}
          >
            <Plus size={16} className="mr-2" />
            Add Your First Bill
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <BillDeleteDialog 
        isOpen={deleteDialog.isOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleDeleteBill}
        billName={deleteDialog.billName}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default BillsTracker;
