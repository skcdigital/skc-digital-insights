import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, Lock, LogIn, Sparkles, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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
  const [tab, setTab] = useState<"password" | "magic">("magic");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) window.location.href = "/admin";
    });
  }, []);

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setInfo(null); setLoading(true);
    try {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) throw err;
      window.location.href = "/admin";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed. Try magic link instead.");
    } finally {
      setLoading(false);
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email) { setError("Enter your email address first."); return; }
    setError(null); setInfo(null); setLoading(true);
    try {
      const { error: err } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: false },
      });
      if (err) throw err;
      setInfo(`Magic link sent to ${email}. Click the link in your email to sign in — check spam if it doesn't arrive within 2 minutes.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send magic link.");
    } finally {
      setLoading(false);
    }
  }

  async function handleReset() {
    if (!email) { setError("Enter your email above first."); return; }
    setError(null); setInfo(null); setLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    setLoading(false);
    if (err) setError(err.message);
    else setInfo(`Reset link sent to ${email} — check your inbox.`);
  }

  function switchTab(t: "password" | "magic") {
    setTab(t); setError(null); setInfo(null);
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-160px)] max-w-md flex-col justify-center px-4 py-12">
      <div className="flex justify-center"><Logo /></div>

      <div className="mt-8 rounded-2xl border border-border bg-surface/40 p-6 sm:p-8">
        <h1 className="font-display text-2xl font-bold">Admin sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">SKC Digital staff only.</p>

        <div className="mt-5 flex rounded-lg border border-border bg-background p-1">
          <button
            type="button"
            onClick={() => switchTab("magic")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium transition-colors ${
              tab === "magic" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" /> Magic link
          </button>
          <button
            type="button"
            onClick={() => switchTab("password")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium transition-colors ${
              tab === "password" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Lock className="h-3.5 w-3.5" /> Password
          </button>
        </div>

        <div className="mt-5">
          <label className="block">
            <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Email
            </span>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-3 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          </label>
        </div>

        {tab === "magic" ? (
          <form onSubmit={handleMagicLink} className="mt-4 space-y-4">
            <p className="text-xs text-muted-foreground">
              We&apos;ll email a one-click sign-in link — no password needed.
            </p>
            {error && <Alert type="error" text={error} />}
            {info  && <Alert type="info"  text={info} />}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              <ArrowRight className="h-4 w-4" />
              {loading ? "Sending…" : "Send magic link"}
            </button>
          </form>
        ) : (
          <form onSubmit={handlePassword} className="mt-4 space-y-4">
            <label className="block">
              <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                Password
              </span>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-3 text-sm focus:border-primary focus:outline-none"
                />
              </div>
            </label>
            {error && <Alert type="error" text={error} />}
            {info  && <Alert type="info"  text={info} />}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              <LogIn className="h-4 w-4" />
              {loading ? "Signing in…" : "Sign in"}
            </button>
            <div className="flex items-center justify-between border-t border-border pt-3">
              <button type="button" disabled={loading} onClick={handleReset}
                className="text-xs text-primary hover:underline disabled:opacity-50">
                Forgot password?
              </button>
              <button type="button" onClick={() => switchTab("magic")}
                className="text-xs text-muted-foreground hover:text-primary">
                Use magic link →
              </button>
            </div>
          </form>
        )}
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        <Link to="/" className="hover:text-primary">← Back to website</Link>
      </p>
    </div>
  );
}

function Alert({ type, text }: { type: "error" | "info"; text: string }) {
  return (
    <p className={`rounded-lg border px-3 py-2 font-mono text-xs ${
      type === "error"
        ? "border-destructive/40 bg-destructive/10 text-destructive"
        : "border-primary/40 bg-primary/10 text-primary"
    }`}>
      {text}
    </p>
  );
}
