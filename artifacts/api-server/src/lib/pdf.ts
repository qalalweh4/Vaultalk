import PDFDocument from "pdfkit";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import type { ContractTerms } from "./ai";

function resolveAmiriFont(): string {
  // Primary: relative to the bundled output file (dist/index.mjs → ../fonts)
  const fromBundle = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../fonts/Amiri-Regular.ttf",
  );
  if (existsSync(fromBundle)) return fromBundle;

  // Fallback: relative to process.cwd() (api-server working directory)
  const fromCwd = path.resolve(process.cwd(), "fonts/Amiri-Regular.ttf");
  if (existsSync(fromCwd)) return fromCwd;

  // Last resort: two levels up from the source file (src/lib → fonts)
  const fromSrc = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../../fonts/Amiri-Regular.ttf",
  );
  return fromSrc;
}

const AMIRI_FONT = resolveAmiriFont();

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
        Subject: "Bilingual Service Agreement",
      },
    });

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.registerFont("Amiri", AMIRI_FONT);

    renderEnglishSection(doc, terms, clientName, merchantName, roomId);

    doc.addPage();

    renderArabicSection(doc, terms, clientName, merchantName, roomId);

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
    .text("FREELANCE SERVICE AGREEMENT", margin, margin, {
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

function renderArabicSection(
  doc: InstanceType<typeof PDFDocument>,
  terms: ContractTerms,
  clientName: string,
  merchantName: string,
  roomId: string,
): void {
  const pageWidth = doc.page.width;
  const margin = 50;
  const contentWidth = pageWidth - margin * 2;

  const date = new Date().toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  doc
    .font("Amiri")
    .fontSize(22)
    .fillColor("#1a1a2e")
    .text("عقد خدمات مستقلة", margin, margin, {
      width: contentWidth,
      align: "right",
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
    .font("Amiri")
    .fontSize(10)
    .fillColor("#6b7280")
    .text(`رقم المرجع: VAULTALK-${roomId.toUpperCase()}`, margin, doc.y, {
      width: contentWidth,
      align: "right",
    });

  doc.text(`التاريخ: ${date}`, margin, doc.y, {
    width: contentWidth,
    align: "right",
  });

  doc.moveDown(1);

  doc
    .font("Amiri")
    .fontSize(13)
    .fillColor("#374151")
    .text("الأطراف", margin, doc.y, { width: contentWidth, align: "right" });

  doc.moveDown(0.4);

  doc.font("Amiri").fontSize(11).fillColor("#111827");

  doc.text(`العميل:  ${clientName}`, margin, doc.y, {
    width: contentWidth,
    align: "right",
  });
  doc.text(`التاجر:   ${merchantName}`, margin, doc.y, {
    width: contentWidth,
    align: "right",
  });

  doc.moveDown(1);
  renderSectionDivider(doc, margin, pageWidth);

  doc
    .font("Amiri")
    .fontSize(13)
    .fillColor("#374151")
    .text("الشروط المتفق عليها", margin, doc.y, {
      width: contentWidth,
      align: "right",
    });

  doc.moveDown(0.6);

  const priceVal =
    terms.price !== null
      ? `${terms.price} ${terms.currency}`
      : "يُحدد لاحقاً";
  const deadlineVal = terms.deadline ?? "يُحدد لاحقاً";
  const revisionsVal =
    terms.revisions !== null ? `${terms.revisions} جولات` : "يُحدد لاحقاً";

  renderArabicTermRow(doc, "الأتعاب", priceVal, margin, contentWidth);
  doc.moveDown(0.3);
  renderArabicTermRow(doc, "الموعد النهائي", deadlineVal, margin, contentWidth);
  doc.moveDown(0.3);
  renderArabicTermRow(doc, "التعديلات", revisionsVal, margin, contentWidth);

  doc.moveDown(0.3);
  doc
    .font("Amiri")
    .fontSize(11)
    .fillColor("#374151")
    .text("المُسلَّمات:", margin, doc.y, { width: contentWidth, align: "right" });

  doc.moveDown(0.3);
  if (terms.deliverables.length > 0) {
    for (const d of terms.deliverables) {
      doc
        .font("Amiri")
        .fontSize(11)
        .fillColor("#111827")
        .text(`• ${d}`, margin, doc.y, { width: contentWidth, align: "right" });
    }
  } else {
    doc
      .font("Amiri")
      .fontSize(11)
      .fillColor("#9ca3af")
      .text("(يُحدد لاحقاً)", margin, doc.y, {
        width: contentWidth,
        align: "right",
      });
  }

  doc.moveDown(1);
  renderSectionDivider(doc, margin, pageWidth);

  doc
    .font("Amiri")
    .fontSize(13)
    .fillColor("#374151")
    .text("الدفع", margin, doc.y, { width: contentWidth, align: "right" });

  doc.moveDown(0.6);

  const paymentAmount =
    terms.price !== null
      ? `${terms.price} ${terms.currency}`
      : "المبلغ المتفق عليه";

  doc
    .font("Amiri")
    .fontSize(11)
    .fillColor("#111827")
    .text(
      `يُحتجز مبلغ ${paymentAmount} في الضمان عبر StreamPay ويُصرف عند الانتهاء من تسليم جميع المُسلَّمات والموافقة عليها.`,
      margin,
      doc.y,
      { width: contentWidth, align: "right" },
    );

  doc.moveDown(1);
  renderSectionDivider(doc, margin, pageWidth);

  doc
    .font("Amiri")
    .fontSize(13)
    .fillColor("#374151")
    .text("شهادة الشاهد الذكي", margin, doc.y, {
      width: contentWidth,
      align: "right",
    });

  doc
    .font("Amiri")
    .fontSize(9)
    .fillColor("#6b7280")
    .text("بدعم من Claude AI", margin, doc.y - 1, {
      width: contentWidth,
      align: "right",
    });

  doc.moveDown(0.6);

  doc
    .font("Amiri")
    .fontSize(11)
    .fillColor("#111827")
    .text(
      `تمت مفاوضة هذه الاتفاقية وشهد عليها Vaultalk AI (Claude). استخرج الشاهد الذكي جميع الشروط وتحقق منها من نص التفاوض في الغرفة ${roomId}. أكد الطرفان رقمياً على هذه الشروط عبر منصة Vaultalk.`,
      margin,
      doc.y,
      { width: contentWidth, align: "right" },
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
    .font("Amiri")
    .fontSize(9)
    .fillColor("#9ca3af")
    .text(
      "بدعم من Vaultalk — مفاوضات عقود موثوقة بالذكاء الاصطناعي | مبني على StreamPay · Stream Chat · Claude AI | Streamathon 2025",
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

function renderArabicTermRow(
  doc: InstanceType<typeof PDFDocument>,
  label: string,
  value: string,
  margin: number,
  contentWidth: number,
): void {
  const y = doc.y;

  doc
    .font("Amiri")
    .fontSize(11)
    .fillColor("#111827")
    .text(`${value}  :${label}`, margin, y, {
      width: contentWidth,
      align: "right",
    });
}
