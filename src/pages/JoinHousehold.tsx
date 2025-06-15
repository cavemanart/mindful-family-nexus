import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RefreshCw } from "lucide-react";
import { useChildDeviceLogin } from "@/hooks/useChildDeviceLogin";

const avatarOptions = [
  { value: "child-1", emoji: "👶" },
  { value: "child-2", emoji: "🧒" },
  { value: "child-3", emoji: "👧" },
  { value: "child-4", emoji: "👦" },
  { value: "child-5", emoji: "🧑" },
];

function getOrSetDeviceId() {
  let deviceId = null;
  try {
    deviceId = localStorage.getItem("child_device_id");
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem("child_device_id", deviceId);
      console.log("Generated new device_id and stored in localStorage:", deviceId);
    } else {
      console.log("Found device_id in localStorage:", deviceId);
    }
  } catch (e) {
    console.warn("Failed to access localStorage for device_id:", e);
  }
  return deviceId;
}

export default function JoinHousehold() {
  const { toast } = useToast();
  const [joinCode, setJoinCode] = useState("");
  const [childName, setChildName] = useState("");
  const [avatar, setAvatar] = useState("child-1");
  const [submitting, setSubmitting] = useState(false);
  const [postSuccessLoading, setPostSuccessLoading] = useState(false);

  const [recoveryTriggered, setRecoveryTriggered] = useState(false);
  // Use effect to guarantee deviceId is set on mount
  useEffect(() => {
    const did = getOrSetDeviceId();
    // Could be null due to browser storage issues
    if (!did) {
      toast({
        title: "Storage Error",
        description: "Unable to set a device ID. Make sure your browser is not in private mode.",
        variant: "destructive"
      });
    }
  }, []);

  const deviceId = getOrSetDeviceId();

  // See if user already logged in as child on device
  const { child: deviceChild, loading: childLoginLoading, error: deviceLoginError, refresh: triggerDeviceLogin } = useChildDeviceLogin();

  // Redirect if child login is successful
  useEffect(() => {
    if (!childLoginLoading && deviceChild) {
      window.location.href = "/dashboard";
    }
  }, [deviceChild, childLoginLoading]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Log join attempt parameters
    console.log("🔑 Attempting join with code:", joinCode, "name:", childName, "avatar:", avatar, "deviceId:", deviceId);

    if (!deviceId) {
      toast({ title: "Device Error", description: "Could not find or create a device ID. Try reloading the page." });
      setSubmitting(false);
      return;
    }

    // Call join with join code
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

    // After join, reload device child profile
    setPostSuccessLoading(true);
    await triggerDeviceLogin();

    setTimeout(() => {
      setPostSuccessLoading(false);
      window.location.href = "/dashboard";
    }, 1000);
  };

  // Handler to recover by regenerating device id (for rare edge case)
  const manualDeviceIdReset = () => {
    try {
      localStorage.removeItem("child_device_id");
      const newId = crypto.randomUUID();
      localStorage.setItem("child_device_id", newId);
      setRecoveryTriggered(true);
      toast({
        title: "Device ID Reset",
        description: "A new device ID was issued. Try joining again."
      });
      window.location.reload();
    } catch (e) {
      toast({ title: "Failed", description: `Could not regenerate device ID: ${String(e)}` });
    }
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
                  ? "Submitting your code…"
                  : "Checking your session…"}
              </div>
            </div>
          )}
          {deviceLoginError && (
            <div className="text-red-600 bg-red-100 rounded p-2 text-center text-sm mb-3">
              {deviceLoginError}
              {deviceLoginError?.includes("No such child") && (
                <div className="mt-2 flex flex-col items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={manualDeviceIdReset}
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Regenerate Device ID &amp; Retry
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    If you recently joined, it's possible your device ID changed or was lost.<br />
                    Try to join again or reset device ID above.
                  </span>
                </div>
              )}
            </div>
          )}
          {!deviceChild && !submitting && !postSuccessLoading && (
            <form className="space-y-4" onSubmit={handleJoin}>
              <Input
                placeholder="Enter Join Code (e.g. Blue-Sun-42)"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                required
                autoCapitalize="characters"
                spellCheck={false}
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
          {!deviceChild && (
            <div className="text-xs text-muted-foreground mt-4">
              Ask your parent for a <span className="font-semibold">Join Code</span>.<br />
              Enter your code, name, and choose an avatar to join the household.<br />
              Codes are one-time use only and expire after 24 hours.
            </div>
          )}
          <div className="mt-4 text-xs text-muted-foreground">
            <b>Debug Info:</b>
            <div>
              Device ID: <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded">{deviceId || "N/A"}</span>
            </div>
            <div>
              Recovery Triggered: <span className="font-mono">{String(recoveryTriggered)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
