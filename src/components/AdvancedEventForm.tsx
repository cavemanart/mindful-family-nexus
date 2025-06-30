
import React, { useState } from 'react';
import { X, Calendar, Clock, Users, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { AdvancedCalendarEvent, EventCategory } from '@/types/calendar';
import { useChildren } from '@/hooks/useChildren';

interface AdvancedEventFormProps {
  onEventCreated: (event: Omit<AdvancedCalendarEvent, 'id' | 'creator_id' | 'created_at'>) => void;
  onCancel: () => void;
  categories: EventCategory[];
  householdId: string;
  initialEvent?: AdvancedCalendarEvent;
  buttonLabel?: string;
}

const AdvancedEventForm: React.FC<AdvancedEventFormProps> = ({
  onEventCreated,
  onCancel,
  categories,
  householdId,
  initialEvent,
  buttonLabel,
}) => {
  const { children } = useChildren(householdId);
  
  const [formData, setFormData] = useState({
    title: initialEvent?.title || '',
    description: initialEvent?.description || '',
    start_datetime: initialEvent?.start_datetime ? new Date(initialEvent.start_datetime).toISOString().slice(0, 16) : '',
    end_datetime: initialEvent?.end_datetime ? new Date(initialEvent.end_datetime).toISOString().slice(0, 16) : '',
    category: initialEvent?.category || 'general',
    color: initialEvent?.color || '#3b82f6',
    assigned_to: initialEvent?.assigned_to || [],
    is_recurring: initialEvent?.is_recurring || false,
    recurrence_pattern: initialEvent?.recurrence_pattern || 'weekly',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.start_datetime) {
      return;
    }

    const selectedCategory = categories.find(c => c.name === formData.category);
    
    // Properly handle null vs undefined for database compatibility
    const eventData = {
      household_id: householdId,
      title: formData.title.trim(),
      description: formData.description.trim() || null, // Use null instead of undefined
      start_datetime: formData.start_datetime,
      end_datetime: formData.end_datetime || null, // Use null instead of undefined
      category: formData.category || null, // Use null instead of undefined
      color: selectedCategory?.color || formData.color,
      assigned_to: formData.assigned_to,
      is_recurring: formData.is_recurring,
      recurrence_pattern: formData.is_recurring ? formData.recurrence_pattern : null, // Use null instead of undefined
      recurrence_end: null, // Always null for now
    };

    console.log('📝 Form submitting event data:', JSON.stringify(eventData, null, 2));
    onEventCreated(eventData);
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Get actual family members from children data
  const familyMembers = children.map(child => `${child.first_name} ${child.last_name || ''}`.trim());

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {initialEvent ? 'Edit Event' : 'Create New Event'}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Enter event title"
                required
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Enter event description"
                rows={3}
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_datetime" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Start Date & Time *
                </Label>
                <Input
                  id="start_datetime"
                  type="datetime-local"
                  value={formData.start_datetime}
                  onChange={(e) => updateField('start_datetime', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="end_datetime">End Date & Time</Label>
                <Input
                  id="end_datetime"
                  type="datetime-local"
                  value={formData.end_datetime}
                  onChange={(e) => updateField('end_datetime', e.target.value)}
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <Label className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Category
              </Label>
              <Select value={formData.category} onValueChange={(value) => updateField('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.name}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Assigned To */}
            {familyMembers.length > 0 && (
              <div>
                <Label className="flex items-center gap-2 mb-3">
                  <Users className="h-4 w-4" />
                  Assign to Family Members
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {familyMembers.map(member => (
                    <div key={member} className="flex items-center space-x-2">
                      <Checkbox
                        id={member}
                        checked={formData.assigned_to.includes(member)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            updateField('assigned_to', [...formData.assigned_to, member]);
                          } else {
                            updateField('assigned_to', formData.assigned_to.filter(m => m !== member));
                          }
                        }}
                      />
                      <Label htmlFor={member} className="text-sm font-medium cursor-pointer">
                        {member}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recurring Event */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_recurring"
                  checked={formData.is_recurring}
                  onCheckedChange={(checked) => updateField('is_recurring', checked)}
                />
                <Label htmlFor="is_recurring" className="text-sm font-medium cursor-pointer">
                  Make this a recurring event
                </Label>
              </div>
              
              {formData.is_recurring && (
                <Select value={formData.recurrence_pattern} onValueChange={(value) => updateField('recurrence_pattern', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select recurrence pattern" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                {buttonLabel ? buttonLabel : (initialEvent ? 'Update Event' : 'Create Event')}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedEventForm;
