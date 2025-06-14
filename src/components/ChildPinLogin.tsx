
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useChildren } from '@/hooks/useChildren';
import { useChildSession } from '@/hooks/useChildSession';
import { Child } from '@/hooks/useChildren';

interface ChildProfile extends Child {
  created_at: string;
}

interface ChildPinLoginProps {
  householdId: string;
  onLoginSuccess: (child: ChildProfile) => void;
}

const ChildPinLogin: React.FC<ChildPinLoginProps> = ({ householdId, onLoginSuccess }) => {
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

      // Create a proper ChildProfile object
      const childProfile: ChildProfile = {
        ...matchingChild,
        created_at: matchingChild.created_at || new Date().toISOString()
      };

      const success = await loginWithPin(pin, householdId);
      
      if (success) {
        onLoginSuccess(childProfile);
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
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Child Login</CardTitle>
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
  );
};

export default ChildPinLogin;
