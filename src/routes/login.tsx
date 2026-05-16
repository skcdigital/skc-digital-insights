import { useState } from "react";
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

  // Redirect if already signed in
  useState(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) window.location.href = "/admin";
    });
  });

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) throw err;
      window.location.href = "/admin";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed. Try the magic link tab instead.");
    } finally {
      setLoading(false);
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email) { setError("Enter your email address first."); return; }
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: false },
      });
      if (err) throw err;
      setInfo(`Magic link sent to ${email} — click the link in the email to sign in instantly. Check your spam folder if it doesn't arrive within 2 minutes.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send magic link. Try the password tab.");
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
    else setInfo(`Password reset link sent to ${email} — check your inbox.`);
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-160px)] max-w-md flex-col justify-center px-4 py-12">
      <div className="flex justify-center">
        <Logo />
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-surface/40 p-6 sm:p-8">
        <h1 className="font-display text-2xl font-bold">Admin sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">Restricted area for SKC Digital staff.</p>

        {/* Tab switcher */}
        <div className="mt-5 flex rounded-lg border border-border bg-background p-1">
          <button
            type="button"
            onClick={() => { setTab("magic"); setError(null); setInfo(null); }}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              tab === "magic" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="mr-1.5 inline h-3.5 w-3.5" />
            Magic link
          </button>
          <button
            type="button"
            onClick={() => { setTab("password"); setError(null); setInfo(null); }}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              tab === "password" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Lock className="mr-1.5 inline h-3.5 w-3.5" />
            Password
          </button>
        </div>

        {/* Email field — shared */}
        <div className="mt-5">
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
                placeholder="you@example.com"
                className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-3 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          </label>
        </div>

        {tab === "magic" ? (
          <form onSubmit={handleMagicLink} className="mt-4 space-y-4">
            <p className="text-xs text-muted-foreground">
              We&apos;ll email you a one-click sign-in link — no password needed.
            </p>
            {error && <ErrorBox text={error} />}
            {info && <InfoBox text={info} />}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              <ArrowRight className="h-4 w-4" />
              {loading ? "Sending link…" : "Send magic link"}
            </button>
          </form>
        ) : (
          <form onSubmit={handlePassword} className="mt-4 space-y-4">
            <label className="block">
              <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Password</span>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-3 text-sm focus:border-primary focus:outline-none"
                />
              </div>
            </label>
            {error && <ErrorBox text={error} />}
            {info && <InfoBox text={info} />}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              <LogIn className="h-4 w-4" />
              {loading ? "Signing in…" : "Sign in"}
            </button>
            <div className="flex items-center justify-between border-t border-border pt-3">
              <button
                type="button"
                disabled={loading}
                onClick={handleReset}
                className="text-xs text-primary underline-offset-2 hover:underline disabled:opacity-50"
              >
                Forgot password?
              </button>
              <button
                type="button"
                onClick={() => { setTab("magic"); setError(null); setInfo(null); }}
                className="text-xs text-muted-foreground hover:text-primary"
              >
                Use magic link instead →
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

function ErrorBox({ text }: { text: string }) {
  return (
    <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 font-mono text-xs text-destructive">{text}</p>
  );
}

function InfoBox({ text }: { text: string }) {
  return (
    <p className="rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 font-mono text-xs text-primary">{text}</p>
  );
}
