import {
  MONTH_NAMES,
  createHolidayIndex,
  getCalendarTitle,
  getMonthGrid,
  getWeekdayLabels,
} from "../calendar.js";
import { DEFAULT_STYLE } from "../styles.js";

/**
 * @typedef {{ year: number, month: number }} MonthReference
 * @typedef {{ date: string, name: string }} Holiday
 * @typedef {{
 *   layout?: "monthly" | "two-month" | "four-month" | "six-month" | "yearly",
 *   style?: string,
 *   weekStart?: "sunday" | "monday",
 *   showGrid?: boolean,
 *   shadeWeekends?: boolean
 * }} CalendarViewSettings
 */

const DEFAULT_SETTINGS = Object.freeze({
  layout: "monthly",
  style: DEFAULT_STYLE,
  weekStart: "sunday",
  showGrid: true,
  shadeWeekends: true,
});

export const CALENDAR_LAYOUTS = Object.freeze({
  monthly: Object.freeze({
    label: "Monthly",
    controlLabel: "1 / page",
    monthsPerPage: 1,
    description: "Monthly creates one roomy page for each of 12 months.",
  }),
  "two-month": Object.freeze({
    label: "2 months per page",
    controlLabel: "2 / page",
    monthsPerPage: 2,
    description: "Two months per page creates a six-page calendar.",
  }),
  "four-month": Object.freeze({
    label: "4 months per page",
    controlLabel: "4 / page",
    monthsPerPage: 4,
    description: "Four months per page creates a compact three-page calendar.",
  }),
  "six-month": Object.freeze({
    label: "6 months per page",
    controlLabel: "6 / page",
    monthsPerPage: 6,
    description: "Six months per page creates a two-page calendar.",
  }),
  yearly: Object.freeze({
    label: "Year at a glance",
    controlLabel: "Whole year",
    monthsPerPage: 12,
    description: "Year at a glance fits all 12 months onto one page.",
  }),
});

export function getLayoutDefinition(layout) {
  const definition = CALENDAR_LAYOUTS[layout];
  if (!definition) throw new RangeError(`Unknown calendar layout: ${layout}`);
  return definition;
}

export function getCalendarPageCount(layout, monthCount = 12) {
  if (!Number.isInteger(monthCount) || monthCount < 1) {
    throw new RangeError("monthCount must be a positive integer");
  }
  return Math.ceil(monthCount / getLayoutDefinition(layout).monthsPerPage);
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function withDefaults(settings = {}) {
  return { ...DEFAULT_SETTINGS, ...settings };
}

function assertMonth(month) {
  if (
    !month
    || !Number.isInteger(month.year)
    || !Number.isInteger(month.month)
    || month.month < 0
    || month.month > 11
  ) {
    throw new TypeError("month must contain an integer year and a zero-based month from 0 to 11");
  }
}

function monthRangeTitle(months) {
  const first = months[0];
  const last = months[months.length - 1];
  if (months.length === 1) return `${MONTH_NAMES[first.month]} ${first.year}`;
  if (first.year === last.year) {
    return `${MONTH_NAMES[first.month]} – ${MONTH_NAMES[last.month]} ${first.year}`;
  }
  return `${MONTH_NAMES[first.month]} ${first.year} – ${MONTH_NAMES[last.month]} ${last.year}`;
}

function holidayDateKey(month, day) {
  return `${String(month.year).padStart(4, "0")}-${String(month.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function resolveHolidayIndex(holidays, holidayIndex) {
  return holidayIndex || createHolidayIndex(holidays);
}

/**
 * Builds the shared heading used by printable monthly and yearly sheets.
 */
export function CalendarHeader({ eyebrow, title, brand = "PAPERDAY" }) {
  const header = element("header", "calendar-header");
  const copy = element("div");
  if (eyebrow) {
    copy.append(element("p", "calendar-eyebrow", eyebrow));
  }
  copy.append(element("h2", "calendar-title", title));
  header.append(copy);
  header.append(element("span", "calendar-brand", brand));
  return header;
}

/**
 * Builds a seven-column weekday heading in Sunday- or Monday-first order.
 */
export function WeekdayRow({ weekStart = "sunday", compact = false } = {}) {
  const row = element("div", compact ? "mini-weekdays" : "weekdays");
  row.setAttribute("role", "row");

  getWeekdayLabels(weekStart).forEach((label) => {
    const weekday = element("span", "weekday", compact ? label[0] : label);
    weekday.setAttribute("role", "columnheader");
    weekday.setAttribute("aria-label", label);
    row.append(weekday);
  });

  return row;
}

/**
 * Builds a fixed six-week month grid. The compact variant is used inside a
 * yearly sheet while the default variant provides a roomy full-page grid.
 *
 * @param {{ month: MonthReference, weekStart?: "sunday" | "monday", showGrid?: boolean, shadeWeekends?: boolean, compact?: boolean, holidays?: Holiday[], holidayIndex?: Map<string, ReadonlyArray<Holiday>> }} options
 */
export function MonthGrid({
  month,
  weekStart = "sunday",
  showGrid = true,
  shadeWeekends = true,
  compact = false,
  holidays = [],
  holidayIndex,
}) {
  assertMonth(month);
  const holidaysByDate = resolveHolidayIndex(holidays, holidayIndex);
  const grid = element("div", compact ? "mini-days" : "days-grid");
  grid.setAttribute("role", "grid");
  grid.setAttribute("aria-label", `${MONTH_NAMES[month.month]} ${month.year}`);
  if (!showGrid) grid.classList.add("no-grid");

  getMonthGrid(month.year, month.month, weekStart).forEach((cell) => {
    const day = element("div", cell.day === null ? "day-cell empty" : "day-cell");
    day.setAttribute("role", "gridcell");
    if (shadeWeekends && cell.isWeekend) day.classList.add("weekend");

    if (cell.day === null) {
      day.setAttribute("aria-hidden", "true");
    } else {
      const dateLabel = `${MONTH_NAMES[month.month]} ${cell.day}, ${month.year}`;
      const holidaysOnDate = holidaysByDate.get(holidayDateKey(month, cell.day)) || [];
      const holidayNames = holidaysOnDate.map((holiday) => holiday.name);

      day.setAttribute(
        "aria-label",
        holidayNames.length > 0
          ? `${dateLabel}. Holidays: ${holidayNames.join("; ")}`
          : dateLabel,
      );
      day.append(element("span", "day-number", String(cell.day)));

      if (holidayNames.length > 0) {
        day.classList.add("holiday");
        day.dataset.holidayCount = String(holidayNames.length);
        day.title = holidayNames.join("; ");

        if (compact) {
          const marker = element("span", "holiday-marker");
          marker.setAttribute("aria-hidden", "true");
          day.append(marker);
        } else {
          const labels = element("span", "holiday-labels");
          holidayNames.forEach((name) => labels.append(element("span", "holiday-name", name)));
          day.append(labels);
        }
      }
    }

    grid.append(day);
  });

  return grid;
}

/**
 * Builds a complete printable monthly sheet.
 *
 * @param {{ month: MonthReference, pageNumber?: number, settings?: CalendarViewSettings, brand?: string, holidays?: Holiday[], holidayIndex?: Map<string, ReadonlyArray<Holiday>> }} options
 */
export function MonthlyCalendarPage({
  month,
  pageNumber = 1,
  settings = {},
  brand = "PAPERDAY",
  holidays = [],
  holidayIndex,
}) {
  assertMonth(month);
  const view = withDefaults(settings);
  const holidaysByDate = resolveHolidayIndex(holidays, holidayIndex);
  const title = `${MONTH_NAMES[month.month]} ${month.year}`;
  const page = element("article", "calendar-page monthly-sheet");
  page.dataset.style = view.style;
  page.setAttribute("aria-label", `${title} calendar`);
  page.append(CalendarHeader({
    title,
    brand,
  }));
  page.append(WeekdayRow({ weekStart: view.weekStart }));
  page.append(MonthGrid({ month, ...view, holidayIndex: holidaysByDate }));

  return page;
}

/**
 * Builds a compact month card for use in a yearly sheet or dashboard.
 *
 * @param {{ month: MonthReference, settings?: CalendarViewSettings, holidays?: Holiday[], holidayIndex?: Map<string, ReadonlyArray<Holiday>> }} options
 */
export function MiniMonth({ month, settings = {}, holidays = [], holidayIndex }) {
  assertMonth(month);
  const view = withDefaults(settings);
  const holidaysByDate = resolveHolidayIndex(holidays, holidayIndex);
  const card = element("section", "mini-month");
  card.setAttribute("aria-label", `${MONTH_NAMES[month.month]} ${month.year}`);
  const heading = element("div", "mini-month-heading");
  heading.append(element("h3", "", MONTH_NAMES[month.month]));
  heading.append(element("span", "", String(month.year)));
  card.append(heading);
  card.append(WeekdayRow({ weekStart: view.weekStart, compact: true }));
  card.append(MonthGrid({ month, ...view, compact: true, holidayIndex: holidaysByDate }));
  return card;
}

/**
 * Builds a printable sheet containing a subset of the calendar year.
 *
 * @param {{ months: MonthReference[], pageNumber?: number, pageCount?: number, settings?: CalendarViewSettings, brand?: string, holidays?: Holiday[], holidayIndex?: Map<string, ReadonlyArray<Holiday>> }} options
 */
export function MultiMonthCalendarPage({
  months,
  pageNumber = 1,
  pageCount = 1,
  settings = {},
  brand = "PAPERDAY",
  holidays = [],
  holidayIndex,
}) {
  if (!Array.isArray(months) || months.length === 0) {
    throw new TypeError("months must be a non-empty array");
  }
  months.forEach(assertMonth);
  const view = withDefaults(settings);
  const holidaysByDate = resolveHolidayIndex(holidays, holidayIndex);
  const title = monthRangeTitle(months);
  const page = element("article", "calendar-page multi-month-sheet");
  page.dataset.style = view.style;
  page.dataset.monthCount = String(months.length);
  page.setAttribute("aria-label", `${title} calendar`);
  page.append(CalendarHeader({
    eyebrow: `${months.length} months · Page ${pageNumber} of ${pageCount}`,
    title,
    brand,
  }));
  const grid = element("div", "multi-month-grid");
  grid.dataset.monthCount = String(months.length);
  months.forEach((month) => grid.append(MiniMonth({
    month,
    settings: view,
    holidayIndex: holidaysByDate,
  })));
  page.append(grid);
  return page;
}

/**
 * Builds one printable sheet containing all supplied months.
 *
 * @param {{ months: MonthReference[], settings?: CalendarViewSettings, brand?: string, holidays?: Holiday[], holidayIndex?: Map<string, ReadonlyArray<Holiday>> }} options
 */
export function YearlyCalendarPage({
  months,
  settings = {},
  brand = "PAPERDAY",
  holidays = [],
  holidayIndex,
}) {
  if (!Array.isArray(months) || months.length === 0) {
    throw new TypeError("months must be a non-empty array");
  }
  months.forEach(assertMonth);
  const view = withDefaults(settings);
  const holidaysByDate = resolveHolidayIndex(holidays, holidayIndex);
  const title = getCalendarTitle(months);
  const page = element("article", "calendar-page yearly-sheet");
  page.dataset.style = view.style;
  page.setAttribute("aria-label", `${title} yearly calendar`);
  page.append(CalendarHeader({ eyebrow: "A year at a glance", title, brand }));
  const grid = element("div", "year-grid");
  months.forEach((month) => grid.append(MiniMonth({
    month,
    settings: view,
    holidayIndex: holidaysByDate,
  })));
  page.append(grid);
  return page;
}

/**
 * High-level component that returns all printable sheets as a document
 * fragment. Consumers can append or replace it into any container.
 *
 * @param {{ months: MonthReference[], settings?: CalendarViewSettings, brand?: string, holidays?: Holiday[] }} options
 */
export function Calendar({ months, settings = {}, brand = "PAPERDAY", holidays = [] }) {
  if (!Array.isArray(months) || months.length === 0) {
    throw new TypeError("months must be a non-empty array");
  }

  const view = withDefaults(settings);
  const holidayIndex = createHolidayIndex(holidays);
  const fragment = document.createDocumentFragment();
  const layout = getLayoutDefinition(view.layout);

  if (view.layout === "yearly") {
    fragment.append(YearlyCalendarPage({
      months,
      settings: view,
      brand,
      holidayIndex,
    }));
    return fragment;
  }

  const pageCount = getCalendarPageCount(view.layout, months.length);
  for (let pageIndex = 0; pageIndex < pageCount; pageIndex += 1) {
    const pageMonths = months.slice(
      pageIndex * layout.monthsPerPage,
      (pageIndex + 1) * layout.monthsPerPage,
    );

    if (layout.monthsPerPage === 1) {
      fragment.append(MonthlyCalendarPage({
        month: pageMonths[0],
        pageNumber: pageIndex + 1,
        settings: view,
        brand,
        holidayIndex,
      }));
    } else {
      fragment.append(MultiMonthCalendarPage({
        months: pageMonths,
        pageNumber: pageIndex + 1,
        pageCount,
        settings: view,
        brand,
        holidayIndex,
      }));
    }
  }
  return fragment;
}
