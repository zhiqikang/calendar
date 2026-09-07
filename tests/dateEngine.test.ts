import assert from "node:assert/strict";
import test from "node:test";

import {
  buildMonthGrid,
  createMonthSequence,
  daysInMonth,
  getWeekdayOrder,
  isLeapYear,
  weekdayOf,
} from "../src/calendar/dateEngine.ts";

test("applies Gregorian leap-year rules", () => {
  assert.equal(isLeapYear(2024), true);
  assert.equal(isLeapYear(1900), false);
  assert.equal(isLeapYear(2000), true);
  assert.equal(daysInMonth(2024, 2), 29);
  assert.equal(daysInMonth(2025, 2), 28);
});

test("calculates weekdays without timezone-dependent Date objects", () => {
  assert.equal(weekdayOf(2026, 1, 1), 4);
  assert.equal(weekdayOf(2000, 1, 1), 6);
  assert.equal(weekdayOf(2024, 2, 29), 4);
});

test("orders weekday columns from Sunday or Monday", () => {
  assert.deepEqual(getWeekdayOrder("sunday"), [0, 1, 2, 3, 4, 5, 6]);
  assert.deepEqual(getWeekdayOrder("monday"), [1, 2, 3, 4, 5, 6, 0]);
});

test("builds a month grid for either weekday convention", () => {
  const sundayGrid = buildMonthGrid({ year: 2026, month: 1 });
  const mondayGrid = buildMonthGrid({
    year: 2026,
    month: 1,
    weekStartsOn: "monday",
  });

  assert.equal(sundayGrid.leadingBlankCount, 4);
  assert.equal(mondayGrid.leadingBlankCount, 3);
  assert.equal(sundayGrid.weeks[0][4]?.day, 1);
  assert.equal(mondayGrid.weeks[0][3]?.day, 1);
  assert.equal(sundayGrid.weeks.flat().filter(Boolean).length, 31);
});

test("marks Saturdays and Sundays as weekends", () => {
  const grid = buildMonthGrid({
    year: 2026,
    month: 1,
    weekStartsOn: "monday",
  });
  const days = grid.weeks
    .flat()
    .filter((day): day is NonNullable<typeof day> => day !== null);

  assert.equal(days.find((day) => day.day === 3)?.isWeekend, true);
  assert.equal(days.find((day) => day.day === 4)?.isWeekend, true);
  assert.equal(days.find((day) => day.day === 5)?.isWeekend, false);
});

test("supports natural and fixed six-week print grids", () => {
  const compactFebruary = buildMonthGrid({ year: 2026, month: 2 });
  const fixedFebruary = buildMonthGrid({
    year: 2026,
    month: 2,
    fixedSixWeeks: true,
  });
  const sixRowMonth = buildMonthGrid({ year: 2026, month: 8 });

  assert.equal(compactFebruary.weeks.length, 4);
  assert.equal(fixedFebruary.weeks.length, 6);
  assert.equal(sixRowMonth.weeks.length, 6);
});

test("creates month sequences across year boundaries", () => {
  assert.deepEqual(createMonthSequence(2026, 11, 4), [
    { year: 2026, month: 11 },
    { year: 2026, month: 12 },
    { year: 2027, month: 1 },
    { year: 2027, month: 2 },
  ]);
});

test("rejects invalid calendar inputs", () => {
  assert.throws(() => daysInMonth(2026, 13), RangeError);
  assert.throws(() => weekdayOf(2026, 2, 29), RangeError);
  assert.throws(() => createMonthSequence(2026, 1, 0), RangeError);
  assert.throws(
    () => createMonthSequence(9999, 12, 2),
    /cannot extend beyond year 9999/,
  );
});
