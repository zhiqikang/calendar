export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const SUNDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export function getWeekdayLabels(weekStart) {
  return weekStart === "monday" ? MONDAY_LABELS : SUNDAY_LABELS;
}

export function getMonthSequence(year, startMonth, count = 12) {
  return Array.from({ length: count }, (_, offset) => {
    const date = new Date(year, startMonth + offset, 1);
    return { year: date.getFullYear(), month: date.getMonth() };
  });
}

export function getMonthGrid(year, month, weekStart = "sunday") {
  const firstWeekday = new Date(year, month, 1).getDay();
  const startOffset = weekStart === "monday"
    ? (firstWeekday + 6) % 7
    : firstWeekday;
  const dayCount = daysInMonth(year, month);

  return Array.from({ length: 42 }, (_, index) => {
    const day = index - startOffset + 1;
    const column = index % 7;
    const isWeekendColumn = weekStart === "monday"
      ? column === 5 || column === 6
      : column === 0 || column === 6;

    if (day < 1 || day > dayCount) {
      return { day: null, isWeekend: isWeekendColumn };
    }

    const weekday = new Date(year, month, day).getDay();
    return { day, isWeekend: weekday === 0 || weekday === 6 };
  });
}

function daysInGregorianMonth(year, month) {
  if (month === 2) {
    const isLeapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    return isLeapYear ? 29 : 28;
  }
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

/**
 * Validates and groups exact-date holidays for fast calendar-cell lookups.
 * Multiple entries may share a date and retain their input order.
 *
 * @param {{ date: string, name: string }[]} holidays
 * @returns {Map<string, ReadonlyArray<{ date: string, name: string }>>}
 */
export function createHolidayIndex(holidays = []) {
  if (!Array.isArray(holidays)) {
    throw new TypeError("holidays must be an array");
  }

  const holidayIndex = new Map();

  holidays.forEach((holiday, index) => {
    if (!holiday || typeof holiday !== "object" || Array.isArray(holiday)) {
      throw new TypeError(`holiday at index ${index} must be an object`);
    }
    if (typeof holiday.date !== "string") {
      throw new TypeError(`holiday at index ${index} must have a date string`);
    }
    if (typeof holiday.name !== "string" || holiday.name.trim() === "") {
      throw new TypeError(`holiday at index ${index} must have a non-empty name`);
    }

    const match = ISO_DATE_PATTERN.exec(holiday.date);
    if (!match) {
      throw new RangeError(`holiday at index ${index} must use a valid YYYY-MM-DD date`);
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const isValidDate = year >= 1
      && month >= 1
      && month <= 12
      && day >= 1
      && day <= daysInGregorianMonth(year, month);

    if (!isValidDate) {
      throw new RangeError(`holiday at index ${index} must use a valid YYYY-MM-DD date`);
    }

    const normalizedHoliday = Object.freeze({
      date: holiday.date,
      name: holiday.name.trim(),
    });
    const holidaysOnDate = holidayIndex.get(holiday.date) || [];
    holidaysOnDate.push(normalizedHoliday);
    holidayIndex.set(holiday.date, holidaysOnDate);
  });

  holidayIndex.forEach((holidaysOnDate, date) => {
    holidayIndex.set(date, Object.freeze([...holidaysOnDate]));
  });

  return holidayIndex;
}

export function getCalendarTitle(months) {
  const first = months[0];
  const last = months[months.length - 1];

  if (first.year === last.year && first.month === 0 && last.month === 11) {
    return String(first.year);
  }

  return `${MONTH_NAMES[first.month]} ${first.year} — ${MONTH_NAMES[last.month]} ${last.year}`;
}
