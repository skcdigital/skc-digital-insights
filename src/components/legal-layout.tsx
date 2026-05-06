import { Link } from "@tanstack/react-router";
import { ArrowLeft, Mail, MessageCircle } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { SITE, waLink } from "@/lib/site";

export interface LegalSection {
  id: string;
  title: string;
  body: React.ReactNode;
}

export function LegalLayout({
  title,
  intro,
  sections,
  updated = "01 January 2025",
}: {
  title: string;
  intro?: React.ReactNode;
  sections: LegalSection[];
  updated?: string;
}) {
  const links: Array<{ to: string; label: string }> = [
    { to: "/legal/terms", label: "Terms & Conditions" },
    { to: "/legal/privacy", label: "Privacy Policy" },
    { to: "/legal/refund", label: "Refund Policy" },
    { to: "/legal/service-agreement", label: "Service Agreement" },
  ];

  return (
    <>
      <PageHero
        eyebrow="Legal"
        title={<>{title}</>}
        description={`Last updated: ${updated} · ${SITE.name} · Pretoria, ZA`}
      />

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-border bg-surface/40 p-5">
              <p className="font-mono text-[10px] uppercase tracking-wider text-primary">
                On this page
              </p>
              <ol className="mt-3 space-y-1.5 text-sm">
                {sections.map((s, i) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="flex gap-2 text-muted-foreground hover:text-primary"
                    >
                      <span className="font-mono text-xs text-primary/70">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span>{s.title}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-4 rounded-2xl border border-border bg-surface/40 p-5">
              <p className="font-mono text-[10px] uppercase tracking-wider text-primary">
                Other documents
              </p>
              <ul className="mt-3 space-y-1.5 text-sm">
                {links.map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      activeProps={{ className: "text-primary" }}
                      inactiveProps={{ className: "text-muted-foreground hover:text-primary" }}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <article className="min-w-0">
            {intro && (
              <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 text-sm text-muted-foreground">
                {intro}
              </div>
            )}

            <div className="mt-8 space-y-10">
              {sections.map((s, i) => (
                <section key={s.id} id={s.id} className="scroll-mt-24">
                  <h2 className="font-display text-2xl font-bold">
                    <span className="font-mono text-primary">
                      {String(i + 1).padStart(2, "0")}.
                    </span>{" "}
                    {s.title}
                  </h2>
                  <div className="legal-prose mt-4 space-y-4 text-[15px] leading-relaxed text-muted-foreground">
                    {s.body}
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-12 rounded-2xl border border-border bg-surface/40 p-6">
              <h3 className="font-display text-lg font-semibold">
                Questions about this document?
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                We&apos;re happy to explain anything in plain language.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href={waLink(`Hi ${SITE.name}, I have a question about your ${title}.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
                <a
                  href={`mailto:${SITE.email}`}
                  className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-semibold hover:border-primary/40"
                >
                  <Mail className="h-4 w-4" /> {SITE.email}
                </a>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-semibold hover:border-primary/40"
                >
                  <ArrowLeft className="h-4 w-4" /> Back home
                </Link>
              </div>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}

export function L({ children }: { children: React.ReactNode }) {
  return <ul className="ml-1 space-y-2">{children}</ul>;
}

export function LI({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <span className="mt-2 inline-block h-1 w-1 shrink-0 rounded-full bg-primary" />
      <span>{children}</span>
    </li>
  );
}

export function Callout({
  tone = "info",
  children,
}: {
  tone?: "info" | "warn";
  children: React.ReactNode;
}) {
  const styles =
    tone === "warn"
      ? "border-yellow-500/40 bg-yellow-500/5 text-yellow-200/90"
      : "border-primary/30 bg-primary/5 text-foreground/90";
  return (
    <div className={`rounded-lg border ${styles} p-4 text-sm`}>{children}</div>
  );
}