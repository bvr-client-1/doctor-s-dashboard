import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const MODEL = "gemini-2.0-flash";

export interface RawAppointmentInput {
  patient_name: string;
  phone: string;
  department: string;
  reason: string | null;
  appointment_date: string | null;
  appointment_time: string | null;
  language: string | null;
  notes: string | null;
}

export interface NormalizedAppointmentOutput {
  patient_name: string;
  department: string;
  reason: string | null;
  notes: string | null;
  original_language: string | null;
}

function buildPrompt(input: RawAppointmentInput): string {
  return `You are a medical appointment data normalizer for CarePoint Medical Center.

Given this raw appointment data from a voice agent, normalize it into professional English.

Input:
- patient_name: ${input.patient_name}
- department: ${input.department}
- reason: ${input.reason || "Not specified"}
- notes: ${input.notes || "None"}
- language spoken: ${input.language || "unknown"}

Rules:
1. Transliterate the patient_name to English (e.g., కీర్తన్ -> Keerthan, राहुल -> Rahul). Keep original script in parentheses if the name was non-English: "Keerthan (కీర్తన్)".
2. Normalize department to one of: General Medicine, Ophthalmology, Gynecology, Dermatology, Pediatrics, Cardiology, Orthopedics, ENT. Map synonyms (e.g., "కళ్ళ డాక్టర్" -> Ophthalmology, "గుండె" -> Cardiology).
3. Convert the reason/symptoms to concise English medical terms (e.g., "జ్వరం" -> "Fever", "తలనొప్పి" -> "Headache", "కళ్ళు నొప్పి" -> "Eye pain").
4. Generate 1-2 concise professional clinical notes summarizing the patient complaint.
5. Detect the original language from the input (e.g., "Telugu", "Hindi", "English").
6. Return ONLY valid JSON, no markdown, no explanation.

Output JSON:
{
  "patient_name": "English transliterated name",
  "department": "Normalized department",
  "reason": "English medical reason",
  "notes": "Professional clinical notes",
  "original_language": "Detected language"
}`;
}

export async function normalizeWithAI(
  input: RawAppointmentInput
): Promise<NormalizedAppointmentOutput> {
  if (!apiKey) {
    console.warn("[AI Normalize] GEMINI_API_KEY not configured, skipping AI normalization");
    return {
      patient_name: input.patient_name,
      department: input.department,
      reason: input.reason || null,
      notes: input.notes || null,
      original_language: input.language || null,
    };
  }

  console.log("[AI Normalize] AI normalization started");
  console.log("[AI Normalize] Original values:", JSON.stringify({
    patient_name: input.patient_name,
    department: input.department,
    reason: input.reason,
    language: input.language,
    notes: input.notes,
  }));

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: MODEL });
  const prompt = buildPrompt(input);

  console.log("[AI Normalize] Calling Gemini API...");
  const startTime = Date.now();

  try {
    const result = await Promise.race([
      model.generateContent(prompt),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Gemini timeout: generateContent exceeded 15s")), 15000)
      ),
    ]);

    const elapsed = Date.now() - startTime;
    const response = result.response.text().trim();
    console.log(`[AI Normalize] Gemini responded in ${elapsed}ms`);
    console.log(`[AI Normalize] Raw response: ${response}`);

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("[AI Normalize] No JSON in response, falling back to raw values");
      return {
        patient_name: input.patient_name,
        department: input.department,
        reason: input.reason || null,
        notes: input.notes || null,
        original_language: input.language || null,
      };
    }

    const parsed = JSON.parse(jsonMatch[0]);

    const normalized = {
      patient_name: String(parsed.patient_name || input.patient_name),
      department: String(parsed.department || input.department),
      reason: parsed.reason !== undefined ? String(parsed.reason) : input.reason || null,
      notes: parsed.notes !== undefined ? String(parsed.notes) : input.notes || null,
      original_language: String(parsed.original_language || input.language || null),
    };

    console.log("[AI Normalize] AI normalization completed");
    console.log("[AI Normalize] Normalized values:", JSON.stringify(normalized));

    return normalized;
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error(`[AI Normalize] Gemini failed after ${elapsed}ms, falling back to raw values`);
    if (error instanceof Error) {
      console.error(`[AI Normalize] Error: ${error.message}`);
    }
    return {
      patient_name: input.patient_name,
      department: input.department,
      reason: input.reason || null,
      notes: input.notes || null,
      original_language: input.language || null,
    };
  }
}