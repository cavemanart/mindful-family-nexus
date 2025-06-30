
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, X, Clock } from 'lucide-react';
import { useChorePoints } from '@/hooks/useChorePoints';
import { useChores } from '@/hooks/useChores';
import { useChildren } from '@/hooks/useChildren';

interface ApprovalCenterProps {
  householdId: string;
}

export default function ApprovalCenter({ householdId }: ApprovalCenterProps) {
  const { getPendingSubmissions, approveChoreSubmission, rejectChoreSubmission } = useChorePoints(householdId);
  const { chores } = useChores(householdId);
  const { children } = useChildren(householdId);
  const [rejectionReasons, setRejectionReasons] = useState<{[key: string]: string}>({});
  
  const pendingSubmissions = getPendingSubmissions();

  const handleApprove = async (submissionId: string, points: number) => {
    await approveChoreSubmission(submissionId, points);
  };

  const handleReject = async (submissionId: string) => {
    const reason = rejectionReasons[submissionId] || '';
    await rejectChoreSubmission(submissionId, reason);
    // Clear the rejection reason after submission
    setRejectionReasons(prev => ({ ...prev, [submissionId]: '' }));
  };

  const getChoreDetails = (choreId: string) => {
    return chores.find(c => c.id === choreId);
  };

  const getChildName = (childId: string) => {
    const child = children.find(c => c.id === childId);
    return child ? `${child.first_name} ${child.last_name || ''}`.trim() : childId;
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
                    <span>Submitted by: <strong>{getChildName(submission.child_id)}</strong></span>
                    <span>Points: <strong>{choreDetails?.points || 0}</strong></span>
                  </div>
                  
                  {submission.submission_note && (
                    <div className="bg-white p-3 rounded border">
                      <p className="text-sm font-medium mb-1">Submission Note:</p>
                      <p className="text-sm text-muted-foreground">{submission.submission_note}</p>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleApprove(submission.id, choreDetails?.points || 0)}
                        className="flex items-center gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Approve & Award Points
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Reason for rejection (optional)..."
                        value={rejectionReasons[submission.id] || ''}
                        onChange={(e) => setRejectionReasons(prev => ({ 
                          ...prev, 
                          [submission.id]: e.target.value 
                        }))}
                        rows={2}
                      />
                      <Button
                        variant="outline"
                        onClick={() => handleReject(submission.id)}
                        className="flex items-center gap-2 text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                        Reject
                      </Button>
                    </div>
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
