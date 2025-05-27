
import React, { useState } from 'react';
import { Star, CheckCircle, Clock, Heart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useChores } from '@/hooks/useChores';
import { useFamilyMessages } from '@/hooks/useFamilyMessages';

interface ChildrenDashboardProps {
  selectedHousehold: { id: string } | null;
}

const ChildrenDashboard = ({ selectedHousehold }: ChildrenDashboardProps) => {
  const { chores, loading: choresLoading, toggleChore } = useChores(selectedHousehold?.id || null);
  const { messages, loading: messagesLoading } = useFamilyMessages(selectedHousehold?.id || null);
  
  const [selectedChild, setSelectedChild] = useState('Emma');
  const children = ['Emma', 'Jack'];
  
  const childChores = chores.filter(chore => chore.assigned_to === selectedChild);
  const childMessages = messages.filter(message => 
    message.to_member === selectedChild || message.to_member === null
  );

  const completedChores = childChores.filter(chore => chore.completed);
  const totalPoints = completedChores.reduce((sum, chore) => sum + chore.points, 0);

  const handleCompleteChore = async (choreId: string) => {
    await toggleChore(choreId);
  };

  const getRewardLevel = (points: number) => {
    if (points >= 50) return { level: 'Super Star', color: 'text-purple-600', icon: '🌟' };
    if (points >= 30) return { level: 'Champion', color: 'text-blue-600', icon: '🏆' };
    if (points >= 15) return { level: 'Helper', color: 'text-green-600', icon: '⭐' };
    return { level: 'Getting Started', color: 'text-gray-600', icon: '👍' };
  };

  const reward = getRewardLevel(totalPoints);

  if (choresLoading || messagesLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="animate-spin" size={24} />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Child Selector */}
      <div className="text-center py-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Kid's Dashboard 🎈
        </h2>
        <div className="flex justify-center gap-2">
          {children.map((child) => (
            <Button
              key={child}
              variant={selectedChild === child ? "default" : "outline"}
              onClick={() => setSelectedChild(child)}
              className={selectedChild === child ? "bg-purple-600 hover:bg-purple-700" : ""}
            >
              {child}
            </Button>
          ))}
        </div>
      </div>

      {/* Points and Rewards */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <Star className="text-yellow-600" size={24} />
            {selectedChild}'s Rewards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-3xl font-bold text-yellow-600">{totalPoints} Points</p>
              <p className="text-sm text-gray-600">This week</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">{reward.icon}</div>
              <Badge className={`${reward.color} font-semibold`}>
                {reward.level}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Next reward at 30 points</span>
              <span>{Math.max(0, 30 - totalPoints)} points to go!</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (totalPoints / 30) * 100)}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chores Section */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <CheckCircle className="text-green-500" size={24} />
          {selectedChild}'s Chores
        </h3>

        <div className="grid gap-4">
          {childChores.map((chore) => (
            <Card 
              key={chore.id} 
              className={`${
                chore.completed 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-blue-50 border-blue-200 hover:shadow-md transition-shadow'
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {!chore.completed && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCompleteChore(chore.id)}
                        className="text-blue-600 hover:bg-blue-100 mt-1"
                      >
                        <CheckCircle size={20} />
                      </Button>
                    )}
                    {chore.completed && (
                      <div className="text-green-600 mt-1">
                        <CheckCircle size={20} />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className={`font-semibold ${chore.completed ? 'text-green-800 line-through' : 'text-gray-800'}`}>
                        {chore.title}
                      </h4>
                      <p className={`text-sm mb-2 ${chore.completed ? 'text-green-600' : 'text-gray-600'}`}>
                        {chore.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          Due: {new Date(chore.due_date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star size={12} className="text-yellow-500" />
                          {chore.points} points
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={chore.completed ? "default" : "secondary"} className="text-xs">
                    {chore.completed ? 'Done!' : 'To Do'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Messages Section */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Heart className="text-pink-500" size={24} />
          Messages for {selectedChild}
        </h3>

        <div className="grid gap-4">
          {childMessages.map((message) => (
            <Card 
              key={message.id} 
              className={`${
                message.is_special 
                  ? 'bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.is_special ? 'bg-pink-100' : 'bg-gray-100'
                    }`}>
                      {message.is_special ? '💝' : '📝'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">From {message.from_member}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(message.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {message.is_special && (
                    <Badge className="bg-pink-100 text-pink-600">Special</Badge>
                  )}
                </div>
                <p className="text-gray-800">{message.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChildrenDashboard;
