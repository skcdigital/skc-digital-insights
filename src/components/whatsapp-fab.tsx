import { MessageCircle } from "lucide-react";
import { SITE, waLink } from "@/lib/site";

export function WhatsAppFab() {
  return (
    <a
      href={waLink(`Hi ${SITE.name}, I'd like a free audit of my business.`)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-[oklch(0.78_0.18_150)] text-[oklch(0.16_0.012_240)] shadow-lg shadow-black/40 transition-transform hover:scale-110"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}