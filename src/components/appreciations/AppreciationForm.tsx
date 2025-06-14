
import React, { useState } from 'react';
import { Heart, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HouseholdMember } from '@/hooks/useAppreciationsOptimized';

interface AppreciationFormProps {
  householdMembers: HouseholdMember[];
  currentUserName: string;
  onSubmit: (data: { message: string; to_member: string; to_user_id: string }) => Promise<boolean>;
  onCancel: () => void;
}

const AppreciationForm: React.FC<AppreciationFormProps> = ({
  householdMembers,
  currentUserName,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    message: '',
    to_member: '',
    to_user_id: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter out current user from recipient options
  const availableMembers = householdMembers.filter(
    member => member.full_name !== currentUserName
  );

  const handleSubmit = async () => {
    if (!formData.message.trim() || !formData.to_member) return;

    setIsSubmitting(true);
    try {
      const success = await onSubmit(formData);
      if (success) {
        setFormData({ message: '', to_member: '', to_user_id: '' });
        onCancel();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecipientChange = (value: string) => {
    const selectedMember = availableMembers.find(member => member.full_name === value);
    setFormData({
      ...formData,
      to_member: value,
      to_user_id: selectedMember?.id || ''
    });
  };

  const isFormValid = formData.message.trim().length > 0 && formData.to_member;

  return (
    <Card className="border-2 border-dashed border-pink-300 dark:border-pink-700 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/30 dark:to-purple-950/30">
      <CardHeader>
        <CardTitle className="text-pink-800 dark:text-pink-200 flex items-center gap-2">
          <Heart size={20} />
          Share an Appreciation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            To
          </label>
          <Select value={formData.to_member} onValueChange={handleRecipientChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select who's receiving appreciation" />
            </SelectTrigger>
            <SelectContent>
              {availableMembers.map((member) => (
                <SelectItem key={member.id} value={member.full_name}>
                  {member.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Message
          </label>
          <Textarea
            placeholder="Share what you appreciate about this person..."
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            rows={3}
            className="resize-none"
            maxLength={500}
          />
          <div className="text-xs text-muted-foreground mt-1 text-right">
            {formData.message.length}/500
          </div>
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={handleSubmit} 
            disabled={!isFormValid || isSubmitting}
            className="bg-pink-600 hover:bg-pink-700 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Sharing...
              </>
            ) : (
              <>
                <Heart size={16} className="mr-2" />
                Share Appreciation
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppreciationForm;
