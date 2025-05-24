
import React, { useState } from 'react';
import { Heart, Plus, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface Appreciation {
  id: string;
  message: string;
  from: string;
  to: string;
  createdAt: Date;
  reactions: number;
}

const Appreciations = () => {
  const [appreciations, setAppreciations] = useState<Appreciation[]>([
    {
      id: '1',
      message: 'Thank you for making breakfast this morning! The pancakes were amazing! ❤️',
      from: 'Emma',
      to: 'Mom',
      createdAt: new Date('2024-01-15'),
      reactions: 3,
    },
    {
      id: '2',
      message: 'I really appreciate you helping me with my homework yesterday. You\'re the best dad!',
      from: 'Jack',
      to: 'Dad',
      createdAt: new Date('2024-01-14'),
      reactions: 5,
    },
    {
      id: '3',
      message: 'Thanks for taking care of the kids while I was sick. You\'re amazing! 💕',
      from: 'Mom',
      to: 'Dad',
      createdAt: new Date('2024-01-13'),
      reactions: 2,
    },
  ]);

  const [isAddingAppreciation, setIsAddingAppreciation] = useState(false);
  const [newAppreciation, setNewAppreciation] = useState({
    message: '',
    from: '',
    to: '',
  });

  const familyMembers = ['Mom', 'Dad', 'Emma', 'Jack'];

  const addAppreciation = () => {
    if (newAppreciation.message.trim() && newAppreciation.from && newAppreciation.to) {
      const appreciation: Appreciation = {
        id: Date.now().toString(),
        message: newAppreciation.message,
        from: newAppreciation.from,
        to: newAppreciation.to,
        createdAt: new Date(),
        reactions: 0,
      };
      setAppreciations([appreciation, ...appreciations]);
      setNewAppreciation({ message: '', from: '', to: '' });
      setIsAddingAppreciation(false);
    }
  };

  const addReaction = (id: string) => {
    setAppreciations(appreciations.map(appreciation =>
      appreciation.id === id 
        ? { ...appreciation, reactions: appreciation.reactions + 1 }
        : appreciation
    ));
  };

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Heart className="text-pink-500" size={28} />
            Family Appreciations
          </h2>
          <p className="text-gray-600 mt-1">Share love and gratitude with your family</p>
        </div>
        <Button 
          onClick={() => setIsAddingAppreciation(true)} 
          className="bg-pink-600 hover:bg-pink-700"
        >
          <Plus size={16} className="mr-2" />
          Add Appreciation
        </Button>
      </div>

      {isAddingAppreciation && (
        <Card className="border-2 border-dashed border-pink-300 bg-gradient-to-r from-pink-50 to-purple-50">
          <CardHeader>
            <CardTitle className="text-pink-800">Share an Appreciation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">From</label>
                <Select value={newAppreciation.from} onValueChange={(value) => 
                  setNewAppreciation({ ...newAppreciation, from: value })
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select who's giving appreciation" />
                  </SelectTrigger>
                  <SelectContent>
                    {familyMembers.map((member) => (
                      <SelectItem key={member} value={member}>{member}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">To</label>
                <Select value={newAppreciation.to} onValueChange={(value) => 
                  setNewAppreciation({ ...newAppreciation, to: value })
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select who's receiving appreciation" />
                  </SelectTrigger>
                  <SelectContent>
                    {familyMembers.filter(member => member !== newAppreciation.from).map((member) => (
                      <SelectItem key={member} value={member}>{member}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Message</label>
              <Textarea
                placeholder="Share what you appreciate about this person..."
                value={newAppreciation.message}
                onChange={(e) => setNewAppreciation({ ...newAppreciation, message: e.target.value })}
                rows={3}
                className="resize-none"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={addAppreciation} className="bg-pink-600 hover:bg-pink-700">
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
          <Card 
            key={appreciation.id} 
            className={`bg-gradient-to-r ${getRandomColor()} border-0 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1`}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <User size={20} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{appreciation.from}</p>
                    <p className="text-sm text-gray-600">to {appreciation.to}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {appreciation.createdAt.toLocaleDateString()}
                </Badge>
              </div>
              
              <p className="text-gray-800 mb-4 leading-relaxed">{appreciation.message}</p>
              
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addReaction(appreciation.id)}
                  className="text-pink-600 hover:bg-white/50 transition-colors"
                >
                  <Heart size={16} className="mr-2" />
                  {appreciation.reactions} Love{appreciation.reactions !== 1 ? 's' : ''}
                </Button>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">
                    {appreciation.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {appreciations.length === 0 && (
        <div className="text-center py-12">
          <Heart size={48} className="text-pink-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No appreciations yet!</p>
          <p className="text-gray-400 text-sm mt-2">Start spreading love by sharing your first appreciation.</p>
        </div>
      )}
    </div>
  );
};

export default Appreciations;
