export type MonthNumber =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12;

/** Sunday is 0, matching the conventional JavaScript weekday numbering. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type WeekStartsOn = "sunday" | "monday";

export interface MonthReference {
  year: number;
  month: MonthNumber;
}

export interface CalendarDay extends MonthReference {
  day: number;
  weekday: Weekday;
  isoDate: string;
  isWeekend: boolean;
}

export type CalendarCell = CalendarDay | null;

export interface MonthGrid extends MonthReference {
  weekStartsOn: WeekStartsOn;
  leadingBlankCount: number;
  dayCount: number;
  weeks: CalendarCell[][];
}

export interface BuildMonthGridOptions extends MonthReference {
  weekStartsOn?: WeekStartsOn;
  /** Pads the grid to six rows so printed months can keep equal heights. */
  fixedSixWeeks?: boolean;
}

const MIN_YEAR = 1;
const MAX_YEAR = 9999;

function assertInteger(value: number, name: string): void {
  if (!Number.isInteger(value)) {
    throw new RangeError(`${name} must be an integer.`);
  }
}

function assertYear(year: number): void {
  assertInteger(year, "year");

  if (year < MIN_YEAR || year > MAX_YEAR) {
    throw new RangeError(`year must be between ${MIN_YEAR} and ${MAX_YEAR}.`);
  }
}

function assertMonth(month: number): asserts month is MonthNumber {
  assertInteger(month, "month");

  if (month < 1 || month > 12) {
    throw new RangeError("month must be between 1 and 12.");
  }
}

function assertDay(year: number, month: MonthNumber, day: number): void {
  assertInteger(day, "day");
  const maximumDay = daysInMonth(year, month);

  if (day < 1 || day > maximumDay) {
    throw new RangeError(
      `day must be between 1 and ${maximumDay} for ${year}-${month}.`,
    );
  }
}

export function isLeapYear(year: number): boolean {
  assertYear(year);
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

export function daysInMonth(year: number, month: number): number {
  assertYear(year);
  assertMonth(month);

  switch (month) {
    case 2:
      return isLeapYear(year) ? 29 : 28;
    case 4:
    case 6:
    case 9:
    case 11:
      return 30;
    default:
      return 31;
  }
}

/**
 * Returns the Gregorian weekday without constructing a Date object.
 * Sunday is 0 and Saturday is 6.
 */
export function weekdayOf(
  year: number,
  month: number,
  day: number,
): Weekday {
  assertYear(year);
  assertMonth(month);
  assertDay(year, month, day);

  const monthOffsets = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];
  const adjustedYear = month < 3 ? year - 1 : year;
  const weekday =
    (adjustedYear +
      Math.floor(adjustedYear / 4) -
      Math.floor(adjustedYear / 100) +
      Math.floor(adjustedYear / 400) +
      monthOffsets[month - 1] +
      day) %
    7;

  return weekday as Weekday;
}

export function getWeekdayOrder(weekStartsOn: WeekStartsOn): Weekday[] {
  if (weekStartsOn === "sunday") {
    return [0, 1, 2, 3, 4, 5, 6];
  }

  if (weekStartsOn === "monday") {
    return [1, 2, 3, 4, 5, 6, 0];
  }

  throw new RangeError('weekStartsOn must be "sunday" or "monday".');
}

export function createMonthSequence(
  year: number,
  startMonth: number,
  count: number,
): MonthReference[] {
  assertYear(year);
  assertMonth(startMonth);
  assertInteger(count, "count");

  if (count < 1) {
    throw new RangeError("count must be at least 1.");
  }

  const endYear = year + Math.floor((startMonth - 1 + count - 1) / 12);
  if (endYear > MAX_YEAR) {
    throw new RangeError(`month sequence cannot extend beyond year ${MAX_YEAR}.`);
  }

  return Array.from({ length: count }, (_, index) => {
    const zeroBasedMonth = startMonth - 1 + index;
    return {
      year: year + Math.floor(zeroBasedMonth / 12),
      month: ((zeroBasedMonth % 12) + 1) as MonthNumber,
    };
  });
}

export function buildMonthGrid({
  year,
  month,
  weekStartsOn = "sunday",
  fixedSixWeeks = false,
}: BuildMonthGridOptions): MonthGrid {
  assertYear(year);
  assertMonth(month);

  const weekdayOrder = getWeekdayOrder(weekStartsOn);
  const firstWeekday = weekdayOf(year, month, 1);
  const leadingBlankCount = weekdayOrder.indexOf(firstWeekday);
  const dayCount = daysInMonth(year, month);
  const naturalWeekCount = Math.ceil((leadingBlankCount + dayCount) / 7);
  const weekCount = fixedSixWeeks ? 6 : naturalWeekCount;
  const cells: CalendarCell[] = Array.from(
    { length: weekCount * 7 },
    () => null,
  );

  for (let day = 1; day <= dayCount; day += 1) {
    const weekday = weekdayOf(year, month, day);
    cells[leadingBlankCount + day - 1] = {
      year,
      month,
      day,
      weekday,
      isoDate: `${year.toString().padStart(4, "0")}-${month
        .toString()
        .padStart(2, "0")}-${day.toString().padStart(2, "0")}`,
      isWeekend: weekday === 0 || weekday === 6,
    };
  }

  const weeks = Array.from({ length: weekCount }, (_, index) =>
    cells.slice(index * 7, index * 7 + 7),
  );

  return {
    year,
    month,
    weekStartsOn,
    leadingBlankCount,
    dayCount,
    weeks,
  };
}
