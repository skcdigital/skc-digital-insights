const ITEMS = [
  "Excel Automation",
  "Web Development",
  "Business Systems",
  "Data Solutions",
  "Bookkeeping",
  "Digital Tools",
  "Pretoria, ZA",
  "Process Automation",
];

export function Marquee() {
  return (
    <div className="border-y border-border bg-surface/30 py-5 overflow-hidden">
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
        {[...ITEMS, ...ITEMS, ...ITEMS, ...ITEMS].map((item, i) => (
          <span
            key={i}
            className="font-display text-2xl font-semibold text-muted-foreground"
          >
            {item}
            <span className="ml-10 text-primary">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}