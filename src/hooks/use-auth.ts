import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChange fires immediately with INITIAL_SESSION — use it to resolve loading fast
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });
    // getSession as a fallback in case onAuthStateChange is slow
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }

    // Build-time whitelist — always works regardless of DB/RLS state
    const whitelist = (import.meta.env.VITE_ADMIN_EMAILS ?? "")
      .split(",")
      .map((e: string) => e.trim().toLowerCase())
      .filter(Boolean);
    if (user.email && whitelist.includes(user.email.toLowerCase())) {
      setIsAdmin(true);
      return;
    }

    // DB check as secondary verification
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
  }, [user]);

  async function signOut() {
    await supabase.auth.signOut();
  }

  return { session, user, isAdmin, loading, signOut };
}