import PptxGenJS from "pptxgenjs";

export interface InspectionArea {
  name: string;
  findings: string[];
  photos: string[];
  notes?: string;
}

export interface InspectionData {
  projectName: string;
  inspectionDate: Date;
  inspectionType: string;
  inspector: string;
  participants?: string[];
  areas: InspectionArea[];
  generalNotes?: string;
  nextSteps?: string;
}

/**
 * Generate PowerPoint presentation for inspection protocol
 */
export async function generateInspectionPPTX(data: InspectionData): Promise<Buffer> {
  const pptx = new PptxGenJS();
  
  // Title Slide
  const titleSlide = pptx.addSlide();
  titleSlide.background = { color: "2C3E50" };
  
  titleSlide.addText("Begehungsprotokoll", {
    x: 0.5,
    y: 2.0,
    w: 9,
    h: 1.5,
    fontSize: 44,
    bold: true,
    color: "FFFFFF",
    align: "center",
  });
  
  titleSlide.addText(data.projectName, {
    x: 0.5,
    y: 3.5,
    w: 9,
    h: 0.8,
    fontSize: 28,
    color: "ECF0F1",
    align: "center",
  });
  
  titleSlide.addText(
    `${data.inspectionDate.toLocaleDateString("de-DE")} | ${data.inspector}`,
    {
      x: 0.5,
      y: 4.5,
      w: 9,
      h: 0.5,
      fontSize: 16,
      color: "BDC3C7",
      align: "center",
    }
  );

  // Overview Slide
  const overviewSlide = pptx.addSlide();
  overviewSlide.addText("Übersicht", {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.6,
    fontSize: 32,
    bold: true,
    color: "2C3E50",
  });
  
  const overviewText = [
    `Begehungsart: ${getInspectionTypeLabel(data.inspectionType)}`,
    `Datum: ${data.inspectionDate.toLocaleDateString("de-DE")}`,
    `Durchgeführt von: ${data.inspector}`,
    data.participants && data.participants.length > 0
      ? `Teilnehmer: ${data.participants.join(", ")}`
      : "",
    `Anzahl begangener Bereiche: ${data.areas.length}`,
  ].filter(Boolean);
  
  overviewSlide.addText(overviewText.join("\n"), {
    x: 0.5,
    y: 1.5,
    w: 9,
    h: 3.5,
    fontSize: 16,
    color: "34495E",
    valign: "top",
  });

  // Area Slides
  for (const area of data.areas) {
    const areaSlide = pptx.addSlide();
    
    // Area Title
    areaSlide.addText(area.name, {
      x: 0.5,
      y: 0.3,
      w: 9,
      h: 0.6,
      fontSize: 28,
      bold: true,
      color: "2C3E50",
    });
    
    // Findings
    if (area.findings && area.findings.length > 0) {
      const findingsText = area.findings.map((f, i) => `${i + 1}. ${f}`).join("\n");
      
      areaSlide.addText("Feststellungen:", {
        x: 0.5,
        y: 1.0,
        w: 4.5,
        h: 0.4,
        fontSize: 16,
        bold: true,
        color: "34495E",
      });
      
      areaSlide.addText(findingsText, {
        x: 0.5,
        y: 1.5,
        w: 4.5,
        h: 3.5,
        fontSize: 12,
        color: "34495E",
        valign: "top",
      });
    }
    
    // Photos (placeholder - in real implementation would fetch and embed actual images)
    if (area.photos && area.photos.length > 0) {
      areaSlide.addText(`${area.photos.length} Foto(s)`, {
        x: 5.5,
        y: 1.0,
        w: 4,
        h: 0.4,
        fontSize: 14,
        italic: true,
        color: "7F8C8D",
      });
      
      // Note: Actual image embedding would require downloading images first
      // For now, we just indicate the number of photos
    }
    
    // Notes
    if (area.notes) {
      areaSlide.addText("Hinweise:", {
        x: 0.5,
        y: 5.2,
        w: 9,
        h: 0.3,
        fontSize: 12,
        bold: true,
        color: "7F8C8D",
      });
      
      areaSlide.addText(area.notes, {
        x: 0.5,
        y: 5.6,
        w: 9,
        h: 0.8,
        fontSize: 11,
        color: "95A5A6",
        italic: true,
      });
    }
  }

  // Summary Slide
  if (data.generalNotes || data.nextSteps) {
    const summarySlide = pptx.addSlide();
    
    summarySlide.addText("Zusammenfassung & Nächste Schritte", {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.6,
      fontSize: 28,
      bold: true,
      color: "2C3E50",
    });
    
    let yPos = 1.5;
    
    if (data.generalNotes) {
      summarySlide.addText("Allgemeine Anmerkungen:", {
        x: 0.5,
        y: yPos,
        w: 9,
        h: 0.4,
        fontSize: 16,
        bold: true,
        color: "34495E",
      });
      
      summarySlide.addText(data.generalNotes, {
        x: 0.5,
        y: yPos + 0.5,
        w: 9,
        h: 1.5,
        fontSize: 14,
        color: "34495E",
      });
      
      yPos += 2.2;
    }
    
    if (data.nextSteps) {
      summarySlide.addText("Nächste Schritte:", {
        x: 0.5,
        y: yPos,
        w: 9,
        h: 0.4,
        fontSize: 16,
        bold: true,
        color: "34495E",
      });
      
      summarySlide.addText(data.nextSteps, {
        x: 0.5,
        y: yPos + 0.5,
        w: 9,
        h: 1.5,
        fontSize: 14,
        color: "34495E",
      });
    }
  }

  // Generate and return buffer
  const buffer = await pptx.write({ outputType: "nodebuffer" }) as Buffer;
  return buffer;
}

function getInspectionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    regular: "Regelbegehung",
    special: "Sonderbegehung",
    final: "Abschlussbegehung",
    acceptance: "Abnahmebegehung",
  };
  return labels[type] || type;
}
