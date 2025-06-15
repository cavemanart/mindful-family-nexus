
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const avatarOptions = [
  { value: "child-1", emoji: "👶" },
  { value: "child-2", emoji: "🧒" },
  { value: "child-3", emoji: "👧" },
  { value: "child-4", emoji: "👦" },
  { value: "child-5", emoji: "🧑" },
];

export default function JoinHousehold() {
  const { toast } = useToast();
  const [joinCode, setJoinCode] = useState("");
  const [childName, setChildName] = useState("");
  const [avatar, setAvatar] = useState("child-1");
  const [submitting, setSubmitting] = useState(false);

  // Generate/store device id for auto-login (uuid)
  useEffect(() => {
    if (!localStorage.getItem("child_device_id")) {
      localStorage.setItem("child_device_id", crypto.randomUUID());
    }
  }, []);
  const deviceId = localStorage.getItem("child_device_id");

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { data, error } = await supabase.rpc("join_household_with_code", {
      _code: joinCode.trim(),
      _name: childName.trim(),
      _avatar_selection: avatar,
      _device_id: deviceId,
    });

    if (error) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Welcome to your family!" });
      window.location.href = "/dashboard";
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Join Household</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleJoin}>
            <Input
              placeholder="Enter 1-hour Join Code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              required
            />
            <Input
              placeholder="First Name"
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              required
            />
            <div className="flex gap-2">
              {avatarOptions.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setAvatar(o.value)}
                  className={`text-2xl p-2 border rounded ${avatar === o.value ? "bg-blue-100 border-blue-500" : "bg-white border-gray-200"}`}
                >
                  {o.emoji}
                </button>
              ))}
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (<Loader2 className="animate-spin w-4 h-4" />) : "Join Household"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
