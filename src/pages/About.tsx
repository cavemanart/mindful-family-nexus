import React from 'react';
import { Heart, Users, Target, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import HomeHeader from '@/components/HomeHeader';
import HomeFooter from '@/components/HomeFooter';

export default function About() {
  const navigate = useNavigate();

  const values = [
    {
      icon: Heart,
      title: "Family First",
      description: "We believe strong families are the foundation of thriving communities. Everything we build is designed to strengthen family bonds."
    },
    {
      icon: Users,
      title: "Inclusive Design", 
      description: "Our platform works for all family structures and sizes, from single parents to multi-generational households."
    },
    {
      icon: Target,
      title: "Simplicity",
      description: "Technology should make life easier, not more complicated. We focus on intuitive, stress-free solutions."
    },
    {
      icon: Shield,
      title: "Privacy & Trust",
      description: "Your family's data belongs to you. We're committed to the highest standards of privacy and security."
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
              About Hublie
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              We're on a mission to help families stay organized, connected, and thriving in our busy modern world.
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-foreground mb-6">Our Story</h2>
            </div>
            
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
              <p>
                Hublie was born from the real struggles of modern family life. As parents ourselves, we experienced 
                firsthand the challenge of keeping everyone organized, connected, and on the same page.
              </p>
              
              <p>
                Between work schedules, school activities, household chores, and family time, we found ourselves 
                juggling multiple apps, paper calendars, and sticky notes. Something had to give.
              </p>
              
              <p>
                That's when we realized what families really needed wasn't another productivity app designed for 
                individuals - it was a comprehensive platform built specifically for the unique dynamics of family life.
              </p>
              
              <p>
                Today, Hublie serves thousands of families worldwide, helping them reduce stress, improve communication, 
                and spend more quality time together. We're constantly evolving based on feedback from real families 
                like yours.
              </p>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Our Values</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              These core values guide everything we do at Hublie, from product development to customer support.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{value.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Built by Parents, for Parents</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our team understands the daily challenges of family life because we live them too. 
              We're parents, partners, and family members who are passionate about making family life better.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Join the Hublie Family
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Ready to transform your family's organization and connection? Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/auth")}>
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/features")}>
              Explore Features
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