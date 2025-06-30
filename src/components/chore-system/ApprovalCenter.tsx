
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, X, Clock, Star } from 'lucide-react';
import { useChorePoints } from '@/hooks/useChorePoints';
import { useChores } from '@/hooks/useChores';

interface ApprovalCenterProps {
  householdId: string;
}

export default function ApprovalCenter({ householdId }: ApprovalCenterProps) {
  const { getPendingSubmissions, approveChoreSubmission } = useChorePoints(householdId);
  const { chores } = useChores(householdId);
  
  const pendingSubmissions = getPendingSubmissions();

  const handleApprove = async (submissionId: string, points: number) => {
    await approveChoreSubmission(submissionId, points);
  };

  const getChoreDetails = (choreId: string) => {
    return chores.find(c => c.id === choreId);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending Approvals
          </CardTitle>
          <CardDescription>
            Review and approve completed chores submitted by children
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {pendingSubmissions.map((submission) => {
          const choreDetails = getChoreDetails(submission.chore_id);
          
          return (
            <Card key={submission.id} className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {choreDetails?.title || 'Unknown Chore'}
                    </CardTitle>
                    <CardDescription>
                      {choreDetails?.description}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>Submitted by: <strong>{submission.child_id}</strong></span>
                    <span>Points: <strong>{choreDetails?.points || 0}</strong></span>
                  </div>
                  
                  {submission.submission_note && (
                    <div className="bg-white p-3 rounded border">
                      <p className="text-sm font-medium mb-1">Submission Note:</p>
                      <p className="text-sm text-muted-foreground">{submission.submission_note}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApprove(submission.id, choreDetails?.points || 0)}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve & Award Points
                    </Button>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {pendingSubmissions.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <div className="text-muted-foreground">
                All caught up! No pending approvals at the moment.
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
