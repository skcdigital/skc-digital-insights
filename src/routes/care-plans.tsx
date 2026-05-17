import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Shield, RefreshCw, FileEdit, MessageCircle } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { SITE, waLink } from "@/lib/site";

const TITLE = "Care Plans — Website Maintenance from R150/mo | SKC Digital";
const DESC =
  "Affordable monthly website care plans for South African businesses. Backups, security updates, content tweaks and uptime monitoring from R150/month.";

export const Route = createFileRoute("/care-plans")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: `${SITE.url}/care-plans` },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
    ],
  }),
  component: CarePlansPage,
});

const PLANS = [
  {
    name: "Basic Care",
    price: "R150",
    desc: "Keep your site safe, online and up to date.",
    features: [
      "Weekly backups",
      "Security updates",
      "Uptime monitoring",
      "Email support (48h)",
    ],
    msg: "Hi, I'd like the Basic Care plan",
    highlight: false,
  },
  {
    name: "Standard Care",
    price: "R350",
    desc: "Everything in Basic, plus monthly content edits.",
    features: [
      "All Basic Care features",
      "30 min content edits / month",
      "Performance check",
      "Priority WhatsApp support",
    ],
    msg: "Hi, I'd like the Standard Care plan",
    highlight: true,
  },
  {
    name: "Pro Care",
    price: "R650",
    desc: "For sites that earn — full hands-on monthly support.",
    features: [
      "All Standard Care features",
      "Unlimited small edits",
      "Monthly traffic report",
      "1 new page or section / month",
    ],
    msg: "Hi, I'd like the Pro Care plan",
    highlight: false,
  },
];

const PERKS: Array<{ icon: () => React.ReactNode; title: string; body: string }> = [
  { icon: () => <Shield className="h-5 w-5" />, title: "Secure", body: "Patches, backups and monitoring on autopilot." },
  { icon: () => <RefreshCw className="h-5 w-5" />, title: "Always fresh", body: "Hours, prices, photos — kept current monthly." },
  { icon: () => <FileEdit className="h-5 w-5" />, title: "No technical work for you", body: "WhatsApp the change, we handle it." },
];

function CarePlansPage() {
  return (
    <>
      <PageHero
        eyebrow="Care Plans · From R150/mo"
        title={
          <>
            Already have a website? <br />
            <span className="text-gradient">Let&apos;s keep it healthy.</span>
          </>
        }
        description="Monthly maintenance, backups, security updates and small content changes — so your site keeps earning instead of breaking."
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          {PERKS.map((p) => (
            <div key={p.title} className="rounded-xl border border-border bg-surface/40 p-6">
              <div className="text-primary">{p.icon()}</div>
              <h3 className="mt-4 font-display text-lg font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {PLANS.map((p) => (
            <article
              key={p.name}
              className={`relative flex flex-col rounded-2xl border p-8 ${
                p.highlight ? "border-primary/60 bg-surface glow" : "border-border bg-surface/40"
              }`}
            >
              {p.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 font-mono text-xs font-semibold text-primary-foreground">
                  RECOMMENDED
                </span>
              )}
              <h3 className="font-display text-xl font-semibold">{p.name}</h3>
              <p className="mt-2 font-display text-4xl font-bold">
                {p.price}
                <span className="ml-1 font-mono text-base font-normal text-muted-foreground">/mo</span>
              </p>
              <p className="mt-3 text-sm text-muted-foreground">{p.desc}</p>
              <ul className="mt-6 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {f}
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
                <MessageCircle className="h-4 w-4" /> Choose {p.name}
              </a>
            </article>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          Don&apos;t have a site yet?{" "}
          <Link to="/services" className="text-primary hover:underline">
            See our web development service
          </Link>
          .
        </p>
      </section>
    </>
  );
}
