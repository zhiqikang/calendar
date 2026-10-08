import assert from "node:assert/strict";
import test from "node:test";

import { createHolidayIndex, parseHolidays } from "../calendar.js";

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

test("parseHolidays parses YYYY-MM-DD dates and is not limited to 2026", () => {
  const text = `
    New Year's Day: 2026-01-01
    Christmas Day: 2026-12-25
    Next New Year: 2027-01-01
    Easter Sunday: 2027-03-28
    Future Holiday: 2028-07-04
    Past Holiday: 2025-05-01
  `;

  const { holidays, errors } = parseHolidays(text, 2026);
  assert.equal(errors.length, 0);
  assert.deepEqual(holidays, [
    { date: "2026-01-01", name: "New Year's Day" },
    { date: "2026-12-25", name: "Christmas Day" },
    { date: "2027-01-01", name: "Next New Year" },
    { date: "2027-03-28", name: "Easter Sunday" },
    { date: "2028-07-04", name: "Future Holiday" },
    { date: "2025-05-01", name: "Past Holiday" },
  ]);
});

test("parseHolidays supports M.D and MM.DD dates with fallback year", () => {
  const text = `
    New Year: 1.1
    Valentine's Day: 02.14
    Christmas: 12.25
  `;

  const result2027 = parseHolidays(text, 2027);
  assert.equal(result2027.errors.length, 0);
  assert.deepEqual(result2027.holidays, [
    { date: "2027-01-01", name: "New Year" },
    { date: "2027-02-14", name: "Valentine's Day" },
    { date: "2027-12-25", name: "Christmas" },
  ]);
});

test("parseHolidays validates leap years based on the holiday date year", () => {
  const text = `
    Leap Day 2024: 2024-02-29
    Invalid Leap Day 2025: 2025-02-29
    Invalid Leap Day 2026: 2026-02-29
    Leap Day 2028: 2028-02-29
  `;

  const { holidays, errors } = parseHolidays(text);
  assert.equal(holidays.length, 2);
  assert.equal(holidays[0].date, "2024-02-29");
  assert.equal(holidays[1].date, "2028-02-29");
  assert.equal(errors.length, 2);
  assert.match(errors[0], /Invalid day in: Invalid Leap Day 2025: 2025-02-29/);
  assert.match(errors[1], /Invalid day in: Invalid Leap Day 2026: 2026-02-29/);
});

test("parseHolidays sanitizes LLM prompt output formats and skips noise", () => {
  const text = `
    Here are the public holidays for 2027:
    - **New Year's Day**: 2027-01-01
    * Martin Luther King Jr. Day: 2027-01-18
    1. Memorial Day: 2027-05-31
    2) Independence Day: 2027-07-04
    Father's Day: Special Edition: 2027-06-20
    Note: Observances may vary across different states.
  `;

  const { holidays, errors } = parseHolidays(text);

  assert.equal(errors.length, 0);
  assert.deepEqual(holidays, [
    { date: "2027-01-01", name: "New Year's Day" },
    { date: "2027-01-18", name: "Martin Luther King Jr. Day" },
    { date: "2027-05-31", name: "Memorial Day" },
    { date: "2027-07-04", name: "Independence Day" },
    { date: "2027-06-20", name: "Father's Day: Special Edition" },
  ]);
});

test("parseHolidays reports validation errors for malformed lines", () => {
  const text = `
    : 2026-01-01
    No Date:
    Bad Month: 2026-13-01
    Bad Day: 2026-04-31
    Bad Format: 2026/abc
  `;

  const { holidays, errors } = parseHolidays(text);
  assert.equal(holidays.length, 0);
  assert.equal(errors.length, 5);
  assert.match(errors[0], /Missing name before ":" in:/);
  assert.match(errors[1], /Missing date after ":" in:/);
  assert.match(errors[2], /Invalid month in:/);
  assert.match(errors[3], /Invalid day in:/);
  assert.match(errors[4], /Expected YYYY-MM-DD or M.D format in:/);
});

