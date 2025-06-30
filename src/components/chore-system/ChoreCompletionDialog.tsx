
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle, MessageCircle } from 'lucide-react';

interface ChoreCompletionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (comment?: string) => void;
  choreName: string;
  points: number;
}

export default function ChoreCompletionDialog({
  isOpen,
  onClose,
  onComplete,
  choreName,
  points
}: ChoreCompletionDialogProps) {
  const [comment, setComment] = useState('');

  const handleComplete = () => {
    onComplete(comment.trim() || undefined);
    setComment('');
    onClose();
  };

  const handleCancel = () => {
    setComment('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Complete Chore
          </DialogTitle>
          <DialogDescription>
            You're about to complete "{choreName}" and earn {points} points!
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="comment" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Add a comment (optional)
            </Label>
            <Textarea
              id="comment"
              placeholder="How did it go? Any notes for your parents..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="mt-2"
              rows={3}
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
              Complete & Earn {points} Points
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
