import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  FileText, BookOpen, Wrench, Package, Mail, Sparkles,
  ShoppingCart, Download, ArrowRight, Star, X, Loader2,
} from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { SITE } from "@/lib/site";
import { supabase } from "@/integrations/supabase/client";

const TITLE = "Digital Products — SKC Digital";
const DESC =
  "Ready-to-use PDF guides, business templates, online tools, and done-for-you packs. Download instantly and level up your business today.";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: `${SITE.url}/products` },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
    ],
  }),
  component: ProductsPage,
});

type Product = {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: string;
  price_zar: number;
  cover_url: string | null;
  is_free: boolean;
  sort_order: number;
};

const TYPE_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  pdf_guide:     { label: "PDF Guide",        icon: <FileText className="h-4 w-4" /> },
  course:        { label: "Course",           icon: <BookOpen className="h-4 w-4" /> },
  software_tool: { label: "Tool / Script",    icon: <Wrench className="h-4 w-4" /> },
  done_for_you:  { label: "Done-For-You",     icon: <Package className="h-4 w-4" /> },
  newsletter:    { label: "Newsletter",       icon: <Mail className="h-4 w-4" /> },
  other:         { label: "Other",            icon: <Sparkles className="h-4 w-4" /> },
};

const FILTER_TABS = [
  { key: "all", label: "All Products" },
  { key: "pdf_guide",     label: "PDF Guides" },
  { key: "course",        label: "Courses" },
  { key: "software_tool", label: "Tools" },
  { key: "done_for_you",  label: "Done-For-You" },
  { key: "newsletter",    label: "Newsletter" },
];

type CheckoutTarget = { id: string; title: string; price_zar: number } | null;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [checkoutTarget, setCheckoutTarget] = useState<CheckoutTarget>(null);

  useEffect(() => {
    supabase
      .from("products")
      .select("id, slug, title, description, type, price_zar, cover_url, is_free, sort_order")
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .then(({ data, error }) => {
        if (!error) setProducts((data as Product[]) ?? []);
        setLoading(false);
      });
  }, []);

  const visible = filter === "all"
    ? products
    : products.filter((p) => p.type === filter);

  return (
    <div>
      <PageHero
        eyebrow="Digital Products"
        title={<>Practical tools built for<br className="hidden sm:block" /> <span className="text-primary">South African businesses</span></>}
        description="Buy once, download instantly. PDF guides, automation templates, video courses, and done-for-you packs designed to save you time and money."
      >
        <div className="flex flex-wrap gap-3">
          <Link
            to="/memberships"
            className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20"
          >
            <Star className="h-3.5 w-3.5" /> View membership plans
          </Link>
        </div>
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        {/* Filter tabs */}
        <div className="mb-10 flex flex-wrap gap-2">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`rounded-full border px-4 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors ${
                filter === tab.key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border p-12 text-center">
            <Sparkles className="h-10 w-10 text-primary" />
            <h2 className="text-xl font-bold">Products launching soon</h2>
            <p className="text-sm text-muted-foreground max-w-md">
              We're building a library of practical digital products for South African entrepreneurs —
              PDF guides, automation templates, video courses, and done-for-you packs.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                Get notified <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/memberships"
                className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-semibold hover:border-primary/40"
              >
                <Star className="h-3.5 w-3.5" /> View memberships
              </Link>
            </div>
          </div>
        )}

        {!loading && products.length > 0 && visible.length === 0 && (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-20 text-center">
            <Sparkles className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No products in this category yet — check back soon.</p>
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((product) => (
            <ProductCard key={product.id} product={product} onBuy={() => setCheckoutTarget(product)} />
          ))}
        </div>
      </section>

      {/* Yoco checkout modal */}
      {checkoutTarget && (
        <CheckoutModal
          product={checkoutTarget}
          onClose={() => setCheckoutTarget(null)}
        />
      )}

      {/* Membership upsell banner */}
      <section className="border-t border-border bg-surface/40">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="rounded-2xl border border-primary/20 bg-primary/5 px-8 py-12 text-center">
            <p className="font-mono text-xs uppercase tracking-wider text-primary">Members save more</p>
            <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
              Get all products + ongoing support<br className="hidden sm:block" /> with a membership
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Starter, Growth, or Scale plans give you access to exclusive resources, priority support,
              and ongoing digital services — from R499/month.
            </p>
            <Link
              to="/memberships"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-90"
            >
              View membership plans <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProductCard({ product, onBuy }: { product: Product; onBuy: () => void }) {
  const typeInfo = TYPE_LABELS[product.type] ?? TYPE_LABELS.other;

  return (
    <div className="group flex flex-col rounded-2xl border border-border bg-surface/40 overflow-hidden transition-all hover:border-primary/40 hover:shadow-lg">
      {/* Cover */}
      <div className="relative flex h-44 items-center justify-center overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
        {product.cover_url ? (
          <img
            src={product.cover_url}
            alt={product.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-primary/40">
            {typeInfo.icon}
            <span className="font-mono text-[10px] uppercase tracking-wider">{typeInfo.label}</span>
          </div>
        )}
        <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-border bg-background/90 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground backdrop-blur">
          {typeInfo.icon}
          {typeInfo.label}
        </span>
        {product.is_free && (
          <span className="absolute right-3 top-3 rounded-full bg-green-500 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-white">
            Free
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="font-bold leading-snug">{product.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-3 flex-1">{product.description}</p>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xl font-bold">
            {product.is_free ? "Free" : `R${product.price_zar.toLocaleString("en-ZA")}`}
          </span>
          {product.is_free ? (
            <a
              href={`/contact?product=${encodeURIComponent(product.slug)}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              <Download className="h-3.5 w-3.5" /> Get it free
            </a>
          ) : (
            <button
              onClick={onBuy}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              <ShoppingCart className="h-3.5 w-3.5" /> Buy now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CheckoutModal({
  product,
  onClose,
}: {
  product: CheckoutTarget & object;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/yoco/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "product",
          itemId: product!.id,
          email,
          idempotencyKey: `${product!.id}-${email}-${Date.now()}`,
        }),
      });

      const data = await res.json() as { redirectUrl?: string; error?: string };

      if (!res.ok || !data.redirectUrl) {
        setError(data.error ?? "Payment failed. Please try again.");
        setLoading(false);
        return;
      }

      // Redirect to Yoco hosted payment page
      window.location.href = data.redirectUrl;
    } catch {
      setError("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1 hover:bg-border"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="font-bold text-lg leading-snug">{product!.title}</h2>
        <p className="mt-1 text-2xl font-bold text-primary">
          R{product!.price_zar.toLocaleString("en-ZA")}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Secure payment via Yoco · ZAR · Once-off
        </p>

        <form onSubmit={handlePay} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Your email (for download link)
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
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Redirecting to payment…</>
            ) : (
              <><ShoppingCart className="h-4 w-4" /> Pay R{product!.price_zar.toLocaleString("en-ZA")}</>
            )}
          </button>
        </form>

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          Powered by <span className="font-semibold">Yoco</span> · South African payment gateway
        </p>
      </div>
    </div>
  );
}
