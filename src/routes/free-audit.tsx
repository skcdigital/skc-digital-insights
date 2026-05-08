import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  Search,
  TrendingUp,
  Zap,
  MessageCircle,
  Mail,
} from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { SITE, waLink } from "@/lib/site";

const TITLE = "Free Digital Audit — SKC Digital";
const DESC =
  "Tell us your biggest business challenge and we'll audit your Google profile, website and quick wins for free. No cost, no obligation.";

export const Route = createFileRoute("/free-audit")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: `${SITE.url}/free-audit` },
    ],
  }),
  component: FreeAuditPage,
});

const BUSINESS_TYPES = [
  "Hair & beauty salon",
  "Spaza / tuck shop",
  "Restaurant / food",
  "Cleaning services",
  "Mechanic / auto",
  "Freelancer / consultant",
  "Retail shop",
  "Other",
] as const;

const CHALLENGES = [
  "Not enough new customers",
  "Hard to be found online",
  "Spending too much time on admin",
  "Invoicing & bookkeeping chaos",
  "Want a professional website",
  "Something else",
] as const;

function FreeAuditPage() {
  return (
    <>
      <PageHero
        eyebrow="Free offer"
        title={
          <>
            Free 15-min <span className="text-gradient">digital audit</span>
          </>
        }
        description="Tell us your biggest challenge. We'll look at your Google profile, website and setup — and show you the three fastest wins. No cost, no obligation."
      />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:items-start">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-primary">
              What we check
            </p>
            <h2 className="mt-3 font-display text-2xl font-bold sm:text-3xl">
              In 15 minutes we&apos;ll cover:
            </h2>

            <ul className="mt-8 space-y-6">
              <AuditPoint
                icon={<MapPin className="h-5 w-5" />}
                title="Google Business Profile"
                body="Is your listing claimed, verified, and optimised so customers can find you on Maps?"
              />
              <AuditPoint
                icon={<Search className="h-5 w-5" />}
                title="Website & online presence"
                body="Does your website load fast, look good on mobile, and send people to WhatsApp or call you?"
              />
              <AuditPoint
                icon={<TrendingUp className="h-5 w-5" />}
                title="Three quick wins"
                body="We pinpoint the two or three changes that will bring in more enquiries the fastest — and give you a plain-English action list."
              />
            </ul>

            <div className="mt-10 rounded-xl border border-border bg-surface/40 p-5">
              <p className="font-mono text-xs uppercase tracking-wider text-primary">
                What you get
              </p>
              <ul className="mt-3 space-y-2">
                {[
                  "Honest, jargon-free feedback",
                  "Written action list via WhatsApp",
                  "No sales pressure",
                  "No cost, no strings attached",
                ].map((t) => (
                  <li key={t} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <AuditForm />
        </div>

        <div className="mt-20 grid gap-5 sm:grid-cols-3">
          <StatCard value="48h" label="Average turnaround on fixes" icon={<Zap className="h-4 w-4" />} />
          <StatCard value="R250" label="Starting price after audit" icon={<CheckCircle2 className="h-4 w-4" />} />
          <StatCard value="4 hrs" label="Saved per week on average" icon={<TrendingUp className="h-4 w-4" />} />
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            Not ready for an audit yet?
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-3">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              Browse services <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              See our work <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function AuditForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bizType, setBizType] = useState("");
  const [challenge, setChallenge] = useState("");
  const [extra, setExtra] = useState("");
  const [sent, setSent] = useState(false);

  function buildWaMessage() {
    return [
      `Hi ${SITE.name}, I'd like a free digital audit.`,
      "",
      `Name: ${name}`,
      `WhatsApp: ${phone}`,
      `Business type: ${bizType}`,
      `Biggest challenge: ${challenge}`,
      extra ? `Extra info: ${extra}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  function handleWhatsApp(e: React.FormEvent) {
    e.preventDefault();
    window.open(waLink(buildWaMessage()), "_blank", "noopener,noreferrer");
    setSent(true);
  }

  function handleEmail(e: React.MouseEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`Free audit request — ${name} (${bizType})`);
    const body = encodeURIComponent(buildWaMessage());
    window.location.href = `mailto:${SITE.email}?subject=${subject}&body=${body}`;
    setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-primary/40 bg-surface/40 p-8 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
        <h3 className="mt-4 font-display text-xl font-bold">We&apos;ve got your request!</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          We&apos;ll review your details and come back with your audit on WhatsApp — usually within 4 hours.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          Back to home <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleWhatsApp}
      className="rounded-2xl border border-border bg-surface/40 p-6 sm:p-8"
    >
      <p className="font-mono text-xs uppercase tracking-wider text-primary">
        Request your free audit
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Takes 60 seconds — we&apos;ll reach out on WhatsApp.
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Field label="Your name">
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            autoComplete="name"
            placeholder="Thandi Mokoena"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
          />
        </Field>

        <Field label="WhatsApp number">
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={20}
            autoComplete="tel"
            placeholder="067 379 3503"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
          />
        </Field>

        <Field label="Business type" className="sm:col-span-2">
          <select
            required
            value={bizType}
            onChange={(e) => setBizType(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
          >
            <option value="">Choose one</option>
            {BUSINESS_TYPES.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </Field>

        <Field label="Biggest challenge" className="sm:col-span-2">
          <select
            required
            value={challenge}
            onChange={(e) => setChallenge(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
          >
            <option value="">Choose one</option>
            {CHALLENGES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>

        <Field label="Anything else? (optional)" className="sm:col-span-2">
          <textarea
            value={extra}
            onChange={(e) => setExtra(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Tell us a bit more about your business or what you'd like help with…"
            className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
          />
        </Field>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <MessageCircle className="h-4 w-4" /> Send on WhatsApp
        </button>
        <button
          type="button"
          onClick={handleEmail}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-5 py-3 text-sm font-semibold transition-colors hover:border-primary/40 hover:text-primary"
        >
          <Mail className="h-4 w-4" /> Email instead
        </button>
      </div>

      <p className="mt-3 text-center font-mono text-[11px] text-muted-foreground">
        No spam · No obligation · We reply within 4 hours
      </p>
    </form>
  );
}

function AuditPoint({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <li className="flex items-start gap-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary">
        {icon}
      </span>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      </div>
    </li>
  );
}

function StatCard({
  value,
  label,
  icon,
}: {
  value: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface/40 p-5">
      <div className="flex items-center gap-2 text-primary">{icon}</div>
      <p className="mt-2 font-display text-3xl font-bold">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
