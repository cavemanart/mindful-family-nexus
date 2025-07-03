import React from 'react';
import { Calendar, CheckSquare, MessageCircle, Users, Star, Shield, Clock, Heart, Target, Gift } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import HomeHeader from '@/components/HomeHeader';
import HomeFooter from '@/components/HomeFooter';

export default function Features() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Calendar,
      title: "Shared Family Calendar",
      description: "Keep everyone synchronized with a centralized calendar that shows all family events, appointments, and activities.",
      benefits: ["Color-coded events", "Mobile notifications", "Recurring event support", "Multiple view options"]
    },
    {
      icon: CheckSquare,
      title: "Smart Chore Management",
      description: "Assign tasks, track completion, and reward achievements with our gamified chore system.",
      benefits: ["Age-appropriate task assignment", "Points and rewards system", "Progress tracking", "Automated reminders"]
    },
    {
      icon: MessageCircle,
      title: "Family Communication Hub",
      description: "Stay connected with dedicated family messaging, announcements, and note sharing.",
      benefits: ["Private family messaging", "Important announcements", "Shared note boards", "Photo sharing"]
    },
    {
      icon: Users,
      title: "Multi-User Household Management",
      description: "Manage different family members with role-based permissions and personalized dashboards.",
      benefits: ["Parent and child accounts", "Individual profiles", "Role-based access", "Activity tracking"]
    },
    {
      icon: Star,
      title: "Rewards & Goal Setting",
      description: "Motivate your family with customizable rewards, goals, and achievement tracking.",
      benefits: ["Custom reward catalog", "Goal setting tools", "Progress visualization", "Achievement badges"]
    },
    {
      icon: Shield,
      title: "Privacy & Security",
      description: "Your family's data is protected with enterprise-grade security and privacy controls.",
      benefits: ["End-to-end encryption", "Secure data storage", "Privacy controls", "COPPA compliant"]
    },
    {
      icon: Clock,
      title: "Bill & Expense Tracking",
      description: "Never miss a payment with automated bill reminders and family expense tracking.",
      benefits: ["Bill due date alerts", "Expense categorization", "Payment history", "Budget tracking"]
    },
    {
      icon: Heart,
      title: "Family Memory Keeper",
      description: "Capture and preserve special family moments and memories in your digital family journal.",
      benefits: ["Photo galleries", "Memory timeline", "Special moments", "Family milestones"]
    },
    {
      icon: Target,
      title: "Weekly Family Sync",
      description: "Plan ahead and celebrate wins with weekly family planning and reflection sessions.",
      benefits: ["Weekly goal setting", "Win celebrations", "Family meetings", "Progress reviews"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <HomeHeader />
      
      <main className="container mx-auto px-6 py-16">
        {/* Hero Section */}
        <section className="text-center space-y-8 mb-16">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              Powerful Features for Modern Families
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Discover how Hublie's comprehensive feature set can transform your family's organization, 
              communication, and daily routine management.
            </p>
          </div>
          <Button size="lg" onClick={() => navigate("/auth")} className="mt-8">
            Start Your Free Trial
          </Button>
        </section>

        {/* Features Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card key={index} className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </section>

        {/* CTA Section */}
        <section className="text-center bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Get Organized?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of families who have transformed their home organization with Hublie's powerful features.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/auth")}>
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/pricing")}>
              View Pricing
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </section>
      </main>

      <HomeFooter />
    </div>
  );
}