
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Clock, Trash2, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNannyTokens } from '@/hooks/useNannyTokens';

interface ActiveToken {
  id: string;
  token: string;
  created_at: string;
  expires_at: string;
  used_at: string | null;
  is_active: boolean;
}

interface NannyTokenManagerProps {
  householdId: string;
}

const NannyTokenManager: React.FC<NannyTokenManagerProps> = ({ householdId }) => {
  const [activeTokens, setActiveTokens] = useState<ActiveToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTokens, setShowTokens] = useState(false);
  const { toast } = useToast();
  const { generateToken, loading: generating } = useNannyTokens();

  const fetchActiveTokens = async () => {
    try {
      const { data, error } = await supabase
        .from('nanny_access_tokens')
        .select('*')
        .eq('household_id', householdId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActiveTokens(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching tokens",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const revokeToken = async (tokenId: string) => {
    try {
      const { error } = await supabase
        .from('nanny_access_tokens')
        .update({ is_active: false })
        .eq('id', tokenId);

      if (error) throw error;

      toast({
        title: "Token revoked",
        description: "The access token has been deactivated"
      });

      fetchActiveTokens();
    } catch (error: any) {
      toast({
        title: "Error revoking token",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleGenerateNew = async () => {
    const token = await generateToken(householdId);
    if (token) {
      fetchActiveTokens();
    }
  };

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }
    return `${minutes}m remaining`;
  };

  useEffect(() => {
    fetchActiveTokens();
  }, [householdId]);

  if (loading) {
    return (
      <Card className="overflow-x-hidden">
        <CardContent className="p-4 sm:p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Loading tokens...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-x-hidden">
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl min-w-0">
            <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500 flex-shrink-0" />
            <span className="truncate">Nanny Access Management</span>
          </CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              onClick={() => setShowTokens(!showTokens)}
              variant="outline"
              size="sm"
              className="min-h-[44px] px-3"
            >
              {showTokens ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span className="ml-2">{showTokens ? 'Hide' : 'Show'} Tokens</span>
            </Button>
            <Button
              onClick={handleGenerateNew}
              disabled={generating}
              size="sm"
              className="min-h-[44px] px-3"
            >
              {generating ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Shield className="h-4 w-4 mr-2" />
              )}
              <span className="hidden sm:inline">Generate New</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 overflow-x-hidden">
        {activeTokens.length === 0 ? (
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription className="text-sm sm:text-base leading-relaxed">
              No active access tokens. Generate a new token to give your nanny secure access.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            {activeTokens.map((token) => (
              <div key={token.id} className="border rounded-lg p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 overflow-x-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <code className="bg-white dark:bg-gray-700 px-2 py-1 rounded text-sm font-mono break-all">
                        {showTokens ? `${token.token.slice(0, 4)}-${token.token.slice(4)}` : '••••-••••'}
                      </code>
                      {token.used_at ? (
                        <Badge variant="secondary" className="text-xs">Used</Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                          Active
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 flex-shrink-0" />
                        <span className="break-words">{formatTimeRemaining(token.expires_at)}</span>
                      </div>
                      <div className="break-words">
                        Created: {new Date(token.created_at).toLocaleDateString()}
                      </div>
                      {token.used_at && (
                        <div className="break-words">
                          Used: {new Date(token.used_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => revokeToken(token.id)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 min-h-[44px] px-3 flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Revoke
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <Alert className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
          <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <AlertDescription className="text-blue-800 dark:text-blue-200 text-sm sm:text-base leading-relaxed break-words">
            <strong>Share tokens securely:</strong> Send access codes directly to your nanny via text or secure messaging. 
            Tokens expire after 24 hours and can only be used once.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default NannyTokenManager;
