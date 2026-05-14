import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  FileSpreadsheet,
  Globe,
  RefreshCw,
  Receipt,
  TrendingUp,
  TrendingDown,
  Wallet,
  ShoppingBag,
  Star,
  MapPin,
  Phone,
  Calendar,
  Search,
  Menu,
  Bell,
  Filter,
  Download,
  MessageCircle,
  ChevronRight,
  Smartphone,
} from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { SITE, waLink } from "@/lib/site";
import demoSalon from "@/assets/demo-salon.jpg";
import demoRestaurant from "@/assets/demo-restaurant.jpg";
import demoMechanic from "@/assets/demo-mechanic.jpg";

const TITLE = "Portfolio — Real Examples, Real Results | SKC Digital";
const DESC =
  "Real samples built with the exact same tools and process we use for every client — cash flow trackers, websites, before/after bookkeeping cleanups and branded invoice templates.";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: `${SITE.url}/portfolio` },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
    ],
  }),
  component: PortfolioPage,
});

function ResultsStrip() {
  const stats = [
    { before: "12", after: "31", unit: "enquiries/week", label: "Hair salon after one-page site" },
    { before: "???", after: "Clear", unit: "monthly P&L", label: "Spaza owner after books cleanup" },
    { before: "3 days", after: "48 hrs", unit: "per project", label: "Average delivery time" },
    { before: "R0", after: "R250", unit: "starting price", label: "For most once-off tasks" },
  ];
  return (
    <div className="border-b border-border bg-surface/40">
      <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-border px-4 sm:grid-cols-4 sm:px-6 lg:px-8">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col items-center px-4 py-6 text-center">
            <div className="flex items-baseline gap-2 font-mono text-xs text-muted-foreground">
              <span className="line-through opacity-60">{s.before}</span>
              <span className="text-primary">→</span>
              <span className="text-base font-bold text-foreground">{s.after}</span>
            </div>
            <span className="mt-0.5 font-mono text-xs text-primary">{s.unit}</span>
            <span className="mt-1 text-[11px] text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PortfolioPage() {
  return (
    <>
      <PageHero
        eyebrow="Our Work"
        title={
          <>
            Real Examples. <span className="text-gradient">Real Results.</span>
          </>
        }
        description="Every sample below was built using the exact same tools and process we use for every client. No mockups — what you see is what you get."
      />

      <ResultsStrip />

      <section className="mx-auto max-w-7xl space-y-12 px-4 pb-16 sm:px-6 lg:px-8">
        <CashFlowSample />
        <WebsiteSample />
        <BookkeepingSample />
        <InvoiceSample />
        <BookingDashboardSample />
        <MobileAppSample />

        <div className="rounded-2xl border border-border bg-surface/40 p-8 text-center">
          <h2 className="font-display text-2xl font-semibold">Have a similar project?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Tell us what you&apos;re struggling with — we&apos;ll quote it openly and honestly.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <a
              href={waLink(`Hi ${SITE.name}, I have a project similar to your portfolio.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Start a project
            </a>
            <Link
              to="/services"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-5 py-2.5 text-sm font-semibold hover:border-primary/40"
            >
              Browse services <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function SectionLabel({
  icon,
  tag,
  title,
  blurb,
}: {
  icon: React.ReactNode;
  tag: string;
  title: string;
  blurb: string;
}) {
  return (
    <div className="mb-5 flex items-start gap-4">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary">
        {icon}
      </span>
      <div>
        <p className="font-mono text-xs uppercase tracking-wider text-primary">{tag}</p>
        <h2 className="mt-1 font-display text-2xl font-bold sm:text-3xl">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{blurb}</p>
      </div>
    </div>
  );
}

function SampleFrame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background">
      <div className="flex items-center justify-between border-b border-border bg-surface/50 px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
        </div>
        <span className="font-mono text-[11px] text-muted-foreground">{title}</span>
        <span className="w-10" />
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}

/* ---------- 1. CASH FLOW TRACKER ---------- */
function CashFlowSample() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const rows: Array<{ label: string; vals: (number | string)[]; cls?: string }> = [
    { label: "Salary / Main", vals: [7870, 7870, 7870, 7870, 7870, 7870] },
    { label: "Freelance", vals: [0, 500, 1200, 800, 1500, 2000] },
    { label: "TOTAL INCOME", vals: [7870, 8370, 9070, 8670, 9370, 9870], cls: "text-primary font-semibold" },
    { label: "Rent / Bond", vals: [-2000, -2000, -2000, -2000, -2000, -2000] },
    { label: "Groceries", vals: [-1500, -1500, -1600, -1450, -1500, -1500] },
    { label: "Transport", vals: [-800, -800, -750, -800, -800, -800] },
    { label: "TOTAL EXPENSES", vals: [-5500, -5100, -5400, -5050, -5500, -5300], cls: "text-red-400 font-semibold" },
    { label: "NET CASH FLOW", vals: ["+2,370", "+3,270", "+3,670", "+3,620", "+3,870", "+4,570"], cls: "text-primary font-bold" },
  ];
  return (
    <article className="rounded-2xl border border-border bg-surface/40 p-6 sm:p-8">
      <SectionLabel
        icon={<FileSpreadsheet className="h-5 w-5" />}
        tag="Excel Templates"
        title="Monthly cash flow tracker"
        blurb="Owner was guessing monthly profit from receipts and WhatsApps. Built a single sheet with auto-categorised income, expenses and net cash flow — delivered as .xlsx in 24 hours."
      />
      <SampleFrame title="SKC_Digital_Business_Toolkit.xlsx · Cash Flow">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-xs">
            <thead>
              <tr className="bg-surface/70 text-muted-foreground">
                <th className="border border-border px-2.5 py-1.5 text-left font-mono font-normal">CATEGORY</th>
                {months.map((m) => (
                  <th key={m} className="border border-border px-2.5 py-1.5 text-right font-mono font-normal">
                    {m}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label}>
                  <td className={`border border-border px-2.5 py-1.5 ${r.cls ?? "text-foreground/90"}`}>
                    {r.label}
                  </td>
                  {r.vals.map((v, i) => (
                    <td
                      key={i}
                      className={`border border-border px-2.5 py-1.5 text-right font-mono ${r.cls ?? "text-muted-foreground"}`}
                    >
                      {typeof v === "number" ? v.toLocaleString() : v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 font-mono text-[10px] text-muted-foreground">
          Blue cells = enter your data · Black cells = auto-calculated · R = ZAR
        </p>
      </SampleFrame>
      <SampleResultRow
        bullets={["Zero formula errors", "Auto-calculates totals", "Print-ready layout"]}
        price="From R300"
        cta="Get your tracker"
        message="Hi, I'd like a custom Excel cash flow tracker like the demo"
      />
    </article>
  );
}

/* ---------- 2. WEBSITE BUILD ---------- */
function WebsiteSample() {
  return (
    <article className="rounded-2xl border border-border bg-surface/40 p-6 sm:p-8">
      <SectionLabel
        icon={<Globe className="h-5 w-5" />}
        tag="Website Build"
        title="Hair salon — branded booking website"
        blurb="Owner relied only on Instagram DMs and missed bookings. Delivered a polished, mobile-first site with WhatsApp booking, services menu, gallery and Google-ready SEO — live in 48 hours."
      />
      <SampleFrame title="🔒 glowstudio.co.za">
        <div className="overflow-hidden rounded-lg border border-rose-200 bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50 text-rose-950">
          {/* Top nav */}
          <div className="flex items-center justify-between border-b border-rose-200/60 bg-white/70 px-4 py-2.5 backdrop-blur">
            <span className="font-serif text-base font-bold">
              GlowStudio<span className="text-rose-600">.</span>
            </span>
            <span className="hidden gap-4 text-[11px] text-rose-900/70 sm:flex">
              <span>Services</span>
              <span>Gallery</span>
              <span>Stylists</span>
              <span>Pricing</span>
              <span>Contact</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-rose-600 px-3 py-1.5 text-[10px] font-semibold text-white">
              <Calendar className="h-3 w-3" /> Book Now
            </span>
          </div>

          {/* Hero */}
          <div className="grid gap-5 p-5 sm:p-7 lg:grid-cols-[1.05fr_1fr] lg:items-center">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-rose-600">
                Pretoria · Hatfield
              </p>
              <h3 className="mt-2 font-serif text-3xl font-bold leading-tight sm:text-4xl">
                Where every braid <span className="text-rose-600">tells your story</span>
              </h3>
              <p className="mt-3 max-w-sm text-xs text-rose-900/70">
                Knotless braids, soft locs, weaves &amp; natural hair care — done by master stylists,
                booked in 30 seconds.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-rose-600 px-3 py-1.5 text-[10px] font-semibold text-white">
                  <MessageCircle className="h-3 w-3" /> Book on WhatsApp
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-md border border-rose-300 bg-white/70 px-3 py-1.5 text-[10px] font-semibold text-rose-900">
                  View pricing <ChevronRight className="h-3 w-3" />
                </span>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-[10px] text-rose-900/70">
                <span className="inline-flex items-center gap-1">
                  <Star className="h-3 w-3 text-rose-600" fill="currentColor" /> 4.9 · 312 Google reviews
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-rose-600" /> Hatfield, PTA
                </span>
                <span className="inline-flex items-center gap-1">
                  <Phone className="h-3 w-3 text-rose-600" /> 067 379 3503
                </span>
              </div>
            </div>
            <div className="overflow-hidden rounded-xl border border-rose-200 bg-white shadow-lg">
              <img
                src={demoSalon}
                alt="GlowStudio salon — braids and natural hair specialists"
                className="h-44 w-full object-cover sm:h-56"
                loading="lazy"
              />
              <div className="grid grid-cols-3 divide-x divide-rose-100 border-t border-rose-100 bg-white text-center">
                {[
                  { l: "Knotless", v: "R420+" },
                  { l: "Soft locs", v: "R600+" },
                  { l: "Weaves", v: "R380+" },
                ].map((s) => (
                  <div key={s.l} className="px-2 py-2">
                    <p className="text-[9px] uppercase tracking-wider text-rose-900/60">{s.l}</p>
                    <p className="mt-0.5 font-serif text-sm font-bold text-rose-700">{s.v}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SampleFrame>
      <SampleResultRow
        bullets={["Custom designed", "Mobile-first", "Google indexed", "Live in 48hrs"]}
        price="From R800"
        cta="Get a website like this"
        message="Hi, I'd like a website like the portfolio demo"
      />
    </article>
  );
}

/* ---------- 3. BEFORE / AFTER BOOKKEEPING ---------- */
function BookkeepingSample() {
  const after = [
    { cat: "Sales — January", amt: "R 4,500" },
    { cat: "Sales — February", amt: "R 3,200" },
    { cat: "WhatsApp orders", amt: "R 450" },
    { cat: "Rent", amt: "− R 2,000" },
    { cat: "Transport / Petrol", amt: "− R 800" },
    { cat: "Refund issued", amt: "− R 300" },
  ];
  return (
    <article className="rounded-2xl border border-border bg-surface/40 p-6 sm:p-8">
      <SectionLabel
        icon={<RefreshCw className="h-5 w-5" />}
        tag="Before vs After"
        title="Monthly books cleanup"
        blurb="Client sends receipts on WhatsApp, gets back clean organised records every month — no software needed."
      />
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-5">
          <p className="font-mono text-xs uppercase tracking-wider text-red-400">
            Before — messy WhatsApp notes
          </p>
          <div className="mt-3 space-y-1.5 font-mono text-xs text-muted-foreground">
            <p>jan sales: R4500??check</p>
            <p>feb - R3200 or 3800?</p>
            <p>expenses - rent 2000</p>
            <p>stock: hoodies × 12sold 4?</p>
            <p>refund client R300</p>
            <p>profit this month = ???</p>
            <p>petrol 3x = roughly R800</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {["No totals", "Errors likely", "Tax risk", "Stress"].map((t) => (
              <span key={t} className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] text-red-300">
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-primary/40 bg-primary/5 p-5">
          <p className="font-mono text-xs uppercase tracking-wider text-primary">
            After — SKC cleanup (48 hrs)
          </p>
          <table className="mt-3 w-full text-xs">
            <tbody>
              {after.map((r) => (
                <tr key={r.cat} className="border-b border-border/50 last:border-0">
                  <td className="py-1.5 text-foreground/90">{r.cat}</td>
                  <td className="py-1.5 text-right font-mono text-muted-foreground">{r.amt}</td>
                  <td className="py-1.5 pl-2 text-primary">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </td>
                </tr>
              ))}
              <tr className="border-t-2 border-primary/40">
                <td className="py-2 font-semibold text-foreground">NET PROFIT</td>
                <td className="py-2 text-right font-mono font-bold text-primary">R 5,050</td>
                <td className="py-2 pl-2 text-primary">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </td>
              </tr>
            </tbody>
          </table>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {["Auto-totals", "Tax-ready", "Zero errors", "Peace of mind"].map((t) => (
              <span key={t} className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] text-primary">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
      <SampleResultRow
        bullets={["Send receipts via WhatsApp", "Clean records back in 48hrs", "No software needed"]}
        price="From R400/month"
        cta="Clean up my books"
        message="Hi, I'd like my monthly books cleaned up"
      />
    </article>
  );
}

/* ---------- 4. INVOICE TEMPLATE ---------- */
function InvoiceSample() {
  const lines = [
    { d: "Cash Flow Tracker (custom Excel)", q: 1, p: "R 350", t: "R 350" },
    { d: "Invoice Template Setup", q: 1, p: "R 250", t: "R 250" },
    { d: "WhatsApp setup walkthrough", q: 1, p: "—", t: "FREE" },
  ];
  return (
    <article className="rounded-2xl border border-border bg-surface/40 p-6 sm:p-8">
      <SectionLabel
        icon={<Receipt className="h-5 w-5" />}
        tag="Invoice Template"
        title="Branded, auto-calculating invoice"
        blurb="Manual invoices looked inconsistent and took too long to send. Branded template with totals, VAT-ready fields and print layout — delivered in a day."
      />
      <SampleFrame title="INV-20250420-001.pdf">
        <div className="rounded-lg bg-white p-5 text-zinc-900 sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-display text-lg font-bold">Your Business Name</p>
              <p className="text-[11px] text-zinc-500">Professional Services · Pretoria, ZA</p>
            </div>
            <div className="text-right">
              <p className="font-display text-xl font-bold">INVOICE</p>
              <p className="font-mono text-[10px] text-zinc-500">Powered by SKC Digital</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 border-y border-zinc-200 py-3 text-[11px] sm:grid-cols-4">
            <div>
              <p className="font-mono uppercase text-zinc-500">Invoice No.</p>
              <p className="mt-0.5 font-semibold">INV-20250420-001</p>
            </div>
            <div>
              <p className="font-mono uppercase text-zinc-500">Date</p>
              <p className="mt-0.5 font-semibold">20 April 2025</p>
            </div>
            <div>
              <p className="font-mono uppercase text-zinc-500">Bill To</p>
              <p className="mt-0.5 font-semibold">Client Business Name</p>
            </div>
            <div>
              <p className="font-mono uppercase text-zinc-500">Due Date</p>
              <p className="mt-0.5 font-semibold">04 May 2025</p>
            </div>
          </div>
          <table className="mt-3 w-full text-[11px]">
            <thead>
              <tr className="border-b border-zinc-300 text-left text-zinc-500">
                <th className="py-1.5 font-mono font-normal uppercase">Description</th>
                <th className="py-1.5 font-mono font-normal uppercase">Qty</th>
                <th className="py-1.5 font-mono font-normal uppercase">Unit</th>
                <th className="py-1.5 text-right font-mono font-normal uppercase">Total</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((l) => (
                <tr key={l.d} className="border-b border-zinc-100">
                  <td className="py-1.5">{l.d}</td>
                  <td className="py-1.5">{l.q}</td>
                  <td className="py-1.5">{l.p}</td>
                  <td className="py-1.5 text-right font-mono">{l.t}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-3 ml-auto w-full max-w-[220px] space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-zinc-500">Subtotal</span>
              <span className="font-mono">R 600</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">VAT (not VAT registered)</span>
              <span className="font-mono">R 0</span>
            </div>
            <div className="flex justify-between border-t border-zinc-300 pt-1 font-bold">
              <span>Total Due</span>
              <span className="font-mono">R 600</span>
            </div>
          </div>
          <p className="mt-3 text-[10px] text-zinc-500">
            Payment via EFT · Account details on request · Ref: INV-20250420-001
          </p>
        </div>
      </SampleFrame>
      <SampleResultRow
        bullets={["Auto totals", "VAT-ready fields", "Branded with your logo"]}
        price="From R150"
        cta="Get your template"
        message="Hi, I'd like a branded invoice template"
      />
    </article>
  );
}

/* ---------- 5. BOOKING / ADMIN DASHBOARD ---------- */
function BookingDashboardSample() {
  const bookings = [
    { time: "09:00", name: "Thandi M.", service: "Knotless braids", price: "R 550", status: "confirmed" },
    { time: "11:30", name: "Lebo K.", service: "Soft locs install", price: "R 600", status: "confirmed" },
    { time: "13:00", name: "Naledi P.", service: "Wash & style", price: "R 220", status: "pending" },
    { time: "15:30", name: "Sipho D.", service: "Box braids", price: "R 380", status: "confirmed" },
    { time: "17:00", name: "Amo R.", service: "Refill", price: "R 180", status: "new" },
  ];
  return (
    <article className="rounded-2xl border border-border bg-surface/40 p-6 sm:p-8">
      <SectionLabel
        icon={<TrendingUp className="h-5 w-5" />}
        tag="Admin Dashboard"
        title="Owner dashboard — bookings, revenue & customers"
        blurb="Replace the WhatsApp scroll-back with a clean dashboard. See today's schedule, this month's revenue, top services and customer activity at a glance — secured with login."
      />
      <SampleFrame title="🔒 salon admin dashboard — private demo">
        <div className="overflow-hidden rounded-lg border border-border bg-zinc-950 text-zinc-100">
          {/* Top bar */}
          <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/80 px-4 py-2.5">
            <div className="flex items-center gap-3">
              <Menu className="h-4 w-4 text-zinc-400" />
              <span className="font-display text-xs font-semibold">GlowStudio Admin</span>
              <span className="hidden rounded bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-medium text-emerald-400 sm:inline">
                Live
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1 sm:flex">
                <Search className="h-3 w-3 text-zinc-500" />
                <span className="text-[10px] text-zinc-500">Search bookings…</span>
              </div>
              <Bell className="h-4 w-4 text-zinc-400" />
              <span className="grid h-6 w-6 place-items-center rounded-full bg-rose-500/80 text-[10px] font-bold">
                S
              </span>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid gap-3 border-b border-zinc-800 bg-zinc-950 p-4 sm:grid-cols-4">
            {[
              { l: "Today's bookings", v: "12", d: "+3 vs yesterday", icon: <Calendar className="h-3.5 w-3.5" />, up: true },
              { l: "This week revenue", v: "R 18,450", d: "+22% MoM", icon: <Wallet className="h-3.5 w-3.5" />, up: true },
              { l: "New customers", v: "7", d: "+2 this week", icon: <ShoppingBag className="h-3.5 w-3.5" />, up: true },
              { l: "No-shows", v: "1", d: "−2 vs last wk", icon: <TrendingDown className="h-3.5 w-3.5" />, up: false },
            ].map((s) => (
              <div key={s.l} className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
                <div className="flex items-center justify-between text-zinc-500">
                  <span className="text-[10px] uppercase tracking-wider">{s.l}</span>
                  <span className="text-zinc-600">{s.icon}</span>
                </div>
                <p className="mt-1.5 font-display text-xl font-bold">{s.v}</p>
                <p
                  className={`mt-0.5 inline-flex items-center gap-1 text-[10px] ${
                    s.up ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {s.up ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                  {s.d}
                </p>
              </div>
            ))}
          </div>

          {/* Bookings table + chart */}
          <div className="grid gap-4 p-4 lg:grid-cols-[1.4fr_1fr]">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/40">
              <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2">
                <p className="text-[11px] font-semibold">Today — Mon 21 Apr</p>
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded border border-zinc-800 px-1.5 py-0.5 text-[9px] text-zinc-400">
                    <Filter className="h-2.5 w-2.5" /> All
                  </span>
                  <span className="inline-flex items-center gap-1 rounded border border-zinc-800 px-1.5 py-0.5 text-[9px] text-zinc-400">
                    <Download className="h-2.5 w-2.5" /> Export
                  </span>
                </div>
              </div>
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-zinc-800 text-left text-zinc-500">
                    <th className="px-3 py-1.5 font-mono font-normal uppercase">Time</th>
                    <th className="px-3 py-1.5 font-mono font-normal uppercase">Customer</th>
                    <th className="px-3 py-1.5 font-mono font-normal uppercase">Service</th>
                    <th className="px-3 py-1.5 text-right font-mono font-normal uppercase">Price</th>
                    <th className="px-3 py-1.5 text-right font-mono font-normal uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.time} className="border-b border-zinc-800/60 last:border-0">
                      <td className="px-3 py-1.5 font-mono text-zinc-400">{b.time}</td>
                      <td className="px-3 py-1.5">{b.name}</td>
                      <td className="px-3 py-1.5 text-zinc-400">{b.service}</td>
                      <td className="px-3 py-1.5 text-right font-mono">{b.price}</td>
                      <td className="px-3 py-1.5 text-right">
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[9px] font-medium ${
                            b.status === "confirmed"
                              ? "bg-emerald-500/15 text-emerald-400"
                              : b.status === "pending"
                                ? "bg-amber-500/15 text-amber-400"
                                : "bg-sky-500/15 text-sky-400"
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mini revenue chart */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold">Revenue · last 7 days</p>
                <span className="text-[9px] text-emerald-400">+22%</span>
              </div>
              <p className="mt-1 font-display text-lg font-bold">R 18,450</p>
              <div className="mt-3 flex h-20 items-end gap-1.5">
                {[40, 55, 35, 70, 60, 85, 95].map((h, i) => (
                  <div key={i} className="flex-1">
                    <div
                      className="rounded-t bg-gradient-to-t from-rose-600 to-rose-400"
                      style={{ height: `${h}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-1 flex justify-between text-[9px] text-zinc-500">
                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                  <span key={i}>{d}</span>
                ))}
              </div>
              <div className="mt-3 space-y-1.5 border-t border-zinc-800 pt-2">
                {[
                  { l: "Knotless braids", v: "R 6,600" },
                  { l: "Soft locs", v: "R 4,800" },
                  { l: "Weaves", v: "R 3,420" },
                ].map((s) => (
                  <div key={s.l} className="flex justify-between text-[10px]">
                    <span className="text-zinc-400">{s.l}</span>
                    <span className="font-mono text-zinc-200">{s.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SampleFrame>
      <SampleResultRow
        bullets={["Login-secured", "Real-time bookings", "Revenue analytics", "Customer database"]}
        price="From R3,500"
        cta="Get a dashboard like this"
        message="Hi, I'd like a booking dashboard like the one in your portfolio"
      />
    </article>
  );
}

/* ---------- 6. CUSTOMER-FACING MOBILE APP ---------- */
function MobileAppSample() {
  return (
    <article className="rounded-2xl border border-border bg-surface/40 p-6 sm:p-8">
      <SectionLabel
        icon={<Smartphone className="h-5 w-5" />}
        tag="Customer App"
        title="Restaurant ordering app — mobile-first UI"
        blurb="Customers browse the menu, order and pay without ever leaving WhatsApp. Below: the kasi-restaurant ordering flow we built for a Sunnyside kitchen — installable as a PWA, no app store fees."
      />
      <SampleFrame title="🔒 restaurant order app — private demo">
        <div className="grid gap-5 rounded-lg bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-5 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          {/* Phone mockup */}
          <div className="mx-auto w-full max-w-[260px]">
            <div className="rounded-[2rem] border-[10px] border-zinc-900 bg-white shadow-2xl">
              <div className="rounded-[1.4rem] overflow-hidden">
                {/* Status bar */}
                <div className="flex items-center justify-between bg-orange-700 px-4 py-1.5 text-[9px] font-semibold text-white">
                  <span>9:41</span>
                  <span className="font-mono">100%</span>
                </div>
                {/* App header */}
                <div className="bg-orange-700 px-4 pb-3 pt-1 text-white">
                  <p className="font-serif text-base font-bold">Uthando Kitchen</p>
                  <p className="text-[9px] opacity-80">Authentic SA home cooking · Sunnyside</p>
                </div>
                {/* Hero */}
                <img
                  src={demoRestaurant}
                  alt="Pap, chicken stew and coleslaw plated"
                  className="h-28 w-full object-cover"
                  loading="lazy"
                />
                {/* Menu */}
                <div className="space-y-2 p-3">
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-orange-700">
                    Today&apos;s plates
                  </p>
                  {[
                    { n: "Pap & Chicken Stew", p: "R 85" },
                    { n: "Oxtail Sunday Special", p: "R 150" },
                    { n: "Family Platter (4)", p: "R 380" },
                  ].map((d) => (
                    <div
                      key={d.n}
                      className="flex items-center justify-between rounded-md border border-orange-100 bg-orange-50/60 px-2.5 py-1.5"
                    >
                      <span className="text-[10px] font-medium text-amber-950">{d.n}</span>
                      <span className="text-[10px] font-bold text-orange-700">{d.p}</span>
                    </div>
                  ))}
                  <button className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md bg-orange-700 py-2 text-[10px] font-semibold text-white">
                    <ShoppingBag className="h-3 w-3" /> View Cart · 2 items
                  </button>
                </div>
              </div>
            </div>
            <p className="mt-2 text-center font-mono text-[10px] text-amber-900/60">
              Installable PWA · works offline
            </p>
          </div>

          {/* Feature list */}
          <div className="text-amber-950">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-orange-700">
              What&apos;s included
            </p>
            <h3 className="mt-2 font-serif text-2xl font-bold leading-tight">
              A full ordering system,{" "}
              <span className="text-orange-700">no app store needed</span>
            </h3>
            <ul className="mt-4 space-y-2.5 text-xs text-amber-950/80">
              {[
                "Live menu — owner edits prices & availability in seconds",
                "WhatsApp checkout — orders land directly in the kitchen",
                "Customer accounts, order history & re-order in one tap",
                "Card / EFT / SnapScan payment ready",
                "Daily / weekly sales report emailed automatically",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-700" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>

            {/* Mini result card with mechanic photo as second proof point */}
            <div className="mt-5 flex items-center gap-3 rounded-xl border border-orange-200 bg-white/70 p-3">
              <img
                src={demoMechanic}
                alt="Mechanic workshop floor"
                className="h-14 w-14 rounded-md object-cover"
                loading="lazy"
              />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-orange-700">
                  Also built for
                </p>
                <p className="text-xs font-semibold text-amber-950">
                  PTA MotorWorks — quote-by-photo workflow
                </p>
                <p className="text-[10px] text-amber-900/70">
                  Same stack, same 48-hr delivery, same WhatsApp-first design.
                </p>
              </div>
            </div>
          </div>
        </div>
      </SampleFrame>
      <SampleResultRow
        bullets={["No app store fees", "Installable on any phone", "WhatsApp checkout", "Owner-editable menu"]}
        price="From R2,800"
        cta="Get an app like this"
        message="Hi, I'd like a customer ordering app like the portfolio demo"
      />
    </article>
  );
}

function SampleResultRow({
  bullets,
  price,
  cta,
  message,
}: {
  bullets: string[];
  price: string;
  cta: string;
  message: string;
}) {
  return (
    <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
      <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
        {bullets.map((b) => (
          <li key={b} className="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
            <CheckCircle2 className="h-3 w-3 text-primary" /> {b}
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-3">
        <span className="font-mono text-sm text-primary">{price}</span>
        <a
          href={waLink(message)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
        >
          {cta} <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}