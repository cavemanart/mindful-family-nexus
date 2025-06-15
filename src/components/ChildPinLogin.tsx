
import React from "react";
import { Child } from "@/hooks/useChildren";

// Child account login by join code flow is now handled by /join-household page
interface ChildPinLoginProps {
  householdId: string;
  onLoginSuccess: (child: Child) => void;
  onBack: () => void;
}

// This component is now a placeholder for the join code experience.
// Instruct user to use the Join Household flow.
const ChildPinLogin: React.FC<ChildPinLoginProps> = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <h1 className="text-2xl font-bold mb-2">Kid Registration</h1>
      <p className="mb-4 text-center">
        The old PIN-based login has been replaced.<br />
        Please use the new <span className="font-semibold">"Join Household"</span> page with your<br/>
        <span className="font-bold">Join Code</span>.<br />
        Ask your parent or guardian for a code. One-time use, expires in 24 hours!
      </p>
    </div>
  );
};

export default ChildPinLogin;
