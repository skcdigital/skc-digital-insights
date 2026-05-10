import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChange fires immediately with INITIAL_SESSION (reads in-memory or localStorage).
    // This is the single reliable source of truth for the current session.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return; // wait until auth state is known

    if (!user) {
      setIsAdmin(false);
      return;
    }

    // Build-time whitelist — instant, no network
    const whitelist = (import.meta.env.VITE_ADMIN_EMAILS ?? "")
      .split(",")
      .map((e: string) => e.trim().toLowerCase())
      .filter(Boolean);
    if (user.email && whitelist.includes(user.email.toLowerCase())) {
      setIsAdmin(true);
      return;
    }

    // DB fallback
    supabase
      .rpc("is_admin")
      .then(({ data, error }) => {
        if (error) {
          return supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id)
            .eq("role", "admin")
            .maybeSingle()
            .then(({ data: row }) => setIsAdmin(!!row));
        }
        setIsAdmin(data === true);
      })
      .catch(() => setIsAdmin(false));
  }, [user, loading]);

  async function signOut() {
    await supabase.auth.signOut();
  }

  return { session, user, isAdmin, loading, signOut };
}
