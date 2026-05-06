import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Star, MapPin, MessageCircle } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { SITE, waLink } from "@/lib/site";
import demoSalon from "@/assets/demo-salon.jpg";
import demoCleaning from "@/assets/demo-cleaning.jpg";
import demoSpaza from "@/assets/demo-spaza.jpg";
import demoGym from "@/assets/demo-gym.jpg";
import demoMechanic from "@/assets/demo-mechanic.jpg";
import demoRestaurant from "@/assets/demo-restaurant.jpg";
import demoNails from "@/assets/demo-nails.jpg";
import demoGeneral from "@/assets/demo-general.jpg";

const TITLE = "Live Demos — See What We Can Build for You | SKC Digital";
const DESC =
  "Click any tab to preview a live working demo of a one-page website. Each one is custom-built — not a template. From R800. Delivered in 48 hours.";

export const Route = createFileRoute("/demos")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: `${SITE.url}/demos` },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
    ],
  }),
  component: DemosPage,
});

type Demo = {
  id: string;
  industry: string;
  emoji: string;
  domain: string;
  brand: string;
  tagline: string;
  headline: string;
  highlight: string;
  desc: string;
  reviewLocation: string;
  services: { name: string; price: string }[];
  image: string;
  /** A self-contained Tailwind-friendly theme. Each demo overrides the
   *  preview frame so the website inside the browser frame feels distinct. */
  theme: {
    /** Background gradient classes for the site body */
    bg: string;
    /** Text color for body copy */
    text: string;
    /** Muted text color */
    muted: string;
    /** Accent color (used for headings, badges, prices) */
    accent: string;
    /** Solid CTA button classes (bg + text) */
    cta: string;
    /** Card surface classes (bg + border) */
    card: string;
    /** Font family class for the brand/headline */
    font: string;
  };
};

const DEMOS: Demo[] = [
  {
    id: "salon",
    industry: "Hair Salon",
    emoji: "💇🏾‍♀️",
    domain: "glowstudio.co.za",
    brand: "GlowStudio",
    tagline: "Pretoria's Premier Hair Studio",
    headline: "Where Every Braid Tells Your Story",
    highlight: "Tells Your Story",
    desc: "Braids, relaxers, weaves & natural hair care. Walk-ins welcome.",
    reviewLocation: "Hatfield, PTA",
    services: [
      { name: "Small Knotless", price: "From R550" },
      { name: "Medium Knotless", price: "From R420" },
      { name: "Box Braids", price: "From R380" },
      { name: "Soft Locs", price: "From R600" },
    ],
    image: demoSalon,
    theme: {
      bg: "bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50",
      text: "text-rose-950",
      muted: "text-rose-900/70",
      accent: "text-rose-600",
      cta: "bg-rose-600 text-white hover:bg-rose-700",
      card: "bg-white/80 border-rose-200",
      font: "font-serif",
    },
  },
  {
    id: "cleaning",
    industry: "Cleaning Co.",
    emoji: "🧼",
    domain: "sparklepta.co.za",
    brand: "SparklePTA",
    tagline: "Professional Home & Office Cleaning",
    headline: "A Spotless Space, Every Single Visit",
    highlight: "Every Single Visit",
    desc: "Once-off, weekly or monthly cleans. Trusted, vetted teams. Pretoria-wide.",
    reviewLocation: "Centurion, PTA",
    services: [
      { name: "Standard Home Clean", price: "From R450" },
      { name: "Deep Clean", price: "From R850" },
      { name: "Office Clean", price: "From R650" },
      { name: "Move-in / Move-out", price: "From R1,200" },
    ],
    image: demoCleaning,
    theme: {
      bg: "bg-gradient-to-br from-sky-50 via-white to-cyan-50",
      text: "text-slate-900",
      muted: "text-slate-600",
      accent: "text-sky-600",
      cta: "bg-sky-600 text-white hover:bg-sky-700",
      card: "bg-white border-sky-200",
      font: "font-sans",
    },
  },
  {
    id: "spaza",
    industry: "Spaza Shop",
    emoji: "🏪",
    domain: "kasispaza.co.za",
    brand: "Kasi Spaza",
    tagline: "Your Local Corner Store, Online",
    headline: "Order from the Spaza on WhatsApp",
    highlight: "on WhatsApp",
    desc: "Bread, airtime, electricity & groceries. WhatsApp orders, same-day delivery in your area.",
    reviewLocation: "Mamelodi, PTA",
    services: [
      { name: "Airtime / Data", price: "All networks" },
      { name: "Electricity", price: "Instant token" },
      { name: "Groceries", price: "From R20" },
      { name: "Bread & Milk", price: "From R18" },
    ],
    image: demoSpaza,
    theme: {
      bg: "bg-gradient-to-br from-yellow-50 via-amber-50 to-red-50",
      text: "text-stone-900",
      muted: "text-stone-700",
      accent: "text-red-600",
      cta: "bg-red-600 text-white hover:bg-red-700",
      card: "bg-white border-amber-300",
      font: "font-sans",
    },
  },
  {
    id: "gym",
    industry: "Gym / Fitness",
    emoji: "🏋🏾",
    domain: "ironboxpta.co.za",
    brand: "IronBox PTA",
    tagline: "Strength · Conditioning · Community",
    headline: "Stronger Every Week, No Excuses",
    highlight: "No Excuses",
    desc: "Group classes, personal training and 24/7 access. First class is free.",
    reviewLocation: "Lynnwood, PTA",
    services: [
      { name: "Day Pass", price: "R80" },
      { name: "Monthly Member", price: "R550/mo" },
      { name: "Personal Training", price: "From R250" },
      { name: "Group Classes", price: "Included" },
    ],
    image: demoGym,
    theme: {
      bg: "bg-gradient-to-br from-zinc-950 via-zinc-900 to-black",
      text: "text-zinc-100",
      muted: "text-zinc-400",
      accent: "text-orange-500",
      cta: "bg-orange-500 text-black hover:bg-orange-400",
      card: "bg-zinc-900/80 border-zinc-800",
      font: "font-sans",
    },
  },
  {
    id: "mechanic",
    industry: "Mechanic",
    emoji: "🔧",
    domain: "ptamotorworks.co.za",
    brand: "PTA MotorWorks",
    tagline: "Honest Pricing. Quality Workmanship.",
    headline: "Get Your Car Sorted Without the Surprises",
    highlight: "Without the Surprises",
    desc: "Services, repairs & diagnostics. WhatsApp us a photo, get a quote within an hour.",
    reviewLocation: "Pretoria West",
    services: [
      { name: "Major Service", price: "From R1,800" },
      { name: "Minor Service", price: "From R950" },
      { name: "Brake Pads (front)", price: "From R750" },
      { name: "Diagnostic Scan", price: "R300" },
    ],
    image: demoMechanic,
    theme: {
      bg: "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
      text: "text-slate-50",
      muted: "text-slate-300",
      accent: "text-blue-400",
      cta: "bg-blue-600 text-white hover:bg-blue-500",
      card: "bg-slate-800/80 border-slate-700",
      font: "font-sans",
    },
  },
  {
    id: "restaurant",
    industry: "Restaurant",
    emoji: "🍽️",
    domain: "uthandokitchen.co.za",
    brand: "Uthando Kitchen",
    tagline: "Authentic SA Home Cooking",
    headline: "Real Food. Real Flavour. Real Local.",
    highlight: "Real Local",
    desc: "Pap & vleis, chakalaka, oxtail and Sunday lunch specials. Dine-in or WhatsApp order.",
    reviewLocation: "Sunnyside, PTA",
    services: [
      { name: "Pap & Wors Combo", price: "R85" },
      { name: "Oxtail Sunday Special", price: "R150" },
      { name: "Chakalaka & Pap", price: "R55" },
      { name: "Family Platter (4)", price: "R380" },
    ],
    image: demoRestaurant,
    theme: {
      bg: "bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50",
      text: "text-amber-950",
      muted: "text-amber-900/70",
      accent: "text-orange-700",
      cta: "bg-orange-700 text-white hover:bg-orange-800",
      card: "bg-white/90 border-orange-200",
      font: "font-serif",
    },
  },
  {
    id: "nails",
    industry: "Nail Salon",
    emoji: "💅🏾",
    domain: "lavishnails.co.za",
    brand: "Lavish Nails",
    tagline: "Where Every Set Is a Statement",
    headline: "Long-Lasting Sets, Booked on WhatsApp",
    highlight: "Booked on WhatsApp",
    desc: "Acrylics, gel, BIAB, classic mani-pedi. Walk-ins or book ahead via WhatsApp.",
    reviewLocation: "Menlyn, PTA",
    services: [
      { name: "Full Acrylic Set", price: "From R380" },
      { name: "Gel Refill", price: "From R220" },
      { name: "Classic Mani + Pedi", price: "R280" },
      { name: "BIAB Overlay", price: "From R250" },
    ],
    image: demoNails,
    theme: {
      bg: "bg-gradient-to-br from-purple-50 via-fuchsia-50 to-pink-50",
      text: "text-purple-950",
      muted: "text-purple-900/70",
      accent: "text-purple-600",
      cta: "bg-purple-600 text-white hover:bg-purple-700",
      card: "bg-white/85 border-purple-200",
      font: "font-serif",
    },
  },
  {
    id: "general",
    industry: "General Store",
    emoji: "🛒",
    domain: "thekasimarket.co.za",
    brand: "The Kasi Market",
    tagline: "Everything you need, in one trip",
    headline: "Your Neighbourhood Store, Now Online",
    highlight: "Now Online",
    desc: "Household basics, school supplies, gift items and more. WhatsApp delivery available.",
    reviewLocation: "Soshanguve, PTA",
    services: [
      { name: "Household Basics", price: "From R30" },
      { name: "School Stationery", price: "From R15" },
      { name: "Gift Items", price: "From R75" },
      { name: "Delivery (5km)", price: "R30" },
    ],
    image: demoGeneral,
    theme: {
      bg: "bg-gradient-to-br from-emerald-50 via-stone-50 to-amber-50",
      text: "text-emerald-950",
      muted: "text-emerald-900/70",
      accent: "text-emerald-700",
      cta: "bg-emerald-700 text-white hover:bg-emerald-800",
      card: "bg-white/90 border-emerald-200",
      font: "font-sans",
    },
  },
];

function DemosPage() {
  const [active, setActive] = useState(DEMOS[0].id);
  const demo = DEMOS.find((d) => d.id === active) ?? DEMOS[0];

  return (
    <>
      <PageHero
        eyebrow="Live Demos"
        title={
          <>
            See What We Can Build <span className="text-gradient">for Your Business</span>
          </>
        }
        description="Click any industry below to preview a real working demo. Each one is custom-built — not a template. From R800. Delivered in 48hrs."
      />

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        {/* Industry tabs */}
        <div className="flex flex-wrap gap-2">
          {DEMOS.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setActive(d.id)}
              className={
                "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors " +
                (active === d.id
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border bg-surface/40 text-muted-foreground hover:border-primary/40 hover:text-foreground")
              }
            >
              <span>{d.emoji}</span> {d.industry}
            </button>
          ))}
        </div>

        {/* Browser-frame preview */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
          <div className="flex items-center gap-3 border-b border-border bg-surface/60 px-4 py-2.5">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
            </div>
            <div className="flex-1">
              <span className="rounded-md border border-border bg-background px-3 py-1 font-mono text-[11px] text-muted-foreground">
                🔒 {demo.domain}
              </span>
            </div>
            <span className="hidden font-mono text-[10px] uppercase tracking-wider text-primary sm:inline">
              Live Demo
            </span>
          </div>

          {/* Themed mock website */}
          <div className={`relative ${demo.theme.bg} ${demo.theme.text} p-5 sm:p-8`}>
            {/* Mock site nav */}
            <div className="flex items-center justify-between">
              <span className={`text-lg font-bold ${demo.theme.font}`}>
                {demo.brand}
                <span className={demo.theme.accent}>.</span>
              </span>
              <div className={`hidden gap-4 text-[11px] sm:flex ${demo.theme.muted}`}>
                <span>Services</span>
                <span>Gallery</span>
                <span>Pricing</span>
              </div>
              <a
                href={waLink(`Hi, I'd like to make a booking via your ${demo.brand} demo.`)}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-semibold transition-colors ${demo.theme.cta}`}
              >
                <MessageCircle className="h-3 w-3" /> Book Now
              </a>
            </div>

            {/* Hero */}
            <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-center">
              <div>
                <p className={`text-[11px] uppercase tracking-wider ${demo.theme.accent}`}>
                  {demo.tagline}
                </p>
                <h2 className={`mt-3 text-3xl font-bold leading-tight sm:text-4xl ${demo.theme.font}`}>
                  {demo.headline.split(demo.highlight)[0]}
                  <span className={demo.theme.accent}>{demo.highlight}</span>
                </h2>
                <p className={`mt-3 max-w-md text-sm ${demo.theme.muted}`}>{demo.desc}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <a
                    href={waLink(`Hi, I'd like to book at ${demo.brand}.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-semibold transition-colors ${demo.theme.cta}`}
                  >
                    💬 Book via WhatsApp
                  </a>
                  <span className={`rounded-md border bg-white/40 px-3 py-1.5 text-[11px] font-medium ${demo.theme.card}`}>
                    View Services
                  </span>
                </div>
                <div className={`mt-4 flex flex-wrap gap-3 text-[11px] ${demo.theme.muted}`}>
                  <span className="inline-flex items-center gap-1">
                    <Star className={`h-3 w-3 ${demo.theme.accent}`} fill="currentColor" /> 4.9 Google
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className={`h-3 w-3 ${demo.theme.accent}`} /> {demo.reviewLocation}
                  </span>
                </div>

                {/* Services preview card */}
                <div className={`mt-6 rounded-xl border p-5 backdrop-blur ${demo.theme.card}`}>
                  <p className={`text-[10px] uppercase tracking-wider ${demo.theme.muted}`}>
                    Popular services
                  </p>
                  <ul className="mt-3 divide-y divide-current/10">
                    {demo.services.map((s) => (
                      <li key={s.name} className="flex items-center justify-between py-2 text-sm">
                        <span>{s.name}</span>
                        <span className={`text-xs font-semibold ${demo.theme.accent}`}>{s.price}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Hero image */}
              <div className={`relative overflow-hidden rounded-2xl border shadow-xl ${demo.theme.card}`}>
                <img
                  src={demo.image}
                  alt={`${demo.brand} — ${demo.industry} demo website hero`}
                  width={1024}
                  height={640}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        <p className="mt-3 text-center font-mono text-[11px] text-muted-foreground">
          Demo: {demo.domain} — custom-built one-page site, live in under 48hrs
        </p>

        <div className="mt-12 grid gap-3 rounded-2xl border border-dashed border-primary/40 bg-surface/30 p-8 text-center sm:grid-cols-[1fr_auto] sm:text-left">
          <div>
          <h2 className="font-display text-2xl font-semibold">Want a demo for your industry?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Don&apos;t see your business above? We&apos;ll mock up a free preview before you commit.
          </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 sm:justify-end">
            <a
              href={waLink(`Hi ${SITE.name}, I'd like a demo for my business.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Request a demo <ArrowRight className="h-4 w-4" />
            </a>
          <Link
            to="/contact"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-5 py-2.5 text-sm font-semibold hover:border-primary/40"
          >
              Contact
          </Link>
          </div>
        </div>
      </section>
    </>
  );
}