import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useUsernameAvailability(username: string) {
  const [loading, setLoading] = useState(false);
  const [exists, setExists] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username || username.trim().length < 3) {
      setExists(null);
      setError(null);
      return;
    }

    let mounted = true;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase.rpc("username_available", { candidate: username });
        if (error) throw error;
        if (!mounted) return;
        const result = data as { exists: boolean };
        setExists(result.exists);
      } catch (err: any) {
        if (!mounted) return;
        console.error("Username check error", err);
        setError("Unable to check username");
        setExists(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }, 400); // debounce

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [username]);

  return { loading, exists, error };
}