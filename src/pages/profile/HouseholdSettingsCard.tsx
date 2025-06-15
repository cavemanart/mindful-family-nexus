
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Home, Shield } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Household {
  id: string;
  name: string;
  role: string;
}

interface HouseholdSettingsCardProps {
  selectedHousehold: Household | undefined;
  householdName: string;
  setHouseholdName: (v: string) => void;
  isAdminOrOwner: boolean;
  isUpdatingHousehold: boolean;
  handleUpdateHousehold: () => void;
}

const HouseholdSettingsCard: React.FC<HouseholdSettingsCardProps> = ({
  selectedHousehold,
  householdName,
  setHouseholdName,
  isAdminOrOwner,
  isUpdatingHousehold,
  handleUpdateHousehold,
}) => {
  if (!selectedHousehold) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Home className="h-5 w-5" />
          Household Settings
        </CardTitle>
        <CardDescription>
          Manage your current household settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="householdName">Household Name</Label>
          <Input
            id="householdName"
            value={householdName}
            onChange={(e) => setHouseholdName(e.target.value)}
            disabled={!isAdminOrOwner}
            placeholder="Enter household name"
          />
          {!isAdminOrOwner && (
            <p className="text-sm text-muted-foreground">
              Only household admins can change the household name
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Your Role in Household</Label>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span className="capitalize font-medium">
              {selectedHousehold.role}
            </span>
          </div>
        </div>
        {isAdminOrOwner && (
          <Button 
            onClick={handleUpdateHousehold}
            disabled={isUpdatingHousehold}
            className="w-full md:w-auto"
          >
            {isUpdatingHousehold ? "Updating..." : "Update Household"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default HouseholdSettingsCard;
