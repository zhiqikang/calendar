import assert from "node:assert/strict";
import test from "node:test";

import { createHolidayIndex } from "../calendar.js";

test("groups exact-date holidays and preserves duplicate-date order", () => {
  const index = createHolidayIndex([
    { date: "2026-01-01", name: " New Year’s Day " },
    { date: "2026-01-01", name: "Second observance" },
    { date: "2027-01-01", name: "Next New Year" },
  ]);

  assert.deepEqual(index.get("2026-01-01"), [
    { date: "2026-01-01", name: "New Year’s Day" },
    { date: "2026-01-01", name: "Second observance" },
  ]);
  assert.equal(index.get("2027-01-01")?.[0].name, "Next New Year");
});

test("accepts Gregorian leap days without timezone parsing", () => {
  const index = createHolidayIndex([
    { date: "2024-02-29", name: "Leap Day" },
  ]);

  assert.equal(index.get("2024-02-29")?.[0].name, "Leap Day");
});

test("rejects malformed holiday collections and entries", () => {
  assert.throws(() => createHolidayIndex(null), /must be an array/);
  assert.throws(() => createHolidayIndex([null]), /must be an object/);
  assert.throws(
    () => createHolidayIndex([{ date: "2026-01-01", name: "  " }]),
    /non-empty name/,
  );
  assert.throws(
    () => createHolidayIndex([{ date: "2026-1-1", name: "New Year" }]),
    /valid YYYY-MM-DD date/,
  );
  assert.throws(
    () => createHolidayIndex([{ date: "2025-02-29", name: "Not a leap day" }]),
    /valid YYYY-MM-DD date/,
  );
});
