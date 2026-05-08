import { jsPDF } from "jspdf";
import { SITE } from "./site";

export type QuoteDoc = {
  number: string;
  issue_date: string;
  valid_until: string | null;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  client_address: string | null;
  notes: string | null;
  subtotal: number;
  total: number;
};

export type InvoiceDoc = {
  number: string;
  issue_date: string;
  due_date: string | null;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  client_address: string | null;
  notes: string | null;
  banking_details: string | null;
  subtotal: number;
  total: number;
  amount_paid: number;
};

export type DocItem = {
  position: number;
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
};

const accent: [number, number, number] = [30, 64, 175];
const muted: [number, number, number] = [110, 110, 110];
const dark: [number, number, number] = [25, 25, 25];
const light: [number, number, number] = [248, 250, 252];
const border: [number, number, number] = [220, 220, 230];

function formatMoney(v: number) {
  return `R ${v.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`;
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-ZA");
}

function buildHeader(doc: jsPDF, pageW: number, margin: number, docType: string) {
  // Blue header band
  doc.setFillColor(...accent);
  doc.rect(0, 0, pageW, 100, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(SITE.name, margin, 40);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(SITE.tagline, margin, 56);
  doc.text(`${SITE.email}  ·  ${SITE.phone}  ·  ${SITE.url.replace("https://", "")}`, margin, 70);

  // Doc type label on the right
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(docType, pageW - margin, 46, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(SITE.location, pageW - margin, 62, { align: "right" });
}

function buildMetaBox(
  doc: jsPDF,
  pageW: number,
  margin: number,
  yStart: number,
  leftRows: [string, string][],
  rightRows: [string, string][],
): number {
  let y = yStart;
  const colW = (pageW - margin * 2) / 2 - 8;
  const rowH = 18;
  const boxH = Math.max(leftRows.length, rightRows.length) * rowH + 20;

  // Left box (doc details)
  doc.setFillColor(...light);
  doc.setDrawColor(...border);
  doc.roundedRect(margin, y, colW, boxH, 4, 4, "FD");

  let ly = y + 14;
  leftRows.forEach(([label, val]) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...muted);
    doc.text(label.toUpperCase(), margin + 10, ly);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...dark);
    doc.text(val, margin + 10, ly + 10);
    ly += rowH;
  });

  // Right box (Bill To)
  const rx = margin + colW + 16;
  doc.setFillColor(...light);
  doc.setDrawColor(...border);
  doc.roundedRect(rx, y, colW, boxH, 4, 4, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...muted);
  doc.text("BILL TO", rx + 10, y + 14);

  let ry = y + 26;
  rightRows.forEach(([, val]) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...dark);
    if (val) {
      const lines = doc.splitTextToSize(val, colW - 20);
      doc.text(lines, rx + 10, ry);
      ry += lines.length * 12;
    }
  });

  return y + boxH + 20;
}

function buildItemsTable(
  doc: jsPDF,
  pageW: number,
  margin: number,
  yStart: number,
  items: DocItem[],
): number {
  const tableW = pageW - margin * 2;
  const cols = {
    num: 28,
    desc: tableW * 0.48,
    qty: tableW * 0.1,
    price: tableW * 0.18,
    total: tableW * 0.18,
  };
  const xs = {
    num: margin,
    desc: margin + cols.num,
    qty: margin + cols.num + cols.desc,
    price: margin + cols.num + cols.desc + cols.qty,
    total: margin + cols.num + cols.desc + cols.qty + cols.price,
  };
  const rowH = 22;
  let y = yStart;

  // Header row
  doc.setFillColor(...accent);
  doc.rect(margin, y, tableW, rowH, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("#", xs.num + 4, y + 14);
  doc.text("DESCRIPTION", xs.desc + 4, y + 14);
  doc.text("QTY", xs.qty + 4, y + 14);
  doc.text("UNIT PRICE (R)", xs.price + 4, y + 14);
  doc.text("TOTAL (R)", xs.total + 4, y + 14);
  y += rowH;

  // Item rows
  items.forEach((item, i) => {
    const pageH = doc.internal.pageSize.getHeight();
    const descLines = doc.splitTextToSize(item.description, cols.desc - 8);
    const itemH = Math.max(rowH, descLines.length * 12 + 10);

    if (y + itemH > pageH - 80) {
      doc.addPage();
      y = 40;
    }

    if (i % 2 === 0) {
      doc.setFillColor(244, 246, 252);
      doc.rect(margin, y, tableW, itemH, "F");
    }

    doc.setDrawColor(...border);
    doc.rect(margin, y, tableW, itemH, "S");

    doc.setTextColor(...dark);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(String(item.position), xs.num + 4, y + 14);
    doc.text(descLines, xs.desc + 4, y + 14);
    doc.text(String(item.quantity), xs.qty + 4, y + 14);
    doc.text(item.unit_price.toLocaleString("en-ZA", { minimumFractionDigits: 2 }), xs.price + 4, y + 14);
    doc.text(item.line_total.toLocaleString("en-ZA", { minimumFractionDigits: 2 }), xs.total + 4, y + 14);
    y += itemH;
  });

  return y;
}

function buildTotals(
  doc: jsPDF,
  pageW: number,
  margin: number,
  yStart: number,
  subtotal: number,
  total: number,
): number {
  let y = yStart + 10;
  const labelX = pageW - margin - 200;
  const valueX = pageW - margin;

  const rows: [string, string][] = [
    ["Subtotal", formatMoney(subtotal)],
    ["Total", formatMoney(total)],
  ];

  rows.forEach(([label, value], i) => {
    const isLast = i === rows.length - 1;
    if (isLast) {
      doc.setFillColor(...accent);
      doc.roundedRect(labelX - 10, y - 12, 210, 22, 4, 4, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
    } else {
      doc.setTextColor(...muted);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
    }
    doc.text(label, labelX, y);
    doc.text(value, valueX, y, { align: "right" });
    y += 26;
  });

  return y;
}

function buildNotes(
  doc: jsPDF,
  pageW: number,
  margin: number,
  yStart: number,
  notes: string,
): number {
  let y = yStart + 16;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...dark);
  doc.text("NOTES", margin, y);
  y += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...muted);
  const lines = doc.splitTextToSize(notes, pageW - margin * 2);
  doc.text(lines, margin, y);
  y += lines.length * 12;
  return y;
}

function buildBankingDetails(
  doc: jsPDF,
  pageW: number,
  margin: number,
  yStart: number,
  details: string,
): number {
  let y = yStart + 16;
  const boxH = 60;
  doc.setFillColor(...light);
  doc.setDrawColor(...border);
  doc.roundedRect(margin, y - 10, pageW - margin * 2, boxH, 4, 4, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...dark);
  doc.text("BANKING DETAILS", margin + 10, y + 4);
  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...muted);
  const lines = doc.splitTextToSize(details, pageW - margin * 2 - 20);
  doc.text(lines, margin + 10, y);
  y += lines.length * 12 + 20;
  return y;
}

function buildFooter(doc: jsPDF, pageW: number, margin: number) {
  const pageCount = (doc.internal as { getNumberOfPages: () => number }).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageH = doc.internal.pageSize.getHeight();
    const footerY = pageH - 36;
    doc.setDrawColor(...border);
    doc.line(margin, footerY - 8, pageW - margin, footerY - 8);
    doc.setFontSize(8);
    doc.setTextColor(...muted);
    doc.setFont("helvetica", "normal");
    doc.text(
      `${SITE.name}  ·  ${SITE.location}  ·  ${SITE.url.replace("https://", "")}  ·  ${SITE.email}`,
      margin,
      footerY,
    );
    doc.text(`Page ${i} of ${pageCount}`, pageW - margin, footerY, { align: "right" });
  }
}

export async function generateQuoteDocPdf(quote: QuoteDoc, items: DocItem[]): Promise<Blob> {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 48;

  buildHeader(doc, pageW, margin, "QUOTATION");

  let y = 120;

  const leftRows: [string, string][] = [
    ["Quote Number", quote.number],
    ["Issue Date", formatDate(quote.issue_date)],
    ["Valid Until", formatDate(quote.valid_until)],
  ];

  const billToRows: [string, string][] = [
    ["name", quote.client_name],
    ["email", quote.client_email ?? ""],
    ["phone", quote.client_phone ?? ""],
    ["address", quote.client_address ?? ""],
  ];

  y = buildMetaBox(doc, pageW, margin, y, leftRows, billToRows);
  y = buildItemsTable(doc, pageW, margin, y, items);
  y = buildTotals(doc, pageW, margin, y, quote.subtotal, quote.total);

  if (quote.notes?.trim()) {
    const pageH = doc.internal.pageSize.getHeight();
    if (y + 80 > pageH - 60) {
      doc.addPage();
      y = 40;
    }
    y = buildNotes(doc, pageW, margin, y, quote.notes);
  }

  buildFooter(doc, pageW, margin);
  return doc.output("blob");
}

export async function generateInvoiceDocPdf(invoice: InvoiceDoc, items: DocItem[]): Promise<Blob> {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 48;

  buildHeader(doc, pageW, margin, "TAX INVOICE");

  let y = 120;

  const leftRows: [string, string][] = [
    ["Invoice Number", invoice.number],
    ["Issue Date", formatDate(invoice.issue_date)],
    ["Due Date", formatDate(invoice.due_date)],
  ];

  const billToRows: [string, string][] = [
    ["name", invoice.client_name],
    ["email", invoice.client_email ?? ""],
    ["phone", invoice.client_phone ?? ""],
    ["address", invoice.client_address ?? ""],
  ];

  y = buildMetaBox(doc, pageW, margin, y, leftRows, billToRows);
  y = buildItemsTable(doc, pageW, margin, y, items);
  y = buildTotals(doc, pageW, margin, y, invoice.subtotal, invoice.total);

  if (invoice.notes?.trim()) {
    const pageH = doc.internal.pageSize.getHeight();
    if (y + 80 > pageH - 60) {
      doc.addPage();
      y = 40;
    }
    y = buildNotes(doc, pageW, margin, y, invoice.notes);
  }

  if (invoice.banking_details?.trim()) {
    const pageH = doc.internal.pageSize.getHeight();
    if (y + 90 > pageH - 60) {
      doc.addPage();
      y = 40;
    }
    y = buildBankingDetails(doc, pageW, margin, y, invoice.banking_details);
  }

  buildFooter(doc, pageW, margin);
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
