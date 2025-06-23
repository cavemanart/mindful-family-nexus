
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Clock, Plus, Edit, Trash2, Calendar } from 'lucide-react';
import { useHouseholdInfo } from '@/hooks/useHouseholdInfo';

interface DailySchedulesProps {
  householdId: string;
  canEdit: boolean;
}

const DailySchedules: React.FC<DailySchedulesProps> = ({ householdId, canEdit }) => {
  const { householdInfo, addHouseholdInfo, updateHouseholdInfo, deleteHouseholdInfo } = useHouseholdInfo(householdId);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [formData, setFormData] = useState({
    time: '',
    activity: '',
    description: '',
    assignedTo: ''
  });

  const schedules = householdInfo.filter(info => info.info_type === 'daily_schedule');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.time || !formData.activity) return;

    const scheduleData = {
      household_id: householdId,
      title: `${formData.time} - ${formData.activity}`,
      value: formData.activity,
      description: `${formData.description}${formData.assignedTo ? ` (Assigned to: ${formData.assignedTo})` : ''}`,
      info_type: 'daily_schedule'
    };

    if (editingSchedule) {
      await updateHouseholdInfo(editingSchedule.id, scheduleData);
      setEditingSchedule(null);
    } else {
      await addHouseholdInfo(scheduleData);
    }

    setFormData({ time: '', activity: '', description: '', assignedTo: '' });
    setShowAddDialog(false);
  };

  const handleEdit = (schedule: any) => {
    const timePart = schedule.title.split(' - ')[0];
    const activityPart = schedule.value;
    const assignedMatch = schedule.description?.match(/\(Assigned to: ([^)]+)\)/);
    const assignedTo = assignedMatch ? assignedMatch[1] : '';
    const description = schedule.description?.replace(/\s*\(Assigned to: [^)]+\)$/, '') || '';

    setFormData({
      time: timePart,
      activity: activityPart,
      description,
      assignedTo
    });
    setEditingSchedule(schedule);
    setShowAddDialog(true);
  };

  const handleDelete = async (scheduleId: string) => {
    if (window.confirm('Are you sure you want to delete this schedule item?')) {
      await deleteHouseholdInfo(scheduleId);
    }
  };

  const closeDialog = () => {
    setShowAddDialog(false);
    setEditingSchedule(null);
    setFormData({ time: '', activity: '', description: '', assignedTo: '' });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-blue-500" />
            Daily Schedules & Routines
          </CardTitle>
          {canEdit && (
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Schedule
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingSchedule ? 'Edit Schedule Item' : 'Add Schedule Item'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="activity">Activity</Label>
                    <Input
                      id="activity"
                      value={formData.activity}
                      onChange={(e) => setFormData(prev => ({ ...prev, activity: e.target.value }))}
                      placeholder="e.g., Breakfast, School pickup, Bedtime routine"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description (optional)</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Additional details about this activity"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="assignedTo">Assigned To (optional)</Label>
                    <Input
                      id="assignedTo"
                      value={formData.assignedTo}
                      onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
                      placeholder="Who is responsible for this activity"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      {editingSchedule ? 'Update Schedule' : 'Add Schedule'}
                    </Button>
                    <Button type="button" variant="outline" onClick={closeDialog}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {schedules.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No daily schedules added yet</p>
            {canEdit && <p className="text-sm mt-2">Click "Add Schedule" to create your family's daily routine</p>}
          </div>
        ) : (
          <div className="space-y-3">
            {schedules
              .sort((a, b) => {
                const timeA = a.title.split(' - ')[0];
                const timeB = b.title.split(' - ')[0];
                return timeA.localeCompare(timeB);
              })
              .map((schedule) => (
                <div key={schedule.id} className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                          {schedule.title}
                        </h4>
                      </div>
                      {schedule.description && (
                        <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                          {schedule.description}
                        </p>
                      )}
                    </div>
                    {canEdit && (
                      <div className="flex gap-2 ml-4">
                        <Button
                          onClick={() => handleEdit(schedule)}
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(schedule.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DailySchedules;
