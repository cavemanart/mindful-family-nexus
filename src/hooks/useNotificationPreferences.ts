
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type NotificationPreferences = {
  id: string;
  user_id: string;
  push_enabled: boolean;
  email_enabled: boolean;
  updated_at: string;
  created_at: string;
};

export const useNotificationPreferences = () => {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPreferences = async () => {
    if (!user) {
      setPrefs(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      setError("Failed to load notification preferences.");
      toast.error("Failed to load notification preferences.");
      setPrefs(null);
    } else {
      setPrefs(data || null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPreferences();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const upsertPreferences = async (prefsUpdate: Partial<NotificationPreferences>) => {
    if (!user) return false;
    setSaving(true);
    setError(null);

    try {
      let result;
      // If record exists: update, else: insert
      if (prefs && prefs.id) {
        result = await supabase
          .from("notification_preferences")
          .update({ ...prefsUpdate, updated_at: new Date().toISOString() })
          .eq("id", prefs.id)
          .select()
          .maybeSingle();
      } else {
        result = await supabase
          .from("notification_preferences")
          .insert({
            user_id: user.id,
            ...prefsUpdate,
            updated_at: new Date().toISOString(),
          })
          .select()
          .maybeSingle();
      }

      if (result.error) {
        setError(result.error.message);
        toast.error("Could not update preferences: " + result.error.message);
        return false;
      }
      setPrefs(result.data || null);
      toast.success("Notification preferences updated.");
      return true;
    } catch (e: any) {
      setError(e.message);
      toast.error("Could not update preferences: " + e.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    prefs,
    loading,
    saving,
    error,
    fetchPreferences,
    upsertPreferences,
  };
};
