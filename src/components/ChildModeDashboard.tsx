
import React from "react";
import { useChildDeviceLogin } from "@/hooks/useChildDeviceLogin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const ChildModeDashboard: React.FC = () => {
  const { child, loading, error } = useChildDeviceLogin();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-blue-400 w-10 h-10" />
        <div className="mt-3 text-muted-foreground">Loading your dashboard…</div>
      </div>
    );
  }
  if (error || !child) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-red-700">{error || "Could not find your child account (device issue)."}</div>
            <div className="text-muted-foreground mt-2">Try joining your household again using a valid Join Code.</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Welcome screen for device-based child account
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>
            Hi {child.first_name}! 🎈
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-lg mb-2">
            Welcome to your Family Dashboard.
          </div>
          <div className="text-muted-foreground">
            (This is a device-linked child account, so only you'll see this dashboard on this device.)
          </div>
          <div className="mt-4">
            <div className="font-semibold text-blue-700">Your Profile</div>
            <div>
              <div><strong>Name:</strong> {child.first_name}</div>
              <div><strong>Avatar:</strong> {child.avatar_selection}</div>
              {child.household_id && <div><strong>Household ID:</strong> {child.household_id}</div>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChildModeDashboard;
