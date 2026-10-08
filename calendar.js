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

const FULL_DATE_PATTERN = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/;
const MONTH_DAY_PATTERN = /^(\d{1,2})[-/.](\d{1,2})$/;

/**
 * Parses holiday text input.
 * Accepted formats per line:
 * - "Holiday Name: YYYY-MM-DD" (or YYYY/MM/DD, YYYY.MM.DD, YYYY-M-D)
 * - "Holiday Name: M.D" or "Holiday Name: MM.DD" (or M/D, M-D, using fallbackYear)
 * Blank lines and lines without a colon are silently skipped.
 * Returns { holidays: [{date, name}], errors: string[] }.
 *
 * @param {string} text
 * @param {number} [fallbackYear=2026]
 * @returns {{ holidays: Array<{ date: string, name: string }>, errors: string[] }}
 */
export function parseHolidays(text, fallbackYear = 2026) {
  const holidays = [];
  const errors = [];

  if (!text || typeof text !== "string") {
    return { holidays, errors };
  }

  const defaultYear = Number.isInteger(Number(fallbackYear))
    ? Number(fallbackYear)
    : 2026;

  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) continue;

    const colonIdx = line.lastIndexOf(":");
    if (colonIdx === -1) continue; // silently skip annotation-only lines

    const lowerLine = line.toLowerCase();
    if (
      lowerLine.startsWith("note:") ||
      lowerLine.startsWith("notes:") ||
      lowerLine.startsWith("disclaimer:") ||
      lowerLine.startsWith("source:")
    ) {
      continue; // silently skip annotation lines
    }

    let name = line.slice(0, colonIdx).trim();
    name = name.replace(/^[-*•]\s+/, "").replace(/^\d+[.)]\s+/, "").trim();
    name = name.replace(/^[*_`]+|[*_`]+$/g, "").trim();

    let datePart = line.slice(colonIdx + 1).trim();
    datePart = datePart.replace(/^[*_`]+|[*_`]+$/g, "").trim();

    if (!name) {
      errors.push(`Missing name before ":" in: ${line}`);
      continue;
    }

    if (!datePart) {
      if (
        lowerLine.includes("holiday") ||
        lowerLine.includes("list") ||
        lowerLine.includes("public") ||
        lowerLine.startsWith("here ")
      ) {
        continue; // silently skip intro header ending in colon
      }
      errors.push(`Missing date after ":" in: ${line}`);
      continue;
    }

    let yearNum;
    let monthNum;
    let dayNum;

    const fullMatch = FULL_DATE_PATTERN.exec(datePart);
    if (fullMatch) {
      yearNum = Number(fullMatch[1]);
      monthNum = Number(fullMatch[2]);
      dayNum = Number(fullMatch[3]);
    } else {
      const mdMatch = MONTH_DAY_PATTERN.exec(datePart);
      if (mdMatch) {
        yearNum = defaultYear;
        monthNum = Number(mdMatch[1]);
        dayNum = Number(mdMatch[2]);
      } else {
        errors.push(`Expected YYYY-MM-DD or M.D format in: ${line}`);
        continue;
      }
    }

    if (yearNum < 1 || yearNum > 9999) {
      errors.push(`Invalid year in: ${line}`);
      continue;
    }

    if (monthNum < 1 || monthNum > 12) {
      errors.push(`Invalid month in: ${line}`);
      continue;
    }

    const maxDays = daysInGregorianMonth(yearNum, monthNum);
    if (dayNum < 1 || dayNum > maxDays) {
      errors.push(`Invalid day in: ${line}`);
      continue;
    }

    const yyyy = String(yearNum).padStart(4, "0");
    const mm = String(monthNum).padStart(2, "0");
    const dd = String(dayNum).padStart(2, "0");
    holidays.push({ date: `${yyyy}-${mm}-${dd}`, name });
  }

  return { holidays, errors };
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
