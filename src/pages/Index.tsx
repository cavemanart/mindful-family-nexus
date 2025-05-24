
import React from 'react';
import { Plus, Heart, Receipt, Brain, Baby, Bell, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FamilyNotes from '@/components/FamilyNotes';
import Appreciations from '@/components/Appreciations';
import BillsTracker from '@/components/BillsTracker';
import MentalLoad from '@/components/MentalLoad';
import NannyMode from '@/components/NannyMode';
import WeeklySync from '@/components/WeeklySync';
import ChildrenDashboard from '@/components/ChildrenDashboard';

const Index = () => {
  const [activeSection, setActiveSection] = React.useState('dashboard');

  const quickActions = [
    { 
      icon: Heart, 
      label: 'Add Appreciation', 
      color: 'bg-pink-100 text-pink-600 hover:bg-pink-200',
      section: 'appreciations'
    },
    { 
      icon: Receipt, 
      label: 'Track Bill', 
      color: 'bg-green-100 text-green-600 hover:bg-green-200',
      section: 'bills'
    },
    { 
      icon: Brain, 
      label: 'Mental Load', 
      color: 'bg-purple-100 text-purple-600 hover:bg-purple-200',
      section: 'mental-load'
    },
    { 
      icon: Calendar, 
      label: 'Weekly Sync', 
      color: 'bg-blue-100 text-blue-600 hover:bg-blue-200',
      section: 'weekly-sync'
    },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'notes':
        return <FamilyNotes />;
      case 'appreciations':
        return <Appreciations />;
      case 'bills':
        return <BillsTracker />;
      case 'mental-load':
        return <MentalLoad />;
      case 'nanny':
        return <NannyMode />;
      case 'weekly-sync':
        return <WeeklySync />;
      case 'kids':
        return <ChildrenDashboard />;
      default:
        return (
          <div className="space-y-6">
            {/* Welcome Header */}
            <div className="text-center py-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                Welcome Home, Family! 🏠
              </h1>
              <p className="text-gray-600 text-lg">
                Your central hub for everything that matters
              </p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className={`h-24 flex flex-col gap-2 ${action.color} transition-all duration-200 hover:scale-105`}
                  onClick={() => setActiveSection(action.section)}
                >
                  <action.icon size={24} />
                  <span className="text-sm font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            {/* Overview Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Heart className="text-pink-500" size={20} />
                    Recent Appreciations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="p-3 bg-pink-50 rounded-lg">
                      <p className="text-sm text-gray-700">"Thanks for making breakfast! ❤️"</p>
                      <p className="text-xs text-gray-500 mt-1">From Mom to Dad</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full text-pink-600 hover:bg-pink-50"
                      onClick={() => setActiveSection('appreciations')}
                    >
                      View All
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="text-blue-500" size={20} />
                    Weekly Sync
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-700">3 wins shared this week</p>
                      <p className="text-xs text-gray-500 mt-1">2 goals in progress</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full text-blue-600 hover:bg-blue-50"
                      onClick={() => setActiveSection('weekly-sync')}
                    >
                      View Sync
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="text-purple-500" size={20} />
                    Kids Dashboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <p className="text-sm text-gray-700">Emma: 15 points earned</p>
                      <p className="text-xs text-gray-500 mt-1">Jack: 14 points earned</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full text-purple-600 hover:bg-purple-50"
                      onClick={() => setActiveSection('kids')}
                    >
                      View Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 
                className="text-xl font-bold text-gray-800 cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => setActiveSection('dashboard')}
              >
                Family Hub
              </h1>
              <div className="hidden md:flex space-x-6">
                {[
                  { key: 'dashboard', label: 'Dashboard' },
                  { key: 'notes', label: 'Notes' },
                  { key: 'appreciations', label: 'Appreciations' },
                  { key: 'bills', label: 'Bills' },
                  { key: 'mental-load', label: 'Mental Load' },
                  { key: 'weekly-sync', label: 'Weekly Sync' },
                  { key: 'kids', label: 'Kids Dashboard' },
                  { key: 'nanny', label: 'Nanny Mode' },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setActiveSection(item.key)}
                    className={`text-sm font-medium transition-colors ${
                      activeSection === item.key
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-gray-600">
              <Bell size={20} />
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
