// /src/hooks/useHouseholds.tsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export function useHouseholds(userId: string | undefined) {
  const [households, setHouseholds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchHouseholds = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("household_members")
        .select("household:household_id(*), role, joined_at")
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching households", error);
      } else {
        setHouseholds(data);
      }
      setLoading(false);
    };

    fetchHouseholds();
  }, [userId]);

  return { households, loading };
}
