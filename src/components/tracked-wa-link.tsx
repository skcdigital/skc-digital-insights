import { type ReactNode } from "react";
import { waLink } from "@/lib/site";

interface Props {
  /** Pre-filled WhatsApp message */
  message: string;
  /** Page / component source for analytics (e.g. "hero", "services/excel", "fab") */
  source: string;
  /** Service name if applicable */
  service?: string;
  /** Visitor name — collected from a form field if available */
  name?: string;
  /** Visitor phone — collected from a form field if available */
  phone?: string;
  children: ReactNode;
  className?: string;
  target?: string;
  rel?: string;
  "aria-label"?: string;
}

export function TrackedWALink({
  message,
  source,
  service,
  name,
  phone,
  children,
  className,
  target = "_blank",
  rel = "noopener noreferrer",
  "aria-label": ariaLabel,
}: Props) {
  function track() {
    // Fire and forget — never block the WhatsApp link from opening
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source, service, message, name, phone }),
    }).catch(() => {});
  }

  return (
    <a
      href={waLink(message)}
      target={target}
      rel={rel}
      className={className}
      aria-label={ariaLabel}
      onClick={track}
    >
      {children}
    </a>
  );
}
