import { invokeLLM } from "./_core/llm";

/**
 * AI-powered report generation and analysis using OpenRouter
 */

export async function generateDailyReportSummary(reportData: {
  workDescription?: string;
  specialOccurrences?: string;
  weather?: string;
  temperature?: string;
  workHours?: number;
}): Promise<string> {
  const prompt = `Du bist ein erfahrener Bauleiter. Erstelle eine professionelle Zusammenfassung für einen Bautagebuch-Eintrag basierend auf folgenden Informationen:

Wetter: ${reportData.weather || "Nicht angegeben"}
Temperatur: ${reportData.temperature || "Nicht angegeben"}
Arbeitsstunden: ${reportData.workHours || "Nicht angegeben"}
Ausgeführte Arbeiten: ${reportData.workDescription || "Nicht angegeben"}
Besondere Vorkommnisse: ${reportData.specialOccurrences || "Keine"}

Erstelle eine prägnante, professionelle Zusammenfassung (max. 3 Sätze) für den Bautagebuch-Eintrag.`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: "Du bist ein erfahrener Bauleiter mit Expertise in Baudokumentation." },
      { role: "user", content: prompt }
    ],
  });

  const content = response.choices[0].message.content;
  return typeof content === 'string' ? content : '';
}

export async function analyzeDefect(defectData: {
  title: string;
  description: string;
  location?: string;
  trade?: string;
}): Promise<{
  suggestedCategory: string;
  suggestedSeverity: "low" | "medium" | "high" | "critical";
  suggestedActions: string[];
  estimatedResolutionTime: string;
}> {
  const prompt = `Analysiere folgenden Baumangel und gib Empfehlungen:

Titel: ${defectData.title}
Beschreibung: ${defectData.description}
Ort: ${defectData.location || "Nicht angegeben"}
Gewerk: ${defectData.trade || "Nicht angegeben"}

Gib eine strukturierte Analyse als JSON zurück mit:
- suggestedCategory: Kategorie des Mangels (z.B. "Elektro", "Sanitär", "Bau", "HVAC")
- suggestedSeverity: Schweregrad ("low", "medium", "high", "critical")
- suggestedActions: Array von empfohlenen Maßnahmen
- estimatedResolutionTime: Geschätzte Behebungszeit (z.B. "1-2 Tage", "1 Woche")`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: "Du bist ein Bauingenieur mit Expertise in Mängelanalyse. Antworte nur mit validem JSON." },
      { role: "user", content: prompt }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "defect_analysis",
        strict: true,
        schema: {
          type: "object",
          properties: {
            suggestedCategory: { type: "string" },
            suggestedSeverity: { 
              type: "string",
              enum: ["low", "medium", "high", "critical"]
            },
            suggestedActions: { 
              type: "array",
              items: { type: "string" }
            },
            estimatedResolutionTime: { type: "string" }
          },
          required: ["suggestedCategory", "suggestedSeverity", "suggestedActions", "estimatedResolutionTime"],
          additionalProperties: false
        }
      }
    }
  });

  const content = response.choices[0].message.content;
  const contentStr = typeof content === 'string' ? content : '{}';
  return JSON.parse(contentStr);
}

export async function generateInspectionReport(protocolData: {
  inspectionType: string;
  areas?: string;
  findings?: string;
  participants?: string;
}): Promise<string> {
  const typeLabels: Record<string, string> = {
    regular: "Regelbegehung",
    special: "Sonderbegehung",
    final: "Endabnahme",
    acceptance: "Abnahme"
  };

  const prompt = `Erstelle einen professionellen Begehungsbericht für eine ${typeLabels[protocolData.inspectionType] || protocolData.inspectionType}:

Teilnehmer: ${protocolData.participants || "Nicht angegeben"}
Begangene Bereiche: ${protocolData.areas || "Nicht angegeben"}
Feststellungen: ${protocolData.findings || "Keine besonderen Feststellungen"}

Erstelle einen strukturierten, professionellen Bericht mit:
1. Zusammenfassung
2. Detaillierte Feststellungen
3. Empfohlene Maßnahmen
4. Nächste Schritte

Formatierung: Professionell, prägnant, in deutscher Sprache.`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: "Du bist ein erfahrener Bauleiter und Sachverständiger." },
      { role: "user", content: prompt }
    ],
  });

  const content = response.choices[0].message.content;
  return typeof content === 'string' ? content : '';
}

export async function generateProjectSummary(projectData: {
  name: string;
  description?: string;
  status: string;
  tasksCount: number;
  defectsCount: number;
  progress?: number;
}): Promise<string> {
  const prompt = `Erstelle eine Executive Summary für folgendes Bauprojekt:

Projektname: ${projectData.name}
Beschreibung: ${projectData.description || "Nicht vorhanden"}
Status: ${projectData.status}
Anzahl Aufgaben: ${projectData.tasksCount}
Anzahl Mängel: ${projectData.defectsCount}
Fortschritt: ${projectData.progress || "Nicht angegeben"}%

Erstelle eine prägnante Executive Summary (max. 5 Sätze) mit Fokus auf:
- Aktueller Projektstatus
- Wichtige Kennzahlen
- Kritische Punkte (falls Mängel vorhanden)
- Nächste Schritte`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: "Du bist ein Projektmanager im Bauwesen." },
      { role: "user", content: prompt }
    ],
  });

  const content = response.choices[0].message.content;
  return typeof content === 'string' ? content : '';
}

export async function suggestTaskPriorities(tasks: Array<{
  title: string;
  description?: string;
  dueDate?: Date;
  status: string;
}>): Promise<Array<{ taskTitle: string; suggestedPriority: string; reasoning: string }>> {
  const tasksText = tasks.map((t, i) => 
    `${i + 1}. ${t.title}\n   Beschreibung: ${t.description || "Keine"}\n   Fällig: ${t.dueDate ? t.dueDate.toLocaleDateString('de-DE') : "Nicht festgelegt"}\n   Status: ${t.status}`
  ).join('\n\n');

  const prompt = `Analysiere folgende Projektaufgaben und schlage Prioritäten vor:

${tasksText}

Gib für jede Aufgabe eine Prioritätsempfehlung als JSON-Array zurück mit:
- taskTitle: Titel der Aufgabe
- suggestedPriority: "low", "medium", "high" oder "critical"
- reasoning: Kurze Begründung (1 Satz)`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: "Du bist ein Projektmanagement-Experte im Bauwesen. Antworte nur mit validem JSON." },
      { role: "user", content: prompt }
    ],
  });

  const content = response.choices[0].message.content;
  const contentStr = typeof content === 'string' ? content : '[]';
  try {
    return JSON.parse(contentStr);
  } catch {
    return [];
  }
}

