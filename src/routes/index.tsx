import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Mail, MessageCircle, Phone, Sparkles, Zap, Clock, Award, CheckCircle2, Star } from "lucide-react";
import { Terminal } from "@/components/terminal";
import { Marquee } from "@/components/marquee";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SITE } from "@/lib/site";
import { TrackedWALink } from "@/components/tracked-wa-link";
import { SERVICES } from "@/lib/services-data";
import { TESTIMONIALS } from "@/lib/testimonials";
import { FAQS } from "@/lib/faqs";

const TITLE = "SKC Digital — IT Solutions, Web Development & Automation | Pretoria";
const DESC =
  "Custom Excel automation, websites, bookkeeping and business systems for South African SMEs. Direct contact, fair local pricing, 48-hour turnaround.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: SITE.url },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
      { name: "keywords", content: "IT solutions Pretoria, web development South Africa, Excel automation, bookkeeping, small business websites, business automation" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "@id": SITE.url,
          name: SITE.name,
          url: SITE.url,
          email: SITE.email,
          telephone: SITE.phone,
          description: DESC,
          address: {
            "@type": "PostalAddress",
            addressLocality: "Pretoria",
            addressRegion: "Gauteng",
            addressCountry: "ZA",
          },
          areaServed: "South Africa",
          priceRange: "R250 – R5000+",
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <Hero />
      <Marquee />
      <ServicesPreview />
      <ProcessSection />
      <TestimonialsSection />
      <FaqSection />
      <CtaBand />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-70" aria-hidden="true" />
      <div className="absolute inset-0 bg-hero-glow" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-7xl gap-14 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-10 lg:px-8 lg:py-24 lg:items-center">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3 py-1 font-mono text-xs uppercase tracking-wider text-primary backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Available for projects · Pretoria, ZA
          </p>

          <h1 className="mt-5 font-display text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
            IT Solutions
            <br />
            <span className="text-gradient">Built to Scale</span>
            <br />
            Your Business
          </h1>

          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            From custom data tools and business automation to web development
            and digital consulting — practical, professional technology
            solutions for South African businesses.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/products"
              className="group inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Browse the Shop
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/free-audit"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-surface/60 px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-surface"
            >
              Get a Free Audit
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <TrackedWALink
              message="Hi Suzan"
              source="hero-phone"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary"
            >
              <Phone className="h-4 w-4" /> {SITE.phone}
            </TrackedWALink>
            <a
              href={`mailto:${SITE.email}`}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary"
            >
              <Mail className="h-4 w-4" /> {SITE.email}
            </a>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
            <Stat icon={<Sparkles className="h-4 w-4" />} value="Free" label="Digital audit" />
            <Stat icon={<Clock className="h-4 w-4" />} value="48h" label="Task turnaround" />
            <Stat icon={<Award className="h-4 w-4" />} value="3+" label="Years IT" />
          </div>
        </div>

        <div className="lg:pl-4">
          <Terminal />
        </div>
      </div>
    </section>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface/50 p-3">
      <div className="flex items-center gap-1.5 text-primary">{icon}</div>
      <p className="mt-1 font-display text-2xl font-bold leading-none">{value}</p>
      <p className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}

function ServicesPreview() {
  return (
    <section className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Services"
          title={<>What We Build <span className="text-gradient">For You</span></>}
          desc="Practical IT solutions tailored to small and medium South African businesses. No unnecessary complexity — just tools that work."
        />

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <article
              key={s.id}
              className="group relative overflow-hidden rounded-xl border border-border bg-surface/40 p-6 transition-all hover:-translate-y-1 hover:border-primary/40 hover:bg-surface"
            >
              <div className="flex items-start justify-between">
                <span className="font-mono text-xs text-muted-foreground">{s.num}</span>
                <span className="text-3xl">{s.icon}</span>
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold">{s.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{s.desc}</p>
              <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                <span className="font-mono text-sm text-primary">→ {s.price}</span>
                <Link
                  to="/services"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-primary"
                >
                  Details
                </Link>
              </div>
            </article>
          ))}

          <article className="relative overflow-hidden rounded-xl border border-dashed border-primary/40 bg-surface/30 p-6">
            <div className="flex items-start justify-between">
              <span className="font-mono text-xs text-primary">CUSTOM</span>
              <span className="text-3xl">💡</span>
            </div>
            <h3 className="mt-5 font-display text-xl font-semibold">
              Got Something Else in Mind?
            </h3>
            <p className="mt-3 text-sm text-muted-foreground">
              Have a unique requirement? Describe your problem and we&apos;ll
              build a solution around it — no job too small or unusual.
            </p>
            <TrackedWALink
              message="Hi, I have a custom project"
              source="services-preview-custom"
              className="mt-6 inline-flex items-center gap-1.5 font-mono text-sm text-primary hover:underline"
            >
              Let&apos;s talk <ArrowRight className="h-3.5 w-3.5" />
            </TrackedWALink>
          </article>
        </div>
      </div>
    </section>
  );
}

function ProcessSection() {
  const steps = [
    { n: "01", title: "Contact Us", body: "WhatsApp or email us. We respond within hours, ask a few quick questions, and confirm the scope." },
    { n: "02", title: "We Quote", body: "You get a clear, upfront price. No hidden costs. You approve before we start anything." },
    { n: "03", title: "We Build", body: "Most projects delivered within 24–48 hours. We keep you updated throughout." },
    { n: "04", title: "You're Set", body: "Receive your deliverable, we walk you through it, and support you if anything needs tweaking." },
  ];
  return (
    <section className="relative border-t border-border bg-surface/30 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="How It Works"
          title={<>Simple Process, <span className="text-gradient">Fast Delivery</span></>}
          desc="No complicated onboarding. No long meetings. Just contact us and we get to work."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div
              key={s.n}
              className="rounded-xl border border-border bg-background p-6"
            >
              <span className="font-mono text-3xl text-primary">{s.n}</span>
              <h4 className="mt-4 font-display text-lg font-semibold">{s.title}</h4>
              <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="relative border-t border-border py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Client stories"
          title={<>Real results from <span className="text-gradient">real businesses</span></>}
          desc="South African business owners who got more time back, more customers, and less headache."
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.name}
              className="flex flex-col rounded-xl border border-border bg-surface/40 p-6"
            >
              <div className="flex gap-0.5 text-primary">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-primary" />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 font-mono text-xs font-bold text-primary">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {t.role} · {t.location}
                  </p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  return (
    <section className="relative border-t border-border bg-surface/30 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.4fr] lg:items-start">
          <div>
            <SectionHeader
              eyebrow="FAQ"
              title={<>Common <span className="text-gradient">questions</span></>}
              desc="Everything you want to know before getting in touch — answered plainly."
            />
            <TrackedWALink
              message="Hi SKC Digital, I have a question"
              source="faq"
              className="mt-8 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              <MessageCircle className="h-4 w-4" /> Ask on WhatsApp
            </TrackedWALink>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border-border">
                <AccordionTrigger className="text-left text-sm font-semibold text-foreground hover:no-underline hover:text-primary">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}

function CtaBand() {
  return (
    <section className="relative overflow-hidden border-t border-border py-20">
      <div className="absolute inset-0 bg-hero-glow" aria-hidden="true" />
      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl font-bold sm:text-5xl">
          Book a <span className="text-gradient">Free Digital Audit</span>
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-muted-foreground">
          Send your website, Google profile, spreadsheet or business problem —
          we&apos;ll point out quick wins and quote only what you actually need.
        </p>
        <p className="mt-3 inline-flex items-center gap-2 font-mono text-xs text-primary">
          <CheckCircle2 className="h-3.5 w-3.5" /> Free audit · typically responds within 4 hours
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <TrackedWALink
            message={`Hi ${SITE.name}, can you do a free digital audit for my business?`}
            source="cta-band"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp Now
          </TrackedWALink>
          <Link
            to="/free-audit"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-surface/60 px-5 py-3 text-sm font-semibold text-foreground hover:bg-surface"
          >
            <Zap className="h-4 w-4 text-primary" /> Free Audit Form
          </Link>
        </div>
      </div>
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  desc,
}: {
  eyebrow: string;
  title: React.ReactNode;
  desc: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="font-mono text-xs uppercase tracking-wider text-primary">{eyebrow}</p>
      <h2 className="mt-3 font-display text-3xl font-bold sm:text-5xl">{title}</h2>
      <p className="mt-4 text-muted-foreground">{desc}</p>
    </div>
  );
}
