
import React from "react";

interface AddChildDialogProps {
  householdId: string;
  onChildAdded: () => Promise<void>;
  trigger: React.ReactElement;
}

// For this v2, there is no dialog; let the parent handle the join code flow.
// Optionally, inform parent on "add" attempt.
const AddChildDialog: React.FC<AddChildDialogProps> = ({
  householdId,
  onChildAdded,
  trigger
}) => {
  // Just render the trigger; this can be enhanced/connected later if needed
  return React.cloneElement(trigger, {
    onClick: onChildAdded
  });
};

export default AddChildDialog;
