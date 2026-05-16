import { createFileRoute, Link } from "@tanstack/react-router";
import { GraduationCap, Briefcase, MapPin, Clock, Zap, Heart, Globe2, Quote, X } from "lucide-react";
import { useState } from "react";
import { PageHero } from "@/components/page-hero";
import { SITE, waLink } from "@/lib/site";

const TITLE = "About SKC Digital — Suzan Kwinika, Pretoria IT Founder";
const DESC =
  "SKC Digital is run by Suzan Kwinika, a Pretoria-based IT professional and BCom Business Informatics student building practical digital tools for South African SMEs.";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: `${SITE.url}/about` },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
    ],
  }),
  component: AboutPage,
});

const TESTIMONIALS = [
  { name: "Thandi M.", role: "Salon Owner · Soshanguve", initials: "TM", text: "SKC built me a cash flow tracker in two days. I finally know exactly where my money goes every month. Best R400 I've spent on my business." },
  { name: "Johan P.", role: "Plumber · Centurion", initials: "JP", text: "My old website was embarrassing. SKC Digital rebuilt it in 48 hours and now customers actually message me from the site. Worth every cent." },
  { name: "Nomvula M.", role: "Caterer · Mamelodi", initials: "NM", text: "No long meetings, no overcharging. I sent a WhatsApp, got a quote in an hour, and my invoice template was ready the next day. Refreshing service." },
];

const STACK = [
  {
    icon: "📊",
    name: "Excel",
    what: "The world's most-used spreadsheet for tracking, calculating and reporting business data.",
    use: "We build cash-flow trackers, invoice templates, stock sheets and dashboards your staff already know how to open.",
    why: "No new software to learn, no monthly fee. Runs on any laptop you already own.",
  },
  {
    icon: "🐍",
    name: "Python",
    what: "A powerful programming language used for automation, data processing and AI.",
    use: "We use Python to clean messy data, generate reports automatically and connect different systems together.",
    why: "Replaces hours of manual copy-paste work with a script that runs in seconds.",
  },
  {
    icon: "🌐",
    name: "HTML/CSS",
    what: "The building blocks of every website on the internet — the structure and the styling.",
    use: "We hand-code fast, lightweight pages that load quickly on slow South African mobile networks.",
    why: "Lighter and faster than drag-and-drop builders like Wix, and you fully own the code.",
  },
  {
    icon: "⚡",
    name: "JavaScript",
    what: "The language that makes websites interactive — buttons, forms, animations, live updates.",
    use: "We add booking forms, WhatsApp click-to-chat, image galleries and quote calculators to your site.",
    why: "Turns a flat brochure site into a tool that actually generates leads.",
  },
  {
    icon: "🗄️",
    name: "SQL",
    what: "The standard language for storing and querying business data in a database.",
    use: "We build customer lists, booking systems and stock databases that scale beyond what Excel can handle.",
    why: "When your business grows past a few hundred records, a real database keeps it fast and reliable.",
  },
  {
    icon: "☁️",
    name: "Google Sheets",
    what: "A free cloud version of Excel that multiple people can edit at the same time from anywhere.",
    use: "Perfect for shared rosters, live stock counts and team-wide quote registers.",
    why: "Free, syncs to your phone, and your bookkeeper can view it without sending files back and forth.",
  },
  {
    icon: "🔷",
    name: "Power BI",
    what: "Microsoft's tool for turning raw business data into interactive dashboards and charts.",
    use: "We build monthly sales, profit and customer dashboards you can open on your phone.",
    why: "See your business performance at a glance instead of digging through spreadsheets.",
  },
  {
    icon: "📁",
    name: "SharePoint",
    what: "A Microsoft platform for storing files, documents and team sites in the cloud.",
    use: "We set up document libraries so your team stops emailing files back and forth.",
    why: "Everyone always has the latest version — no more 'Final_v3_REAL.xlsx' confusion.",
  },
  {
    icon: "🖥️",
    name: "Windows",
    what: "The operating system running on most South African business PCs and laptops.",
    use: "We optimise, secure and configure Windows machines for small offices and home users.",
    why: "A well-set-up PC is faster, safer and crashes less — saving you costly downtime.",
  },
  {
    icon: "🚀",
    name: "Vercel",
    what: "A modern cloud hosting service that serves your website from data centres worldwide.",
    use: "We deploy client websites here so they load in under a second, anywhere in SA.",
    why: "Free SSL, automatic backups and global speed — without you managing a server.",
  },
  {
    icon: "📧",
    name: "M365",
    what: "Microsoft 365 — business email, Word, Excel, Teams and OneDrive in one subscription.",
    use: "We set up branded email like you@yourbusiness.co.za, plus shared calendars and Teams meetings.",
    why: "Looks professional to clients and gives your whole team the tools they already know.",
  },
  {
    icon: "🔧",
    name: "Automation",
    what: "Connecting your tools (forms, email, WhatsApp, sheets) so they work together without manual effort.",
    use: "Example: a quote form that auto-emails you, saves to a sheet and sends a WhatsApp confirmation — all in one go.",
    why: "Frees up hours every week so you can focus on serving customers, not pushing data around.",
  },
];

function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title={
          <>
            The person behind <span className="text-gradient">SKC Digital</span>
          </>
        }
        description="You're not dealing with a faceless agency. You're working directly with someone who understands both the tech and the business side."
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-start">
          <div className="rounded-2xl border border-border bg-surface/40 p-8">
            <div className="grid h-24 w-24 place-items-center rounded-2xl bg-primary text-primary-foreground font-display text-4xl font-bold">
              SK
            </div>
            <h2 className="mt-6 font-display text-2xl font-bold">Suzan Kwinika</h2>
            <p className="mt-1 text-sm text-muted-foreground">Founder · Developer · BCom Student</p>
            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex items-center gap-3"><MapPin className="h-4 w-4 text-primary" /> Pretoria, Gauteng</li>
              <li className="flex items-center gap-3"><Briefcase className="h-4 w-4 text-primary" /> IT Professional · 3+ years</li>
              <li className="flex items-center gap-3"><GraduationCap className="h-4 w-4 text-primary" /> BCom Business Informatics · UNISA</li>
              <li className="flex items-center gap-3"><Clock className="h-4 w-4 text-primary" /> Available evenings & weekends</li>
            </ul>
            <a
              href={waLink(`Hi Suzan, I'd like to chat about a project.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Message Suzan on WhatsApp
            </a>
          </div>

          <div>
            <p className="font-display text-2xl leading-relaxed">
              Hi, I&apos;m <span className="text-primary">Suzan</span> — I started SKC Digital because I saw too many small South African businesses paying for clunky software they didn&apos;t need, or doing everything by hand on paper.
            </p>
            <p className="mt-5 text-muted-foreground">
              By day I work in IT. By night I study <strong className="text-foreground">BCom Business Informatics</strong> at UNISA. That mix means I don&apos;t just build tools — I understand <em>why</em> a business needs them, what saves money, and what just looks fancy.
            </p>
            <p className="mt-4 text-muted-foreground">
              Every project I take on is built personally, priced fairly and delivered fast. No long contracts, no jargon, no long wait — just practical digital tools that help your business run better.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <Pill icon={<Zap className="h-4 w-4" />} title="Fast Delivery" body="Most projects in 24–48 hours" />
              <Pill icon={<Heart className="h-4 w-4" />} title="Direct Contact" body="WhatsApp the founder directly" />
              <Pill icon={<Globe2 className="h-4 w-4" />} title="Local Pricing" body="ZAR rates, EFT-friendly" />
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="font-mono text-xs uppercase tracking-wider text-primary">Tools & technologies</p>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Our tech stack</h2>
          <p className="mt-3 max-w-xl text-muted-foreground">
            The tools we use daily to build fast, reliable solutions for our clients.
          </p>
          <StackGrid />
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="font-mono text-xs uppercase tracking-wider text-primary">Testimonials</p>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
            What clients are saying
          </h2>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Honest feedback from South African business owners we&apos;ve helped.
          </p>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure
                key={t.name}
                className="flex flex-col rounded-2xl border border-border bg-surface/40 p-6"
              >
                <Quote className="h-6 w-6 text-primary" />
                <p className="mt-3 text-sm text-muted-foreground">★★★★★</p>
                <blockquote className="mt-4 flex-1 text-base leading-relaxed">
                  “{t.text}”
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-4">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/15 font-mono text-sm font-semibold text-primary">
                    {t.initials}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{t.name}</span>
                    <span className="block text-xs text-muted-foreground">{t.role}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Start your project
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function Pill({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface/40 p-4">
      <div className="flex items-center gap-2 text-primary">{icon}<span className="font-mono text-xs uppercase tracking-wider">{title}</span></div>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

function StackGrid() {
  const [active, setActive] = useState<(typeof STACK)[number] | null>(null);
  return (
    <>
      <div className="mt-10 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {STACK.map((t) => (
          <button
            key={t.name}
            type="button"
            onClick={() => setActive(t)}
            className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-background p-5 text-center transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
            aria-label={`Learn about ${t.name}`}
          >
            <span className="text-3xl">{t.icon}</span>
            <span className="font-mono text-xs text-muted-foreground group-hover:text-primary">
              {t.name}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-primary/70 opacity-0 transition-opacity group-hover:opacity-100">
              Learn →
            </span>
          </button>
        ))}
      </div>

      {active && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`About ${active.name}`}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
          onClick={() => setActive(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-2xl sm:p-8"
          >
            <button
              type="button"
              onClick={() => setActive(null)}
              className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground hover:bg-background hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-3">
              <span className="text-4xl">{active.icon}</span>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-wider text-primary">
                  Tech in our stack
                </p>
                <h3 className="font-display text-2xl font-bold">{active.name}</h3>
              </div>
            </div>
            <div className="mt-6 space-y-4 text-sm">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  What it is
                </p>
                <p className="mt-1 text-foreground">{active.what}</p>
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  How we use it
                </p>
                <p className="mt-1 text-foreground">{active.use}</p>
              </div>
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                <p className="font-mono text-[11px] uppercase tracking-wider text-primary">
                  Why it matters for your business
                </p>
                <p className="mt-1 text-foreground">{active.why}</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <a
                href={waLink(`Hi ${SITE.name}, I'd like to know how ${active.name} can help my business.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
              >
                Ask how this fits my business
              </a>
              <button
                type="button"
                onClick={() => setActive(null)}
                className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground hover:border-primary/40"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}