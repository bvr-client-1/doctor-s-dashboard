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
