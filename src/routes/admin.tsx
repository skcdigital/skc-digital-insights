import { useEffect, useState } from "react";
import { createFileRoute, Link, Outlet, useNavigate, useRouter } from "@tanstack/react-router";
import { LayoutDashboard, Users, FileText, Receipt, MessageSquare, LogOut, ExternalLink } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Logo } from "@/components/logo";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — SKC Digital" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const router = useRouter();
  const [bootstrapping, setBootstrapping] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  // Bootstrap: if there are zero admins yet, the first signed-in user becomes admin.
  // Uses a server-side API to bypass RLS (client cannot read user_roles without being admin).
  useEffect(() => {
    if (!user || isAdmin || isAdmin === null) return;
    let cancelled = false;
    (async () => {
      setBootstrapping(true);
      try {
        const res = await fetch("/api/admin/bootstrap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id }),
        });
        if (cancelled) return;
        const data = await res.json();
        if (data.promoted) {
          router.invalidate();
          window.location.reload();
          return;
        }
      } catch {
        // bootstrap failed — user will see "not authorised" screen
      }
      if (!cancelled) setBootstrapping(false);
    })();
    return () => { cancelled = true; };
  }, [user, isAdmin, router]);

  if (loading || bootstrapping || isAdmin === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }
  if (!user) return null;
  if (isAdmin === false) {
    return (
      <CenterMessage>
        <p className="font-display text-xl font-bold">Not authorised</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account ({user.email}) does not have admin access.
        </p>
        <button
          onClick={async () => { await signOut(); navigate({ to: "/login" }); }}
          className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Sign out
        </button>
      </CenterMessage>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Link to="/admin"><Logo /></Link>
            <span className="hidden font-mono text-xs uppercase tracking-wider text-primary sm:inline">Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="hidden items-center gap-1 rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:text-primary sm:inline-flex">
              <ExternalLink className="h-3.5 w-3.5" /> Site
            </Link>
            <span className="hidden text-xs text-muted-foreground md:inline">{user.email}</span>
            <button
              onClick={async () => { await signOut(); navigate({ to: "/login" }); }}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-3 py-1.5 text-xs hover:border-primary/40"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6">
        <aside className="hidden w-56 shrink-0 lg:block">
          <nav className="sticky top-20 space-y-1">
            <NavItem to="/admin" icon={<LayoutDashboard className="h-4 w-4" />}>Dashboard</NavItem>
            <NavItem to="/admin/leads" icon={<Users className="h-4 w-4" />}>Leads</NavItem>
            <NavItem to="/admin/quotes" icon={<FileText className="h-4 w-4" />}>Quotes</NavItem>
            <NavItem to="/admin/invoices" icon={<Receipt className="h-4 w-4" />}>Invoices</NavItem>
            <NavItem to="/admin/chats" icon={<MessageSquare className="h-4 w-4" />}>Chatbot</NavItem>
          </nav>
        </aside>
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 border-t border-border bg-background/95 backdrop-blur lg:hidden">
        <MobileNav to="/admin" icon={<LayoutDashboard className="h-4 w-4" />}>Home</MobileNav>
        <MobileNav to="/admin/leads" icon={<Users className="h-4 w-4" />}>Leads</MobileNav>
        <MobileNav to="/admin/quotes" icon={<FileText className="h-4 w-4" />}>Quotes</MobileNav>
        <MobileNav to="/admin/invoices" icon={<Receipt className="h-4 w-4" />}>Inv.</MobileNav>
        <MobileNav to="/admin/chats" icon={<MessageSquare className="h-4 w-4" />}>Chats</MobileNav>
      </nav>
    </div>
  );
}

function NavItem({ to, icon, children }: { to: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      activeOptions={{ exact: to === "/admin" }}
      activeProps={{ className: "bg-primary/10 text-primary border-primary/40" }}
      inactiveProps={{ className: "text-muted-foreground hover:text-foreground hover:bg-surface" }}
      className="flex items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-sm font-medium transition-colors"
    >
      {icon}
      {children}
    </Link>
  );
}

function MobileNav({ to, icon, children }: { to: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      activeOptions={{ exact: to === "/admin" }}
      activeProps={{ className: "text-primary" }}
      inactiveProps={{ className: "text-muted-foreground" }}
      className="flex flex-col items-center gap-0.5 py-2 text-[10px] font-mono uppercase"
    >
      {icon}
      {children}
    </Link>
  );
}

function CenterMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="rounded-2xl border border-border bg-surface p-8 text-center">{children}</div>
    </div>
  );
}