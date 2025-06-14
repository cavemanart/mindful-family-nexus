
import React, { useState, useCallback, memo } from 'react';
import { Heart, User, MessageCircle, Edit, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Appreciation, AppreciationComment } from '@/hooks/useAppreciationsOptimized';

interface AppreciationCardOptimizedProps {
  appreciation: Appreciation;
  comments: AppreciationComment[];
  currentUser: string;
  currentUserId?: string;
  onToggleReaction: (appreciationId: string) => Promise<boolean>;
  onAddComment: (appreciationId: string, comment: string) => Promise<boolean>;
  onDeleteAppreciation?: (id: string) => Promise<boolean>;
  onLoadComments: (appreciationId: string) => void;
}

const AppreciationCardOptimized: React.FC<AppreciationCardOptimizedProps> = memo(({
  appreciation,
  comments,
  currentUser,
  currentUserId,
  onToggleReaction,
  onAddComment,
  onDeleteAppreciation,
  onLoadComments
}) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [isReacting, setIsReacting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Get a consistent color based on appreciation ID
  const getCardStyle = useCallback(() => {
    const colors = [
      'bg-gradient-to-r from-pink-50 to-pink-100 dark:from-pink-950/40 dark:to-pink-900/40 border-pink-200 dark:border-pink-800',
      'bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/40 border-purple-200 dark:border-purple-800',
      'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/40 border-blue-200 dark:border-blue-800',
      'bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/40 dark:to-green-900/40 border-green-200 dark:border-green-800',
      'bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-950/40 dark:to-yellow-900/40 border-yellow-200 dark:border-yellow-800',
      'bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950/40 dark:to-orange-900/40 border-orange-200 dark:border-orange-800',
    ];
    // Use appreciation ID to ensure consistent color
    const hash = appreciation.id.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  }, [appreciation.id]);

  const canDelete = appreciation.from_member === currentUser || 
                   (currentUserId && appreciation.from_user_id === currentUserId);

  const handleToggleComments = useCallback(() => {
    if (!showComments) {
      onLoadComments(appreciation.id);
    }
    setShowComments(!showComments);
  }, [showComments, onLoadComments, appreciation.id]);

  const handleAddComment = useCallback(async () => {
    if (!newComment.trim() || isAddingComment) return;

    setIsAddingComment(true);
    try {
      const success = await onAddComment(appreciation.id, newComment.trim());
      if (success) {
        setNewComment('');
      }
    } finally {
      setIsAddingComment(false);
    }
  }, [newComment, isAddingComment, onAddComment, appreciation.id]);

  const handleToggleReaction = useCallback(async () => {
    if (isReacting) return;

    setIsReacting(true);
    try {
      await onToggleReaction(appreciation.id);
    } finally {
      setIsReacting(false);
    }
  }, [isReacting, onToggleReaction, appreciation.id]);

  const handleDelete = useCallback(async () => {
    if (onDeleteAppreciation) {
      await onDeleteAppreciation(appreciation.id);
    }
    setShowDeleteDialog(false);
  }, [onDeleteAppreciation, appreciation.id]);

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  }, []);

  return (
    <Card className={`${getCardStyle()} hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-background rounded-full flex items-center justify-center shadow-sm border">
              <User size={20} className="text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{appreciation.from_member}</p>
              <p className="text-sm text-muted-foreground">to {appreciation.to_member}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {formatDate(appreciation.created_at)}
            </Badge>
            {canDelete && onDeleteAppreciation && (
              <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-700">
                    <Trash2 size={14} />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Appreciation</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this appreciation? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
        
        <p className="text-foreground mb-4 leading-relaxed whitespace-pre-wrap">
          {appreciation.message}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleReaction}
            disabled={isReacting}
            className={`transition-colors ${
              appreciation.user_has_reacted 
                ? 'text-pink-600 bg-pink-50 hover:bg-pink-100 dark:bg-pink-950/30 dark:hover:bg-pink-900/50' 
                : 'text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-950/30'
            }`}
          >
            <Heart 
              size={16} 
              className={`mr-2 ${appreciation.user_has_reacted ? 'fill-current' : ''}`} 
            />
            {appreciation.reactions_count || 0} Love{(appreciation.reactions_count || 0) !== 1 ? 's' : ''}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleComments}
            className="text-muted-foreground hover:bg-muted"
          >
            <MessageCircle size={16} className="mr-2" />
            {appreciation.comments_count || 0} Comment{(appreciation.comments_count || 0) !== 1 ? 's' : ''}
            {showComments ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />}
          </Button>
        </div>

        {showComments && (
          <div className="border-t pt-4 space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-background/50 rounded-lg p-3 border">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm text-foreground">{comment.commenter_name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(comment.created_at)}
                  </span>
                </div>
                <p className="text-foreground text-sm whitespace-pre-wrap">{comment.comment}</p>
              </div>
            ))}
            
            <div className="flex gap-2">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={2}
                className="flex-1 resize-none"
                maxLength={300}
              />
              <Button
                onClick={handleAddComment}
                disabled={!newComment.trim() || isAddingComment}
                className="self-end"
              >
                {isAddingComment ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  'Post'
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

AppreciationCardOptimized.displayName = 'AppreciationCardOptimized';

export default AppreciationCardOptimized;
