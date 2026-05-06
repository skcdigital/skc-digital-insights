import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, MessageCircle } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { SERVICES } from "@/lib/services-data";
import { SITE, waLink } from "@/lib/site";

const TITLE = "Services — Excel, Web, Bookkeeping & Automation | SKC Digital";
const DESC =
  "Detailed service offering for South African SMEs: Excel automation, custom websites, bookkeeping, business process automation and digital setup. From R250.";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: `${SITE.url}/services` },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Our services"
        title={
          <>
            Tools that actually <span className="text-gradient">save you time</span>
          </>
        }
        description="Five focused services for small and medium South African businesses. Pick what you need — or describe a problem and we'll scope a custom build."
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12">
          {SERVICES.map((s, idx) => (
            <article
              key={s.id}
              id={s.id}
              className={`grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-start ${
                idx % 2 === 1 ? "lg:[&>*:first-child]:order-last" : ""
              }`}
            >
              <div className="rounded-2xl border border-border bg-surface/40 p-8">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-muted-foreground">{s.num} / 05</span>
                  <span className="text-5xl">{s.icon}</span>
                </div>
                <h2 className="mt-6 font-display text-3xl font-bold">{s.title}</h2>
                <p className="mt-4 text-muted-foreground">{s.desc}</p>
                <p className="mt-6 inline-flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-3 py-1.5 font-mono text-sm text-primary">
                  {s.price}
                </p>
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold">What&apos;s included</h3>
                <ul className="mt-4 space-y-3">
                  {s.details?.map((d) => (
                    <li key={d} className="flex items-start gap-3 text-sm">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href={waLink(`Hi ${SITE.name}, I'm interested in ${s.title}.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
                  >
                    <MessageCircle className="h-4 w-4" /> Get a quote
                  </a>
                  <Link
                    to="/pricing"
                    className="inline-flex items-center gap-2 rounded-md border border-border bg-surface/60 px-4 py-2 text-sm font-semibold hover:bg-surface"
                  >
                    See pricing <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}