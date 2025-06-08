
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Baby, ArrowLeft, Users, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ChildAccessHelp: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 dark:from-purple-950 dark:via-pink-950 dark:to-blue-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-6 text-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/auth')}
            className="mb-4 text-purple-600 hover:text-purple-700"
          >
            <ArrowLeft className="mr-2" size={16} />
            Back to Login
          </Button>
        </div>

        <Card className="border-2 border-purple-200 dark:border-purple-700 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-purple-600 flex items-center justify-center gap-2">
              <Baby size={28} />
              Kids Zone Help 🎈
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Ask Your Parent for Access!
              </h2>
              <p className="text-muted-foreground">
                To use the Kids Zone, your parent needs to create your account first.
              </p>
            </div>

            <div className="space-y-4">
              <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-700">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Users className="text-blue-500 mt-1" size={20} />
                    <div>
                      <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-1">
                        For Parents
                      </h3>
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        Sign in to your account and go to "Manage Children" to create accounts for your kids. 
                        Each child gets their own PIN and avatar!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-700">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Baby className="text-purple-500 mt-1" size={20} />
                    <div>
                      <h3 className="font-semibold text-purple-700 dark:text-purple-300 mb-1">
                        For Kids
                      </h3>
                      <p className="text-sm text-purple-600 dark:text-purple-400">
                        Once your parent creates your account, they'll give you a special link and PIN. 
                        Use your PIN to access your own dashboard with chores, rewards, and messages!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-700">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="text-green-500 mt-1" size={20} />
                    <div>
                      <h3 className="font-semibold text-green-700 dark:text-green-300 mb-1">
                        Safe & Secure
                      </h3>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        Kids can only see age-appropriate content and can't access adult features. 
                        Parents have full control over child accounts.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="text-center pt-4">
              <Button
                onClick={() => navigate('/auth')}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Got It! Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChildAccessHelp;
