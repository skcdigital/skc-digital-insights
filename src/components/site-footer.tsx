import { Link } from "@tanstack/react-router";
import { Mail, Phone, MapPin } from "lucide-react";
import { SITE, waLink } from "@/lib/site";
import { Logo } from "@/components/logo";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-surface/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-5">
          <div className="md:col-span-2">
            <Link to="/" aria-label="SKC Digital — home">
              <Logo />
            </Link>
            <p className="mt-4 max-w-md text-sm text-muted-foreground">
              Practical IT solutions, automation and websites for South African
              businesses. Direct contact, fair local pricing, fast delivery.
            </p>
            <div className="mt-5 flex flex-col gap-2 text-sm">
              <a
                href={waLink(`Hi ${SITE.name}, I have a question.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary"
              >
                <Phone className="h-4 w-4" /> {SITE.phone}
              </a>
              <a
                href={`mailto:${SITE.email}`}
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary"
              >
                <Mail className="h-4 w-4" /> {SITE.email}
              </a>
              <span className="inline-flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" /> {SITE.location}
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">
              Explore
            </h4>
            <ul className="mt-4 space-y-2 text-sm">
              {[
                { to: "/services", label: "Services" },
                { to: "/pricing", label: "Pricing" },
                { to: "/portfolio", label: "Portfolio" },
                { to: "/free-audit", label: "Free Audit" },
              ].map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">
              Company
            </h4>
            <ul className="mt-4 space-y-2 text-sm">
              {[
                { to: "/about", label: "About" },
                { to: "/blog", label: "Blog" },
                { to: "/contact", label: "Contact" },
              ].map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">
              Legal
            </h4>
            <ul className="mt-4 space-y-2 text-sm">
              {[
                { to: "/legal/terms", label: "Terms & Conditions" },
                { to: "/legal/privacy", label: "Privacy Policy" },
                { to: "/legal/refund", label: "Refund Policy" },
                { to: "/legal/service-agreement", label: "Service Agreement" },
              ].map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {year} {SITE.name}. All rights reserved.</p>
          <p className="font-mono">Built in Pretoria · Serving South Africa</p>
        </div>
      </div>
    </footer>
  );
}