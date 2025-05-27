// /src/components/LeaveHouseholdButton.tsx
import { supabase } from "../lib/supabaseClient";

export const LeaveHouseholdButton = ({ userId, householdId }: { userId: string, householdId: string }) => {
  const handleLeave = async () => {
    // Check if the user is the last owner
    const { data, error } = await supabase
      .from("household_members")
      .select("*")
      .eq("household_id", householdId)
      .eq("role", "owner");

    if (error) {
      alert("Error checking owners.");
      return;
    }

    const otherOwners = data.filter((member) => member.user_id !== userId);
    if (otherOwners.length === 0) {
      alert("You're the last owner. Please assign another owner before leaving.");
      return;
    }

    // Proceed to delete
    const { error: deleteError } = await supabase
      .from("household_members")
      .delete()
      .eq("user_id", userId)
      .eq("household_id", householdId);

    if (deleteError) {
      alert("Failed to leave household.");
    } else {
      alert("You have left the household.");
      window.location.reload();
    }
  };

  return <button onClick={handleLeave}>Leave Household</button>;
};
