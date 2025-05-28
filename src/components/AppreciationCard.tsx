
import React, { useState, useEffect } from 'react';
import { Heart, User, MessageCircle, Edit, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Appreciation, AppreciationComment, AppreciationReaction } from '@/hooks/useAppreciations';

interface AppreciationCardProps {
  appreciation: Appreciation;
  comments: AppreciationComment[];
  reactions: AppreciationReaction[];
  currentUser: string;
  onToggleReaction: (appreciationId: string, reactorName: string) => Promise<boolean>;
  onAddComment: (appreciationId: string, commenterName: string, comment: string) => Promise<boolean>;
  onUpdateAppreciation: (id: string, updates: Partial<Appreciation>) => Promise<boolean>;
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
  onLoadComments,
  onLoadReactions
}) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedMessage, setEditedMessage] = useState(appreciation.message);

  const getRandomColor = () => {
    const colors = [
      'from-pink-100 to-pink-200',
      'from-purple-100 to-purple-200',
      'from-blue-100 to-blue-200',
      'from-green-100 to-green-200',
      'from-yellow-100 to-yellow-200',
      'from-orange-100 to-orange-200',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const userHasReacted = reactions.some(r => r.reactor_name === currentUser);
  const canEdit = appreciation.from_member === currentUser;

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

  return (
    <Card className={`bg-gradient-to-r ${getRandomColor()} border-0 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
              <User size={20} className="text-gray-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">{appreciation.from_member}</p>
              <p className="text-sm text-gray-600">to {appreciation.to_member}</p>
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
          </div>
        </div>
        
        <p className="text-gray-800 mb-4 leading-relaxed">{appreciation.message}</p>
        
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleReaction(appreciation.id, currentUser)}
            className={`transition-colors ${
              userHasReacted 
                ? 'text-pink-600 bg-pink-50 hover:bg-pink-100' 
                : 'text-pink-600 hover:bg-white/50'
            }`}
          >
            <Heart size={16} className={`mr-2 ${userHasReacted ? 'fill-current' : ''}`} />
            {reactions.length} Love{reactions.length !== 1 ? 's' : ''}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleComments}
            className="text-gray-600 hover:bg-white/50"
          >
            <MessageCircle size={16} className="mr-2" />
            {comments.length} Comment{comments.length !== 1 ? 's' : ''}
            {showComments ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />}
          </Button>
        </div>

        {showComments && (
          <div className="border-t pt-4 space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-white/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm text-gray-700">{comment.commenter_name}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-800 text-sm">{comment.comment}</p>
              </div>
            ))}
            
            <div className="flex gap-2">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={2}
                className="flex-1 resize-none bg-white/70"
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
          <span className="text-xs text-gray-600">
            {new Date(appreciation.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppreciationCard;
