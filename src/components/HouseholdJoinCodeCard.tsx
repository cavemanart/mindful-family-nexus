
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
  const [joinCode, setJoinCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateJoinCode = async () => {
    setLoading(true);
    setJoinCode(null);

    // Call the Supabase database function for join codes
    const { data, error } = await supabase.rpc("generate_household_join_code", {
      _household_id: householdId,
    });

    if (error) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
    } else {
      setJoinCode(data);
      toast({ title: "Join code created!", description: data });
    }
    setLoading(false);
  };

  const copyJoinCode = () => {
    if (joinCode) {
      navigator.clipboard.writeText(joinCode);
      toast({ title: "Copied", description: "Join code copied to clipboard." });
    }
  };

  return (
    <Card className="my-4">
      <CardHeader>
        <CardTitle>Invite a Child</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={generateJoinCode} disabled={loading}>
          {loading ? "Generating..." : "Generate Join Code"}
        </Button>
        {joinCode && (
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <span className="font-mono text-lg">{joinCode}</span>
            <Button size="icon" variant="ghost" onClick={copyJoinCode}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        )}
        <div className="text-xs text-muted-foreground mt-2">
          Share this code with your child. They can use it once to join your household, on any device. Code expires in 24 hours or after use.
        </div>
      </CardContent>
    </Card>
  );
}
