import PDFDocument from "pdfkit";
import { Readable } from "stream";

export interface DailyReportData {
  reportDate: Date;
  projectName: string;
  weather?: string;
  temperature?: string;
  workDescription?: string;
  attendees?: string;
  workHours?: number;
  photos?: string[];
  specialOccurrences?: string;
  nextDayPlanning?: string;
}

export interface DefectData {
  defectNumber: string;
  title: string;
  description: string;
  location?: string;
  severity: string;
  status: string;
  detectedDate: Date;
  responsibleParty?: string;
  detectionPhotos?: string[];
}

/**
 * Generate PDF for a daily report
 */
export async function generateDailyReportPDF(data: DailyReportData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Header
    doc.fontSize(20).text("Bautagebuch", { align: "center" });
    doc.moveDown();
    
    // Project and Date
    doc.fontSize(14).text(`Projekt: ${data.projectName}`);
    doc.fontSize(12).text(`Datum: ${data.reportDate.toLocaleDateString("de-DE")}`);
    doc.moveDown();

    // Weather
    if (data.weather || data.temperature) {
      doc.fontSize(14).text("Wetter", { underline: true });
      if (data.weather) doc.fontSize(11).text(`Wetterlage: ${data.weather}`);
      if (data.temperature) doc.fontSize(11).text(`Temperatur: ${data.temperature}`);
      doc.moveDown();
    }

    // Work Description
    if (data.workDescription) {
      doc.fontSize(14).text("Ausgeführte Arbeiten", { underline: true });
      doc.fontSize(11).text(data.workDescription, { align: "justify" });
      doc.moveDown();
    }

    // Attendees
    if (data.attendees) {
      doc.fontSize(14).text("Anwesende Personen", { underline: true });
      doc.fontSize(11).text(data.attendees);
      doc.moveDown();
    }

    // Work Hours
    if (data.workHours) {
      doc.fontSize(14).text("Arbeitsstunden", { underline: true });
      doc.fontSize(11).text(`${data.workHours} Stunden`);
      doc.moveDown();
    }

    // Special Occurrences
    if (data.specialOccurrences) {
      doc.fontSize(14).text("Besondere Vorkommnisse", { underline: true });
      doc.fontSize(11).text(data.specialOccurrences, { align: "justify" });
      doc.moveDown();
    }

    // Next Day Planning
    if (data.nextDayPlanning) {
      doc.fontSize(14).text("Planung für den nächsten Tag", { underline: true });
      doc.fontSize(11).text(data.nextDayPlanning, { align: "justify" });
      doc.moveDown();
    }

    // Footer
    doc.fontSize(9).text(
      `Erstellt am ${new Date().toLocaleDateString("de-DE")} um ${new Date().toLocaleTimeString("de-DE")}`,
      50,
      doc.page.height - 50,
      { align: "center" }
    );

    doc.end();
  });
}

/**
 * Generate PDF for defect protocol (filtered list)
 */
export async function generateDefectProtocolPDF(
  defects: DefectData[],
  projectName: string,
  filters?: { severity?: string; status?: string }
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Header
    doc.fontSize(20).text("Mängelprotokoll", { align: "center" });
    doc.moveDown();
    
    doc.fontSize(14).text(`Projekt: ${projectName}`);
    doc.fontSize(12).text(`Erstellt: ${new Date().toLocaleDateString("de-DE")}`);
    
    if (filters?.severity || filters?.status) {
      doc.fontSize(10).text(
        `Filter: ${filters.severity ? `Priorität: ${filters.severity}` : ""} ${filters.status ? `Status: ${filters.status}` : ""}`,
        
      );
    }
    
    doc.moveDown();
    doc.fontSize(12).text(`Anzahl Mängel: ${defects.length}`);
    doc.moveDown(2);

    // Defects Table
    defects.forEach((defect, index) => {
      // Check if we need a new page
      if (doc.y > 700) {
        doc.addPage();
      }

      // Defect Header
      doc.fontSize(12).fillColor("black").text(`${index + 1}. ${defect.defectNumber} - ${defect.title}`, {
        underline: true,
      });
      doc.moveDown(0.5);

      // Defect Details
      doc.fontSize(10);
      doc.text(`Beschreibung: ${defect.description}`);
      if (defect.location) doc.text(`Ort: ${defect.location}`);
      doc.text(`Priorität: ${getSeverityLabel(defect.severity)}`);
      doc.text(`Status: ${getStatusLabel(defect.status)}`);
      doc.text(`Festgestellt am: ${defect.detectedDate.toLocaleDateString("de-DE")}`);
      if (defect.responsibleParty) doc.text(`Verantwortlich: ${defect.responsibleParty}`);
      
      doc.moveDown(1.5);
    });

    // Footer
    doc.fontSize(9).text(
      `Seite ${doc.bufferedPageRange().count}`,
      50,
      doc.page.height - 50,
      { align: "center" }
    );

    doc.end();
  });
}

function getSeverityLabel(severity: string): string {
  const labels: Record<string, string> = {
    low: "Niedrig",
    medium: "Mittel",
    high: "Hoch",
    critical: "Kritisch",
  };
  return labels[severity] || severity;
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    open: "Offen",
    in_progress: "In Bearbeitung",
    resolved: "Behoben",
    verified: "Verifiziert",
    closed: "Geschlossen",
  };
  return labels[status] || status;
}

