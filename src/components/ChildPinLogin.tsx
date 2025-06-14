
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useChildSession } from '@/hooks/useChildSession';
import { useChildren } from '@/hooks/useChildren';
import { ArrowLeft, LogIn } from 'lucide-react';
import { toast } from 'sonner';

interface ChildPinLoginProps {
  householdId: string;
  onBack: () => void;
}

const ChildPinLogin: React.FC<ChildPinLoginProps> = ({ householdId, onBack }) => {
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { children } = useChildren(householdId);
  const { setActiveChild } = useChildSession();

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (pin.length !== 4) {
      toast.error('PIN must be 4 digits');
      return;
    }

    setIsLoading(true);
    
    try {
      // Find child with matching PIN
      const matchingChild = children.find(child => child.pin === pin);
      
      if (matchingChild) {
        console.log('✅ Child PIN login successful:', matchingChild.first_name);
        setActiveChild(matchingChild);
        toast.success(`Welcome, ${matchingChild.first_name}! 👶`);
        setPin('');
      } else {
        toast.error('Invalid PIN. Please try again.');
        setPin('');
      }
    } catch (error) {
      console.error('❌ Child PIN login error:', error);
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            👶 Kid's Login
          </CardTitle>
          <CardDescription>
            Enter your 4-digit PIN to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="1234"
                maxLength={4}
                className="text-center text-2xl font-bold tracking-widest"
                disabled={isLoading}
                autoFocus
              />
              <p className="text-xs text-muted-foreground text-center">
                Ask your parent if you forgot your PIN
              </p>
            </div>

            <Button
              type="submit"
              disabled={pin.length !== 4 || isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
            >
              {isLoading ? (
                'Logging in...'
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </>
              )}
            </Button>
          </form>

          <Button
            variant="ghost"
            onClick={onBack}
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Parent Login
          </Button>

          {children.length > 0 && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Available Kids:</p>
              <div className="space-y-1">
                {children.map((child) => (
                  <div key={child.id} className="text-sm text-muted-foreground">
                    {child.first_name} {child.last_name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ChildPinLogin;
