
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Calendar, Clock, Tag, AlertCircle, CheckCircle } from 'lucide-react';
import { parseNaturalLanguage, ParsedEventData } from '@/utils/naturalLanguageParser';
import { toast } from 'sonner';

interface QuickAddEventInputProps {
  onEventParsed: (eventData: ParsedEventData) => void;
  onCancel: () => void;
  placeholder?: string;
}

const QuickAddEventInput: React.FC<QuickAddEventInputProps> = ({
  onEventParsed,
  onCancel,
  placeholder = "Try: 'Doctor appointment Monday at 3pm' or 'Team meeting tomorrow 2:30'"
}) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [parseResult, setParseResult] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleParse = async () => {
    if (!input.trim()) {
      toast.error('Please enter an event description');
      return;
    }

    setIsLoading(true);
    try {
      const result = parseNaturalLanguage(input);
      setParseResult(result);
      
      if (result.success && result.data) {
        setShowPreview(true);
        toast.success('Event parsed successfully!');
      } else {
        toast.error(result.error || 'Failed to parse event');
      }
    } catch (error) {
      console.error('Error parsing event:', error);
      toast.error('Failed to parse event');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEvent = () => {
    if (parseResult?.success && parseResult.data) {
      onEventParsed(parseResult.data);
      setInput('');
      setParseResult(null);
      setShowPreview(false);
    }
  };

  const formatDateTime = (datetime: string) => {
    return new Date(datetime).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold">Quick Add Event</h3>
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={placeholder}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleParse();
                }
              }}
            />
            <Button 
              onClick={handleParse} 
              disabled={isLoading || !input.trim()}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Parse
                </>
              )}
            </Button>
          </div>

          {/* Parsing Result Preview */}
          {parseResult && (
            <div className="border rounded-lg p-4 space-y-3">
              {parseResult.success ? (
                <>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">Event Parsed Successfully</span>
                    <Badge className={getConfidenceColor(parseResult.data.confidence)}>
                      {Math.round(parseResult.data.confidence * 100)}% confidence
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">Title:</span>
                      <span>{parseResult.data.title}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Start:</span>
                      <span>{formatDateTime(parseResult.data.start_datetime)}</span>
                    </div>
                    
                    {parseResult.data.category && (
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-purple-600" />
                        <span className="font-medium">Category:</span>
                        <Badge variant="outline">{parseResult.data.category}</Badge>
                      </div>
                    )}
                    
                    {parseResult.data.end_datetime && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-orange-600" />
                        <span className="font-medium">End:</span>
                        <span>{formatDateTime(parseResult.data.end_datetime)}</span>
                      </div>
                    )}
                  </div>

                  {/* Suggestions */}
                  {parseResult.data.suggestions && parseResult.data.suggestions.length > 0 && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Suggestions:</span>
                      </div>
                      <ul className="text-sm text-blue-700 space-y-1">
                        {parseResult.data.suggestions.map((suggestion: string, index: number) => (
                          <li key={index}>• {suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button onClick={handleCreateEvent} className="flex-1">
                      Create Event
                    </Button>
                    <Button variant="outline" onClick={() => {
                      setParseResult(null);
                      setShowPreview(false);
                    }}>
                      Try Again
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <span className="font-medium text-red-800">Parsing Failed</span>
                  </div>
                  <p className="text-sm text-red-700">{parseResult.error}</p>
                  {parseResult.ambiguities && parseResult.ambiguities.length > 0 && (
                    <div className="mt-2">
                      <span className="text-sm font-medium text-red-700">Issues found:</span>
                      <ul className="text-sm text-red-600 mt-1">
                        {parseResult.ambiguities.map((issue: string, index: number) => (
                          <li key={index}>• {issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Examples */}
          {!parseResult && (
            <div className="text-sm text-gray-600 space-y-2">
              <p className="font-medium">Try these examples:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Doctor appointment Monday at 3pm",
                  "Team meeting tomorrow 2:30",
                  "Birthday party Saturday 6pm",
                  "Grocery shopping this Friday"
                ].map((example) => (
                  <Button
                    key={example}
                    variant="outline"
                    size="sm"
                    onClick={() => setInput(example)}
                    className="text-xs"
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Cancel Button */}
          <div className="flex justify-end pt-2">
            <Button variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickAddEventInput;
