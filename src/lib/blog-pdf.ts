import { jsPDF } from "jspdf";
import logoUrl from "@/assets/skc-logo-pdf.png";
import { SITE } from "./site";
import type { BlogPost } from "./blog-posts";

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

export async function generateBlogPdf(post: BlogPost): Promise<Blob> {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  const contentW = pageW - margin * 2;
  const accent: [number, number, number] = [30, 64, 175];
  const muted: [number, number, number] = [110, 110, 110];
  const dark: [number, number, number] = [25, 25, 25];

  const footerY = pageH - 48;

  function addFooter() {
    doc.setDrawColor(230, 230, 230);
    doc.line(margin, footerY - 14, pageW - margin, footerY - 14);
    doc.setFontSize(9);
    doc.setTextColor(...muted);
    doc.text(
      `${SITE.name} · ${SITE.location} · ${SITE.url.replace("https://", "")}`,
      margin,
      footerY,
    );
    doc.text(SITE.email, pageW - margin, footerY, { align: "right" });
  }

  // Header band
  doc.setFillColor(...accent);
  doc.rect(0, 0, pageW, 110, "F");

  try {
    const logo = await loadImageAsDataUrl(logoUrl);
    doc.addImage(logo, "PNG", margin, 24, 64, 64);
  } catch {
    /* ignore */
  }

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(SITE.name, margin + 80, 56);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(SITE.tagline, margin + 80, 74);
  doc.text(`${SITE.email}  ·  ${SITE.phone}`, margin + 80, 90);

  // Tag + title
  let y = 148;
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...accent);
  doc.text(post.tag.toUpperCase(), margin, y);
  y += 18;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...dark);
  const titleLines = doc.splitTextToSize(post.title, contentW);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 24 + 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...muted);
  const excerptLines = doc.splitTextToSize(post.excerpt, contentW);
  doc.text(excerptLines, margin, y);
  y += excerptLines.length * 16 + 4;

  // Thin divider
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, y, pageW - margin, y);
  y += 20;

  // Body blocks
  for (const block of post.body) {
    if (y > footerY - 80) {
      addFooter();
      doc.addPage();
      // Repeat slim header on continuation pages
      doc.setFillColor(...accent);
      doc.rect(0, 0, pageW, 32, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(SITE.name, margin, 21);
      y = 60;
    }

    if (block.heading) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(...dark);
      const headLines = doc.splitTextToSize(block.heading, contentW);
      doc.text(headLines, margin, y);
      y += headLines.length * 16 + 6;
    }

    for (const para of block.paragraphs) {
      if (y > footerY - 60) {
        addFooter();
        doc.addPage();
        doc.setFillColor(...accent);
        doc.rect(0, 0, pageW, 32, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(SITE.name, margin, 21);
        y = 60;
      }
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(...muted);
      const lines = doc.splitTextToSize(para, contentW);
      doc.text(lines, margin, y);
      y += lines.length * 16 + 10;
    }

    y += 6;
  }

  // CTA box
  if (y > footerY - 90) {
    addFooter();
    doc.addPage();
    doc.setFillColor(...accent);
    doc.rect(0, 0, pageW, 32, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(SITE.name, margin, 21);
    y = 60;
  }
  y += 8;
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(...accent);
  doc.roundedRect(margin, y, contentW, 68, 6, 6, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...accent);
  doc.text("Want help putting this into practice?", margin + 14, y + 22);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...muted);
  doc.text(
    `WhatsApp us on ${SITE.phone} or visit ${SITE.url.replace("https://", "")}`,
    margin + 14,
    y + 42,
  );

  addFooter();
  return doc.output("blob");
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
