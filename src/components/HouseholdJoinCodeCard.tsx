
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Copy } from "lucide-react";

// Helper for formatting date/time and relative expiry
function formatExpiration(expiresAtString: string | null): { formatted: string; relative: string } {
  if (!expiresAtString) return { formatted: "", relative: "" };
  const expiresAt = new Date(expiresAtString);
  const now = new Date();
  // Format: Jun 17, 2025, 3:45 PM
  const formatted =
    expiresAt.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) +
    ", " +
    expiresAt.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

  // Relative (e.g., "in 24 hours", "in N hours", etc.)
  const ms = expiresAt.getTime() - now.getTime();
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  let relative = "";
  if (ms <= 0) {
    relative = "Expired";
  } else if (hours > 0) {
    if (minutes > 0) {
      relative = `in ${hours}h ${minutes}m`;
    } else {
      relative = `in ${hours} hour${hours === 1 ? "" : "s"}`;
    }
  } else {
    relative = `in ${minutes} minute${minutes === 1 ? "" : "s"}`;
  }
  return { formatted, relative };
}

interface Props {
  householdId: string;
}

export default function HouseholdJoinCodeCard({ householdId }: Props) {
  const [joinCode, setJoinCode] = React.useState<string | null>(null);
  const [expiresAt, setExpiresAt] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
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

  const expiryInfo = expiresAt ? formatExpiration(expiresAt) : null;

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
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <span className="font-mono">{joinCode}</span>
            <Button size="icon" variant="ghost" onClick={copyCode}>
              <Copy className="w-4 h-4" />
            </Button>
            {expiresAt && (
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                Expires:&nbsp;
                <span title={expiryInfo?.formatted}>
                  {expiryInfo?.formatted} ({expiryInfo?.relative})
                </span>
              </span>
            )}
          </div>
        )}
        <div className="text-xs text-muted-foreground mt-2">
          Give this code to your child for 24-hour use, or until redeemed.
        </div>
      </CardContent>
    </Card>
  );
}
