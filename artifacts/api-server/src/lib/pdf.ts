import PDFDocument from "pdfkit";
import type { ContractTerms } from "./ai";

export async function generateBilingualPdf(
  terms: ContractTerms,
  clientName: string,
  merchantName: string,
  roomId: string,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
      info: {
        Title: `Vaultalk Contract — ${roomId}`,
        Author: "Vaultalk AI",
        Subject: "Service Agreement",
      },
    });

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    renderEnglishSection(doc, terms, clientName, merchantName, roomId);

    doc.end();
  });
}

function renderEnglishSection(
  doc: InstanceType<typeof PDFDocument>,
  terms: ContractTerms,
  clientName: string,
  merchantName: string,
  roomId: string,
): void {
  const pageWidth = doc.page.width;
  const margin = 50;
  const contentWidth = pageWidth - margin * 2;

  const date = new Date().toLocaleDateString("en-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  doc
    .font("Helvetica-Bold")
    .fontSize(20)
    .fillColor("#1a1a2e")
    .text("PAYMENT SUCCEEDED — SERVICE AGREEMENT", margin, margin, {
      width: contentWidth,
      align: "center",
    });

  doc.moveDown(0.3);

  doc
    .moveTo(margin, doc.y)
    .lineTo(pageWidth - margin, doc.y)
    .strokeColor("#6366f1")
    .lineWidth(2)
    .stroke();

  doc.moveDown(0.8);

  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor("#6b7280")
    .text(`Agreement Reference: VAULTALK-${roomId.toUpperCase()}`, margin, doc.y, {
      width: contentWidth,
      align: "left",
    });

  doc.text(`Date: ${date}`, margin, doc.y, {
    width: contentWidth,
    align: "left",
  });

  doc.moveDown(1);

  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor("#374151")
    .text("PARTIES", margin, doc.y);

  doc.moveDown(0.4);

  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#111827");

  doc.text(`Client:      ${clientName}`, margin + 10, doc.y);
  doc.text(`Merchant:    ${merchantName}`, margin + 10, doc.y);

  doc.moveDown(1);

  renderSectionDivider(doc, margin, pageWidth);

  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor("#374151")
    .text("AGREED TERMS", margin, doc.y);

  doc.moveDown(0.6);

  const termRows: Array<[string, string]> = [
    [
      "Compensation",
      terms.price !== null
        ? `${terms.price} ${terms.currency}`
        : "To be agreed",
    ],
    ["Deadline", terms.deadline ?? "To be agreed"],
    [
      "Revisions",
      terms.revisions !== null
        ? `${terms.revisions} rounds`
        : "To be agreed",
    ],
  ];

  for (const [label, value] of termRows) {
    renderTermRow(doc, label, value, margin, contentWidth);
    doc.moveDown(0.3);
  }

  doc.moveDown(0.3);
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor("#374151")
    .text("Deliverables:", margin, doc.y);

  doc.moveDown(0.3);
  if (terms.deliverables.length > 0) {
    for (const d of terms.deliverables) {
      doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor("#111827")
        .text(`• ${d}`, margin + 15, doc.y, { width: contentWidth - 15 });
    }
  } else {
    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#9ca3af")
      .text("(To be specified)", margin + 15, doc.y);
  }

  doc.moveDown(1);
  renderSectionDivider(doc, margin, pageWidth);

  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor("#374151")
    .text("PAYMENT", margin, doc.y);

  doc.moveDown(0.6);

  const paymentAmount =
    terms.price !== null
      ? `${terms.price} ${terms.currency}`
      : "the agreed amount";

  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#111827")
    .text(
      `Payment of ${paymentAmount} is held in escrow via StreamPay and will be released upon completion and approval of all deliverables.`,
      margin,
      doc.y,
      { width: contentWidth },
    );

  doc.moveDown(1);
  renderSectionDivider(doc, margin, pageWidth);

  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor("#374151")
    .text("AI WITNESS CERTIFICATE", margin, doc.y);

  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor("#6b7280")
    .text("Powered by Claude AI", margin + 2, doc.y - 1);

  doc.moveDown(0.6);

  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#111827")
    .text(
      `This agreement was negotiated and witnessed by Vaultalk AI (Claude). The AI Witness extracted and verified all terms from the negotiation transcript in room ${roomId}. Both parties have digitally confirmed these terms via the Vaultalk platform.`,
      margin,
      doc.y,
      { width: contentWidth },
    );

  doc.moveDown(1);

  doc
    .moveTo(margin, doc.y)
    .lineTo(pageWidth - margin, doc.y)
    .strokeColor("#e5e7eb")
    .lineWidth(1)
    .stroke();

  doc.moveDown(0.5);

  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor("#9ca3af")
    .text(
      "Powered by Vaultalk — Trusted AI Contract Negotiations | Built on StreamPay · Stream Chat · Claude AI | Streamathon 2025",
      margin,
      doc.y,
      { width: contentWidth, align: "center" },
    );
}

function renderSectionDivider(
  doc: InstanceType<typeof PDFDocument>,
  margin: number,
  pageWidth: number,
): void {
  doc
    .moveTo(margin, doc.y)
    .lineTo(pageWidth - margin, doc.y)
    .strokeColor("#d1d5db")
    .lineWidth(0.5)
    .stroke();
  doc.moveDown(0.7);
}

function renderTermRow(
  doc: InstanceType<typeof PDFDocument>,
  label: string,
  value: string,
  margin: number,
  contentWidth: number,
): void {
  const labelWidth = 120;
  const y = doc.y;

  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor("#4b5563")
    .text(`${label}:`, margin, y, { width: labelWidth });

  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#111827")
    .text(value, margin + labelWidth, y, { width: contentWidth - labelWidth });
}
