# Product: SKC Digital

**Last updated:** 2026-05-16
**Method:** codebase scan (routes, schema, lib, config)

## Product Identity

- **One-liner:** South African small businesses contact SKC Digital, get a custom quote for IT services or digital products, pay via invoice or Yoco, and receive ongoing support through a monthly membership or care plan.
- **Category:** B2B service business with a growing digital products and SaaS layer
- **Product type:** Hybrid — B2B services (consultative, project-based) + B2C-leaning digital products and memberships sold direct to small business owners
- **Collaboration:** Single-player admin (operator-run); clients interact via public forms and WhatsApp only

## Business Model

- **Monetization:** Three streams running in parallel:
  1. **Services** — custom quotes (R300–R5,000+) for Excel automation, web design, bookkeeping, process automation, digital setup
  2. **Digital products** — one-time purchases (PDF guides, templates, courses, done-for-you packs) via Yoco
  3. **Memberships** — recurring monthly/annual plans (Starter R499/mo, Growth R999/mo, Scale R1,999/mo)
- **Pricing tiers:**
  - Starter — R499/mo (R4,490/yr) — website, basic SEO, support
  - Growth — R999/mo (R8,990/yr) — ads, social, reports, priority support
  - Scale — R1,999/mo (R17,990/yr) — full-service, dedicated manager
- **Billing integration:** Yoco (ZAR, one-time payments); EFT invoices for recurring memberships; Resend for transactional email

## Tech Stack

- **Primary language:** TypeScript
- **Framework:** TanStack Start (React 19, file-based routing, SSR via Cloudflare Workers)
- **Database:** Supabase (PostgreSQL) with Row Level Security
- **Background jobs:** None detected — all operations are request-driven
- **HTTP client patterns:** `fetch` (native, used in all API routes)
- **Module organisation:** File-based routes in `src/routes/`; shared logic in `src/lib/`; Supabase clients in `src/integrations/supabase/`
- **Deployment:** Cloudflare Workers (edge SSR) + GitHub Actions CI/CD

## Value Mapping

### Primary Value Action
**Lead captured** — A prospective client submits a contact form, WhatsApp message, or free audit request. If new leads drop to zero, the entire revenue pipeline (quotes → invoices → memberships) stops. Everything downstream depends on this.

### Core Features (directly deliver value)
1. **Lead pipeline** — Captures, tracks, and moves prospects from new → contacted → quoted → won/lost. The operational heart of the business.
2. **Quote & invoice generation** — Produces numbered PDF documents (SKC-QT-XXXX, SKC-INV-XXXX), sent via email. Converts leads to revenue.
3. **Membership activation** — Converts one-off clients to recurring subscribers. Long-term revenue stability.
4. **Digital product purchases** — Self-serve revenue not tied to Suzan's time. Scales independently.

### Supporting Features (enable core actions)
1. **Chat widget** — Engages site visitors before they bounce; feeds the lead pipeline
2. **Blog** — SEO and trust-building; drives organic traffic to lead capture
3. **Free audit form** — Top-of-funnel lead magnet; low friction first touch
4. **Admin dashboard** — Enables Suzan to manage pipeline, documents, and clients without external CRM
5. **Credit notes & tickets** — Post-sale service management; supports retention
6. **Newsletter subscribers** — Future nurture channel for product and membership upsells

## Entity Model

### Users (Admin)
- **ID format:** UUID (Supabase `auth.users`)
- **Roles:** `admin`, `staff` (enum `app_role`)
- **Multi-account:** No — single operator business; admin and staff share one Supabase project
- **Current state:** 2 users exist in production (admin accounts)

### Clients (Leads)
- **ID format:** UUID
- **Not authenticated** — clients do not log in; they interact via public forms and WhatsApp
- **Tracked as:** `leads` table rows, identified by name + email + phone

### Membership Subscribers
- **ID format:** UUID (Supabase `auth.users` — must create an account to subscribe)
- **Roles:** Standard user (no admin privileges)
- **Linked to:** `user_memberships` → `membership_plans`

## Group Hierarchy

This is a single-operator B2B service business — no workspace, team, or organisation hierarchy exists or is needed. All admin actions happen at the top (user) level.

```
Admin User (Suzan / staff)
└── Operates all CRM, products, memberships
```

Clients are not authenticated entities in the product — they are data records (leads).

**Default event level:** User (admin operator)
**Client actions tracked as:** Anonymous events on public-facing pages

## Current State

- **Existing tracking:** GA4 is configured (`VITE_GA_MEASUREMENT_ID` env var present in Cloudflare Pages). A custom `/api/track` endpoint exists for WhatsApp link click events, storing data in Supabase `leads` / `lead_activities`.
- **Documentation:** None for telemetry — this file is the starting point
- **Known gaps:**
  - No funnel visibility: leads captured but no event on quote sent, invoice paid, or membership activated
  - No product page engagement tracking (which products viewed, which categories filtered)
  - No conversion tracking: visitor → lead → client is unobserved beyond GA page views
  - WhatsApp clicks tracked but not linked to downstream lead outcomes

## Integration Targets

| Destination | Purpose | Priority |
|-------------|---------|----------|
| Google Analytics 4 | Page views, traffic sources, acquisition — already live | Active |
| Supabase (custom) | WhatsApp click events via `/api/track` — already live | Active |
| TBD (Accoil / PostHog) | Product funnel: lead → quote → invoice → membership conversion | Future |

## Codebase Observations

- **Feature areas inferred from routes:** Home, Services, Products, Memberships, Pricing, Care Plans, Portfolio, Blog, About, Contact, Free Audit, Chat, Login, Admin (Dashboard, Leads, Quotes, Invoices, Credit Notes, Tickets, Chatbot, Products, Memberships)
- **Entity model inferred from schema:** leads, lead_activities, quotes, quote_items, invoices, invoice_items, credit_notes, credit_note_items, tickets, ticket_replies, products, product_files, membership_plans, user_memberships, purchases, newsletter_subscribers, profiles, user_roles, doc_counters, chat_conversations, chat_messages
- **Monetisation signals:** Yoco payment routes (`/api/yoco/checkout`, `/api/yoco/webhook`), `purchases` table, `user_memberships` table, `doc_counters` for sequential numbering of quotes/invoices
- **South Africa–specific signals:** ZAR currency throughout, Yoco (SA gateway), WhatsApp as primary support channel, EFT billing for memberships
