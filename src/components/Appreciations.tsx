
import React, { useState } from 'react';
import { Heart, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppreciations } from '@/hooks/useAppreciations';
import { useAuth } from '@/hooks/useAuth';
import { Household } from '@/hooks/useHouseholds';
import AppreciationCard from './AppreciationCard';

interface AppreciationsProps {
  selectedHousehold: Household;
}

const Appreciations: React.FC<AppreciationsProps> = ({ selectedHousehold }) => {
  const { user, userProfile } = useAuth();
  const { 
    appreciations, 
    comments, 
    reactions, 
    householdMembers,
    loading, 
    addAppreciation, 
    updateAppreciation,
    deleteAppreciation,
    toggleReaction,
    addComment,
    fetchComments,
    fetchReactions,
    getCurrentUserName
  } = useAppreciations(selectedHousehold?.id);
  
  const [isAddingAppreciation, setIsAddingAppreciation] = useState(false);
  const [newAppreciation, setNewAppreciation] = useState({
    message: '',
    to_member: '',
  });

  // Add safety check for getCurrentUserName
  const currentUserName = React.useMemo(() => {
    try {
      return getCurrentUserName();
    } catch (error) {
      console.error('❌ Appreciations: Error getting current user name:', error);
      return 'Unknown User';
    }
  }, [getCurrentUserName]);

  const handleAddAppreciation = async () => {
    if (newAppreciation.message.trim() && newAppreciation.to_member) {
      const success = await addAppreciation({
        message: newAppreciation.message,
        to_member: newAppreciation.to_member,
        reactions: 0,
      });
      
      if (success) {
        setNewAppreciation({ message: '', to_member: '' });
        setIsAddingAppreciation(false);
      }
    }
  };

  // Add loading state and error handling
  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Heart className="text-pink-300 mx-auto mb-4" size={48} />
          <p className="text-muted-foreground">Please log in to view appreciations</p>
        </div>
      </div>
    );
  }

  if (!selectedHousehold) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Heart className="text-pink-300 mx-auto mb-4" size={48} />
          <p className="text-muted-foreground">Please select a household to view appreciations</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Heart className="text-pink-500" size={28} />
            Family Appreciations
          </h2>
          <p className="text-muted-foreground mt-1">Share love and gratitude with your family</p>
        </div>
        {householdMembers.length > 1 && (
          <Button 
            onClick={() => setIsAddingAppreciation(true)} 
            className="bg-pink-600 hover:bg-pink-700"
          >
            <Plus size={16} className="mr-2" />
            Add Appreciation
          </Button>
        )}
      </div>

      {isAddingAppreciation && (
        <Card className="border-2 border-dashed border-pink-300 dark:border-pink-700 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/30 dark:to-purple-950/30">
          <CardHeader>
            <CardTitle className="text-pink-800 dark:text-pink-200">Share an Appreciation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">To</label>
              <Select value={newAppreciation.to_member} onValueChange={(value) => 
                setNewAppreciation({ ...newAppreciation, to_member: value })
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select who's receiving appreciation" />
                </SelectTrigger>
                <SelectContent>
                  {householdMembers
                    .filter(member => {
                      const memberFullName = `${member.first_name} ${member.last_name}`;
                      return memberFullName !== currentUserName;
                    })
                    .map((member) => (
                      <SelectItem key={member.id} value={`${member.first_name} ${member.last_name}`}>
                        {member.first_name} {member.last_name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Message</label>
              <Textarea
                placeholder="Share what you appreciate about this person..."
                value={newAppreciation.message}
                onChange={(e) => setNewAppreciation({ ...newAppreciation, message: e.target.value })}
                rows={3}
                className="resize-none"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddAppreciation} className="bg-pink-600 hover:bg-pink-700">
                <Heart size={16} className="mr-2" />
                Share Appreciation
              </Button>
              <Button variant="outline" onClick={() => setIsAddingAppreciation(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {appreciations.map((appreciation) => (
          <AppreciationCard
            key={appreciation.id}
            appreciation={appreciation}
            comments={comments[appreciation.id] || []}
            reactions={reactions[appreciation.id] || []}
            currentUser={currentUserName}
            onToggleReaction={toggleReaction}
            onAddComment={addComment}
            onUpdateAppreciation={updateAppreciation}
            onDeleteAppreciation={deleteAppreciation}
            onLoadComments={fetchComments}
            onLoadReactions={fetchReactions}
          />
        ))}
      </div>

      {appreciations.length === 0 && (
        <div className="text-center py-12">
          <Heart size={48} className="text-pink-300 mx-auto mb-4" />
          {householdMembers.length <= 1 ? (
            <>
              <p className="text-muted-foreground text-lg">No family members to appreciate yet!</p>
              <p className="text-muted-foreground text-sm mt-2">Invite family members to start sharing appreciations.</p>
            </>
          ) : (
            <>
              <p className="text-muted-foreground text-lg">No appreciations yet!</p>
              <p className="text-muted-foreground text-sm mt-2">Start spreading love by sharing your first appreciation.</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Appreciations;
