import Groq from "groq-sdk";

const apiKey = process.env.GROQ_API_KEY;
const MODEL = "llama-3.3-70b-versatile";

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
  patient_name_english: string;
  reason_english: string | null;
  department_normalized: string;
  notes_english: string | null;
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
1. Transliterate the patient_name to English only (e.g., కీర్తన్ -> Keerthan, राहुल -> Rahul, పృథ్వి -> Pruthvi, కార్తీక్ -> Karthik). Return ONLY the English name, no original script, no parentheses.
2. Normalize department to one of: General Medicine, Ophthalmology, Gynecology, Dermatology, Pediatrics, Cardiology, Orthopedics, ENT. Map synonyms (e.g., "కళ్ళ డాక్టర్" -> Ophthalmology, "గుండె" -> Cardiology).
3. Convert the reason/symptoms to concise English medical terms (e.g., "జ్వరం" -> "Fever", "తలనొప్పి" -> "Headache", "కడుపునొప్పి" -> "Stomach Pain", "కళ్ళు నొప్పి" -> "Eye pain").
4. Generate 1-2 concise professional clinical notes summarizing the patient complaint.
5. Detect the original language from the input (e.g., "Telugu", "Hindi", "English").
6. Return ONLY valid JSON, no markdown, no explanation.

Output JSON:
{
  "patient_name_english": "English transliterated name",
  "reason_english": "English medical reason",
  "department_normalized": "Normalized department",
  "notes_english": "Professional clinical notes",
  "original_language": "Detected language"
}`;
}

function createFallback(input: RawAppointmentInput): NormalizedAppointmentOutput {
  return {
    patient_name_english: input.patient_name,
    reason_english: input.reason || null,
    department_normalized: input.department,
    notes_english: input.notes || null,
    original_language: input.language || null,
  };
}

export async function normalizeWithAI(
  input: RawAppointmentInput
): Promise<NormalizedAppointmentOutput> {
  if (!apiKey) {
    console.warn("[AI Normalize] GROQ_API_KEY not configured, skipping AI normalization");
    return createFallback(input);
  }

  console.log("[AI Normalize] AI normalization started");
  console.log("[AI Normalize] Original values:", JSON.stringify({
    patient_name: input.patient_name,
    department: input.department,
    reason: input.reason,
    language: input.language,
    notes: input.notes,
  }));

  const client = new Groq({ apiKey });
  const prompt = buildPrompt(input);

  console.log("[AI Normalize] Calling Groq API (llama-3.3-70b-versatile)...");
  const startTime = Date.now();

  try {
    const result = await Promise.race([
      client.chat.completions.create({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        max_tokens: 512,
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Groq timeout: chat.completions.create exceeded 15s")), 15000)
      ),
    ]);

    const elapsed = Date.now() - startTime;
    const response = result.choices[0]?.message?.content?.trim() ?? "";
    console.log(`[AI Normalize] Groq responded in ${elapsed}ms`);
    console.log(`[AI Normalize] Raw response: ${response}`);

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("[AI Normalize] No JSON in response, falling back to raw values");
      return createFallback(input);
    }

    const parsed = JSON.parse(jsonMatch[0]);

    const normalized: NormalizedAppointmentOutput = {
      patient_name_english: String(parsed.patient_name_english || input.patient_name),
      reason_english: parsed.reason_english !== undefined ? String(parsed.reason_english) : input.reason || null,
      department_normalized: String(parsed.department_normalized || input.department),
      notes_english: parsed.notes_english !== undefined ? String(parsed.notes_english) : input.notes || null,
      original_language: String(parsed.original_language || input.language || null),
    };

    console.log("[AI Normalize] AI normalization completed");
    console.log("[AI Normalize] Normalized values:", JSON.stringify(normalized));

    return normalized;
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error(`[AI Normalize] Groq failed after ${elapsed}ms, falling back to raw values`);
    if (error instanceof Error) {
      console.error(`[AI Normalize] Error: ${error.message}`);
    }
    return createFallback(input);
  }
}