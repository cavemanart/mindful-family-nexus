
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNannyTokens } from '@/hooks/useNannyTokens';
import { Shield, Users, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

interface NannyLoginProps {
  onSuccess: (householdId: string) => void;
}

const NannyLogin: React.FC<NannyLoginProps> = ({ onSuccess }) => {
  const [token, setToken] = useState('');
  const { verifyToken, loading } = useNannyTokens();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (token.length === 8) {
      const householdId = await verifyToken(token);
      if (householdId) {
        onSuccess(householdId);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="absolute top-4 left-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="flex justify-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              Nanny Access
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Enter the 8-character access code provided by the family
            </p>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Access Code
              </label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={8}
                  value={token}
                  onChange={setToken}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                  </InputOTPGroup>
                  <div className="mx-2">-</div>
                  <InputOTPGroup>
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                    <InputOTPSlot index={6} />
                    <InputOTPSlot index={7} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading || token.length !== 8}
            >
              {loading ? 'Verifying...' : 'Access Dashboard'}
            </Button>
          </form>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start space-x-3">
              <Users className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">For Families</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Generate access codes from your family dashboard under "Nanny Mode" to give caregivers secure access to important information.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NannyLogin;
