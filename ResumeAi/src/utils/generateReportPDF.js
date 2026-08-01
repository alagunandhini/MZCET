import jsPDF from "jspdf";

const COLORS = {
  primary: [56, 189, 248],        // sky-400
  primaryDark: [15, 23, 42],      // slate-900 header
  ink: [15, 23, 42],              // near-black
  blue: [14, 165, 233],           // sky-500
  pass: [16, 185, 129],           // emerald green
  passBg: [236, 253, 245],        // soft green light bg
  fail: [239, 68, 68],            // soft red
  failBg: [254, 242, 242],        // soft red light bg
  slateDark: [30, 41, 59],
  slateMid: [100, 116, 139],
  slateLight: [148, 163, 184],
  cardBg: [248, 250, 252],
  answerBg: [239, 246, 255],
  border: [226, 232, 240],
  white: [255, 255, 255],
};

function loadImageAsDataURL(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export async function generateReportPDF(feedback, studentInfo, roundLabel) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const maxWidth = pageWidth - margin * 2;
  let y = 0;

  const checkPageBreak = (neededSpace = 20) => {
    if (y + neededSpace > pageHeight - 50) {
      doc.addPage();
      y = margin;
      return true;
    }
    return false;
  };

  const addWrappedText = (text, x, fontSize, fontStyle = "normal", color = COLORS.slateDark, lineGap = 5, width = null) => {
    doc.setFont("helvetica", fontStyle);
    doc.setFontSize(fontSize);
    doc.setTextColor(...color);
    const w = width || (maxWidth - (x - margin));
    const lines = doc.splitTextToSize(text || "", w);
    lines.forEach((line) => {
      checkPageBreak(fontSize + lineGap);
      doc.text(line, x, y);
      y += fontSize + lineGap;
    });
  };

const drawBrandHeader = (x, yPos, mzFontSize = 22, isDarkBg = true) => {
    doc.setFont("courier", "bold");
    doc.setFontSize(mzFontSize);
    
    // If it's a dark background (Header), use white text. 
    // If light background (Footer), use slate dark text.
    if (isDarkBg) {
      doc.setTextColor(255, 255, 255);
    } else {
      doc.setTextColor(...COLORS.slateDark);
    }

    doc.text("MZ", x, yPos);

    const mzWidth = doc.getTextWidth("MZ");
    doc.setTextColor(...COLORS.primary);
    doc.text("PlaceNext", x + mzWidth + 2, yPos);
  };

  const drawProgressBar = (label, percentage, x, barY, barWidth) => {
    const barHeight = 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.slateDark);
    doc.text(label, x, barY - 5);
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.blue);
    doc.text(`${percentage}%`, x + barWidth, barY - 5, { align: "right" });

    doc.setFillColor(...COLORS.border);
    doc.roundedRect(x, barY, barWidth, barHeight, 3, 3, "F");

    const fillWidth = Math.max((percentage / 100) * barWidth, 4);
    doc.setFillColor(...COLORS.blue);
    doc.roundedRect(x, barY, fillWidth, barHeight, 3, 3, "F");
  };

  // ===================== HEADER =====================
  const headerHeight = 110;
  doc.setFillColor(...COLORS.primaryDark);
  doc.rect(0, 0, pageWidth, headerHeight, "F");
  
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, headerHeight - 4, pageWidth, 4, "F");

  const logoSize = 56;
  let brandX = margin;
  try {
    const logoDataUrl = await loadImageAsDataURL("/completed logo.png");
    doc.addImage(logoDataUrl, "PNG", margin, 27, logoSize, logoSize);
    brandX = margin + logoSize + 16;
  } catch (e) {
    console.warn("Could not load logo for PDF, continuing without it.", e);
  }

  drawBrandHeader(brandX, 48, 22);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(180, 220, 245);
  doc.text("Interview Performance Assessment", brandX, 66);

  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `${roundLabel || "Interview Round"}  ·  ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`,
    brandX, 81
  );

  y = headerHeight + 24;

  // ===================== HERO DASHBOARD (INCREASED HEIGHT & PADDING) =====================
  const heroCardHeight = 140; // Increased card height from 120 -> 140
  checkPageBreak(heroCardHeight + 10);

  // Background Card
  doc.setFillColor(...COLORS.cardBg);
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(1);
  doc.roundedRect(margin, y, maxWidth, heroCardHeight, 8, 8, "FD");

  // --- Left Column: Student Details ---
  const leftWidth = (maxWidth / 2) - 10;
  let infoY = y + 24;

  const studentFields = [
    { label: "CANDIDATE NAME", val: studentInfo?.name || "-" },
    { label: "REGISTER NUMBER", val: studentInfo?.registerNumber || "-" },
    { label: "DEPARTMENT", val: studentInfo?.department || "-" },
  ];

  studentFields.forEach((field) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.slateLight);
    doc.text(field.label, margin + 18, infoY);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.slateDark);
    const splitVal = doc.splitTextToSize(field.val, leftWidth - 20);
    doc.text(splitVal[0] || "-", margin + 18, infoY + 13);

    infoY += 44; // Slightly padded spacing between fields
  });

  // Vertical Divider Line
  const dividerX = margin + (maxWidth / 2);
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(1);
  doc.line(dividerX, y + 16, dividerX, y + heroCardHeight - 16);

  // --- Right Column: Score & Metrics ---
  const rightX = dividerX + 20;
  const isPass = feedback.result?.toLowerCase().includes("pass");
  const themeColor = isPass ? COLORS.pass : COLORS.fail;
  const themeBgColor = isPass ? COLORS.passBg : COLORS.failBg;

  // Circle Badge
  const scoreCircleX = rightX + 35;
  const scoreCircleY = y + 54;
  doc.setFillColor(...themeBgColor);
  doc.circle(scoreCircleX, scoreCircleY, 32, "F");
  doc.setDrawColor(...themeColor);
  doc.setLineWidth(2);
  doc.circle(scoreCircleX, scoreCircleY, 32, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...themeColor);
  doc.text(`${feedback.overallScore ?? 0}`, scoreCircleX, scoreCircleY + 3, { align: "center" });

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.slateMid);
  doc.text("SCORE", scoreCircleX, scoreCircleY + 14, { align: "center" });

  // Status Pill Badge & Performance Label
  const statusX = scoreCircleX + 48;
  const statusText = (feedback.result || "PENDING").toUpperCase();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  const statusWidth = doc.getTextWidth(statusText) + 14;

  doc.setFillColor(...themeBgColor);
  doc.roundedRect(statusX, scoreCircleY - 22, statusWidth, 16, 8, 8, "F");
  doc.setTextColor(...themeColor);
  doc.text(statusText, statusX + statusWidth / 2, scoreCircleY - 11, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...COLORS.slateMid);
  doc.text("Rating:", statusX, scoreCircleY + 8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.slateDark);
  doc.text(`${feedback.performance_label || "-"}`, statusX + 34, scoreCircleY + 8);

  // Progress Bars Shifted Down for Bottom Breathing Room
  const pbWidth = maxWidth - (rightX - margin) - 20;
  const progressBarsY = y + 112; // Shifted down so there's clear padding below
  drawProgressBar("Confidence", feedback.communication?.confidence_percentage ?? 0, rightX, progressBarsY, pbWidth / 2 - 8);
  drawProgressBar("Clarity", feedback.communication?.clarity_percentage ?? 0, rightX + (pbWidth / 2) + 8, progressBarsY, pbWidth / 2 - 8);

  y += heroCardHeight + 32; // Increased gap before next section (24 -> 32)

  // ===================== SECTION HEADERS UTILITY =====================
  const renderSectionHeader = (title) => {
    checkPageBreak(35);
    doc.setFillColor(...COLORS.primaryDark);
    doc.roundedRect(margin, y, maxWidth, 22, 4, 4, "F");

    doc.setFillColor(...COLORS.primary);
    doc.rect(margin, y, 4, 22, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(title.toUpperCase(), margin + 14, y + 14);
    y += 42; // Increased spacing after header bar
  };

  // ===================== SUMMARY =====================
  renderSectionHeader("Overall Assessment Summary");
  addWrappedText(feedback.overall_feedback || "", margin, 9.5, "normal", COLORS.slateDark, 6);
  y += 20; // Increased spacing after summary block

  // ===================== KEY TAKEAWAYS =====================
  if (feedback.motivation_message?.length) {
    renderSectionHeader("Key Takeaways & Action Items");

    feedback.motivation_message.forEach((msg) => {
      checkPageBreak(22);
      doc.setFillColor(...COLORS.primary);
      doc.circle(margin + 6, y - 3, 2.5, "F");
      addWrappedText(msg, margin + 18, 9.5, "normal", COLORS.slateDark, 5, maxWidth - 18);
      y += 6;
    });
    y += 20; // Increased spacing after takeaways block
  }

  // ===================== Q&A BREAKDOWN =====================
// ===================== Q&A BREAKDOWN =====================
  renderSectionHeader("Detailed Question & Answer Analysis");
  
  // ADD THIS LINE to push Q1 down further from the header bar:
  y += 12; // Extra breathing room directly under the header banner

  (feedback.qa_feedback || []).forEach((item, index) => {
    checkPageBreak(65);

    // Question Box Badge (Q1, Q2, etc.)
    doc.setFillColor(...COLORS.slateDark);
    doc.roundedRect(margin, y - 8, 26, 16, 3, 3, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text(`Q${index + 1}`, margin + 13, y + 3, { align: "center" });

    // Question Text
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.slateDark);
    const qLines = doc.splitTextToSize(item.question || "", maxWidth - 36);
    doc.text(qLines, margin + 34, y + 3);
    y += qLines.length * 14 + 14; // Added extra vertical gap before answer boxes

    // Student Answer Box
    checkPageBreak(35);
    doc.setFillColor(...COLORS.cardBg);
    doc.setDrawColor(...COLORS.border);
    const yourAnswerLines = doc.splitTextToSize(`"${item.user_answer || "(No answer provided)"}"`, maxWidth - 24);
    const yourBoxHeight = yourAnswerLines.length * 12 + 20;

    doc.roundedRect(margin, y, maxWidth, yourBoxHeight, 4, 4, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...COLORS.slateLight);
    doc.text("YOUR RESPONSE", margin + 12, y + 13);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.slateMid);
    doc.text(yourAnswerLines, margin + 12, y + 26);
    y += yourBoxHeight + 10;

    // Suggested Answer Box
    checkPageBreak(35);
    doc.setFillColor(...COLORS.answerBg);
    doc.setDrawColor(...COLORS.primary);
    const suggestedLines = doc.splitTextToSize(item.improved_answer || "", maxWidth - 24);
    const suggestedBoxHeight = suggestedLines.length * 12 + 20;

    doc.roundedRect(margin, y, maxWidth, suggestedBoxHeight, 4, 4, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...COLORS.blue);
    doc.text("RECOMMENDED IMPROVED ANSWER", margin + 12, y + 13);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.slateDark);
    doc.text(suggestedLines, margin + 12, y + 26);
    y += suggestedBoxHeight + 28; // Space between Q&A cards
  });
// ===================== FOOTER =====================
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 32, pageWidth - margin, pageHeight - 32);

    // Pass 'false' for dark background so "MZ" turns dark gray/black
    drawBrandHeader(margin, pageHeight - 18, 10, false);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.slateLight);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 18, { align: "right" });
  }

  const fileName = `Interview_Report_${(studentInfo?.registerNumber || "student")}_${roundLabel || ""}.pdf`.replace(/\s+/g, "_");
  doc.save(fileName);
}