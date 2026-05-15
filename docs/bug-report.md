# skcdigital.co.za — Website Audit Bug Report
**Date:** 14 May 2026  
**Auditor:** Claude Code  
**Scope:** Broken links, HTTP error codes, JavaScript / auth errors, SEO signals  
**Method:** Live HTTP crawl + source-code inspection (`skc-digital-insights-main`)

---

## Status of Known Issues

| # | Severity | Area | Issue | Status |
|---|----------|------|-------|--------|
| 1 | 🔴 Critical | DNS / Hosting | `www.skcdigital.co.za` returns HTTP 404 | ❌ Open |
| 2 | 🔴 Critical | Portfolio Links | `order.uthandokitchen.co.za` — ECONNREFUSED (dead link) | ❌ Open |
| 3 | 🔴 Critical | Portfolio Links | `app.glowstudio.co.za/dashboard` — TLS certificate invalid | ❌ Open |
| 4 | 🟠 High | Admin Auth | Login → /admin race condition | ✅ Fixed 2026-05-14 (window.location.href) |
| 5 | 🟠 High | SEO | No `sitemap.xml` (HTTP 404) | ❌ Open |
| 6 | 🟠 High | SEO / Meta | Canonical `og:url` tags point to broken `www.` domain | ❌ Open |
| 7 | 🟡 Medium | SEO / Social | Missing `og:image` — social share previews show no image | ❌ Open |
| 8 | 🟡 Medium | Security | Public account signup on `/login` | ✅ Fixed 2026-05-14 (signup removed) |
| 9 | 🟡 Medium | UX | Admin page shows public site nav during auth loading | ❌ Open |
| 10 | 🔵 Low | SEO | Non-standard robots.txt directive format | ❌ Open |

---

## Bug Details

---

### BUG-01 — `www.skcdigital.co.za` returns HTTP 404
**Severity:** 🔴 Critical  

The `www` subdomain returns a hard 404. The non-www domain (`https://skcdigital.co.za`) works correctly.

**Fix:**
1. Add a CNAME for `www` in DNS panel pointing to the apex domain, with a 301 redirect `www` → non-www in Cloudflare.
2. Update `src/lib/site.ts` line 5 to `url: "https://skcdigital.co.za"` (also fixes BUG-06).

---

### BUG-02 — `order.uthandokitchen.co.za` is completely unreachable
**Severity:** 🔴 Critical  

The portfolio "Uthando Kitchen — customer ordering app" link is ECONNREFUSED at TCP level.

**Fix:** Remove the live URL from the portfolio section or replace with a static screenshot.

---

### BUG-03 — `app.glowstudio.co.za/dashboard` has an invalid TLS certificate
**Severity:** 🔴 Critical  

SSL cert does not cover the `app.` subdomain — browsers show a full security warning.

**Fix:** Re-issue cert to include `*.glowstudio.co.za` wildcard, or add a dedicated cert for the subdomain.

---

### BUG-04 — Admin login race condition ✅ FIXED
**Fixed:** 2026-05-14 — `src/routes/login.tsx` now uses `window.location.href = "/admin"` instead of `navigate()`.

---

### BUG-05 — No `sitemap.xml`
**Severity:** 🟠 High  

`https://skcdigital.co.za/sitemap.xml` returns 404.

**Fix:** Add a server route or generate `public/sitemap.xml` at build time. Use canonical non-www URLs.

---

### BUG-06 — `og:url` meta tags point to broken `www.` domain
**Severity:** 🟠 High  
**File:** `src/lib/site.ts:5`

All Open Graph URLs use `https://www.skcdigital.co.za` which 404s.

**Fix:**
```ts
// src/lib/site.ts line 5
url: "https://skcdigital.co.za",  // remove www
```

---

### BUG-07 — Missing `og:image`
**Severity:** 🟡 Medium  
**File:** `src/routes/__root.tsx`

No social share image is set anywhere. `twitter:card: "summary_large_image"` is set but has no image.

**Fix:** Add a 1200×630px image to `public/og-image.jpg` and register in `__root.tsx`:
```ts
{ property: "og:image", content: "https://skcdigital.co.za/og-image.jpg" },
{ name: "twitter:image", content: "https://skcdigital.co.za/og-image.jpg" },
```

---

### BUG-08 — Public signup on `/login` ✅ FIXED
**Fixed:** 2026-05-14 — "Create one" signup mode removed from `src/routes/login.tsx`.

---

### BUG-09 — Admin routes render inside public site shell
**Severity:** 🟡 Medium  

`/admin` renders `<SiteHeader>` + `<SiteFooter>` around the admin sign-in gate.

**Fix:** Exclude `/admin/*` routes from the root layout shell, or move the admin tree into a separate root.

---

### BUG-10 — Non-standard `robots.txt` directive
**Severity:** 🔵 Low  

`Content-Signal: search=yes,ai-train=no` is not a recognised robots.txt directive and is silently ignored by crawlers.

**Fix:** Remove `Content-Signal` lines. Keep the `User-agent` + `Disallow` blocks (those work). Add `Sitemap:` once BUG-05 is fixed.

---

## Recommended Fix Order

1. **BUG-06** — 1-line fix in `site.ts`, deploy immediately
2. **BUG-01** — Fix `www` DNS + redirect
3. **BUG-02 / BUG-03** — Fix portfolio dead links
4. **BUG-05** — Add `sitemap.xml`
5. **BUG-07** — Add `og:image`
6. **BUG-09** — Isolate admin from public shell
7. **BUG-10** — Clean up robots.txt
