
import React, { useState } from 'react';
import { Trophy, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HouseholdMember } from '@/hooks/useMVPOfTheDay';

interface MVPNominationFormProps {
  householdMembers: HouseholdMember[];
  currentUserName: string;
  onSubmit: (data: { nominated_for: string; nominated_for_user_id: string; reason: string; emoji: string }) => Promise<boolean>;
  onCancel: () => void;
}

const MVPNominationForm: React.FC<MVPNominationFormProps> = ({
  householdMembers,
  currentUserName,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    nominated_for: '',
    nominated_for_user_id: '',
    reason: '',
    emoji: '🏆'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableMembers = householdMembers.filter(
    member => member.full_name !== currentUserName
  );

  const emojiOptions = ['🏆', '🥇', '⭐', '🌟', '💎', '🎖️', '🏅', '👑', '💪', '🔥'];

  const handleSubmit = async () => {
    if (!formData.reason.trim() || !formData.nominated_for) return;

    setIsSubmitting(true);
    try {
      const success = await onSubmit(formData);
      if (success) {
        setFormData({ nominated_for: '', nominated_for_user_id: '', reason: '', emoji: '🏆' });
        onCancel();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMemberChange = (value: string) => {
    const selectedMember = availableMembers.find(member => member.full_name === value);
    setFormData({
      ...formData,
      nominated_for: value,
      nominated_for_user_id: selectedMember?.id || ''
    });
  };

  const isFormValid = formData.reason.trim().length > 0 && formData.nominated_for;

  return (
    <Card className="border-2 border-dashed border-yellow-300 dark:border-yellow-700 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30">
      <CardHeader>
        <CardTitle className="text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
          <Trophy size={20} />
          Nominate Today's MVP
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Who deserves the MVP award today?
          </label>
          <Select value={formData.nominated_for} onValueChange={handleMemberChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select your MVP" />
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
            Why do they deserve to be MVP?
          </label>
          <Textarea
            placeholder="Tell us what made them amazing today..."
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            rows={3}
            className="resize-none"
            maxLength={200}
          />
          <div className="text-xs text-muted-foreground mt-1 text-right">
            {formData.reason.length}/200
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Choose an emoji
          </label>
          <div className="flex flex-wrap gap-2">
            {emojiOptions.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setFormData({ ...formData, emoji })}
                className={`text-2xl p-2 rounded-lg transition-colors ${
                  formData.emoji === emoji
                    ? 'bg-yellow-200 dark:bg-yellow-800 ring-2 ring-yellow-400'
                    : 'bg-white dark:bg-gray-700 hover:bg-yellow-100 dark:hover:bg-yellow-900'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={handleSubmit} 
            disabled={!isFormValid || isSubmitting}
            className="bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Nominating...
              </>
            ) : (
              <>
                <Star size={16} className="mr-2" />
                Nominate MVP
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

export default MVPNominationForm;
