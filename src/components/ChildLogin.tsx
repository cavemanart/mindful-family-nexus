
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, ArrowLeft } from 'lucide-react';
import { usePinAuth } from '@/hooks/usePinAuth';

interface ChildLoginProps {
  householdId: string;
  onLoginSuccess: (childData: any) => void;
  onBack: () => void;
}

const ChildLogin: React.FC<ChildLoginProps> = ({ householdId, onLoginSuccess, onBack }) => {
  const [pin, setPin] = useState('');
  const { verifyPin, loading } = usePinAuth();

  const handlePinInput = (digit: string) => {
    if (pin.length < 6) {
      setPin(pin + digit);
    }
  };

  const handleClearPin = () => {
    setPin('');
  };

  const handleSubmit = async () => {
    if (pin.length < 4) return;

    try {
      const childData = await verifyPin(pin, householdId);
      onLoginSuccess(childData);
    } catch (error) {
      // Error handling is done in the hook
      setPin('');
    }
  };

  const avatarOptions = [
    { id: 'child-1', emoji: '😊' },
    { id: 'child-2', emoji: '🌟' },
    { id: 'child-3', emoji: '🦄' },
    { id: 'child-4', emoji: '🎈' },
    { id: 'child-5', emoji: '🚀' },
    { id: 'child-6', emoji: '🎨' },
    { id: 'child-7', emoji: '⚽' },
    { id: 'child-8', emoji: '🎵' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 dark:from-purple-950 dark:via-pink-950 dark:to-blue-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4 text-purple-600 hover:text-purple-700"
          >
            <ArrowLeft className="mr-2" size={16} />
            Back to Login
          </Button>
          <h1 className="text-3xl font-bold text-purple-600 mb-2">Kid's Login 🎈</h1>
          <p className="text-muted-foreground">Enter your special PIN to continue</p>
        </div>

        <Card className="border-2 border-purple-200 dark:border-purple-700 shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl text-purple-600">
              <div className="flex justify-center gap-2 mb-4">
                {avatarOptions.slice(0, 4).map((avatar) => (
                  <div key={avatar.id} className="text-2xl animate-bounce" style={{ animationDelay: `${Math.random() * 2}s` }}>
                    {avatar.emoji}
                  </div>
                ))}
              </div>
              Enter Your PIN
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* PIN Display */}
            <div className="flex justify-center gap-2">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <div
                  key={index}
                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-xl font-bold ${
                    index < pin.length
                      ? 'bg-purple-500 border-purple-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {index < pin.length ? '●' : ''}
                </div>
              ))}
            </div>

            {/* Number Pad */}
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
                <Button
                  key={number}
                  variant="outline"
                  size="lg"
                  onClick={() => handlePinInput(number.toString())}
                  className="h-16 text-xl font-bold border-2 hover:bg-purple-100 dark:hover:bg-purple-950/50 hover:border-purple-300"
                  disabled={loading || pin.length >= 6}
                >
                  {number}
                </Button>
              ))}
              <Button
                variant="outline"
                size="lg"
                onClick={handleClearPin}
                className="h-16 text-lg font-bold border-2 hover:bg-red-100 dark:hover:bg-red-950/50 hover:border-red-300"
                disabled={loading}
              >
                Clear
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => handlePinInput('0')}
                className="h-16 text-xl font-bold border-2 hover:bg-purple-100 dark:hover:bg-purple-950/50 hover:border-purple-300"
                disabled={loading || pin.length >= 6}
              >
                0
              </Button>
              <Button
                size="lg"
                onClick={handleSubmit}
                className="h-16 text-lg font-bold bg-purple-600 hover:bg-purple-700"
                disabled={loading || pin.length < 4}
              >
                {loading ? '...' : 'Go!'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChildLogin;
