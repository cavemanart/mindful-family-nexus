import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useHouseholds } from '@/hooks/useHouseholds';
import ChildPinLogin from './ChildPinLogin';
import { 
  Calendar, 
  CheckSquare, 
  MessageCircle, 
  Users, 
  Star,
  Shield,
  Smartphone,
  Clock,
  Heart,
  Zap
} from 'lucide-react';

export default function HomePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [showChildLogin, setShowChildLogin] = useState(false);
  const { households } = useHouseholds();
  
  // Get the first household for child login
  const firstHousehold = households?.[0];

  useEffect(() => {
    if (!loading && user) {
      console.log('🏠 User logged in, navigating to dashboard');
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
        <p className="text-lg font-semibold">Loading...</p>
      </div>
    );
  }

  if (showChildLogin && firstHousehold) {
    return (
      <ChildPinLogin 
        householdId={firstHousehold.id}
        onBack={() => setShowChildLogin(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 dark:from-background dark:to-muted/20">
      <header className="py-8">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div className="text-2xl font-bold">
            <span className="text-purple-600">Hub</span>lie
          </div>
          <nav>
            <ul className="flex items-center space-x-6">
              <li>
                <Button variant="ghost" onClick={() => navigate('/auth')}>
                  Login / Sign Up
                </Button>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-6 py-16">
        <section className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tight">
              Organize Your Family Life, Effortlessly
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Hublie is the all-in-one family management app designed to streamline your daily routines,
              enhance communication, and bring joy back to family life.
            </p>
          </div>
          <img
            src="/hero-image.png"
            alt="Hublie App Interface"
            className="rounded-xl shadow-lg mx-auto max-w-4xl"
          />
        </section>

        {/* Updated CTA Section */}
        <section className="text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">Ready to Get Started?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of families who have transformed their home organization with Hublie.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="flex-1"
            >
              Get Started Free
            </Button>
            
            {firstHousehold && (
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => setShowChildLogin(true)}
                className="flex-1"
              >
                👶 Kid's Login
              </Button>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground">
            No credit card required • Free 14-day trial
          </p>
        </section>

        <section className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-700 hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="text-blue-500" size={20} />
                  Shared Calendar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Keep everyone on the same page with a centralized family calendar.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-700 hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckSquare className="text-green-500" size={20} />
                  Chores & Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Assign chores, track progress, and make household responsibilities a breeze.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-700 hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="text-yellow-500" size={20} />
                  Family Messaging
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Stay connected with real-time messaging and share important updates instantly.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-700 hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="text-purple-500" size={20} />
                  Household Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Manage family members, roles, and permissions in one centralized place.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-pink-50 dark:bg-pink-950/30 border-pink-200 dark:border-pink-700 hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="text-pink-500" size={20} />
                  Rewards & Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Set goals, reward achievements, and motivate your family to reach new heights.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-700 hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="text-orange-500" size={20} />
                  Privacy & Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Ensure your family's data is safe and secure with advanced privacy controls.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="py-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-8">
            Why Choose Hublie?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-white dark:bg-gray-800 border-none shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-4">
                <Smartphone className="h-8 w-8 text-blue-500 mx-auto" />
                <h3 className="text-xl font-semibold text-center">Cross-Platform Access</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Access Hublie on any device, anywhere.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-none shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-4">
                <Clock className="h-8 w-8 text-green-500 mx-auto" />
                <h3 className="text-xl font-semibold text-center">Time-Saving Tools</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Streamline your daily routines and save valuable time.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-none shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-4">
                <Heart className="h-8 w-8 text-pink-500 mx-auto" />
                <h3 className="text-xl font-semibold text-center">Enhanced Communication</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Foster stronger family connections through seamless communication.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-none shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-4">
                <Zap className="h-8 w-8 text-yellow-500 mx-auto" />
                <h3 className="text-xl font-semibold text-center">Easy to Use</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Intuitive interface for all family members.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="py-6 bg-muted text-center text-muted-foreground">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Hublie. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
