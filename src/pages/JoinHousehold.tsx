
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useChildDeviceLogin } from "@/hooks/useChildDeviceLogin";

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
  const [postSuccessLoading, setPostSuccessLoading] = useState(false);

  // Check for device login after join
  const { child: deviceChild, loading: childLoginLoading, error: deviceLoginError, refresh: triggerDeviceLogin } = useChildDeviceLogin();

  // Generate/store device id for auto-login (uuid)
  useEffect(() => {
    if (!localStorage.getItem("child_device_id")) {
      localStorage.setItem("child_device_id", crypto.randomUUID());
    }
  }, []);
  const deviceId = localStorage.getItem("child_device_id");

  // If user is already logged in as a child on this device, redirect now
  useEffect(() => {
    if (!childLoginLoading && deviceChild) {
      window.location.href = "/dashboard";
    }
  }, [deviceChild, childLoginLoading]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // 1. Attempt join
    const { data, error } = await supabase.rpc("join_household_with_code", {
      _code: joinCode.trim(),
      _name: childName.trim(),
      _avatar_selection: avatar,
      _device_id: deviceId,
    });

    if (error) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
      setSubmitting(false);
      return;
    }

    toast({ title: "Success", description: "Welcome to your family! Finalizing login..." });

    // 2. After join, try device login to retrieve the new child profile
    setPostSuccessLoading(true);
    await triggerDeviceLogin();

    // Delay to guarantee state and db propagation (rare syncing issue)
    setTimeout(() => {
      setPostSuccessLoading(false);
      window.location.href = "/dashboard";
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Join Household</CardTitle>
        </CardHeader>
        <CardContent>
          {(submitting || postSuccessLoading || childLoginLoading) && (
            <div className="flex flex-col items-center justify-center mb-4 gap-2">
              <Loader2 className="animate-spin w-6 h-6 text-blue-500" />
              <div className="text-sm text-gray-500">
                {postSuccessLoading
                  ? "Logging you in as child…"
                  : submitting
                  ? "Submitting join code…"
                  : "Checking your session…"}
              </div>
            </div>
          )}
          {deviceLoginError && (
            <div className="text-red-600 bg-red-100 rounded p-2 text-center text-sm mb-3">
              {deviceLoginError}
            </div>
          )}
          {!deviceChild && !submitting && !postSuccessLoading && (
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
                    aria-label={`Avatar option ${o.emoji}`}
                  >
                    {o.emoji}
                  </button>
                ))}
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (<Loader2 className="animate-spin w-4 h-4" />) : "Join Household"}
              </Button>
            </form>
          )}
          {deviceChild && (
            <div className="text-center text-green-700 bg-green-100 rounded p-3 mt-4">
              You have already joined a family! Redirecting…
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
