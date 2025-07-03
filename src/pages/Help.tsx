import React, { useState } from 'react';
import { Search, ChevronDown, ChevronRight, MessageCircle, Mail } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useNavigate } from 'react-router-dom';
import HomeHeader from '@/components/HomeHeader';
import HomeFooter from '@/components/HomeFooter';

export default function Help() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const faqCategories = [
    {
      title: "Getting Started",
      faqs: [
        {
          question: "How do I create my first household?",
          answer: "After signing up, you'll be guided through creating your household. Simply enter your family name and add family members by generating join codes or PINs for children."
        },
        {
          question: "How do I add family members?",
          answer: "Go to your household settings and generate join codes for adults or PINs for children. Family members can use these codes to join your household."
        },
        {
          question: "Is Hublie free to use?",
          answer: "Hublie offers a 14-day free trial with full access to all features. After the trial, you can choose from our affordable subscription plans or continue with limited free features."
        }
      ]
    },
    {
      title: "Family Organization",
      faqs: [
        {
          question: "How do I assign chores to my children?",
          answer: "Navigate to the Chores section, click 'Add Chore', fill in the details, assign it to a family member, and set the point value. Children can complete chores and earn points for rewards."
        },
        {
          question: "Can I set up recurring chores?",
          answer: "Yes! When creating a chore, you can set it to repeat daily, weekly, or monthly. The system will automatically create new instances based on your schedule."
        },
        {
          question: "How does the points and rewards system work?",
          answer: "Children earn points by completing chores and tasks. Parents can create custom rewards that children can redeem using their earned points, encouraging positive behavior."
        }
      ]
    },
    {
      title: "Calendar & Scheduling",
      faqs: [
        {
          question: "How do I add events to the family calendar?",
          answer: "Click the '+' button on the calendar or use the quick add feature. You can create events, assign them to specific family members, and set reminders."
        },
        {
          question: "Can I sync with other calendars?",
          answer: "Currently, Hublie maintains its own family calendar system. We're working on calendar sync features for future updates."
        },
        {
          question: "How do I set up recurring events?",
          answer: "When creating an event, look for the 'Repeat' option. You can set events to repeat daily, weekly, monthly, or create custom patterns."
        }
      ]
    },
    {
      title: "Account & Privacy",
      faqs: [
        {
          question: "Is my family's data secure?",
          answer: "Absolutely. We use enterprise-grade encryption and security measures. Your family data is private and never shared with third parties."
        },
        {
          question: "Can I delete my account and data?",
          answer: "Yes, you can delete your account and all associated data at any time from your account settings. This action is permanent and cannot be undone."
        },
        {
          question: "How do I change my subscription plan?",
          answer: "Go to your account settings and click on 'Subscription'. You can upgrade, downgrade, or cancel your subscription at any time."
        }
      ]
    }
  ];

  const filteredFaqs = faqCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(
      faq =>
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0);

  return (
    <div className="min-h-screen bg-background">
      <HomeHeader />
      
      <main className="container mx-auto px-6 py-16">
        {/* Hero Section */}
        <section className="text-center space-y-8 mb-16">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              Help & Support
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Find answers to common questions and get the help you need to make the most of Hublie.
            </p>
          </div>
          
          {/* Search */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search help articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
              <p className="text-muted-foreground">
                Can't find what you're looking for? Contact our support team below.
              </p>
            </div>
            
            <div className="space-y-6">
              {filteredFaqs.map((category, categoryIndex) => (
                <Card key={categoryIndex}>
                  <CardHeader>
                    <CardTitle className="text-xl">{category.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {category.faqs.map((faq, faqIndex) => (
                      <Collapsible key={faqIndex}>
                        <CollapsibleTrigger className="flex items-center justify-between w-full text-left p-4 hover:bg-muted/50 rounded-lg transition-colors">
                          <span className="font-medium">{faq.question}</span>
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="px-4 pb-4">
                          <p className="text-muted-foreground">{faq.answer}</p>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {filteredFaqs.length === 0 && searchTerm && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No results found for "{searchTerm}". Try a different search term or contact support.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Contact Support */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-4">Still Need Help?</h2>
              <p className="text-muted-foreground">
                Our support team is here to help you get the most out of Hublie.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto p-3 bg-primary/10 rounded-lg w-fit mb-4">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Email Support</CardTitle>
                  <CardDescription>
                    Get detailed help via email. We typically respond within 24 hours.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Send Email
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto p-3 bg-primary/10 rounded-lg w-fit mb-4">
                    <MessageCircle className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Live Chat</CardTitle>
                  <CardDescription>
                    Chat with our support team in real-time during business hours.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    Start Chat
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start organizing your family life today with our comprehensive family management platform.
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