import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { NAV, SITE, waLink } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-colors",
        scrolled
          ? "border-border bg-background/85 backdrop-blur-xl"
          : "border-transparent bg-background/40 backdrop-blur-md"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" aria-label="SKC Digital — home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-0.5 xl:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.exact }}
              activeProps={{ className: "text-primary" }}
              inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
              className="rounded-md px-3 py-2 text-sm font-medium transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={waLink(`Hi ${SITE.name}, I'd like a free audit.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 sm:inline-flex"
          >
            Free Audit
          </a>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid h-10 w-10 place-items-center rounded-md border border-border bg-surface text-foreground xl:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="xl:hidden">
          <nav className="border-t border-border bg-background/95 px-4 py-4 backdrop-blur-xl">
            <div className="flex flex-col gap-1">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  activeOptions={{ exact: item.exact }}
                  activeProps={{ className: "bg-surface text-primary" }}
                  inactiveProps={{ className: "text-muted-foreground" }}
                  className="rounded-md px-3 py-3 text-base font-medium"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <a
                href={waLink(`Hi ${SITE.name}, I'd like a free audit.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 rounded-md bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground"
              >
                Free Audit
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}