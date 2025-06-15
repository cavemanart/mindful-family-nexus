
import React from "react";
import { Child } from "@/hooks/useChildren";

// Child account login by join code flow is now handled by /join-household page
interface ChildPinLoginProps {
  householdId: string;
  onLoginSuccess: (child: Child) => void;
  onBack: () => void;
}

// This component is now basically a placeholder for the new join experience.
// Instruct user to use the Join Household flow.
const ChildPinLogin: React.FC<ChildPinLoginProps> = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <h1 className="text-2xl font-bold mb-2">Kid's Login Moved</h1>
      <p className="mb-4 text-center">
        The PIN-based login is no longer available.<br />
        Please use the new <span className="font-semibold">"Join Household"</span> page to add a child.<br/>
        If you need to join, tap "Join Household" and enter the join code.
      </p>
    </div>
  );
};

export default ChildPinLogin;
