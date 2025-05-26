import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, Clock, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import HouseholdSelector from '@/components/HouseholdSelector';
import { useAuth } from '@/hooks/useAuth';
import { useHouseholds, Household } from '@/hooks/useHouseholds';
// If you want to add appreciations, you can import your Appreciations component here

interface Chore {
  id: string;
  title: string;
  description: string;
  points: number;
  completed: boolean;
  dueDate: Date;
  assignedTo: string;
}

interface Note {
  id: string;
  message: string;
  from: string;
  createdAt: Date;
  isSpecial: boolean;
}

const Dashboard = () => {
  // Household onboarding state
  const { user } = useAuth();
  const { households, loading: householdsLoading } = useHouseholds();
  const [selectedHousehold, setSelectedHousehold] = useState<Household | null>(null);

  // Set the first household as selected if available and none is selected
  useEffect(() => {
    if (households.length > 0 && !selectedHousehold) {
      setSelectedHousehold(households[0]);
    }
  }, [households, selectedHousehold]);

  // Demo data for chores/notes (replace with your DB logic as needed)
  const [selectedChild, setSelectedChild] = useState('Emma');
  const [chores, setChores] = useState<Chore[]>([
    {
      id: '1',
      title: 'Clean Your Room',
      description: 'Make bed, organize toys, put clothes in hamper',
      points: 10,
      completed: false,
      dueDate: new Date('2024-01-20'),
      assignedTo: 'Emma',
    },
    {
      id: '2',
      title: 'Feed the Dog',
      description: 'Give Buddy his morning and evening meals',
      points: 5,
      completed: true,
      dueDate: new Date('2024-01-18'),
      assignedTo: 'Emma',
    },
    {
      id: '3',
      title: 'Take Out Trash',
      description: 'Empty trash cans and take bags to the curb',
      points: 8,
      completed: false,
      dueDate: new Date('2024-01-19'),
      assignedTo: 'Jack',
    },
    {
      id: '4',
      title: 'Help with Dishes',
      description: 'Load dishwasher after dinner',
      points: 6,
      completed: true,
      dueDate: new Date('2024-01-18'),
      assignedTo: 'Jack',
    },
  ]);

  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      message: 'Great job on your math test! We\'re so proud of you! 🎉',
      from: 'Mom',
      createdAt: new Date('2024-01-15'),
      isSpecial: true,
    },
    {
      id: '2',
      message: 'Don\'t forget to practice piano today',
      from: 'Dad',
      createdAt: new Date('2024-01-16'),
      isSpecial: false,
    },
    {
      id: '3',
      message: 'Thank you for helping your sister with homework ❤️',
      from: 'Mom',
      createdAt: new Date('2024-01-14'),
      isSpecial: true,
    },
  ]);

  const children = ['Emma', 'Jack'];
  const childChores = chores.filter(chore => chore.assignedTo === selectedChild);
  const childNotes = notes.filter(note => 
    note.message.toLowerCase().includes(selectedChild.toLowerCase()) || 
    selectedChild === 'Emma' && ['1', '3'].includes(note.id) ||
    selectedChild === 'Jack' && ['2'].includes(note.id)
  );
  const completedChores = childChores.filter(chore => chore.completed);
  const totalPoints = completedChores.reduce((sum, chore) => sum + chore.points, 0);

  const completeChore = (choreId: string) => {
    setChores(chores.map(chore =>
      chore.id === choreId ? { ...chore, completed: true } : chore
    ));
  };

  const getRewardLevel = (points: number) => {
    if (points >= 50) return { level: 'Super Star', color: 'text-purple-600', icon: '🌟' };
    if (points >= 30) return { level: 'Champion', color: 'text-blue-600', icon: '🏆' };
    if (points >= 15) return { level: 'Helper', color: 'text-green-600', icon: '⭐' };
    return { level: 'Getting Started', color: 'text-gray-600', icon: '👍' };
  };

  const reward = getRewardLevel(totalPoints);

  // Loading state
  if (householdsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If no user, show loading or login prompt
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to continue</p>
        </div>
      </div>
    );
  }

  // If no households or no selected household, show household selector
  if (households.length === 0 || !selectedHousehold) {
    return <HouseholdSelector onHouseholdSelect={setSelectedHousehold} />;
  }

  // Main dashboard content
  return (
    <div className="space-y-6">
      {/* Household Info & Change Button */}
      <div className="flex flex-col items-center py-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          {selectedHousehold.name}
        </h2>
        <p className="text-gray-600 mb-4">
          {selectedHousehold.description || 'Welcome to your family dashboard'}
        </p>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setSelectedHousehold(null)}
        >
          Change Household
        </Button>
      </div>

      {/* Child Selector */}
      <div className="text-center">
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
                        onClick={() => completeChore(chore.id)}
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
                          Due: {chore.dueDate.toLocaleDateString()}
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

      {/* Notes Section */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Heart className="text-pink-500" size={24} />
          Messages for {selectedChild}
        </h3>

        <div className="grid gap-4">
          {childNotes.map((note) => (
            <Card 
              key={note.id} 
              className={`${
                note.isSpecial 
                  ? 'bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      note.isSpecial ? 'bg-pink-100' : 'bg-gray-100'
                    }`}>
                      {note.isSpecial ? '💝' : '📝'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">From {note.from}</p>
                      <p className="text-xs text-gray-500">
                        {note.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {note.isSpecial && (
                    <Badge className="bg-pink-100 text-pink-600">Special</Badge>
                  )}
                </div>
                <p className="text-gray-800">{note.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
