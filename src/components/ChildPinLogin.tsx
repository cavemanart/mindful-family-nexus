
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useChildren, Child } from '@/hooks/useChildren';
import { useChildSession } from '@/hooks/useChildSession';
import { ArrowLeft } from 'lucide-react';

interface ChildPinLoginProps {
  householdId: string;
  onLoginSuccess?: (child: Child) => void;
  onBack?: () => void;
}

const ChildPinLogin: React.FC<ChildPinLoginProps> = ({ householdId, onLoginSuccess, onBack }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { children } = useChildren(householdId);
  const { loginWithPin } = useChildSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (pin.length !== 4) {
      setError('PIN must be 4 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Find child with matching PIN
      const matchingChild = children.find(child => child.pin === pin);
      
      if (!matchingChild) {
        setError('Invalid PIN');
        return;
      }

      // Create a proper Child object with proper typing
      const childProfile: Child = {
        id: matchingChild.id,
        first_name: matchingChild.first_name,
        last_name: matchingChild.last_name,
        avatar_selection: matchingChild.avatar_selection,
        is_child_account: matchingChild.is_child_account,
        pin: matchingChild.pin,
        parent_id: matchingChild.parent_id,
        created_at: matchingChild.created_at || new Date().toISOString()
      };

      const success = await loginWithPin(pin, householdId);
      
      if (success) {
        onLoginSuccess?.(childProfile);
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (error) {
      console.error('PIN login error:', error);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setPin(value);
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            {onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="p-1"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <CardTitle className="text-center flex-1">Child Login</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Enter 4-digit PIN"
                value={pin}
                onChange={handlePinChange}
                maxLength={4}
                className="text-center text-2xl tracking-widest"
              />
            </div>
            
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={pin.length !== 4 || loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChildPinLogin;
