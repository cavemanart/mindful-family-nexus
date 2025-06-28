
import React, { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Bell, TestTube2, AlertCircle, CheckCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useNotificationPreferences } from "@/hooks/useNotificationPreferences";
import { pushNotificationService } from "@/lib/push-notifications";

export default function NotificationPreferencesCard() {
  const { prefs, loading, saving, error, upsertPreferences } = useNotificationPreferences();
  const [pushEnabled, setPushEnabled] = useState(false);
  const [isPushSupported, setIsPushSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<'unknown' | 'ready' | 'not_ready'>('unknown');

  // Check browser support and current permission
  useEffect(() => {
    const checkSupport = async () => {
      if ("Notification" in window) {
        setIsPushSupported(true);
        setPermission(Notification.permission);
        
        // Check if we have an active push setup
        if ('serviceWorker' in navigator && 'PushManager' in window) {
          try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            setNotificationStatus(subscription ? 'ready' : 'not_ready');
          } catch (error) {
            console.error('Error checking notification setup:', error);
            setNotificationStatus('not_ready');
          }
        }
      } else {
        setIsPushSupported(false);
        setPermission("unsupported");
      }
    };
    
    checkSupport();
  }, []);

  // Sync with backend preferences
  useEffect(() => {
    if (prefs) {
      setPushEnabled(prefs.push_enabled);
    }
  }, [prefs]);

  // Handle push toggle: require permission and setup
  const handlePushToggle = async (state: boolean) => {
    if (!isPushSupported) {
      toast.error("Push notifications are not supported in this browser.");
      return;
    }

    setIsSettingUp(true);
    
    try {
      if (state) {
        // Enabling notifications
        console.log('Setting up push notifications...');
        
        // Request permission first
        const permission = await pushNotificationService.requestPermission();
        setPermission(permission);
        
        if (permission !== "granted") {
          toast.error("Permission denied for push notifications. Please enable them in your browser settings.");
          setIsSettingUp(false);
          return;
        }

        // Set up push notifications
        const subscription = await pushNotificationService.subscribeToPushNotifications();
        if (!subscription) {
          toast.error("Failed to set up push notifications. Please try again.");
          setIsSettingUp(false);
          return;
        }

        setNotificationStatus('ready');
        toast.success("Push notifications are now enabled!");
      } else {
        // Disabling notifications
        console.log('Disabling push notifications...');
        
        const unsubscribed = await pushNotificationService.unsubscribeFromPushNotifications();
        if (unsubscribed) {
          setNotificationStatus('not_ready');
          toast.success("Push notifications have been disabled.");
        } else {
          toast.info("No active notifications found to disable.");
        }
      }

      // Update backend preferences
      setPushEnabled(state);
      const success = await upsertPreferences({ push_enabled: state });
      
      if (!success) {
        // Revert the UI state if backend update failed
        setPushEnabled(!state);
        toast.error("Failed to save notification preferences. Please try again.");
      }
      
    } catch (error) {
      console.error("Error handling push toggle:", error);
      
      let errorMessage = "Failed to update push notification settings.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      
      // Revert the UI state
      setPushEnabled(!state);
    } finally {
      setIsSettingUp(false);
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

    if (permission !== "granted") {
      toast.error("Please grant notification permission first.");
      return;
    }

    setIsTesting(true);
    
    try {
      await pushNotificationService.testNotification();
      toast.success("Test notification sent! Check your notifications.");
    } catch (error) {
      console.error("Error sending test notification:", error);
      
      let errorMessage = "Failed to send test notification.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsTesting(false);
    }
  };

  const getPermissionStatusDisplay = () => {
    switch (permission) {
      case "granted":
        return (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">Permission granted</span>
          </div>
        );
      case "denied":
        return (
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Permission denied - please enable in browser settings</span>
          </div>
        );
      case "default":
        return (
          <div className="flex items-center gap-2 text-yellow-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Permission not yet requested</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 text-gray-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Not supported in this browser</span>
          </div>
        );
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
          Get notified on your device about chores, bills, family messages, and more.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Enable Push Notifications</Label>
            <p className="text-sm text-muted-foreground">
              {isPushSupported
                ? "Receive push notifications on this device for important family updates."
                : "Push notifications are not available in your browser."}
            </p>
          </div>
          <Switch
            checked={pushEnabled}
            onCheckedChange={handlePushToggle}
            disabled={saving || isSettingUp || !isPushSupported}
          />
        </div>

        {isPushSupported && (
          <div className="space-y-3">
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Status</h4>
                {getPermissionStatusDisplay()}
                {notificationStatus !== 'unknown' && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Setup: {notificationStatus === 'ready' ? 'Complete' : 'Pending'}</span>
                  </div>
                )}
              </div>
            </div>

            {isSettingUp && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Setting up notifications...</span>
              </div>
            )}
          </div>
        )}

        {pushEnabled && isPushSupported && permission === "granted" && (
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
