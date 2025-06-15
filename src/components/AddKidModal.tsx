
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import HouseholdJoinCodeCard from "@/components/HouseholdJoinCodeCard";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

interface AddKidModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  householdId: string;
}

const AddKidModal: React.FC<AddKidModalProps> = ({ open, onOpenChange, householdId }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5" /> Add a Child
        </DialogTitle>
        <DialogDescription>
          Generate a 24-hour join code below.<br />
          <span>
            Your child can join by going to <strong>hublie.app/join-household</strong> (or "Join Household" from the homepage) on their device and entering the code.<br />
            Once they join, their profile will appear here!
          </span>
        </DialogDescription>
      </DialogHeader>
      <HouseholdJoinCodeCard householdId={householdId} />
      <div className="flex justify-end mt-2">
        <DialogClose asChild>
          <Button variant="secondary">Close</Button>
        </DialogClose>
      </div>
    </DialogContent>
  </Dialog>
);

export default AddKidModal;
