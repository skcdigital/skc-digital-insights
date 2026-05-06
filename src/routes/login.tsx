import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Mail, Lock, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Logo } from "@/components/logo";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Admin Sign In — SKC Digital" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin" });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const body = await res.json();
        if (!res.ok) throw new Error(body.error || "Sign-up failed.");
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        navigate({ to: "/admin" });
        return;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/admin" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/admin`,
    });
    if (result.error) {
      setError(result.error.message || "Google sign-in failed");
      setLoading(false);
      return;
    }
    if (!result.redirected) navigate({ to: "/admin" });
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-160px)] max-w-md flex-col justify-center px-4 py-12">
      <div className="flex justify-center">
        <Logo />
      </div>
      <div className="mt-8 rounded-2xl border border-border bg-surface/40 p-6 sm:p-8">
        <h1 className="font-display text-2xl font-bold">
          {mode === "signin" ? "Admin sign in" : "Create admin account"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Restricted area for SKC Digital staff.
        </p>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-semibold hover:border-primary/40 disabled:opacity-60"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.56c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.78.42 3.46 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
          Continue with Google
        </button>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Email</span>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-3 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          </label>
          <label className="block">
            <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Password</span>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-3 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          </label>

          {error && (
            <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 font-mono text-xs text-destructive">
              {error}
            </p>
          )}
          {info && (
            <p className="rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 font-mono text-xs text-primary">
              {info}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            <LogIn className="h-4 w-4" />
            {loading ? "Working…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); setInfo(null); }}
          className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-primary"
        >
          {mode === "signin" ? "Need an account? Create one" : "Already have an account? Sign in"}
        </button>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link to="/" className="hover:text-primary">← Back to website</Link>
        </p>
      </div>
    </div>
  );
}
