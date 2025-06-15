
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileHeaderProps {
  userProfile: any;
  firstName: string;
  lastName: string;
  getAvatarFallback: () => string;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  userProfile,
  firstName,
  lastName,
  getAvatarFallback,
}) => (
  <div className="text-center space-y-4">
    <Avatar className="h-24 w-24 mx-auto">
      <AvatarImage src={userProfile?.avatar_url || undefined} />
      <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
    </Avatar>
    <div>
      <h1 className="text-3xl font-bold">Profile Settings</h1>
      <p className="text-muted-foreground">
        Manage your account and household preferences
      </p>
    </div>
  </div>
);

export default ProfileHeader;
