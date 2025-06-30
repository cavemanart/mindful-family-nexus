
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Sparkles, Plus } from 'lucide-react';
import QuickAddEventInput from './QuickAddEventInput';
import { ParsedEventData } from '@/utils/naturalLanguageParser';

interface QuickAddFloatingButtonProps {
  onEventParsed: (eventData: ParsedEventData) => void;
  className?: string;
}

const QuickAddFloatingButton: React.FC<QuickAddFloatingButtonProps> = ({
  onEventParsed,
  className = ""
}) => {
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const handleEventParsed = (eventData: ParsedEventData) => {
    onEventParsed(eventData);
    setShowQuickAdd(false);
  };

  if (showQuickAdd) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <QuickAddEventInput
          onEventParsed={handleEventParsed}
          onCancel={() => setShowQuickAdd(false)}
        />
      </div>
    );
  }

  return (
    <Button
      onClick={() => setShowQuickAdd(true)}
      className={`fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-40 ${className}`}
      size="sm"
    >
      <div className="flex items-center justify-center">
        <Sparkles className="h-6 w-6" />
      </div>
    </Button>
  );
};

export default QuickAddFloatingButton;
