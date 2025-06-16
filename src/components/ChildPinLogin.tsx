
import React from "react";
import { Child } from "@/hooks/useChildren";

// Child account login is now handled through the main Auth page
// Join household functionality is available in UserProfile component
interface ChildPinLoginProps {
  householdId: string;
  onLoginSuccess: (child: Child) => void;
  onBack: () => void;
}

// This component is now obsolete - redirecting users to proper flow
const ChildPinLogin: React.FC<ChildPinLoginProps> = ({ onBack }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <h1 className="text-2xl font-bold mb-4">Child Account Access</h1>
      <div className="max-w-md space-y-4">
        <p className="text-gray-600">
          Child accounts are now created through the main sign-up page.
        </p>
        <p className="text-gray-600">
          To join a household, create your account first, then use the "Join Household" feature from your profile with an invite code from a parent or guardian.
        </p>
        <button 
          onClick={onBack}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default ChildPinLogin;
