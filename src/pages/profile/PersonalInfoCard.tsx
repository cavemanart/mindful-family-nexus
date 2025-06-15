
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PersonalInfoCardProps {
  firstName: string;
  lastName: string;
  setFirstName: (v: string) => void;
  setLastName: (v: string) => void;
  user: any;
  userProfile: any;
  isUpdatingProfile: boolean;
  handleUpdateProfile: () => void;
  getRoleDisplay: (role?: string) => string;
}

const PersonalInfoCard: React.FC<PersonalInfoCardProps> = ({
  firstName,
  lastName,
  setFirstName,
  setLastName,
  user,
  userProfile,
  isUpdatingProfile,
  handleUpdateProfile,
  getRoleDisplay,
}) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <User className="h-5 w-5" />
        Personal Information
      </CardTitle>
      <CardDescription>
        Update your personal details and profile information
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Enter your first name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Enter your last name"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Email</Label>
        <Input value={user?.email || ""} disabled className="bg-muted" />
        <p className="text-sm text-muted-foreground">
          Email cannot be changed at this time
        </p>
      </div>
      <div className="space-y-2">
        <Label>Role</Label>
        <Input value={getRoleDisplay(userProfile?.role)} disabled className="bg-muted" />
      </div>
      <Button 
        onClick={handleUpdateProfile}
        disabled={isUpdatingProfile}
        className="w-full md:w-auto"
      >
        {isUpdatingProfile ? "Updating..." : "Update Profile"}
      </Button>
    </CardContent>
  </Card>
);

export default PersonalInfoCard;
