import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft, ShoppingCart, Download, CheckCircle2,
  X, Loader2, FileText, BookOpen, Wrench, Package,
  Sparkles, Mail, ChevronLeft, ChevronRight, Lock,
  Star, Play, Calculator, Plus, Trash2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { submitPayFastForm } from "@/lib/payfast";
import { SITE } from "@/lib/site";

type ProductMeta = {
  highlights?: string[];
  includes?: string[];
  gallery_urls?: string[];
  demo_type?: "calculator";
  demo_url?: string;
};

type Product = {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: string;
  price_zar: number;
  cover_url: string | null;
  is_free: boolean;
  meta: ProductMeta;
};

export const Route = createFileRoute("/product/$slug")({
  head: ({ loaderData }) => {
    const title = loaderData?.product?.title
      ? `${loaderData.product.title} — SKC Digital Shop`
      : "Product — SKC Digital";
    const desc = loaderData?.product?.description ?? "Digital product by SKC Digital";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: `${SITE.url}/product/${loaderData?.product?.slug ?? ""}` },
      ],
    };
  },
  loader: async ({ params }) => {
    const { data, error } = await supabase
      .from("products")
      .select("id, slug, title, description, type, price_zar, cover_url, is_free, meta")
      .eq("slug", params.slug)
      .eq("is_published", true)
      .maybeSingle();

    if (error || !data) throw notFound();

    const raw = data as unknown as Omit<Product, "meta"> & { meta: unknown };
    const meta: ProductMeta =
      raw.meta && typeof raw.meta === "object" && !Array.isArray(raw.meta)
        ? (raw.meta as ProductMeta)
        : {};

    return { product: { ...raw, meta } satisfies Product };
  },
  component: ProductDetailPage,
  notFoundComponent: () => (
    <div className="py-32 text-center">
      <p className="text-muted-foreground">Product not found.</p>
      <Link
        to="/products"
        className="mt-4 inline-flex items-center gap-2 text-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> Back to shop
      </Link>
    </div>
  ),
});

const TYPE_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  pdf_guide:     { label: "PDF Guide",    icon: <FileText className="h-4 w-4" />,  color: "text-sky-400 bg-sky-500/10 border-sky-500/30" },
  course:        { label: "Course",       icon: <BookOpen className="h-4 w-4" />,  color: "text-violet-400 bg-violet-500/10 border-violet-500/30" },
  software_tool: { label: "Tool",         icon: <Wrench className="h-4 w-4" />,    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  done_for_you:  { label: "Done-For-You", icon: <Package className="h-4 w-4" />,   color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
  newsletter:    { label: "Newsletter",   icon: <Mail className="h-4 w-4" />,      color: "text-pink-400 bg-pink-500/10 border-pink-500/30" },
  other:         { label: "Digital",      icon: <Sparkles className="h-4 w-4" />,  color: "text-muted-foreground bg-surface border-border" },
};

function ProductDetailPage() {
  const { product } = Route.useLoaderData();
  const [showCheckout, setShowCheckout] = useState(false);
  const typeMeta = TYPE_META[product.type] ?? TYPE_META.other;
  const { meta } = product;

  return (
    <>
      {/* Breadcrumb */}
      <div className="border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-foreground">Shop</Link>
            <span>/</span>
            <span className="text-foreground line-clamp-1">{product.title}</span>
          </nav>
        </div>
      </div>

      {/* Hero / Product Info */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_360px] lg:items-start">

            {/* Left: cover + info */}
            <div>
              {/* Cover */}
              <div className="relative mb-8 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/8 to-transparent">
                {product.cover_url ? (
                  <img
                    src={product.cover_url}
                    alt={product.title}
                    className="h-56 w-full object-cover sm:h-72"
                  />
                ) : (
                  <div className="flex h-56 items-center justify-center sm:h-72">
                    <div className="text-primary/15 scale-[3.5]">{typeMeta.icon}</div>
                  </div>
                )}
                <span className={`absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-xs uppercase tracking-wider backdrop-blur ${typeMeta.color}`}>
                  {typeMeta.icon} {typeMeta.label}
                </span>
              </div>

              <h1 className="font-display text-3xl font-bold sm:text-4xl">{product.title}</h1>

              {/* Highlights */}
              {meta.highlights && meta.highlights.length > 0 && (
                <ul className="mt-5 space-y-2">
                  {meta.highlights.map((h) => (
                    <li key={h} className="flex items-center gap-2.5 text-sm font-medium">
                      <Star className="h-4 w-4 shrink-0 text-primary" fill="currentColor" />
                      {h}
                    </li>
                  ))}
                </ul>
              )}

              <p className="mt-5 text-muted-foreground leading-relaxed">{product.description}</p>
            </div>

            {/* Right: purchase card — sticky on desktop */}
            <div className="lg:sticky lg:top-6">
              <div className="rounded-2xl border border-border bg-surface p-6 shadow-xl shadow-black/10">
                <div className="text-4xl font-bold">
                  {product.is_free ? (
                    <span className="text-emerald-400">Free</span>
                  ) : (
                    `R${product.price_zar.toLocaleString("en-ZA")}`
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {product.is_free
                    ? "No payment needed"
                    : "Once-off · ZAR · Instant access after payment"}
                </p>

                <button
                  onClick={() => setShowCheckout(true)}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  {product.is_free ? (
                    <><Download className="h-4 w-4" /> Get for free</>
                  ) : (
                    <><ShoppingCart className="h-4 w-4" /> Buy now</>
                  )}
                </button>

                {/* Includes preview in card */}
                {meta.includes && meta.includes.length > 0 && (
                  <ul className="mt-5 space-y-2.5 border-t border-border pt-5">
                    {meta.includes.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-xs">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <p className="mt-4 text-center text-[11px] text-muted-foreground">
                  Secured by <span className="font-semibold">PayFast</span> · SA payment gateway
                </p>
              </div>

              {/* WhatsApp questions */}
              <div className="mt-4 rounded-xl border border-border bg-surface/40 p-4 text-center">
                <p className="text-xs text-muted-foreground">Questions before buying?</p>
                <a
                  href={`https://wa.me/${SITE.phoneRaw}?text=${encodeURIComponent(`Hi SKC Digital, I have a question about "${product.title}"`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  WhatsApp us →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Screenshot gallery */}
      {meta.gallery_urls && meta.gallery_urls.length > 0 && (
        <ImageGallery images={meta.gallery_urls} productTitle={product.title} />
      )}

      {/* What's included */}
      {meta.includes && meta.includes.length > 0 && (
        <section className="border-t border-border bg-background py-14">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-2xl font-bold">What&apos;s included</h2>
            <p className="mt-1 text-sm text-muted-foreground">Everything you get with your purchase:</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {meta.includes.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-xl border border-border bg-surface/40 p-4 transition-colors hover:border-primary/30"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Type-specific interactive preview */}
      {product.type === "software_tool" && meta.demo_type === "calculator" && (
        <QuoteCalculatorDemo />
      )}
      {product.type === "course" && <CoursePreview />}
      {product.type === "pdf_guide" && <PdfPreview />}
      {product.type === "done_for_you" && <DoneForYouProcess />}

      {/* Embedded iframe demo */}
      {meta.demo_url && (
        <section className="border-t border-border py-14">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-2xl font-bold mb-2">Try it live</h2>
            <p className="text-sm text-muted-foreground mb-6">Interact with the tool directly below:</p>
            <iframe
              src={meta.demo_url}
              className="w-full rounded-2xl border border-border"
              style={{ height: 520 }}
              title={`${product.title} demo`}
            />
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="border-t border-border bg-surface/40 py-16">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
          <p className="font-mono text-xs uppercase tracking-wider text-primary">Ready?</p>
          <h2 className="mt-3 font-display text-3xl font-bold">{product.title}</h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setShowCheckout(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 font-semibold text-primary-foreground hover:opacity-90"
            >
              <ShoppingCart className="h-4 w-4" />
              {product.is_free
                ? "Get for free"
                : `Buy now — R${product.price_zar.toLocaleString("en-ZA")}`}
            </button>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-xl border border-border px-8 py-3.5 font-semibold hover:border-primary/40"
            >
              Browse all products
            </Link>
          </div>
        </div>
      </section>

      {/* Checkout modal */}
      {showCheckout && (
        <CheckoutModal product={product} onClose={() => setShowCheckout(false)} />
      )}
    </>
  );
}

/* ── Image Gallery ─────────────────────────────────────────────────── */
function ImageGallery({ images, productTitle }: { images: string[]; productTitle: string }) {
  const [active, setActive] = useState(0);

  return (
    <section className="border-t border-border bg-surface/40 py-14">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h2 className="font-display text-2xl font-bold">Screenshots &amp; Preview</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          See what you&apos;re getting before you buy
        </p>

        {/* Main image */}
        <div className="relative mt-6 overflow-hidden rounded-2xl border border-border bg-surface">
          <img
            src={images[active]}
            alt={`${productTitle} screenshot ${active + 1}`}
            className="h-64 w-full object-cover sm:h-96"
          />
          {images.length > 1 && (
            <>
              <button
                onClick={() => setActive((a) => (a - 1 + images.length) % images.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-border bg-background/80 p-2 backdrop-blur hover:border-primary/40"
                aria-label="Previous"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setActive((a) => (a + 1) % images.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-border bg-background/80 p-2 backdrop-blur hover:border-primary/40"
                aria-label="Next"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
          {/* Dot indicators */}
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === active ? "w-6 bg-primary" : "w-1.5 bg-white/50"
                }`}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                  i === active ? "border-primary" : "border-border hover:border-primary/40"
                }`}
              >
                <img
                  src={src}
                  alt={`Thumbnail ${i + 1}`}
                  className="h-14 w-20 object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ── Interactive Demo: Quote Calculator ────────────────────────────── */
type LineItem = { desc: string; qty: number; rate: number };

function QuoteCalculatorDemo() {
  const [clientName, setClientName] = useState("Thandi Beauty Salon");
  const [items, setItems] = useState<LineItem[]>([
    { desc: "Logo design", qty: 1, rate: 1500 },
    { desc: "Business cards (100 units)", qty: 1, rate: 350 },
  ]);
  const [toastVisible, setToastVisible] = useState(false);

  function addItem() {
    setItems((prev) => [...prev, { desc: "", qty: 1, rate: 0 }]);
  }
  function removeItem(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  }
  function updateItem(i: number, field: keyof LineItem, value: string | number) {
    setItems((prev) =>
      prev.map((it, idx) => (idx === i ? { ...it, [field]: value } : it))
    );
  }

  const subtotal = items.reduce((s, it) => s + it.qty * it.rate, 0);
  const vat = subtotal * 0.15;
  const total = subtotal + vat;

  function handleExport() {
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  }

  return (
    <section className="border-t border-border bg-background py-14">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-primary">Live Demo</p>
            <h2 className="mt-1 font-display text-2xl font-bold">Try the Quote Builder</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Add items — totals and VAT calculate instantly
            </p>
          </div>
          <Calculator className="h-8 w-8 shrink-0 text-primary/30" />
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-surface">
          {/* Quote header */}
          <div className="flex items-start justify-between border-b border-border bg-surface/60 p-5">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Quote for</p>
              <input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="mt-1 bg-transparent font-display text-lg font-bold focus:outline-none"
                placeholder="Client name"
              />
            </div>
            <div className="text-right">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Ref</p>
              <p className="font-mono text-sm font-bold text-primary">SKC-QT-0042</p>
              <p className="font-mono text-[10px] text-muted-foreground">
                {new Date().toLocaleDateString("en-ZA")}
              </p>
            </div>
          </div>

          {/* Line items */}
          <div className="p-5">
            <div className="mb-2 grid grid-cols-[1fr_56px_80px_80px_32px] gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              <span>Description</span>
              <span className="text-right">Qty</span>
              <span className="text-right">Rate (R)</span>
              <span className="text-right">Amount</span>
              <span />
            </div>

            <div className="space-y-2">
              {items.map((item, i) => (
                <div key={i} className="grid grid-cols-[1fr_56px_80px_80px_32px] items-center gap-2">
                  <input
                    value={item.desc}
                    onChange={(e) => updateItem(i, "desc", e.target.value)}
                    placeholder="Service or product"
                    className="rounded-lg border border-border bg-background px-2.5 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                  <input
                    type="number"
                    value={item.qty}
                    min={1}
                    onChange={(e) => updateItem(i, "qty", Math.max(1, Number(e.target.value)))}
                    className="rounded-lg border border-border bg-background px-2 py-2 text-right text-sm focus:border-primary focus:outline-none"
                  />
                  <input
                    type="number"
                    value={item.rate}
                    min={0}
                    onChange={(e) => updateItem(i, "rate", Number(e.target.value))}
                    className="rounded-lg border border-border bg-background px-2 py-2 text-right text-sm focus:border-primary focus:outline-none"
                  />
                  <p className="text-right text-sm font-semibold tabular-nums">
                    R{(item.qty * item.rate).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                  </p>
                  <button
                    onClick={() => removeItem(i)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={addItem}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground hover:border-primary/40 hover:text-primary"
            >
              <Plus className="h-3.5 w-3.5" /> Add line item
            </button>

            {/* Totals */}
            <div className="ml-auto mt-5 w-full max-w-[240px] space-y-1.5 border-t border-border pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="tabular-nums">R{subtotal.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">VAT (15%)</span>
                <span className="tabular-nums">R{vat.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-1.5 font-bold">
                <span>Total</span>
                <span className="tabular-nums text-primary">R{total.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Export button with tooltip */}
            <div className="relative mt-5 inline-block">
              <button
                onClick={handleExport}
                className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/20"
              >
                <Download className="h-4 w-4" /> Export as PDF
              </button>
              {toastVisible && (
                <div className="absolute bottom-full left-0 mb-2 whitespace-nowrap rounded-lg border border-border bg-surface px-4 py-2 text-xs shadow-lg">
                  PDF export available in the full tool 📄
                </div>
              )}
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Live demo — the full tool adds auto-numbering, client database, your logo &amp; one-click PDF export.
        </p>
      </div>
    </section>
  );
}

/* ── Course Preview ────────────────────────────────────────────────── */
const SAMPLE_CURRICULUM = [
  { title: "Module 1: Google Business Profile Setup", duration: "28 min", preview: true },
  { title: "Module 2: WhatsApp Marketing Basics", duration: "35 min", preview: false },
  { title: "Module 3: Facebook & Instagram for Small Business", duration: "42 min", preview: false },
  { title: "Module 4: Creating Content on a R0 Budget", duration: "30 min", preview: false },
  { title: "Module 5: Tracking Results & Making Decisions", duration: "25 min", preview: false },
  { title: "Bonus: AI Tools for Free Marketing", duration: "20 min", preview: false },
];

function CoursePreview() {
  return (
    <section className="border-t border-border bg-background py-14">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <p className="font-mono text-xs uppercase tracking-wider text-primary">Course Curriculum</p>
        <h2 className="mt-1 font-display text-2xl font-bold">What you&apos;ll learn</h2>
        <p className="mt-2 text-sm text-muted-foreground">Module 1 is available as a free preview</p>

        <div className="mt-6 overflow-hidden rounded-2xl border border-border divide-y divide-border">
          {SAMPLE_CURRICULUM.map((lesson, i) => (
            <div
              key={i}
              className={`flex items-center justify-between gap-4 p-4 ${
                lesson.preview ? "bg-primary/5" : "bg-surface/20"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs ${
                    lesson.preview
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-surface text-muted-foreground"
                  }`}
                >
                  {lesson.preview ? (
                    <Play className="h-3 w-3" fill="currentColor" />
                  ) : (
                    <Lock className="h-3 w-3" />
                  )}
                </div>
                <span className={`text-sm font-medium ${!lesson.preview ? "text-muted-foreground" : ""}`}>
                  {lesson.title}
                </span>
                {lesson.preview && (
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 font-mono text-[10px] uppercase text-primary">
                    Free preview
                  </span>
                )}
              </div>
              <span className="shrink-0 font-mono text-xs text-muted-foreground">{lesson.duration}</span>
            </div>
          ))}
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Total: 3h 20min · Lifetime access · Watch at your own pace
        </p>
      </div>
    </section>
  );
}

/* ── PDF Sneak Peek ────────────────────────────────────────────────── */
const SAMPLE_GUIDE_ITEMS = [
  "How to claim and verify your Google Business listing (step-by-step with screenshots)",
  "The 9 categories that get the most clicks from local searches",
  "Photo guidelines: what to upload and when to refresh for maximum visibility",
  "How to respond to negative reviews professionally — with copy-paste scripts",
  "Monthly maintenance checklist to keep your listing ahead of competitors",
  "Q&A post templates that generate free traffic every week",
];

function PdfPreview() {
  return (
    <section className="border-t border-border bg-background py-14">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <p className="font-mono text-xs uppercase tracking-wider text-primary">Sneak Peek</p>
        <h2 className="mt-1 font-display text-2xl font-bold">Inside the guide</h2>
        <p className="mt-1 text-sm text-muted-foreground">Here&apos;s a sample of what&apos;s covered:</p>

        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface">
          {/* Fake PDF header bar */}
          <div className="flex items-center gap-3 border-b border-border bg-surface/80 px-5 py-3">
            <FileText className="h-4 w-4 text-primary" />
            <div className="h-2 w-40 rounded bg-muted-foreground/20" />
            <div className="ml-auto h-2 w-16 rounded bg-muted-foreground/10" />
          </div>

          <div className="divide-y divide-border">
            {SAMPLE_GUIDE_ITEMS.map((item, i) => {
              const locked = i >= 3;
              return (
                <div key={i} className="relative flex items-start gap-3 p-4">
                  <CheckCircle2
                    className={`mt-0.5 h-4 w-4 shrink-0 ${locked ? "text-muted-foreground/25" : "text-primary"}`}
                  />
                  <span className={`text-sm ${locked ? "select-none blur-sm text-muted-foreground/30" : ""}`}>
                    {item}
                  </span>
                  {i === 3 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-surface/85 backdrop-blur-[2px]">
                      <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 shadow-lg">
                        <Lock className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs font-semibold">Purchase to unlock full guide</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Done-For-You Process ──────────────────────────────────────────── */
const DFY_STEPS = [
  {
    day: "Day 1",
    title: "We get started",
    body: "You fill in a short intake form — business name, colours, contact info. We handle everything from there.",
  },
  {
    day: "Day 2–3",
    title: "Design & build",
    body: "Our team designs and builds your website. You'll receive a preview link to review before anything goes live.",
  },
  {
    day: "Day 4",
    title: "Your review",
    body: "You get two rounds of revisions — text, images, colours. We make changes until you're 100% happy.",
  },
  {
    day: "Day 5",
    title: "Live!",
    body: "We connect your domain, test everything on mobile and desktop, and hand you the login. Your business is online.",
  },
];

function DoneForYouProcess() {
  return (
    <section className="border-t border-border bg-background py-14">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <p className="font-mono text-xs uppercase tracking-wider text-primary">How It Works</p>
        <h2 className="mt-1 font-display text-2xl font-bold">Your website live in 5 days</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Here&apos;s exactly what happens after you pay:
        </p>

        <div className="relative mt-8">
          <div className="absolute left-5 top-0 h-full w-px bg-border" aria-hidden />
          <div className="space-y-8">
            {DFY_STEPS.map((step, i) => (
              <div key={i} className="relative flex gap-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-background text-sm font-bold text-primary">
                  {i + 1}
                </div>
                <div className="pt-1.5">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-primary">{step.day}</p>
                  <p className="mt-0.5 font-semibold">{step.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Checkout Modal ────────────────────────────────────────────────── */
function CheckoutModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/payfast/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "product", itemId: product.id, email }),
      });
      const data = await res.json() as {
        paymentUrl?: string;
        fields?: Record<string, string>;
        error?: string;
      };
      if (!res.ok || !data.paymentUrl || !data.fields) {
        setError(data.error ?? "Payment failed. Please try again.");
        setLoading(false);
        return;
      }
      submitPayFastForm(data.paymentUrl, data.fields);
    } catch {
      setError("Network error. Please check your connection.");
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1.5 hover:bg-border"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <p className="font-mono text-xs uppercase tracking-wider text-primary">Checkout</p>
        <h2 className="mt-1 text-base font-bold leading-snug">{product.title}</h2>
        <p className="mt-1 text-2xl font-bold">R{product.price_zar.toLocaleString("en-ZA")}</p>
        <p className="text-xs text-muted-foreground">Once-off · ZAR · Instant access after payment</p>

        <form onSubmit={handlePay} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Email (for download link &amp; receipt)
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </label>
          {error && (
            <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Redirecting to payment…</>
            ) : (
              <><ShoppingCart className="h-4 w-4" /> Pay R{product.price_zar.toLocaleString("en-ZA")}</>
            )}
          </button>
        </form>
        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          Secured by <span className="font-semibold">PayFast</span> · South African payment gateway
        </p>
      </div>
    </div>
  );
}
