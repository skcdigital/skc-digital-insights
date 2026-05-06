import { jsPDF } from "jspdf";
import logoUrl from "@/assets/skc-logo-pdf.png";
import { SITE } from "./site";

export type QuoteData = {
  name: string;
  email: string;
  service: string;
  budget: string;
  deadline: string;
  message: string;
};

async function loadImageAsDataUrl(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function generateQuotePdf(data: QuoteData): Promise<Blob> {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 48;
  const accent: [number, number, number] = [30, 64, 175]; // #1e40af
  const muted: [number, number, number] = [110, 110, 110];
  const dark: [number, number, number] = [25, 25, 25];

  // Header band
  doc.setFillColor(...accent);
  doc.rect(0, 0, pageW, 110, "F");

  // Logo
  try {
    const logo = await loadImageAsDataUrl(logoUrl);
    doc.addImage(logo, "PNG", margin, 24, 64, 64);
  } catch {
    /* ignore logo failure */
  }

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(SITE.name, margin + 80, 56);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(SITE.tagline, margin + 80, 74);
  doc.text(`${SITE.email}  ·  ${SITE.phone}`, margin + 80, 90);

  // Title
  let y = 160;
  doc.setTextColor(...dark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("Quote request received", margin, y);
  y += 22;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...muted);
  const today = new Date().toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.text(`Reference date: ${today}`, margin, y);
  y += 28;

  // Greeting
  doc.setTextColor(...dark);
  doc.setFontSize(12);
  doc.text(`Hi ${data.name},`, margin, y);
  y += 20;
  doc.setFontSize(11);
  doc.setTextColor(...muted);
  const intro = doc.splitTextToSize(
    `Thank you for getting in touch with ${SITE.name}. We have received your quote request and will reply on WhatsApp or by email within 4 working hours. Below is a summary of what you sent us so you have it on file.`,
    pageW - margin * 2,
  );
  doc.text(intro, margin, y);
  y += intro.length * 14 + 18;

  // Summary card
  doc.setDrawColor(220, 220, 220);
  doc.setFillColor(248, 250, 252);
  const cardTop = y;
  doc.roundedRect(margin, cardTop, pageW - margin * 2, 0, 8, 8, "S");

  const rows: [string, string][] = [
    ["Name", data.name],
    ["Email", data.email],
    ["Service", data.service],
    ["Budget", data.budget],
    ["Deadline", data.deadline],
  ];
  y += 18;
  rows.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...dark);
    doc.setFontSize(10);
    doc.text(label.toUpperCase(), margin + 14, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...muted);
    doc.setFontSize(11);
    doc.text(value, margin + 110, y);
    y += 20;
  });

  // Project details
  y += 6;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...dark);
  doc.setFontSize(10);
  doc.text("PROJECT DETAILS", margin + 14, y);
  y += 14;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...muted);
  doc.setFontSize(11);
  const msg = doc.splitTextToSize(data.message, pageW - margin * 2 - 28);
  doc.text(msg, margin + 14, y);
  y += msg.length * 14 + 18;

  // Redraw card with correct height
  doc.setDrawColor(220, 220, 220);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, cardTop, pageW - margin * 2, y - cardTop, 8, 8, "S");

  // Next steps
  y += 24;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...dark);
  doc.setFontSize(13);
  doc.text("What happens next", margin, y);
  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...muted);
  doc.setFontSize(11);
  const steps = [
    "1. We review your request (usually within 4 working hours).",
    "2. We reply on WhatsApp with a fixed quote and timeline.",
    "3. On approval, we start work — most projects ship in 24–48 hours.",
  ];
  steps.forEach((s) => {
    const lines = doc.splitTextToSize(s, pageW - margin * 2);
    doc.text(lines, margin, y);
    y += lines.length * 14 + 4;
  });

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 48;
  doc.setDrawColor(230, 230, 230);
  doc.line(margin, footerY - 14, pageW - margin, footerY - 14);
  doc.setFontSize(9);
  doc.setTextColor(...muted);
  doc.text(
    `${SITE.name} · ${SITE.location} · ${SITE.url.replace("https://", "")}`,
    margin,
    footerY,
  );
  doc.text(`${SITE.email}`, pageW - margin, footerY, { align: "right" });

  return doc.output("blob");
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] || "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}