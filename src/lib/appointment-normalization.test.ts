import test from "node:test";
import assert from "node:assert/strict";

import { normalizeAppointmentTime } from "./appointment-normalization";

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
