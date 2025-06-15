
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AccountActionsCardProps {
  safeAuth: any;
  handleLogout: () => void;
}

const AccountActionsCard: React.FC<AccountActionsCardProps> = ({
  safeAuth,
  handleLogout,
}) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <User className="h-5 w-5" />
        Account Actions
      </CardTitle>
      <CardDescription>
        General account options
      </CardDescription>
    </CardHeader>
    <CardContent>
      <Button 
        variant="destructive"
        onClick={handleLogout}
        className="w-full"
      >
        {safeAuth.isChildMode ? "Switch User" : "Sign Out"}
      </Button>
    </CardContent>
  </Card>
);

export default AccountActionsCard;
