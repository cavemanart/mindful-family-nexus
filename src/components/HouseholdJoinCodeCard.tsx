
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
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateCode = async () => {
    setLoading(true);
    setJoinCode(null);
    setExpiresAt(null);

    const { data, error } = await supabase.rpc("generate_household_join_code", {
      _household_id: householdId,
    });

    if (error) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
    } else {
      // Fetch code & expiry (lookup, since function returns only the code)
      const { data: codeRow } = await supabase
        .from("household_join_codes")
        .select("*")
        .eq("code", data)
        .maybeSingle();
      setJoinCode(data);
      setExpiresAt(codeRow?.expires_at || null);
      toast({ title: "Join code created!", description: data });
    }
    setLoading(false);
  };

  const copyCode = () => {
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
        <Button onClick={generateCode} disabled={loading}>
          {loading ? "Generating..." : "Generate Join Code"}
        </Button>
        {joinCode && (
          <div className="mt-4 flex items-center gap-2">
            <span className="font-mono">{joinCode}</span>
            <Button size="icon" variant="ghost" onClick={copyCode}>
              <Copy className="w-4 h-4" />
            </Button>
            <span className="text-xs text-muted-foreground">Expires: {new Date(expiresAt!).toLocaleTimeString()}</span>
          </div>
        )}
        <div className="text-xs text-muted-foreground mt-2">
          Give this code to your child for one-hour use, or until redeemed.
        </div>
      </CardContent>
    </Card>
  );
}
