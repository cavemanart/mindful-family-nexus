import React, { useState, useEffect } from 'react';
import { Heart, User, MessageCircle, Edit, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Appreciation, AppreciationComment, AppreciationReaction } from '@/hooks/useAppreciations';

interface AppreciationCardProps {
  appreciation: Appreciation;
  comments: AppreciationComment[];
  reactions: AppreciationReaction[];
  currentUser: string;
  onToggleReaction: (appreciationId: string, reactorName: string) => Promise<boolean>;
  onAddComment: (appreciationId: string, commenterName: string, comment: string) => Promise<boolean>;
  onUpdateAppreciation: (id: string, updates: Partial<Appreciation>) => Promise<boolean>;
  onDeleteAppreciation: (id: string) => Promise<boolean>;
  onLoadComments: (appreciationId: string) => void;
  onLoadReactions: (appreciationId: string) => void;
}

const AppreciationCard: React.FC<AppreciationCardProps> = ({
  appreciation,
  comments,
  reactions,
  currentUser,
  onToggleReaction,
  onAddComment,
  onUpdateAppreciation,
  onDeleteAppreciation,
  onLoadComments,
  onLoadReactions
}) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedMessage, setEditedMessage] = useState(appreciation.message);

  const getRandomCardStyle = () => {
    const styles = [
      'bg-gradient-to-r from-pink-50 to-pink-100 dark:from-pink-950/40 dark:to-pink-900/40 border-pink-200 dark:border-pink-800',
      'bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/40 border-purple-200 dark:border-purple-800',
      'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/40 border-blue-200 dark:border-blue-800',
      'bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/40 dark:to-green-900/40 border-green-200 dark:border-green-800',
      'bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-950/40 dark:to-yellow-900/40 border-yellow-200 dark:border-yellow-800',
      'bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950/40 dark:to-orange-900/40 border-orange-200 dark:border-orange-800',
    ];
    return styles[Math.floor(Math.random() * styles.length)];
  };

  const userHasReacted = reactions.some(r => r.reactor_name === currentUser);
  const canEdit = appreciation.from_member === currentUser;
  const canDelete = appreciation.from_member === currentUser;

  useEffect(() => {
    onLoadReactions(appreciation.id);
  }, [appreciation.id]);

  const handleToggleComments = () => {
    if (!showComments) {
      onLoadComments(appreciation.id);
    }
    setShowComments(!showComments);
  };

  const handleAddComment = async () => {
    if (newComment.trim()) {
      const success = await onAddComment(appreciation.id, currentUser, newComment.trim());
      if (success) {
        setNewComment('');
      }
    }
  };

  const handleSaveEdit = async () => {
    if (editedMessage.trim() && editedMessage !== appreciation.message) {
      const success = await onUpdateAppreciation(appreciation.id, { message: editedMessage.trim() });
      if (success) {
        setIsEditing(false);
      }
    } else {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    await onDeleteAppreciation(appreciation.id);
  };

  return (
    <Card className={`${getRandomCardStyle()} hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1`}>
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
              {new Date(appreciation.created_at).toLocaleDateString()}
            </Badge>
            {canEdit && (
              <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Edit size={14} />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Appreciation</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Textarea
                      value={editedMessage}
                      onChange={(e) => setEditedMessage(e.target.value)}
                      rows={4}
                      className="resize-none"
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleSaveEdit}>Save Changes</Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            {canDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
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
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
        
        <p className="text-foreground mb-4 leading-relaxed">{appreciation.message}</p>
        
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleReaction(appreciation.id, currentUser)}
            className={`transition-colors ${
              userHasReacted 
                ? 'text-pink-600 bg-pink-50 hover:bg-pink-100 dark:bg-pink-950/30 dark:hover:bg-pink-900/50' 
                : 'text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-950/30'
            }`}
          >
            <Heart size={16} className={`mr-2 ${userHasReacted ? 'fill-current' : ''}`} />
            {reactions.length} Love{reactions.length !== 1 ? 's' : ''}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleComments}
            className="text-muted-foreground hover:bg-muted"
          >
            <MessageCircle size={16} className="mr-2" />
            {comments.length} Comment{comments.length !== 1 ? 's' : ''}
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
                    {new Date(comment.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-foreground text-sm">{comment.comment}</p>
              </div>
            ))}
            
            <div className="flex gap-2">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={2}
                className="flex-1 resize-none"
              />
              <Button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="self-end"
              >
                Post
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end mt-2">
          <span className="text-xs text-muted-foreground">
            {new Date(appreciation.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppreciationCard;
