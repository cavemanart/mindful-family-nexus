
import { useEffect, useState } from "react";

interface Result {
  loading: boolean;
  child: any | null;
  error: string | null;
}

export function useChildDeviceLogin() {
  const [loading, setLoading] = useState(true);
  const [child, setChild] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function check() {
      setLoading(true);
      const deviceId = localStorage.getItem("child_device_id");
      if (deviceId) {
        try {
          const resp = await fetch("/functions/v1/child-device-login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ device_id: deviceId }),
          });
          const result = await resp.json();
          if (result.child) setChild(result.child);
          else setChild(null);
        } catch (e: any) {
          setError(e.message || "Error fetching device status");
        }
      }
      setLoading(false);
    }
    check();
  }, []);

  return { loading, child, error };
}
