
import React, { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Loader2, Bell } from "lucide-react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useNotificationPreferences } from "@/hooks/useNotificationPreferences";

export default function NotificationPreferencesCard() {
  const { prefs, loading, saving, error, upsertPreferences } = useNotificationPreferences();
  const [pushEnabled, setPushEnabled] = useState(false);
  const [isPushSupported, setIsPushSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");

  // Check browser support and current permission
  useEffect(() => {
    if ("Notification" in window) {
      setIsPushSupported(true);
      setPermission(Notification.permission);
    } else {
      setIsPushSupported(false);
      setPermission("unsupported");
    }
  }, []);

  // Sync with backend
  useEffect(() => {
    if (prefs) {
      setPushEnabled(prefs.push_enabled);
    }
  }, [prefs]);

  // Handle push toggle: require permission
  const handlePushToggle = async (state: boolean) => {
    if (!isPushSupported) {
      toast.error("Push notifications are not supported in this browser.");
      return;
    }
    if (Notification.permission === "default") {
      // Prompt for permission
      try {
        const result = await Notification.requestPermission();
        setPermission(result);
        if (result !== "granted") {
          toast.error("Permission denied for push notifications.");
          return;
        }
      } catch {
        toast.error("Could not request notification permission.");
        return;
      }
    }
    setPushEnabled(state);
    await upsertPreferences({ push_enabled: state });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Loading your notification preferences...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin h-6 w-6" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifications
        </CardTitle>
        <CardDescription>
          Manage how you receive push notifications from the app.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Push Notifications</Label>
            <p className="text-sm text-muted-foreground">
              {isPushSupported
                ? permission === "granted"
                  ? "You will receive push notifications on this device."
                  : "Enable push notifications for alerts on this device."
                : "Push notifications are not available in your browser."}
            </p>
          </div>
          <Switch
            checked={pushEnabled}
            onCheckedChange={handlePushToggle}
            disabled={saving || !isPushSupported || permission === "denied"}
          />
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
      </CardContent>
    </Card>
  );
}
