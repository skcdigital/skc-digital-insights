import type { ReactNode } from "react";

export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 bg-grid opacity-60" aria-hidden="true" />
      <div className="absolute inset-0 bg-hero-glow" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        {eyebrow && (
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 font-mono text-xs uppercase tracking-wider text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" /> {eyebrow}
          </p>
        )}
        <h1 className="max-w-4xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        {description && (
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">{description}</p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}