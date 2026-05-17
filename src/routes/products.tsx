import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  FileText, BookOpen, Wrench, Package, Mail, Sparkles,
  ShoppingCart, Download, ArrowRight, X, Loader2,
  Check, Zap, TrendingUp, Rocket, CreditCard, ShieldCheck, Clock, Repeat, Eye,
} from "lucide-react";
import { submitPayFastForm } from "@/lib/payfast";
import { SITE } from "@/lib/site";
import { supabase } from "@/integrations/supabase/client";

const TITLE = "Shop — SKC Digital";
const DESC =
  "PDF guides, Excel tools, courses, done-for-you packs and membership plans built for South African businesses. Pay once, download instantly.";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: `${SITE.url}/products` },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
    ],
  }),
  // Runs on the server — products are in the HTML before JavaScript loads
  loader: async () => {
    const [{ data: prods }, { data: pls }] = await Promise.all([
      supabase
        .from("products")
        .select("id, slug, title, description, type, price_zar, cover_url, is_free, sort_order")
        .eq("is_published", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("membership_plans")
        .select("id, slug, name, tagline, price_monthly, price_annual, features, is_popular")
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
    ]);

    const products = (prods ?? []) as Product[];
    const raw = (pls ?? []) as Array<Omit<Plan, "features"> & { features: unknown }>;
    const plans: Plan[] = raw.map((p) => ({
      ...p,
      features: Array.isArray(p.features)
        ? (p.features as string[])
        : typeof p.features === "string"
        ? (JSON.parse(p.features) as string[])
        : [],
    }));

    return { products, plans };
  },
  component: ShopPage,
});

type Product = {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: string;
  price_zar: number;
  cover_url: string | null;
  is_free: boolean;
  sort_order: number;
};

type Plan = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  price_monthly: number;
  price_annual: number | null;
  features: string[];
  is_popular: boolean;
};

type CheckoutProduct = { id: string; title: string; price_zar: number } | null;
type CheckoutPlan = { id: string; slug: string; name: string; price: number; billing: "monthly" | "annual" } | null;

const TYPE_META: Record<string, { label: string; icon: () => React.ReactNode; color: string }> = {
  pdf_guide:     { label: "PDF Guide",    icon: () => <FileText className="h-3.5 w-3.5" />, color: "text-sky-400 bg-sky-500/10 border-sky-500/30" },
  course:        { label: "Course",       icon: () => <BookOpen className="h-3.5 w-3.5" />, color: "text-violet-400 bg-violet-500/10 border-violet-500/30" },
  software_tool: { label: "Tool",         icon: () => <Wrench className="h-3.5 w-3.5" />,   color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  done_for_you:  { label: "Done-For-You", icon: () => <Package className="h-3.5 w-3.5" />,  color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
  newsletter:    { label: "Newsletter",   icon: () => <Mail className="h-3.5 w-3.5" />,     color: "text-pink-400 bg-pink-500/10 border-pink-500/30" },
   other:         { label: "Digital",      icon: () => <Sparkles className="h-3.5 w-3.5" />, color: "text-muted-foreground bg-surface border-border" },
};

const FILTER_TABS = [
  { key: "all",          label: "All" },
  { key: "pdf_guide",    label: "PDF Guides" },
  { key: "software_tool",label: "Tools" },
  { key: "course",       label: "Courses" },
  { key: "done_for_you", label: "Done-For-You" },
  { key: "plans",        label: "Plans" },
];

const PLAN_ICONS: Record<string, () => React.ReactNode> = {
  starter: () => <Zap className="h-5 w-5" />,
  growth:  () => <TrendingUp className="h-5 w-5" />,
  scale:   () => <Rocket className="h-5 w-5" />,
};

export default function ShopPage() {
  // Products and plans come from the server-side loader — already in the HTML.
  const { products, plans } = Route.useLoaderData();

  const [filter, setFilter]       = useState("all");
  const [billing, setBilling]     = useState<"monthly" | "annual">("monthly");
  const [checkoutProduct, setCheckoutProduct] = useState<CheckoutProduct>(null);
  const [checkoutPlan, setCheckoutPlan]       = useState<CheckoutPlan>(null);

  const showPlans    = filter === "all" || filter === "plans";
  const showProducts = filter !== "plans";
  const visibleProducts = showProducts
    ? filter === "all"
      ? products
      : products.filter((p) => p.type === filter)
    : [];

  return (
    <div>
      {/* ── Shop Hero ──────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border bg-background">
        <div className="absolute inset-0 bg-grid opacity-50" aria-hidden />
        <div className="absolute inset-0 bg-hero-glow" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <p className="font-mono text-xs uppercase tracking-widest text-primary">SKC Digital Shop</p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight sm:text-5xl">
            Everything your business needs,
            <br className="hidden sm:block" />
            <span className="text-gradient"> in one place</span>
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            PDF guides, Excel tools, courses, done-for-you packs and membership plans — all built
            for South African businesses. Pay once, download instantly. No subscription unless you want one.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {[
              { icon: <ShieldCheck className="h-4 w-4" />, text: "Secure via PayFast" },
              { icon: <Download className="h-4 w-4" />,    text: "Instant download" },
              { icon: <CreditCard className="h-4 w-4" />,  text: "Priced in ZAR" },
              { icon: <Clock className="h-4 w-4" />,       text: "Once-off or monthly" },
            ].map(({ icon, text }) => (
              <span
                key={text}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3.5 py-1.5 text-sm text-muted-foreground"
              >
                <span className="text-primary">{icon}</span>
                {text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Shop Body ──────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Filter tabs */}
        <div className="mb-8 flex flex-wrap gap-2">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`rounded-full border px-4 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors ${
                filter === tab.key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {tab.label}
              {tab.key === "plans" && (
                <span className="ml-1.5 rounded-full bg-primary/20 px-1.5 py-0.5 text-[9px] text-primary">
                  MONTHLY
                </span>
              )}
            </button>
          ))}
        </div>

        <>
            {/* Products grid */}
            {showProducts && visibleProducts.length > 0 && (
              <>
                {filter === "all" && (
                  <p className="mb-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    Digital Products
                  </p>
                )}
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {visibleProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onBuy={() => setCheckoutProduct(product)}
                    />
                  ))}
                </div>
              </>
            )}

            {showProducts && visibleProducts.length === 0 && (
              <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
                <Sparkles className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {filter === "all"
                    ? "Products are on their way — check back shortly."
                    : "No products in this category yet — check back soon."}
                </p>
              </div>
            )}

            {/* Membership plans */}
            {showPlans && plans.length > 0 && (
              <div className={showProducts && visibleProducts.length > 0 ? "mt-16 border-t border-border pt-14" : ""}>
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-widest text-primary">Membership Plans</p>
                    <h2 className="mt-1 text-2xl font-bold">Your digital team, on a flat monthly rate</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Ongoing services, priority support, and exclusive resources. No day-rate surprises.</p>
                  </div>
                  <div className="flex items-center gap-1 self-start rounded-full border border-border bg-surface/60 p-1 sm:self-auto">
                    {(["monthly", "annual"] as const).map((b) => (
                      <button
                        key={b}
                        onClick={() => setBilling(b)}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                          billing === b
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {b === "monthly" ? "Monthly" : "Annual (−25%)"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-3">
                  {plans.map((plan) => {
                    const price =
                      billing === "annual" && plan.price_annual
                        ? Math.round(plan.price_annual / 12)
                        : plan.price_monthly;
                    return (
                      <PlanCard
                        key={plan.id}
                        plan={plan}
                        price={price}
                        billing={billing}
                        onBuy={() =>
                          setCheckoutPlan({
                            id: plan.id,
                            slug: plan.slug,
                            name: plan.name,
                            price:
                              billing === "annual" && plan.price_annual
                                ? plan.price_annual
                                : plan.price_monthly,
                            billing,
                          })
                        }
                      />
                    );
                  })}
                </div>

                <p className="mt-5 text-center text-xs text-muted-foreground">
                  First payment by card via PayFast. Subsequent months invoiced via EFT.{" "}
                  <Link to="/contact" className="text-primary hover:underline">
                    Enterprise quotes available.
                  </Link>
                </p>
              </div>
            )}
        </>
      </section>

      {/* ── CTA band ───────────────────────────────────────── */}
      <section className="border-t border-border bg-surface/40">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-primary/20 bg-primary/5 px-8 py-12 text-center">
              <p className="font-mono text-xs uppercase tracking-wider text-primary">Not sure what you need?</p>
              <h2 className="mt-3 text-2xl font-bold sm:text-3xl">Get a free digital strategy session</h2>
              <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                Book a free 15-minute call. We&apos;ll look at your business and tell you exactly which products
                or plan will give you the best return.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-90"
                >
                  Book free session <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/services"
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 font-semibold hover:border-primary/40"
                >
                  View all services
                </Link>
              </div>
            </div>
          </div>
        </section>

      {/* ── Checkout modals ────────────────────────────────── */}
      {checkoutProduct && (
        <ProductCheckoutModal
          product={checkoutProduct}
          onClose={() => setCheckoutProduct(null)}
        />
      )}
      {checkoutPlan && (
        <PlanCheckoutModal
          plan={checkoutPlan}
          onClose={() => setCheckoutPlan(null)}
        />
      )}
    </div>
  );
}

/* ── Product Card ─────────────────────────────────────────── */
function ProductCard({ product, onBuy }: { product: Product; onBuy: () => void }) {
  const meta = TYPE_META[product.type] ?? TYPE_META.other;
  return (
    <div className="group flex flex-col rounded-2xl border border-border bg-surface/30 overflow-hidden transition-all hover:border-primary/40 hover:shadow-lg hover:-translate-y-0.5">
      {/* Cover — clicking navigates to the detail page */}
      <Link to="/product/$slug" params={{ slug: product.slug }} className="block">
        <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-primary/8 to-transparent">
          {product.cover_url ? (
            <img
              src={product.cover_url}
              alt={product.title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-primary/25">
              <div className="scale-[2.5]">{meta.icon()}</div>
            </div>
          )}
          <span className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider backdrop-blur ${meta.color}`}>
            {meta.icon()} {meta.label}
          </span>
          {product.is_free && (
            <span className="absolute right-3 top-3 rounded-full bg-emerald-500 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-white">
              Free
            </span>
          )}
        </div>
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <Link to="/product/$slug" params={{ slug: product.slug }}>
          <h3 className="text-sm font-bold leading-snug group-hover:text-primary transition-colors">{product.title}</h3>
        </Link>
        <p className="flex-1 text-xs leading-relaxed text-muted-foreground line-clamp-3">
          {product.description}
        </p>
        <div className="flex items-center justify-between border-t border-border/40 pt-3">
          <span className="text-lg font-bold">
            {product.is_free ? (
              <span className="text-emerald-400">Free</span>
            ) : (
              `R${product.price_zar.toLocaleString("en-ZA")}`
            )}
          </span>
          <div className="flex items-center gap-2">
            <Link
              to="/product/$slug"
              params={{ slug: product.slug }}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold transition-colors hover:border-primary/40 hover:text-primary"
            >
              <Eye className="h-3 w-3" /> View
            </Link>
            {product.is_free ? (
              <Link
                to="/product/$slug"
                params={{ slug: product.slug }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
              >
                <Download className="h-3.5 w-3.5" /> Get free
              </Link>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); onBuy(); }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95"
              >
                <ShoppingCart className="h-3.5 w-3.5" /> Buy
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Plan Card ────────────────────────────────────────────── */
function PlanCard({
  plan, price, billing, onBuy,
}: {
  plan: Plan;
  price: number;
  billing: "monthly" | "annual";
  onBuy: () => void;
}) {
  return (
    <article
      className={`relative flex flex-col rounded-2xl border p-7 ${
        plan.is_popular
          ? "border-primary/60 bg-surface shadow-lg shadow-primary/10"
          : "border-border bg-surface/30"
      }`}
    >
      {plan.is_popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 font-mono text-xs font-semibold text-primary-foreground">
          Most Popular
        </span>
      )}

      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
          plan.is_popular ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
        }`}
      >
        {(PLAN_ICONS[plan.slug] ?? (() => <Repeat className="h-5 w-5" />))()}
      </div>

      <h3 className="mt-4 font-display text-xl font-bold">{plan.name}</h3>
      {plan.tagline && <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>}

      <div className="mt-5">
        <span className="font-display text-3xl font-bold">R{price.toLocaleString("en-ZA")}</span>
        <span className="ml-1.5 text-sm text-muted-foreground">/month</span>
      </div>
      {billing === "annual" && (
        <p className="mt-0.5 font-mono text-xs text-primary">Billed annually</p>
      )}

      <ul className="mt-5 flex-1 space-y-2.5">
        {plan.features.map((f: string) => (
          <li key={f} className="flex items-start gap-2.5 text-sm">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onBuy}
        className={`mt-7 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-opacity ${
          plan.is_popular
            ? "bg-primary text-primary-foreground hover:opacity-90"
            : "border border-border bg-background hover:border-primary/40"
        }`}
      >
        <CreditCard className="h-4 w-4" /> Get {plan.name}
      </button>
    </article>
  );
}

/* ── Product checkout modal ───────────────────────────────── */
function ProductCheckoutModal({
  product,
  onClose,
}: {
  product: NonNullable<CheckoutProduct>;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/payfast/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "product", itemId: product.id, email }),
      });
      const data = await res.json() as {
        paymentUrl?: string;
        fields?: Record<string, string>;
        error?: string;
      };
      if (!res.ok || !data.paymentUrl || !data.fields) {
        setError(data.error ?? "Payment failed. Please try again.");
        setLoading(false);
        return;
      }
      submitPayFastForm(data.paymentUrl, data.fields);
    } catch {
      setError("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  }

  return (
    <CheckoutModal onClose={onClose}>
      <p className="font-mono text-xs uppercase tracking-wider text-primary">Checkout</p>
      <h2 className="mt-1 text-lg font-bold leading-snug">{product.title}</h2>
      <p className="mt-1 text-2xl font-bold">R{product.price_zar.toLocaleString("en-ZA")}</p>
      <p className="text-xs text-muted-foreground">Once-off · ZAR · Instant download after payment</p>

      <form onSubmit={handlePay} className="mt-6 space-y-4">
        <EmailInput value={email} onChange={setEmail} />
        {error && <ErrorMsg text={error} />}
        <SubmitBtn loading={loading}>
          Pay R{product.price_zar.toLocaleString("en-ZA")}
        </SubmitBtn>
      </form>
      <PayFastFooter />
    </CheckoutModal>
  );
}

/* ── Plan checkout modal ──────────────────────────────────── */
function PlanCheckoutModal({
  plan,
  onClose,
}: {
  plan: NonNullable<CheckoutPlan>;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user?.email) setEmail(data.session.user.email);
    });
  }, []);

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/payfast/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "membership",
          itemId: plan.id,
          billing: plan.billing,
          email,
        }),
      });
      const data = await res.json() as {
        paymentUrl?: string;
        fields?: Record<string, string>;
        error?: string;
      };
      if (!res.ok || !data.paymentUrl || !data.fields) {
        setError(data.error ?? "Payment failed. Please try again.");
        setLoading(false);
        return;
      }
      submitPayFastForm(data.paymentUrl, data.fields);
    } catch {
      setError("Network error. Please check your connection.");
      setLoading(false);
    }
  }

  return (
    <CheckoutModal onClose={onClose}>
      <p className="font-mono text-xs uppercase tracking-wider text-primary">{plan.name} Membership</p>
      <p className="mt-1 text-2xl font-bold">R{plan.price.toLocaleString("en-ZA")}</p>
      <p className="text-xs text-muted-foreground">
        {plan.billing === "annual" ? "Annual plan" : "First month"} · ZAR · Activates immediately
      </p>
      <p className="mt-3 text-sm text-muted-foreground">
        Subsequent months invoiced via EFT at the start of each billing cycle.
      </p>

      <form onSubmit={handlePay} className="mt-5 space-y-4">
        <EmailInput value={email} onChange={setEmail} />
        {error && <ErrorMsg text={error} />}
        <SubmitBtn loading={loading}>
          Pay R{plan.price.toLocaleString("en-ZA")}
        </SubmitBtn>
      </form>
      <PayFastFooter />
    </CheckoutModal>
  );
}

/* ── Shared checkout atoms ────────────────────────────────── */
function CheckoutModal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1.5 hover:bg-border"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
}

function EmailInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
        Email (for download link / receipt)
      </span>
      <input
        type="email"
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="you@example.com"
        className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
      />
    </label>
  );
}

function ErrorMsg({ text }: { text: string }) {
  return (
    <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
      {text}
    </p>
  );
}

function SubmitBtn({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" /> Redirecting to payment…
        </>
      ) : (
        <>
          <ShoppingCart className="h-4 w-4" /> {children}
        </>
      )}
    </button>
  );
}

function PayFastFooter() {
  return (
    <p className="mt-4 text-center text-[11px] text-muted-foreground">
      Secured by <span className="font-semibold">PayFast</span> · South African payment gateway
    </p>
  );
}
