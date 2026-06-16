import test from "node:test";
import assert from "node:assert/strict";

import { normalizeAppointmentDate, normalizeAppointmentTime } from "./appointment-normalization";

test("normalizes Telugu morning time phrase", () => {
  assert.deepEqual(normalizeAppointmentTime("ఉదయం 10 గంటలకు"), {
    success: true,
    value: "10:00 AM",
  });
});

test("normalizes Telugu afternoon time phrase", () => {
  assert.deepEqual(normalizeAppointmentTime("మధ్యాహ్నం 3 గంటలకు"), {
    success: true,
    value: "03:00 PM",
  });
});

test("normalizes Telugu evening time phrase", () => {
  assert.deepEqual(normalizeAppointmentTime("సాయంత్రం 6 గంటలకు"), {
    success: true,
    value: "06:00 PM",
  });
});

test("normalizes Telugu night time phrase", () => {
  assert.deepEqual(normalizeAppointmentTime("రాత్రి 8 గంటలకు"), {
    success: true,
    value: "08:00 PM",
  });
});

test("keeps broad English phrases invalid", () => {
  assert.deepEqual(normalizeAppointmentTime("morning"), {
    success: false,
    error: "Exact appointment_time is required instead of a broad time like morning",
  });
});

test("normalizes existing English am/pm input", () => {
  assert.deepEqual(normalizeAppointmentTime("3 pm"), {
    success: true,
    value: "03:00 PM",
  });
});

test("normalizes existing 24-hour input", () => {
  assert.deepEqual(normalizeAppointmentTime("15:00"), {
    success: true,
    value: "03:00 PM",
  });
});

test("normalizes ISO date unchanged", () => {
  assert.deepEqual(normalizeAppointmentDate("2026-06-15"), {
    success: true,
    value: "2026-06-15",
  });
});

test("normalizes English month-day-year format", () => {
  assert.deepEqual(normalizeAppointmentDate("June 15, 2026"), {
    success: true,
    value: "2026-06-15",
  });
});

test("normalizes day-month-year format", () => {
  assert.deepEqual(normalizeAppointmentDate("15 June 2026"), {
    success: true,
    value: "2026-06-15",
  });
});

test("normalizes Telugu weekday + English date", () => {
  assert.deepEqual(normalizeAppointmentDate("సోమవారం జూన్ 15, 2026"), {
    success: true,
    value: "2026-06-15",
  });
});

test("normalizes Telugu month + English date", () => {
  assert.deepEqual(normalizeAppointmentDate("జూన్ 15, 2026"), {
    success: true,
    value: "2026-06-15",
  });
});

test("normalizes English weekday + month-day-year", () => {
  assert.deepEqual(normalizeAppointmentDate("Monday June 15, 2026"), {
    success: true,
    value: "2026-06-15",
  });
});

test("falls back to original value for unparseable date", () => {
  assert.deepEqual(normalizeAppointmentDate("అసాధారణ తేదీ"), {
    success: true,
    value: "అసాధారణ తేదీ",
  });
});

test("normalizes Hindi आज to today", () => {
  const today = new Date();
  const expected = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  assert.deepEqual(normalizeAppointmentDate("आज"), {
    success: true,
    value: expected,
  });
});

test("normalizes Hindi कल to tomorrow", () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const expected = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;
  assert.deepEqual(normalizeAppointmentDate("कल"), {
    success: true,
    value: expected,
  });
});

test("normalizes Hindi परसों to day after tomorrow", () => {
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);
  const expected = `${dayAfter.getFullYear()}-${String(dayAfter.getMonth() + 1).padStart(2, "0")}-${String(dayAfter.getDate()).padStart(2, "0")}`;
  assert.deepEqual(normalizeAppointmentDate("परसों"), {
    success: true,
    value: expected,
  });
});

test("normalizes Hindi weekday सोमवार", () => {
  const result = normalizeAppointmentDate("सोमवार");
  assert.equal(result.success, true);
  assert.match(result.value!, /^\d{4}-\d{2}-\d{2}$/);
});

test("normalizes Hindi weekday मंगलवार", () => {
  const result = normalizeAppointmentDate("मंगलवार");
  assert.equal(result.success, true);
  assert.match(result.value!, /^\d{4}-\d{2}-\d{2}$/);
});

test("normalizes Hindi weekday बुधवार", () => {
  const result = normalizeAppointmentDate("बुधवार");
  assert.equal(result.success, true);
  assert.match(result.value!, /^\d{4}-\d{2}-\d{2}$/);
});

test("normalizes Hindi weekday गुरुवार", () => {
  const result = normalizeAppointmentDate("गुरुवार");
  assert.equal(result.success, true);
  assert.match(result.value!, /^\d{4}-\d{2}-\d{2}$/);
});

test("normalizes Hindi weekday शुक्रवार", () => {
  const result = normalizeAppointmentDate("शुक्रवार");
  assert.equal(result.success, true);
  assert.match(result.value!, /^\d{4}-\d{2}-\d{2}$/);
});

test("normalizes Hindi weekday शनिवार", () => {
  const result = normalizeAppointmentDate("शनिवार");
  assert.equal(result.success, true);
  assert.match(result.value!, /^\d{4}-\d{2}-\d{2}$/);
});

test("normalizes Hindi weekday रविवार", () => {
  const result = normalizeAppointmentDate("रविवार");
  assert.equal(result.success, true);
  assert.match(result.value!, /^\d{4}-\d{2}-\d{2}$/);
});

test("normalizes Hindi month + date जून 15, 2026", () => {
  assert.deepEqual(normalizeAppointmentDate("जून 15, 2026"), {
    success: true,
    value: "2026-06-15",
  });
});

test("normalizes Hindi weekday + month + date सोमवार जून 15, 2026", () => {
  assert.deepEqual(normalizeAppointmentDate("सोमवार जून 15, 2026"), {
    success: true,
    value: "2026-06-15",
  });
});
