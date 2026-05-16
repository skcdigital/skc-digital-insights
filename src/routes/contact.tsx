import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, MessageCircle, Phone, Clock, Zap, FileDown, Send } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { SITE, waLink } from "@/lib/site";
import { generateQuotePdf, downloadBlob, blobToBase64 } from "@/lib/quote-pdf";

const TITLE = "Contact SKC Digital — WhatsApp, Email or Free Audit";
const DESC =
  "Get in touch with SKC Digital in Pretoria. WhatsApp +27 67 379 3503 or email info@skcdigital.co.za. Free digital audits for South African businesses.";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: `${SITE.url}/contact` },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
    ],
  }),
  component: ContactPage,
});

const FAQ = [
  { q: "How do I get in touch?", a: `WhatsApp us at ${SITE.phone} or email ${SITE.email}. We respond to all messages within a few hours.` },
  { q: "How do I send you my data?", a: "WhatsApp or email works perfectly — send photos of receipts, a voice note, or a file attachment. We work with whatever you have." },
  { q: "Do I need any special software?", a: "No. Everything is built in Excel or Google Sheets — tools you already have on your phone or laptop. No new subscriptions required." },
  { q: "How fast will I get my deliverable?", a: "Most once-off projects are delivered within 24–48 hours of confirmation and payment. Larger projects are scoped with a clear timeline upfront." },
  { q: "Do you work with clients outside Pretoria?", a: "Yes — we're 100% online so we can serve clients anywhere in South Africa. All work is handled via WhatsApp and email, no meetings needed." },
  { q: "What payment methods do you accept?", a: "EFT to our bank account. A 50% deposit is required before starting any project above R500. Full payment on delivery for smaller tasks." },
];

function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={
          <>
            Let&apos;s talk about your <span className="text-gradient">project</span>
          </>
        }
        description="WhatsApp is the fastest way to reach us. Send a quick message, voice note, screenshot or file — we'll respond within hours."
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          <ContactCard
            icon={<MessageCircle className="h-5 w-5" />}
            title="WhatsApp"
            value={SITE.phone}
            href={waLink(`Hi ${SITE.name}, I have a question about your services.`)}
            cta="Open chat"
            highlight
          />
          <ContactCard
            icon={<Mail className="h-5 w-5" />}
            title="Email"
            value={SITE.email}
            href={`mailto:${SITE.email}`}
            cta="Send email"
          />
          <ContactCard
            icon={<Phone className="h-5 w-5" />}
            title="Call"
            value={SITE.phone}
            href={`tel:${SITE.phone.replace(/\s/g, "")}`}
            cta="Phone us"
          />
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          <Info icon={<MapPin className="h-4 w-4" />} title="Based in" body={SITE.location} />
          <Info icon={<Clock className="h-4 w-4" />} title="Response time" body="Within 4 hours · evenings & weekends" />
          <Info icon={<Zap className="h-4 w-4" />} title="Turnaround" body="24–48h on most projects" />
        </div>

        {/* WhatsApp Quote Form */}
        <div className="mt-20 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-primary">Quote form</p>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
              WhatsApp-first <span className="text-gradient">quote form</span>
            </h2>
            <p className="mt-4 text-sm text-muted-foreground">
              Choose what you need and we&apos;ll format your request as a clean WhatsApp message — no email back-and-forth, no pricing guesswork. Hit send and we&apos;ll reply within hours with a quote.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-3"><span className="text-primary">›</span> No spam, no email lists, no follow-up calls.</li>
              <li className="flex gap-3"><span className="text-primary">›</span> Your info is sent straight to our WhatsApp.</li>
              <li className="flex gap-3"><span className="text-primary">›</span> You stay in control — review the message before sending.</li>
            </ul>
          </div>
          <QuoteForm />
        </div>

        <div className="mt-20">
          <p className="font-mono text-xs uppercase tracking-wider text-primary">FAQ</p>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
            Common questions
          </h2>
          <div className="mt-8 grid gap-3">
            {FAQ.map((f) => (
              <details
                key={f.q}
                className="group rounded-xl border border-border bg-surface/40 p-5 open:bg-surface"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-base font-semibold">
                  {f.q}
                  <span className="font-mono text-primary transition-transform group-open:rotate-90">
                    ›
                  </span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

const SERVICE_OPTIONS = [
  "Website",
  "Excel / automation",
  "Bookkeeping setup",
  "Google Business Profile",
  "Care plan",
  "Not sure yet",
] as const;

const BUDGET_OPTIONS = [
  "Under R1,000",
  "R1,000 – R3,500",
  "R3,500 – R7,500",
  "R7,500+",
  "I need guidance",
] as const;

const DEADLINE_OPTIONS = [
  "This week",
  "Within 2 weeks",
  "This month",
  "No rush",
] as const;

function QuoteForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [service, setService] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  function validate() {
    if (!name || !email || !service || !budget || !deadline || !message) {
      setError("Please fill in every field so we can quote accurately.");
      return false;
    }
    setError(null);
    return true;
  }

  function buildWhatsAppMessage() {
    return [
      `Hi ${SITE.name}, I'd like a quote.`,
      "",
      `Name: ${name}`,
      `Email: ${email}`,
      `Service: ${service}`,
      `Budget: ${budget}`,
      `Deadline: ${deadline}`,
      "",
      "Project details:",
      message,
    ].join("\n");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;
    setStatus("sending");

    const data = { name, email, service, budget, deadline, message };

    let pdfBase64 = "";
    try {
      const blob = await generateQuotePdf(data);
      setPdfBlob(blob);
      pdfBase64 = await blobToBase64(blob);
    } catch (err) {
      console.error("PDF generation failed", err);
    }

    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, pdfBase64 }),
      });
      const resData = await res.json().catch(() => ({} as Record<string, unknown>));
      if (!res.ok) {
        setError((resData as { error?: string }).error || "We couldn't send your request. Try WhatsApp or email instead.");
        setStatus("idle");
        return;
      }
      // Lead saved but email not sent (Resend not configured) — open WhatsApp automatically
      if ((resData as { emailSent?: boolean }).emailSent === false) {
        window.open(waLink(buildWhatsAppMessage()), "_blank", "noopener,noreferrer");
      }
      setStatus("sent");
    } catch {
      // Network completely down — fall back to WhatsApp
      window.open(waLink(buildWhatsAppMessage()), "_blank", "noopener,noreferrer");
      setStatus("sent");
    }
  }

  function handleWhatsApp() {
    if (!validate()) return;
    window.open(waLink(buildWhatsAppMessage()), "_blank", "noopener,noreferrer");
  }

  function handleEmail() {
    if (!validate()) return;
    const subject = encodeURIComponent(`Quote request — ${service} (${name})`);
    const body = encodeURIComponent(buildWhatsAppMessage());
    window.location.href = `mailto:${SITE.email}?subject=${subject}&body=${body}`;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border bg-surface/40 p-6 sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            autoComplete="name"
            required
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={255}
            autoComplete="email"
            required
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
          />
        </Field>
        <Field label="Service needed">
          <select
            value={service}
            onChange={(e) => setService(e.target.value)}
            required
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
          >
            <option value="">Choose one</option>
            {SERVICE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </Field>
        <Field label="Budget">
          <select
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            required
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
          >
            <option value="">Choose one</option>
            {BUDGET_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </Field>
        <Field label="Deadline" className="sm:col-span-2">
          <select
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
          >
            <option value="">Choose one</option>
            {DEADLINE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </Field>
        <Field label="Project details" className="sm:col-span-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={2000}
            required
            placeholder="e.g. I need a one-page website for my salon with WhatsApp booking and a gallery."
            rows={5}
            className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
          />
        </Field>
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 font-mono text-xs text-destructive">
          {error}
        </p>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          <Send className="h-4 w-4" />
          {status === "sending" ? "Sending…" : status === "sent" ? "Sent ✓" : "Submit form"}
        </button>
        <button
          type="button"
          onClick={handleWhatsApp}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary/60 bg-surface px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
        >
          <MessageCircle className="h-4 w-4" />
          Send on WhatsApp
        </button>
        <button
          type="button"
          onClick={handleEmail}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          <Mail className="h-4 w-4" />
          Email us
        </button>
      </div>

      {status === "sent" && (
        <div className="mt-4 rounded-lg border border-primary/40 bg-primary/10 p-4 text-sm">
          <p className="font-semibold text-foreground">
            ✅ Request received! We&apos;ll reply within 4 hours via WhatsApp or email.
          </p>
          {pdfBlob && (
            <button
              type="button"
              onClick={() => downloadBlob(pdfBlob, `SKC-Digital-Quote-${name.replace(/\s+/g, "-")}.pdf`)}
              className="mt-3 inline-flex items-center gap-2 rounded-md border border-primary/60 bg-background px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/10"
            >
              <FileDown className="h-3.5 w-3.5" /> Download PDF copy
            </button>
          )}
        </div>
      )}

      <p className="mt-3 text-center font-mono to-[11px] text-[11px] text-muted-foreground">
        Pick the channel you prefer — submit the form, message us on WhatsApp, or open your email app.
      </p>
    </form>
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

function ContactCard({
  icon,
  title,
  value,
  href,
  cta,
  highlight,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  href: string;
  cta: string;
  highlight?: boolean;
}) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noopener noreferrer"
      className={`group block rounded-2xl border p-6 transition-all hover:-translate-y-1 ${
        highlight ? "border-primary/60 bg-surface glow" : "border-border bg-surface/40 hover:border-primary/40"
      }`}
    >
      <div className="flex items-center gap-3 text-primary">
        {icon}
        <span className="font-mono text-xs uppercase tracking-wider">{title}</span>
      </div>
      <p className="mt-4 font-display text-xl font-semibold">{value}</p>
      <p className="mt-3 inline-flex items-center gap-1 text-sm text-muted-foreground group-hover:text-primary">
        {cta} →
      </p>
    </a>
  );
}

function Info({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface/30 p-5">
      <div className="flex items-center gap-2 text-primary">{icon}<span className="font-mono text-xs uppercase tracking-wider">{title}</span></div>
      <p className="mt-2 text-sm">{body}</p>
    </div>
  );
}