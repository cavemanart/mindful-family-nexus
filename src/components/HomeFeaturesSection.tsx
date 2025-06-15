
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  CheckSquare,
  MessageCircle,
  Users,
  Star,
  Shield,
} from "lucide-react";

const HomeFeaturesSection: React.FC = () => (
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
);

export default HomeFeaturesSection;
