import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, MessageCircle, Sparkles } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { SITE, waLink } from "@/lib/site";

const TITLE = "Pricing — Transparent Local Rates | SKC Digital";
const DESC =
  "Clear, upfront pricing in South African Rand. One-time projects from R300, monthly retainer R500, full business bundle R1,200. EFT only.";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: `${SITE.url}/pricing` },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
    ],
  }),
  component: PricingPage,
});

const PLANS = [
  {
    id: "once",
    badge: "One-Time",
    price: "R300",
    suffix: "starting price · once-off",
    desc: "Single deliverable. Perfect for a template, a quick digital task or a small automation.",
    features: [
      "1 custom Excel template or script",
      "Invoice / quote template",
      "Website landing page",
      "WhatsApp & email support",
      "Delivered within 48 hours",
    ],
    cta: "Start a Project",
    msg: "Hi, I'd like a once-off service",
    highlight: false,
  },
  {
    id: "retainer",
    badge: "POPULAR",
    price: "R500",
    suffix: "per month · ongoing support",
    desc: "Ongoing support and monthly bookkeeping for growing businesses that need consistent help.",
    features: [
      "Monthly books cleanup & summary",
      "Unlimited WhatsApp & email support",
      "1 custom template per month",
      "Priority response time",
      "First month: R350",
    ],
    cta: "Get Started for R350",
    msg: "Hi, I'd like the monthly retainer",
    highlight: true,
  },
  {
    id: "bundle",
    badge: "Business Bundle",
    price: "R1,200",
    suffix: "once-off · full setup",
    desc: "Everything a growing small business needs to get professionally set up digitally.",
    features: [
      "Cash flow + stock tracker",
      "Invoice & quote templates",
      "Personal & business budget",
      "Business website (1 page)",
      "1 month free support included",
    ],
    cta: "Get the Bundle",
    msg: "Hi, I'd like the Business Bundle",
    highlight: false,
  },
];

function PricingPage() {
  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title={
          <>
            Transparent <span className="text-gradient">local pricing</span>
          </>
        }
        description="All prices in South African Rand. Payment via EFT. Custom quotes available for larger projects."
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {PLANS.map((p) => (
            <article
              key={p.id}
              className={`relative flex flex-col rounded-2xl border p-8 ${
                p.highlight
                  ? "border-primary/60 bg-surface glow"
                  : "border-border bg-surface/40"
              }`}
            >
              {p.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 font-mono text-xs font-semibold text-primary-foreground">
                  {p.badge}
                </span>
              )}
              {!p.highlight && (
                <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  {p.badge}
                </span>
              )}
              <p className="mt-4 font-display text-5xl font-bold">{p.price}</p>
              <p className="mt-1 font-mono text-xs text-muted-foreground">{p.suffix}</p>
              <p className="mt-4 text-sm text-muted-foreground">{p.desc}</p>
              <ul className="mt-6 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href={waLink(p.msg)}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-8 inline-flex items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-semibold ${
                  p.highlight
                    ? "bg-primary text-primary-foreground hover:opacity-90"
                    : "border border-border bg-background hover:border-primary/40"
                }`}
              >
                <MessageCircle className="h-4 w-4" /> {p.cta}
              </a>
            </article>
          ))}
        </div>

        <div className="mt-14 rounded-2xl border border-border bg-surface/40 p-8 text-center">
          <Sparkles className="mx-auto h-6 w-6 text-primary" />
          <h3 className="mt-3 font-display text-2xl font-semibold">
            Need something larger?
          </h3>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            Multi-page websites, complex automations and bigger system builds
            are quoted custom. Tell us what you need — we&apos;ll scope it
            transparently.
          </p>
          <Link
            to="/contact"
            className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Request a custom quote
          </Link>
        </div>
      </section>
    </>
  );
}