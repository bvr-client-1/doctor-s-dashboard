type NormalizationResult<T> =
  | { success: true; value: T }
  | { success: false; error: string };

const weekdayMap: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

const teluguDayMap: Record<string, string> = {
  "ఈరోజు": "today",
  "రేపు": "tomorrow",
  "ఎల్లుండి": "day after tomorrow",
};

const hindiDayMap: Record<string, string> = {
  "आज": "today",
  "कल": "tomorrow",
  "परसों": "day after tomorrow",
};

const teluguWeekdayMap: Record<string, string> = {
  "ఆదివారం": "sunday",
  "సోమవారం": "monday",
  "మంగళవారం": "tuesday",
  "బుధవారం": "wednesday",
  "గురువారం": "thursday",
  "శుక్రవారం": "friday",
  "శనివారం": "saturday",
};

const hindiWeekdayMap: Record<string, string> = {
  "रविवार": "sunday",
  "सोमवार": "monday",
  "मंगलवार": "tuesday",
  "बुधवार": "wednesday",
  "गुरुवार": "thursday",
  "शुक्रवार": "friday",
  "शनिवार": "saturday",
};

const teluguMonthMap: Record<string, string> = {
  "జనవరి": "January",
  "ఫిబ్రవరి": "February",
  "మార్చి": "March",
  "ఏప్రిల్": "April",
  "మే": "May",
  "జూన్": "June",
  "జూలై": "July",
  "ఆగస్టు": "August",
  "సెప్టెంబర్": "September",
  "అక్టోబర్": "October",
  "నవంబర్": "November",
  "డిసెంబర్": "December",
};

const hindiMonthMap: Record<string, string> = {
  "जनवरी": "January",
  "फरवरी": "February",
  "मार्च": "March",
  "अप्रैल": "April",
  "मई": "May",
  "जून": "June",
  "जुलाई": "July",
  "अगस्त": "August",
  "सितंबर": "September",
  "अक्टूबर": "October",
  "नवंबर": "November",
  "दिसंबर": "December",
};

const ambiguousTimeValues = new Set([
  "morning",
  "afternoon",
  "evening",
  "night",
  "ఉదయం",
  "మధ్యాహ్నం",
  "సాయంత్రం",
  "రాత్రి",
]);

const teluguPeriodMeridiemMap: Record<string, "AM" | "PM"> = {
  "ఉదయం": "AM",
  "మధ్యాహ్నం": "PM",
  "సాయంత్రం": "PM",
  "రాత్రి": "PM",
};

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function nextWeekday(baseDate: Date, targetWeekday: number, forceNextWeek: boolean): Date {
  const currentWeekday = baseDate.getDay();
  let diff = (targetWeekday - currentWeekday + 7) % 7;
  if (diff === 0 && forceNextWeek) {
    diff = 7;
  }
  return addDays(baseDate, diff);
}

export function normalizeAppointmentDate(input: string): NormalizationResult<string | null> {
  const raw = input.trim();
  if (!raw) {
    return { success: true, value: null };
  }

  const lower = raw.toLowerCase();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const parsed = new Date(`${raw}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) {
      return { success: false, error: "Invalid appointment_date" };
    }
    return { success: true, value: raw };
  }

  if (raw in teluguDayMap) {
    if (raw === "ఈరోజు") {
      return { success: true, value: formatDate(today) };
    }
    if (raw === "రేపు") {
      return { success: true, value: formatDate(addDays(today, 1)) };
    }
    if (raw === "ఎల్లుండి") {
      return { success: true, value: formatDate(addDays(today, 2)) };
    }
  }

  if (raw in hindiDayMap) {
    if (raw === "आज") {
      return { success: true, value: formatDate(today) };
    }
    if (raw === "कल") {
      return { success: true, value: formatDate(addDays(today, 1)) };
    }
    if (raw === "परसों") {
      return { success: true, value: formatDate(addDays(today, 2)) };
    }
  }

  if (lower === "today") {
    return { success: true, value: formatDate(today) };
  }
  if (lower === "tomorrow") {
    return { success: true, value: formatDate(addDays(today, 1)) };
  }

  if (lower in weekdayMap) {
    return { success: true, value: formatDate(nextWeekday(today, weekdayMap[lower], false)) };
  }

  const hindiWeekday = hindiWeekdayMap[raw];
  if (hindiWeekday && hindiWeekday in weekdayMap) {
    return { success: true, value: formatDate(nextWeekday(today, weekdayMap[hindiWeekday], false)) };
  }

  const nextWeekdayMatch = lower.match(/^next\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)$/);
  if (nextWeekdayMatch) {
    return {
      success: true,
      value: formatDate(nextWeekday(today, weekdayMap[nextWeekdayMatch[1]], true)),
    };
  }

  let cleaned = raw;
  for (const [teluguWeekday] of Object.entries(teluguWeekdayMap)) {
    if (cleaned.includes(teluguWeekday)) {
      cleaned = cleaned.replace(teluguWeekday, "").trim();
      break;
    }
  }

  for (const [hindiWeekday] of Object.entries(hindiWeekdayMap)) {
    if (cleaned.includes(hindiWeekday)) {
      cleaned = cleaned.replace(hindiWeekday, "").trim();
      break;
    }
  }

  for (const [teluguMonth, englishMonth] of Object.entries(teluguMonthMap)) {
    if (cleaned.includes(teluguMonth)) {
      cleaned = cleaned.replace(teluguMonth, englishMonth).trim();
      break;
    }
  }

  for (const [hindiMonth, englishMonth] of Object.entries(hindiMonthMap)) {
    if (cleaned.includes(hindiMonth)) {
      cleaned = cleaned.replace(hindiMonth, englishMonth).trim();
      break;
    }
  }

  cleaned = cleaned.replace(/,\s*$/, "").replace(/\s+/g, " ").trim();

  const parsed = new Date(cleaned);
  if (!Number.isNaN(parsed.getTime())) {
    return { success: true, value: formatDate(parsed) };
  }

  console.warn(`[Date Normalize] Could not parse date: "${raw}" (cleaned: "${cleaned}"), falling back to original value`);
  return { success: true, value: raw };
}

function inferMeridiem(hour: number): "AM" | "PM" {
  if (hour >= 8 && hour <= 11) {
    return "AM";
  }
  return "PM";
}

export function normalizeAppointmentTime(input: string): NormalizationResult<string | null> {
  const raw = input.trim();
  if (!raw) {
    return { success: true, value: null };
  }

  const lower = raw.toLowerCase();
  const teluguTimeMatch = raw.match(/^(ఉదయం|మధ్యాహ్నం|సాయంత్రం|రాత్రి)\s*(\d{1,2})(?::(\d{2}))?\s*గంటలకు$/);
  if (teluguTimeMatch) {
    const hour = Number(teluguTimeMatch[2]);
    const minute = Number(teluguTimeMatch[3] ?? "0");
    if (hour < 1 || hour > 12 || minute < 0 || minute > 59) {
      return { success: false, error: "Invalid appointment_time" };
    }
    return {
      success: true,
      value: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${teluguPeriodMeridiemMap[teluguTimeMatch[1]]}`,
    };
  }

  if (ambiguousTimeValues.has(lower) || ambiguousTimeValues.has(raw)) {
    return { success: false, error: "Exact appointment_time is required instead of a broad time like morning" };
  }

  const meridiemMatch = lower.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i);
  if (meridiemMatch) {
    const hour = Number(meridiemMatch[1]);
    const minute = Number(meridiemMatch[2] ?? "0");
    if (hour < 1 || hour > 12 || minute < 0 || minute > 59) {
      return { success: false, error: "Invalid appointment_time" };
    }
    return {
      success: true,
      value: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${meridiemMatch[3].toUpperCase()}`,
    };
  }

  const twentyFourHourMatch = lower.match(/^(\d{1,2}):(\d{2})$/);
  if (twentyFourHourMatch) {
    const hour = Number(twentyFourHourMatch[1]);
    const minute = Number(twentyFourHourMatch[2]);
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
      return { success: false, error: "Invalid appointment_time" };
    }

    let meridiem: "AM" | "PM";
    let twelveHour: number;

    if (hour === 0) {
      twelveHour = 12;
      meridiem = "AM";
    } else if (hour < 12) {
      twelveHour = hour;
      meridiem = inferMeridiem(hour);
    } else if (hour === 12) {
      twelveHour = 12;
      meridiem = "PM";
    } else {
      twelveHour = hour - 12;
      meridiem = "PM";
    }

    return {
      success: true,
      value: `${String(twelveHour).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${meridiem}`,
    };
  }

  const hourOnlyMatch = lower.match(/^(\d{1,2})$/);
  if (hourOnlyMatch) {
    const hour = Number(hourOnlyMatch[1]);
    if (hour < 1 || hour > 12) {
      return { success: false, error: "Invalid appointment_time" };
    }
    return {
      success: true,
      value: `${String(hour).padStart(2, "0")}:00 ${inferMeridiem(hour)}`,
    };
  }

  return { success: false, error: "Unsupported appointment_time value" };
}

export function isTeluguLanguage(input: string | null | undefined): boolean {
  if (!input) {
    return false;
  }

  const lower = input.trim().toLowerCase();
  return lower === "telugu" || input.includes("తెలుగు");
}
