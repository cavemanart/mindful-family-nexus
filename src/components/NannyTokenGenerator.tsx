
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNannyTokens } from '@/hooks/useNannyTokens';
import { Copy, RefreshCw, Shield, Clock, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface NannyTokenGeneratorProps {
  householdId: string;
}

const NannyTokenGenerator: React.FC<NannyTokenGeneratorProps> = ({ householdId }) => {
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { generateToken, loading } = useNannyTokens();

  const handleGenerateToken = async () => {
    const token = await generateToken(householdId);
    if (token) {
      setCurrentToken(token);
      setCopied(false);
    }
  };

  const handleCopyToken = async () => {
    if (currentToken) {
      await navigator.clipboard.writeText(currentToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-500" />
          Generate Nanny Access Code
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Generate a secure, one-time access code for your nanny or caregiver to access important 
          household information including emergency contacts, medications, access codes, and routines.
        </p>

        {currentToken ? (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg border-2 border-dashed border-blue-300">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700 mb-2">Access Code</p>
                <div className="text-2xl font-mono font-bold text-blue-600 tracking-wider">
                  {currentToken.slice(0, 4)}-{currentToken.slice(4)}
                </div>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    Expires in 24 hours
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    One-time use
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleCopyToken}
                className="flex-1"
                variant={copied ? "default" : "outline"}
              >
                {copied ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Code
                  </>
                )}
              </Button>
              <Button
                onClick={handleGenerateToken}
                variant="outline"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Share this code with your nanny:</strong> They can use it at{' '}
                <code className="bg-yellow-100 px-1 rounded">{window.location.origin}/nanny</code>
              </p>
            </div>
          </div>
        ) : (
          <Button
            onClick={handleGenerateToken}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Generate Access Code
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default NannyTokenGenerator;
