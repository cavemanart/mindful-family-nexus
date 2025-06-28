
import React, { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Bell, TestTube2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useNotificationPreferences } from "@/hooks/useNotificationPreferences";
import { pushNotificationService } from "@/lib/push-notifications";

export default function NotificationPreferencesCard() {
  const { prefs, loading, saving, error, upsertPreferences } = useNotificationPreferences();
  const [pushEnabled, setPushEnabled] = useState(false);
  const [isPushSupported, setIsPushSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

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

  // Handle push toggle: require permission and subscription
  const handlePushToggle = async (state: boolean) => {
    if (!isPushSupported) {
      toast.error("Push notifications are not supported in this browser.");
      return;
    }

    setIsSubscribing(true);
    
    try {
      if (state) {
        // Request permission
        const permission = await pushNotificationService.requestPermission();
        setPermission(permission);
        
        if (permission !== "granted") {
          toast.error("Permission denied for push notifications.");
          setIsSubscribing(false);
          return;
        }

        // Subscribe to push notifications
        const subscription = await pushNotificationService.subscribeToPushNotifications();
        if (!subscription) {
          toast.error("Failed to subscribe to push notifications.");
          setIsSubscribing(false);
          return;
        }

        toast.success("Successfully subscribed to push notifications!");
      }

      setPushEnabled(state);
      await upsertPreferences({ push_enabled: state });
      
    } catch (error) {
      console.error("Error handling push toggle:", error);
      toast.error("Failed to update push notification settings.");
    } finally {
      setIsSubscribing(false);
    }
  };

  // Test push notifications
  const handleTestNotification = async () => {
    if (!isPushSupported) {
      toast.error("Push notifications are not supported in this browser.");
      return;
    }

    if (!pushEnabled) {
      toast.error("Please enable push notifications first.");
      return;
    }

    setIsTesting(true);
    
    try {
      await pushNotificationService.testNotification();
      toast.success("Test notification sent! Check your notifications.");
    } catch (error) {
      console.error("Error sending test notification:", error);
      toast.error("Failed to send test notification.");
    } finally {
      setIsTesting(false);
    }
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
          Push Notifications
        </CardTitle>
        <CardDescription>
          Manage how you receive push notifications from the app. Get notified about chores, bills, family messages, and more.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Enable Push Notifications</Label>
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
            disabled={saving || isSubscribing || !isPushSupported || permission === "denied"}
          />
        </div>

        {pushEnabled && isPushSupported && (
          <div className="pt-4 border-t">
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Test Notifications</Label>
                <p className="text-xs text-muted-foreground mb-3">
                  Send a test notification to make sure everything is working correctly.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestNotification}
                disabled={isTesting || !pushEnabled}
                className="w-full"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Test...
                  </>
                ) : (
                  <>
                    <TestTube2 className="mr-2 h-4 w-4" />
                    Send Test Notification
                  </>
                )}
              </Button>
            </div>

            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <h4 className="text-sm font-medium mb-2">You'll receive notifications for:</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>🏠 Chore reminders and assignments</li>
                <li>💰 Upcoming bill due dates</li>
                <li>💬 New family messages</li>
                <li>📅 Calendar event reminders</li>
                <li>⭐ MVP of the day announcements</li>
              </ul>
            </div>
          </div>
        )}

        {error && (
          <div className="text-red-500 text-sm p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
