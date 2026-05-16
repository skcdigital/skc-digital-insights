import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Read the current session from storage immediately (instant for fresh tokens, avoids
    // waiting on the INITIAL_SESSION event which can lag in supabase-js v2 when a refresh
    // is needed and the Supabase backend is cold-starting).
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    // Subscribe for sign-in / sign-out / token-refresh events going forward.
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

    // DB fallback — check user_roles table directly
    void (async () => {
      try {
        const { data: row } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();
        setIsAdmin(!!row);
      } catch {
        setIsAdmin(false);
      }
    })();
  }, [user, loading]);

  async function signOut() {
    await supabase.auth.signOut();
  }

  return { session, user, isAdmin, loading, signOut };
}
