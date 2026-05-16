import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Zap, TrendingUp, Rocket, ArrowRight, MessageCircle, HelpCircle, X, Loader2, CreditCard } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { SITE } from "@/lib/site";
import { TrackedWALink } from "@/components/tracked-wa-link";
import { supabase } from "@/integrations/supabase/client";
import { submitPayFastForm } from "@/lib/payfast";

const TITLE = "Membership Plans — SKC Digital";
const DESC =
  "Choose a Starter, Growth, or Scale membership to get ongoing digital services, priority support, and exclusive resources — all in South African Rand.";

export const Route = createFileRoute("/memberships")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: `${SITE.url}/memberships` },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
    ],
  }),
  component: MembershipsPage,
});

type BillingInterval = "monthly" | "annual";

type CheckoutPlan = {
  slug: string;
  name: string;
  price: number;
  billing: BillingInterval;
} | null;

const PLANS = [
  {
    slug: "starter",
    name: "Starter",
    tagline: "For small businesses just getting online",
    icon: <Zap className="h-5 w-5" />,
    price_monthly: 499,
    price_annual: 4490,
    highlight: false,
    cta_msg: "Hi, I'm interested in the Starter membership",
    features: [
      "Professional website (up to 5 pages)",
      "Basic SEO setup",
      "Contact form & WhatsApp integration",
      "1 month free support",
      "SSL & hosting included",
      "Access to Starter digital resources",
    ],
  },
  {
    slug: "growth",
    name: "Growth",
    tagline: "For businesses ready to scale digitally",
    icon: <TrendingUp className="h-5 w-5" />,
    price_monthly: 999,
    price_annual: 8990,
    highlight: true,
    cta_msg: "Hi, I'm interested in the Growth membership",
    features: [
      "Everything in Starter",
      "Up to 10 pages",
      "Google Ads setup & management",
      "Social media integration",
      "Monthly performance report",
      "Priority support (24h response)",
      "Access to all Growth resources & templates",
    ],
  },
  {
    slug: "scale",
    name: "Scale",
    tagline: "Full-service digital partner for ambitious brands",
    icon: <Rocket className="h-5 w-5" />,
    price_monthly: 1999,
    price_annual: 17990,
    highlight: false,
    cta_msg: "Hi, I'm interested in the Scale membership",
    features: [
      "Everything in Growth",
      "Custom design & branding",
      "E-commerce or booking integration",
      "Advanced SEO & content strategy",
      "Dedicated account manager",
      "Quarterly strategy session",
      "Unlimited resource library access",
    ],
  },
];

const FAQS = [
  {
    q: "How does billing work?",
    a: "We invoice via EFT in South African Rand at the start of each month (or annually upfront for the discounted rate). Stripe card billing is coming soon.",
  },
  {
    q: "Can I upgrade or downgrade my plan?",
    a: "Yes — you can move between plans at any time. Upgrades take effect immediately; downgrades kick in at the next billing cycle.",
  },
  {
    q: "What happens if I cancel?",
    a: "You keep access until the end of your paid period. No lock-in contracts, no cancellation fees.",
  },
  {
    q: "Do you offer a free trial?",
    a: "We offer a free initial consultation and site audit. Contact us and we'll walk you through what the right plan looks like for your business.",
  },
  {
    q: "What are digital resources?",
    a: "Members get access to our growing library of PDF guides, Excel templates, SEO checklists, and automation scripts — all practical tools built for South African SMEs.",
  },
];

function MembershipsPage() {
  const [billing, setBilling] = useState<BillingInterval>("monthly");
  const [checkoutPlan, setCheckoutPlan] = useState<CheckoutPlan>(null);

  return (
    <div>
      <PageHero
        eyebrow="Memberships"
        title={<>Your digital team,<br className="hidden sm:block" /> <span className="text-primary">on a monthly plan</span></>}
        description="Stop paying agency day-rates. Get ongoing digital services, priority support, and a full resource library — at a flat monthly rate in Rand."
      >
        <div className="inline-flex items-center gap-1 rounded-full border border-border bg-surface/60 p-1">
          <button
            onClick={() => setBilling("monthly")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              billing === "monthly" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling("annual")}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              billing === "annual" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Annual
            <span className={`rounded-full px-1.5 py-0.5 font-mono text-[10px] ${
              billing === "annual" ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
            }`}>
              Save ~25%
            </span>
          </button>
        </div>
      </PageHero>

      {/* Plans */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {PLANS.map((plan) => {
            const price = billing === "monthly" ? plan.price_monthly : Math.round(plan.price_annual / 12);
            const suffix = billing === "monthly" ? "per month" : "per month, billed annually";

            return (
              <article
                key={plan.slug}
                className={`relative flex flex-col rounded-2xl border p-8 transition-shadow ${
                  plan.highlight
                    ? "border-primary/60 bg-surface glow"
                    : "border-border bg-surface/40"
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 font-mono text-xs font-semibold text-primary-foreground">
                    Most Popular
                  </span>
                )}

                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  plan.highlight ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                }`}>
                  {plan.icon}
                </div>

                <h2 className="mt-4 font-display text-2xl font-bold">{plan.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>

                <div className="mt-6">
                  <span className="font-display text-4xl font-bold">R{price.toLocaleString("en-ZA")}</span>
                  <span className="ml-2 text-sm text-muted-foreground">/{suffix}</span>
                </div>
                {billing === "annual" && (
                  <p className="mt-1 font-mono text-xs text-primary">
                    R{plan.price_annual.toLocaleString("en-ZA")} billed once a year
                  </p>
                )}

                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 flex flex-col gap-2">
                  <button
                    onClick={() =>
                      setCheckoutPlan({ slug: plan.slug, name: plan.name, price, billing })
                    }
                    className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-opacity ${
                      plan.highlight
                        ? "bg-primary text-primary-foreground hover:opacity-90"
                        : "border border-border bg-background hover:border-primary/40"
                    }`}
                  >
                    <CreditCard className="h-4 w-4" />
                    Pay &amp; activate — {plan.name}
                  </button>
                  <TrackedWALink
                    message={plan.cta_msg}
                    source={`memberships/${plan.slug}`}
                    service={plan.name}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    Or enquire via WhatsApp
                  </TrackedWALink>
                </div>
              </article>
            );
          })}
        </div>

        {/* Compare note */}
        <p className="mt-8 text-center text-sm text-muted-foreground">
          All plans invoiced via EFT in ZAR. Card payments coming soon.{" "}
          <Link to="/contact" className="text-primary hover:underline">Custom enterprise quotes available.</Link>
        </p>
      </section>

      {/* Feature comparison table */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
          <h2 className="text-center text-2xl font-bold">Plan comparison</h2>
          <div className="mt-8 overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface/60">
                  <th className="px-5 py-4 text-left font-medium text-muted-foreground">Feature</th>
                  <th className="px-5 py-4 text-center font-mono text-xs uppercase tracking-wider">Starter</th>
                  <th className="px-5 py-4 text-center font-mono text-xs uppercase tracking-wider text-primary">Growth</th>
                  <th className="px-5 py-4 text-center font-mono text-xs uppercase tracking-wider">Scale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.feature} className="hover:bg-surface/40">
                    <td className="px-5 py-3 text-muted-foreground">{row.feature}</td>
                    <td className="px-5 py-3 text-center">{renderCell(row.starter)}</td>
                    <td className="px-5 py-3 text-center">{renderCell(row.growth)}</td>
                    <td className="px-5 py-3 text-center">{renderCell(row.scale)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="border-t border-border bg-surface/40">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <div className="flex items-center gap-2 justify-center mb-8">
            <HelpCircle className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Frequently asked questions</h2>
          </div>
          <div className="space-y-6">
            {FAQS.map((faq) => (
              <div key={faq.q} className="rounded-xl border border-border bg-background p-6">
                <h3 className="font-semibold">{faq.q}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 text-center">
          <h2 className="text-2xl font-bold">Not sure which plan is right for you?</h2>
          <p className="mt-3 text-muted-foreground max-w-md mx-auto">
            Book a free 15-minute call. We'll look at your business and recommend the plan that fits.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-90"
            >
              Book a free consultation <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="/products"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 font-semibold hover:border-primary/40"
            >
              Browse digital products
            </a>
          </div>
        </div>
      </section>

      {checkoutPlan && (
        <MembershipCheckoutModal
          plan={checkoutPlan}
          onClose={() => setCheckoutPlan(null)}
        />
      )}
    </div>
  );
}

function MembershipCheckoutModal({
  plan,
  onClose,
}: {
  plan: NonNullable<CheckoutPlan>;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pre-fill email if user is signed in
  useState(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user?.email) setEmail(data.session.user.email);
    });
  });

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Look up plan ID from Supabase
      const { data: planRow } = await supabase
        .from("membership_plans")
        .select("id")
        .eq("slug", plan.slug)
        .maybeSingle();

      if (!planRow) {
        setError("Plan not found. Please refresh and try again.");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/payfast/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "membership",
          itemId: (planRow as { id: string }).id,
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
      setError("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  }

  const suffix = plan.billing === "annual" ? "annual plan" : "first month";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-xl">
        <button onClick={onClose} className="absolute right-4 top-4 rounded-md p-1 hover:bg-border">
          <X className="h-4 w-4" />
        </button>

        <p className="font-mono text-xs uppercase tracking-wider text-primary">
          {plan.name} Membership
        </p>
        <p className="mt-1 text-2xl font-bold">R{plan.price.toLocaleString("en-ZA")}</p>
        <p className="text-xs text-muted-foreground">{suffix} · ZAR · Yoco secure payment</p>

        <p className="mt-3 text-sm text-muted-foreground">
          After payment your membership activates immediately. Renewals are managed via EFT invoice each month.
        </p>

        <form onSubmit={handlePay} className="mt-5 space-y-4">
          <label className="block">
            <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Your email
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </label>

          {error && (
            <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Redirecting to payment…</>
            ) : (
              <><CreditCard className="h-4 w-4" /> Pay R{plan.price.toLocaleString("en-ZA")}</>
            )}
          </button>
        </form>

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          Powered by <span className="font-semibold">PayFast</span> · South African payment gateway
        </p>
      </div>
    </div>
  );
}

const TICK = <Check className="mx-auto h-4 w-4 text-primary" />;
const DASH = <span className="text-muted-foreground">—</span>;

function renderCell(v: React.ReactNode | boolean | string) {
  if (v === true) return TICK;
  if (v === false) return DASH;
  return <span className="text-xs">{v}</span>;
}

const COMPARISON_ROWS: Array<{
  feature: string;
  starter: React.ReactNode | boolean | string;
  growth: React.ReactNode | boolean | string;
  scale: React.ReactNode | boolean | string;
}> = [
  { feature: "Website pages",        starter: "Up to 5",    growth: "Up to 10",  scale: "Unlimited" },
  { feature: "SEO setup",            starter: true,         growth: true,        scale: true },
  { feature: "WhatsApp integration", starter: true,         growth: true,        scale: true },
  { feature: "Google Ads management",starter: false,        growth: true,        scale: true },
  { feature: "Social media integration", starter: false,    growth: true,        scale: true },
  { feature: "Monthly report",       starter: false,        growth: true,        scale: true },
  { feature: "Custom branding",      starter: false,        growth: false,       scale: true },
  { feature: "E-commerce / booking", starter: false,        growth: false,       scale: true },
  { feature: "Account manager",      starter: false,        growth: false,       scale: true },
  { feature: "Quarterly strategy",   starter: false,        growth: false,       scale: true },
  { feature: "Support response",     starter: "48 hours",   growth: "24 hours",  scale: "Same day" },
  { feature: "Digital resources",    starter: "Starter",    growth: "All",       scale: "Unlimited" },
];
