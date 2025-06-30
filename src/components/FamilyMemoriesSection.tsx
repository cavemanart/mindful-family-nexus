
import React, { useState } from "react";
import { Heart, Plus, Calendar, Tag, Users, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FamilyMemory, useFamilyMemories } from "@/hooks/useFamilyMemories";
import { useChildren } from "@/hooks/useChildren";

interface FamilyMemoriesSectionProps {
  memories: FamilyMemory[];
  loading: boolean;
  addMemory: (data: Omit<FamilyMemory, 'id' | 'created_at' | 'updated_at' | 'household_id'>) => Promise<boolean>;
  updateMemory: (id: string, updates: Partial<FamilyMemory>) => Promise<boolean>;
  deleteMemory: (id: string) => Promise<boolean>;
  householdId: string;
  currentUserName: string;
  currentUserId: string;
}

const MEMORY_TYPES = [
  { value: 'milestone', label: 'Milestone', emoji: '🏆' },
  { value: 'funny', label: 'Funny Moment', emoji: '😄' },
  { value: 'achievement', label: 'Achievement', emoji: '⭐' },
  { value: 'tradition', label: 'Family Tradition', emoji: '🎉' },
  { value: 'adventure', label: 'Adventure', emoji: '🌟' },
  { value: 'bonding', label: 'Family Bonding', emoji: '💝' },
  { value: 'general', label: 'General Memory', emoji: '💭' }
];

const EMOTION_TAGS = [
  'happy', 'proud', 'funny', 'touching', 'exciting', 'peaceful', 
  'grateful', 'surprised', 'loving', 'inspiring'
];

const FamilyMemoriesSection: React.FC<FamilyMemoriesSectionProps> = ({
  memories,
  loading,
  addMemory,
  updateMemory,
  deleteMemory,
  householdId,
  currentUserName,
  currentUserId,
}) => {
  const { children } = useChildren(householdId);
  const [isAddingMemory, setIsAddingMemory] = useState(false);
  const [editingMemory, setEditingMemory] = useState<string | null>(null);
  const [newMemory, setNewMemory] = useState({
    title: '',
    content: '',
    memory_type: 'general',
    emotion_tags: [] as string[],
    family_members: [] as string[],
    memory_date: new Date().toISOString().split('T')[0]
  });

  const familyMembers = children.map(child => `${child.first_name} ${child.last_name || ''}`.trim());

  const handleAddMemory = async () => {
    if (newMemory.title.trim() && newMemory.content.trim()) {
      const success = await addMemory({
        ...newMemory,
        added_by: currentUserName,
        added_by_user_id: currentUserId
      });
      if (success) {
        setNewMemory({
          title: '',
          content: '',
          memory_type: 'general',
          emotion_tags: [],
          family_members: [],
          memory_date: new Date().toISOString().split('T')[0]
        });
        setIsAddingMemory(false);
      }
    }
  };

  const handleEditMemory = async (memory: FamilyMemory) => {
    const success = await updateMemory(memory.id, {
      title: memory.title,
      content: memory.content,
      memory_type: memory.memory_type,
      emotion_tags: memory.emotion_tags,
      family_members: memory.family_members,
      memory_date: memory.memory_date
    });
    if (success) {
      setEditingMemory(null);
    }
  };

  const getMemoryTypeInfo = (type: string) => {
    return MEMORY_TYPES.find(t => t.value === type) || MEMORY_TYPES[6];
  };

  const toggleEmotionTag = (tag: string) => {
    setNewMemory(prev => ({
      ...prev,
      emotion_tags: prev.emotion_tags.includes(tag)
        ? prev.emotion_tags.filter(t => t !== tag)
        : [...prev.emotion_tags, tag]
    }));
  };

  const toggleFamilyMember = (member: string) => {
    setNewMemory(prev => ({
      ...prev,
      family_members: prev.family_members.includes(member)
        ? prev.family_members.filter(m => m !== member)
        : [...prev.family_members, member]
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Heart className="text-pink-500" size={24} />
          Family Memories
        </h3>
        <Button onClick={() => setIsAddingMemory(true)} className="bg-pink-600 hover:bg-pink-700">
          <Plus size={16} className="mr-2" />
          Add Memory
        </Button>
      </div>

      {isAddingMemory && (
        <Card className="border-2 border-dashed border-pink-300 bg-gradient-to-r from-pink-50 to-purple-50">
          <CardHeader>
            <CardTitle className="text-pink-800">Capture a Family Memory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Memory title..."
              value={newMemory.title}
              onChange={(e) => setNewMemory({ ...newMemory, title: e.target.value })}
            />
            <Textarea
              placeholder="Tell us about this special moment..."
              value={newMemory.content}
              onChange={(e) => setNewMemory({ ...newMemory, content: e.target.value })}
              rows={4}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Memory Type</label>
                <Select value={newMemory.memory_type} onValueChange={(value) => setNewMemory({ ...newMemory, memory_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MEMORY_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.emoji} {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Memory Date</label>
                <Input
                  type="date"
                  value={newMemory.memory_date}
                  onChange={(e) => setNewMemory({ ...newMemory, memory_date: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">How did this make you feel?</label>
              <div className="flex flex-wrap gap-2">
                {EMOTION_TAGS.map((tag) => (
                  <Badge
                    key={tag}
                    variant={newMemory.emotion_tags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleEmotionTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Family Members Involved</label>
              <div className="flex flex-wrap gap-2">
                {familyMembers.map((member) => (
                  <Badge
                    key={member}
                    variant={newMemory.family_members.includes(member) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleFamilyMember(member)}
                  >
                    {member}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddMemory} className="bg-pink-600 hover:bg-pink-700">
                <Heart size={16} className="mr-2" />
                Save Memory
              </Button>
              <Button variant="outline" onClick={() => setIsAddingMemory(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {memories.map((memory) => {
          const memoryType = getMemoryTypeInfo(memory.memory_type);
          return (
            <Card key={memory.id} className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                      <span className="text-lg">{memoryType.emoji}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{memory.title}</h4>
                      <p className="text-sm text-muted-foreground">by {memory.added_by}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(memory.memory_date).toLocaleDateString()}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {memoryType.label}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-foreground mb-3">{memory.content}</p>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {memory.emotion_tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs bg-pink-100 text-pink-800">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                  {memory.family_members.map((member) => (
                    <Badge key={member} variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                      <Users className="w-3 h-3 mr-1" />
                      {member}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {memories.length === 0 && !loading && (
          <Card className="text-center py-8 bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
            <CardContent>
              <Heart className="h-12 w-12 mx-auto text-pink-400 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Memories Yet</h3>
              <p className="text-muted-foreground mb-4">
                Start capturing your family's special moments and create lasting memories together.
              </p>
              <Button onClick={() => setIsAddingMemory(true)} className="bg-pink-600 hover:bg-pink-700">
                <Plus size={16} className="mr-2" />
                Add Your First Memory
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default FamilyMemoriesSection;
