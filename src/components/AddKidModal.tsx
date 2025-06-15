
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
          Generate a one-hour join code below and have your child use it on their device to join this household. You'll see them appear here as soon as they join!
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
