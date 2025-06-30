
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, X, Clock, Star } from 'lucide-react';
import { useChorePoints } from '@/hooks/useChorePoints';
import { useChildren } from '@/hooks/useChildren';
import { useState } from 'react';

interface ApprovalCenterProps {
  householdId: string;
}

export default function ApprovalCenter({ householdId }: ApprovalCenterProps) {
  const { getPendingSubmissions, approveChoreSubmission, choreSubmissions } = useChorePoints(householdId);
  const { children } = useChildren(householdId);
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});

  const pendingSubmissions = getPendingSubmissions();

  const getChildName = (childId: string) => {
    const child = children.find(c => c.id === childId);
    return child ? `${child.first_name} ${child.last_name}` : 'Unknown Child';
  };

  const handleApprove = async (submissionId: string, pointsToAward: number) => {
    await approveChoreSubmission(submissionId, pointsToAward);
  };

  const handleReject = async (submissionId: string) => {
    // Implementation for rejection would go here
    console.log('Rejecting submission:', submissionId, 'Reason:', rejectionReasons[submissionId]);
  };

  if (pendingSubmissions.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
          <p className="text-muted-foreground">No chores waiting for approval.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="h-5 w-5 text-orange-600" />
        <h2 className="text-xl font-semibold">Pending Approvals</h2>
        <Badge variant="secondary">{pendingSubmissions.length}</Badge>
      </div>

      {pendingSubmissions.map((submission) => (
        <Card key={submission.id} className="border-orange-200 bg-orange-50">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">Chore Submission</CardTitle>
                <CardDescription>
                  Submitted by {getChildName(submission.child_id)} on{' '}
                  {new Date(submission.submitted_at).toLocaleDateString()}
                </CardDescription>
              </div>
              <Badge variant="outline" className="border-orange-300 text-orange-700">
                <Clock className="h-3 w-3 mr-1" />
                Pending
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {submission.submission_note && (
                <div>
                  <h4 className="font-medium mb-2">Submission Note:</h4>
                  <p className="text-sm text-muted-foreground bg-white p-3 rounded border">
                    {submission.submission_note}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-600" />
                <span className="font-medium">Points to Award: {submission.points_awarded || 'Not set'}</span>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => handleApprove(submission.id, submission.points_awarded || 10)}
                  className="bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                
                <Button
                  onClick={() => handleReject(submission.id)}
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-50"
                  size="sm"
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </div>

              <div className="mt-3">
                <Textarea
                  placeholder="Add a note for rejection (optional)"
                  value={rejectionReasons[submission.id] || ''}
                  onChange={(e) => setRejectionReasons(prev => ({
                    ...prev,
                    [submission.id]: e.target.value
                  }))}
                  className="text-sm"
                  rows={2}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
