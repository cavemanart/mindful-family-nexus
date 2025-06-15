
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Copy } from "lucide-react";

interface Props {
  householdId: string;
}

export default function HouseholdJoinCodeCard({ householdId }: Props) {
  const [childPin, setChildPin] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generatePin = async () => {
    setLoading(true);
    setChildPin(null);

    const { data, error } = await supabase.rpc("generate_child_pin", {
      _household_id: householdId,
    });

    if (error) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
    } else {
      setChildPin(data);
      toast({ title: "PIN created!", description: data });
    }
    setLoading(false);
  };

  const copyPin = () => {
    if (childPin) {
      navigator.clipboard.writeText(childPin);
      toast({ title: "Copied", description: "Child PIN copied to clipboard." });
    }
  };

  return (
    <Card className="my-4">
      <CardHeader>
        <CardTitle>Invite a Child</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={generatePin} disabled={loading}>
          {loading ? "Generating..." : "Generate 4-digit PIN"}
        </Button>
        {childPin && (
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <span className="font-mono text-lg">{childPin}</span>
            <Button size="icon" variant="ghost" onClick={copyPin}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        )}
        <div className="text-xs text-muted-foreground mt-2">
          Share this PIN with your child. They can use it once, on any device. Permanent unless used.
        </div>
      </CardContent>
    </Card>
  );
}
