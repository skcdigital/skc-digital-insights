import { useEffect, useState } from "react";

type Line =
  | { kind: "cmd"; text: string }
  | { kind: "out"; text: string; color?: "green" | "cyan" | "muted" | "coral" };

const SCRIPT: Line[] = [
  { kind: "cmd", text: "ssh skc@digital.co.za" },
  { kind: "out", text: "✓ Connected to SKC Digital", color: "green" },
  { kind: "cmd", text: "ls services/" },
  { kind: "out", text: "excel-automation.sh", color: "cyan" },
  { kind: "out", text: "web-development.sh", color: "cyan" },
  { kind: "out", text: "bookkeeping.sh    business-setup.sh", color: "cyan" },
  { kind: "cmd", text: "./quote --service=website --pages=5" },
  { kind: "out", text: "→ Estimated: R800 · Delivery: 48h", color: "coral" },
  { kind: "cmd", text: "whoami" },
  { kind: "out", text: "suzan@skcdigital · pretoria, za", color: "muted" },
];

export function Terminal() {
  const [step, setStep] = useState(0);
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (step >= SCRIPT.length) return;
    const line = SCRIPT[step];
    if (line.kind === "cmd") {
      let i = 0;
      setTyped("");
      const id = window.setInterval(() => {
        i += 1;
        setTyped(line.text.slice(0, i));
        if (i >= line.text.length) {
          window.clearInterval(id);
          window.setTimeout(() => setStep((s) => s + 1), 380);
        }
      }, 38);
      return () => window.clearInterval(id);
    }
    const id = window.setTimeout(() => setStep((s) => s + 1), 280);
    return () => window.clearTimeout(id);
  }, [step]);

  // Loop
  useEffect(() => {
    if (step >= SCRIPT.length) {
      const id = window.setTimeout(() => setStep(0), 3500);
      return () => window.clearTimeout(id);
    }
  }, [step]);

  const colorMap: Record<string, string> = {
    green: "text-[oklch(0.85_0.18_150)]",
    cyan: "text-primary",
    coral: "text-[oklch(0.78_0.18_25)]",
    muted: "text-muted-foreground",
  };

  const visible = SCRIPT.slice(0, step);
  const current = step < SCRIPT.length ? SCRIPT[step] : null;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-[oklch(0.13_0.012_240)] shadow-2xl shadow-black/40 glow">
      <div className="flex items-center justify-between border-b border-border bg-surface/60 px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[oklch(0.7_0.2_25)]" />
          <span className="h-3 w-3 rounded-full bg-[oklch(0.85_0.18_85)]" />
          <span className="h-3 w-3 rounded-full bg-[oklch(0.78_0.18_150)]" />
        </div>
        <span className="font-mono text-xs text-muted-foreground">skc-digital ~ bash</span>
        <span className="w-12" />
      </div>
      <div className="min-h-[280px] p-5 font-mono text-sm leading-relaxed sm:text-[0.95rem]">
        {visible.map((line, i) =>
          line.kind === "cmd" ? (
            <p key={i}>
              <span className="text-primary">$</span>{" "}
              <span className="text-foreground">{line.text}</span>
            </p>
          ) : (
            <p key={i} className={colorMap[line.color ?? "muted"]}>
              {line.text}
            </p>
          )
        )}
        {current && current.kind === "cmd" && (
          <p>
            <span className="text-primary">$</span>{" "}
            <span className="cursor-blink text-foreground">{typed}</span>
          </p>
        )}
        {current && current.kind === "out" && (
          <p className={colorMap[current.color ?? "muted"]}>{current.text}</p>
        )}
      </div>
    </div>
  );
}