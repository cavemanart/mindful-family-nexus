
import { useEffect, useState, useCallback } from "react";

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
    const deviceId = localStorage.getItem("child_device_id");
    if (deviceId) {
      try {
        const resp = await fetch("/functions/v1/child-device-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ device_id: deviceId }),
        });
        const result = await resp.json();
        if (result.child) {
          setChild(result.child);
          setError(null);
        } else if (result.error) {
          setChild(null);
          setError(result.error);
        } else {
          setChild(null);
          setError("No such child found.");
        }
      } catch (e: any) {
        setChild(null);
        setError(e.message || "Error fetching device status");
      }
    } else {
      setChild(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    runCheck();
  }, [runCheck]);

  return { loading, child, error, refresh: runCheck };
}
