
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useHouseholds } from '@/hooks/useHouseholds';
import { useChildSession } from '@/hooks/useChildSession';
import { Child } from '@/hooks/useChildren';
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
import HomeHeader from "./HomeHeader";
import HomeCTASection from "./HomeCTASection";
import HomeFeaturesSection from "./HomeFeaturesSection";
import HomeBenefitsSection from "./HomeBenefitsSection";
import HomeFooter from "./HomeFooter";

export default function HomePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { households } = useHouseholds();
  const { setActiveChild } = useChildSession();
  
  // Get the first household for child login
  const firstHousehold = households?.[0];

  useEffect(() => {
    if (!loading && user) {
      console.log("🏠 User logged in, navigating to dashboard");
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-lg font-semibold text-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <HomeHeader />

      <main className="container mx-auto px-6 py-16">
        <section className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tight text-foreground">
              The Ultimate Family Organization App for Busy Households
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Simplify your family life with Hublie's comprehensive household management platform. 
              Track chores, manage bills, share calendars, and keep everyone connected - all in one intuitive app.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-4 text-sm text-muted-foreground">
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">Family Calendar</span>
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">Chore Management</span>
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">Bill Tracking</span>
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">Family Messaging</span>
            </div>
          </div>
        </section>

        <HomeCTASection />
        <HomeFeaturesSection />
        <HomeBenefitsSection />
      </main>

      <HomeFooter />
    </div>
  );
}
