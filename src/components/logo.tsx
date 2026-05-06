import { cn } from "@/lib/utils";

/**
 * SKC Digital hex monogram logo.
 * Inline SVG so it inherits currentColor for the wordmark and uses the
 * primary accent for the hex outline.
 */
export function Logo({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        viewBox="0 0 80 70"
        className="h-9 w-auto shrink-0"
        role="img"
        aria-label="SKC Digital"
      >
        <polygon
          points="20,2 60,2 78,35 60,68 20,68 2,35"
          fill="hsl(var(--background))"
          stroke="currentColor"
          strokeWidth="2"
          className="text-foreground/90"
        />
        <polygon
          points="22,7 58,7 74,35 58,63 22,63 6,35"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="text-primary"
        />
        <text
          x="40"
          y="44"
          textAnchor="middle"
          fontFamily="Georgia, serif"
          fontSize="22"
          fontWeight="700"
          fill="currentColor"
          className="text-foreground"
          letterSpacing="-1"
        >
          SKC
        </text>
      </svg>
      {showWordmark && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-base font-bold tracking-tight">
            SKC<span className="text-primary">.</span>Digital
          </span>
          <span className="mt-1 hidden font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground sm:block">
            Built to scale
          </span>
        </span>
      )}
    </span>
  );
}