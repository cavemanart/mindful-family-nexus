import { useEffect, useState, useCallback } from "react";

const SUPABASE_FUNCTIONS_URL = "https://gnuclticnlrlpkqhzrpa.supabase.co/functions/v1";

interface Result {
  loading: boolean;
  child: any | null;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useChildDeviceLogin(): Result {
  const [loading, setLoading] = useState(true);
  const [child, setChild] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const runCheck = useCallback(async () => {
    setLoading(true);
    setError(null);
    let deviceId: string | null = null;

    try {
      deviceId = localStorage.getItem("child_device_id");
    } catch (e) {
      console.error("❌ [useChildDeviceLogin] Could not access localStorage:", e);
    }
    console.log("🔎 [useChildDeviceLogin] Checking deviceId:", deviceId);
    if (deviceId) {
      try {
        // Use full URL for Supabase Edge Function
        const resp = await fetch(`${SUPABASE_FUNCTIONS_URL}/child-device-login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ device_id: deviceId }),
        });
        // If response is not JSON, attempt to handle error
        const contentType = resp.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          setChild(null);
          setError("Unexpected server response. Try again later.");
          setLoading(false);
          return;
        }
        const result = await resp.json();
        if (result.child) {
          setChild(result.child);
          setError(null);
          console.log("[useChildDeviceLogin] Login successful. Child:", result.child);
        } else if (result.error) {
          setChild(null);
          setError(result.error);
          console.warn("[useChildDeviceLogin] Server error:", result.error);
        } else {
          setChild(null);
          setError("No such child found.");
          console.warn("[useChildDeviceLogin] No such child found in DB.");
        }
      } catch (e: any) {
        setChild(null);
        setError(e.message || "Error fetching device status");
        console.error("[useChildDeviceLogin] Exception in fetch:", e);
      }
    } else {
      setChild(null);
      setError("Device ID not found. Please try rejoining or reset device ID.");
      console.error("[useChildDeviceLogin] Device ID is missing in localStorage.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    runCheck();
  }, [runCheck]);

  return { loading, child, error, refresh: runCheck };
}
