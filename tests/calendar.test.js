import {
  createHolidayIndex,
  daysInMonth,
  getCalendarTitle,
  getMonthGrid,
  getMonthSequence,
  getWeekdayLabels,
} from "../calendar.js";
import {
  CALENDAR_LAYOUTS,
  Calendar,
  MiniMonth,
  MonthGrid,
  MultiMonthCalendarPage,
  MonthlyCalendarPage,
  WeekdayRow,
  YearlyCalendarPage,
  getCalendarPageCount,
} from "../components/calendar-components.js";

const tests = [];
const test = (name, run) => tests.push({ name, run });

test("handles leap years", () => {
  if (daysInMonth(2024, 1) !== 29 || daysInMonth(2025, 1) !== 28) throw new Error("February length is wrong");
});

test("always creates a six-week grid", () => {
  if (getMonthGrid(2026, 0).length !== 42) throw new Error("Grid does not contain 42 cells");
});

test("places a Sunday-start month in the first column", () => {
  const grid = getMonthGrid(2023, 0, "sunday");
  if (grid[0].day !== 1) throw new Error("January 1, 2023 should be the first cell");
});

test("moves Sunday to the last column for Monday-first weeks", () => {
  const grid = getMonthGrid(2023, 0, "monday");
  if (grid[6].day !== 1) throw new Error("January 1, 2023 should be the seventh cell");
});

test("rolls month sequences into the next year", () => {
  const months = getMonthSequence(2026, 11, 2);
  if (months[1].year !== 2027 || months[1].month !== 0) throw new Error("December did not roll into January");
});

test("uses the requested weekday order", () => {
  const labels = getWeekdayLabels("monday");
  if (labels[0] !== "Mon" || labels[6] !== "Sun") throw new Error("Monday-first labels are wrong");
});

test("labels calendar years and rolling ranges", () => {
  const year = getCalendarTitle(getMonthSequence(2026, 0));
  const rolling = getCalendarTitle(getMonthSequence(2026, 6));
  if (year !== "2026" || rolling !== "July 2026 — June 2027") throw new Error("Calendar title is wrong");
});

test("indexes multiple holidays on the same exact date", () => {
  const holidays = createHolidayIndex([
    { date: "2026-01-01", name: "New Year’s Day" },
    { date: "2026-01-01", name: "Second observance" },
  ]);
  if (holidays.get("2026-01-01")?.length !== 2) throw new Error("Same-date holidays were not preserved");
});

test("builds reusable weekday rows", () => {
  const row = WeekdayRow({ weekStart: "monday" });
  const labels = [...row.children].map((item) => item.textContent);
  if (labels.join(",") !== "Mon,Tue,Wed,Thu,Fri,Sat,Sun") throw new Error("Weekday component order is wrong");
});

test("builds configurable month grids", () => {
  const grid = MonthGrid({
    month: { year: 2026, month: 0 },
    weekStart: "monday",
    showGrid: false,
    shadeWeekends: true,
  });
  if (grid.children.length !== 42) throw new Error("MonthGrid does not contain 42 cells");
  if (!grid.classList.contains("no-grid")) throw new Error("MonthGrid did not apply its grid setting");
  if (grid.querySelectorAll(".weekend").length !== 12) throw new Error("MonthGrid weekend shading is wrong");
});

test("builds monthly pages with branding", () => {
  const page = MonthlyCalendarPage({
    month: { year: 2026, month: 1 },
    pageNumber: 2,
    brand: "TEST BRAND",
  });
  if (page.getAttribute("aria-label") !== "February 2026 calendar") throw new Error("Monthly page label is wrong");
  if (page.querySelector(".calendar-brand")?.textContent !== "TEST BRAND") throw new Error("Custom brand was not applied");
  if (page.querySelector(".calendar-eyebrow")) throw new Error("Monthly page should not render an eyebrow index");
});

test("renders holiday names and accessible labels on monthly pages", () => {
  const page = MonthlyCalendarPage({
    month: { year: 2026, month: 0 },
    holidays: [
      { date: "2026-01-01", name: "New Year’s Day" },
      { date: "2026-01-01", name: "Second observance" },
    ],
  });
  const holiday = page.querySelector('.day-cell[aria-label*="New Year’s Day"]');
  if (!holiday || holiday.dataset.holidayCount !== "2") throw new Error("Holiday metadata is missing");
  if (holiday.querySelectorAll(".holiday-name").length !== 2) throw new Error("Holiday names are missing");
});

test("builds compact mini-months", () => {
  const mini = MiniMonth({ month: { year: 2026, month: 0 } });
  if (mini.querySelectorAll(".mini-days .day-cell").length !== 42) throw new Error("MiniMonth grid is incomplete");
});

test("uses accessible markers for holidays in compact calendars", () => {
  const mini = MiniMonth({
    month: { year: 2026, month: 11 },
    holidays: [{ date: "2026-12-25", name: "Christmas Day" }],
  });
  const holiday = mini.querySelector('.day-cell[aria-label*="Christmas Day"]');
  if (!holiday?.querySelector(".holiday-marker")) throw new Error("Compact holiday marker is missing");
  if (holiday.querySelector(".holiday-name")) throw new Error("Compact calendar should not render a full holiday label");
});

test("builds yearly pages from supplied months", () => {
  const page = YearlyCalendarPage({ months: getMonthSequence(2026, 6) });
  if (page.querySelectorAll(".mini-month").length !== 12) throw new Error("Yearly page is missing months");
  if (page.querySelector(".calendar-title")?.textContent !== "July 2026 — June 2027") throw new Error("Yearly page title is wrong");
});

test("defines incremental layout page counts", () => {
  const expected = {
    monthly: 12,
    "two-month": 6,
    "four-month": 3,
    "six-month": 2,
    yearly: 1,
  };

  for (const [layout, pageCount] of Object.entries(expected)) {
    if (!CALENDAR_LAYOUTS[layout]) throw new Error(`Missing ${layout} layout metadata`);
    if (getCalendarPageCount(layout) !== pageCount) throw new Error(`${layout} page count is wrong`);
  }
});

test("builds multi-month pages across year boundaries", () => {
  const page = MultiMonthCalendarPage({
    months: getMonthSequence(2026, 11, 2),
    pageNumber: 1,
    pageCount: 6,
  });
  if (page.dataset.monthCount !== "2") throw new Error("Multi-month density is missing");
  if (page.querySelectorAll(".mini-month").length !== 2) throw new Error("Multi-month page is missing a month");
  if (page.querySelector(".calendar-title")?.textContent !== "December 2026 – January 2027") {
    throw new Error("Cross-year multi-month title is wrong");
  }
});

test("composes every calendar layout variant", () => {
  const months = getMonthSequence(2026, 0);
  const expected = {
    monthly: { pages: 12, monthsOnFirstPage: 0 },
    "two-month": { pages: 6, monthsOnFirstPage: 2 },
    "four-month": { pages: 3, monthsOnFirstPage: 4 },
    "six-month": { pages: 2, monthsOnFirstPage: 6 },
    yearly: { pages: 1, monthsOnFirstPage: 12 },
  };

  for (const [layout, result] of Object.entries(expected)) {
    const calendar = Calendar({ months, settings: { layout } });
    if (calendar.children.length !== result.pages) throw new Error(`${layout} Calendar page count is wrong`);
    if (result.monthsOnFirstPage > 0) {
      const firstPageMonths = calendar.children[0].querySelectorAll(".mini-month").length;
      if (firstPageMonths !== result.monthsOnFirstPage) throw new Error(`${layout} density is wrong`);
    }
  }
});

test("threads holidays through every layout and across calendar years", () => {
  const months = getMonthSequence(2026, 6);
  const holidays = [
    { date: "2026-12-25", name: "Christmas Day" },
    { date: "2027-01-01", name: "New Year’s Day" },
  ];

  for (const layout of Object.keys(CALENDAR_LAYOUTS)) {
    const calendar = Calendar({ months, settings: { layout }, holidays });
    if (calendar.querySelectorAll(".day-cell.holiday").length !== 2) {
      throw new Error(`${layout} did not render both cross-year holidays`);
    }
  }
});

test("recovers from an invalid saved starting month and keeps the dropdown usable", async () => {
  const storageKey = "paperday-settings-v1";
  const frame = document.createElement("iframe");
  frame.title = "Paperday application under test";
  frame.hidden = true;
  document.body.append(frame);
  localStorage.setItem(storageKey, JSON.stringify({ year: 2026, startMonth: null }));

  try {
    const loaded = new Promise((resolve) => frame.addEventListener("load", resolve, { once: true }));
    frame.src = `../index.html?calendar-test=${Date.now()}`;
    await loaded;

    const appDocument = frame.contentDocument;
    const monthSelect = appDocument.querySelector("#start-month");
    if (monthSelect.value !== "0" || monthSelect.selectedOptions[0]?.textContent !== "January") {
      throw new Error("Invalid saved month did not fall back to January");
    }
    if (appDocument.querySelectorAll(".calendar-page").length !== 12) {
      throw new Error("Calendar preview was not rendered after recovering the saved month");
    }

    monthSelect.value = "2";
    monthSelect.dispatchEvent(new Event("change", { bubbles: true }));
    if (appDocument.querySelector(".calendar-title")?.textContent !== "March 2026") {
      throw new Error("Starting month change did not update the preview");
    }
  } finally {
    localStorage.removeItem(storageKey);
    frame.remove();
  }
});

test("loads the current application bundle after a deployment", async () => {
  const response = await fetch(`../index.html?bundle-test=${Date.now()}`);
  const html = await response.text();
  const scriptMatch = html.match(/<script type="module" src="([^"]*app\.js\?v=(\d+))"/);
  if (!scriptMatch || scriptMatch[2] !== "5") {
    throw new Error("Application bundle cache key was not updated");
  }

  const scriptResponse = await fetch(new URL(scriptMatch[1], response.url));
  const script = await scriptResponse.text();
  if (!script.includes("normalizeStartMonth")) {
    throw new Error("Current application bundle is missing the starting-month fix");
  }
});

test("defaults a new calendar to the 2026 starting year", async () => {
  const sourceResponse = await fetch(`../app.js?default-year-test=${Date.now()}`);
  const source = await sourceResponse.text();
  if (!/const defaults = \{[\s\S]*?year: 2026,/.test(source)) {
    throw new Error("Default starting year is not fixed to 2026");
  }

  const storageKey = "paperday-settings-v1";
  const frame = document.createElement("iframe");
  frame.title = "Paperday application under test";
  frame.hidden = true;
  document.body.append(frame);
  localStorage.removeItem(storageKey);

  try {
    const loaded = new Promise((resolve) => frame.addEventListener("load", resolve, { once: true }));
    frame.src = `../index.html?default-year-test=${Date.now()}`;
    await loaded;

    const appDocument = frame.contentDocument;
    if (appDocument.querySelector("#year")?.value !== "2026") {
      throw new Error("New calendar did not default to 2026");
    }
    if (appDocument.querySelector(".calendar-title")?.textContent !== "January 2026") {
      throw new Error("Preview did not use the 2026 default year");
    }
  } finally {
    localStorage.removeItem(storageKey);
    frame.remove();
  }
});

test("applies style dataset attribute to calendar pages", () => {
  const monthly = MonthlyCalendarPage({
    month: { year: 2026, month: 0 },
    settings: { style: "high-contrast" },
  });
  if (monthly.dataset.style !== "high-contrast") {
    throw new Error("Monthly page did not apply style dataset");
  }

  const multi = MultiMonthCalendarPage({
    months: getMonthSequence(2026, 0, 2),
    settings: { style: "high-contrast" },
  });
  if (multi.dataset.style !== "high-contrast") {
    throw new Error("Multi-month page did not apply style dataset");
  }

  const yearly = YearlyCalendarPage({
    months: getMonthSequence(2026, 0),
    settings: { style: "warm-sunshine" },
  });
  if (yearly.dataset.style !== "warm-sunshine") {
    throw new Error("Yearly page did not apply default style dataset");
  }
});

test("renders 02 · Style step above Paper settings and allows switching styles", async () => {
  const storageKey = "paperday-settings-v1";
  const frame = document.createElement("iframe");
  frame.title = "Paperday application style test";
  frame.hidden = true;
  document.body.append(frame);
  localStorage.removeItem(storageKey);

  try {
    const loaded = new Promise((resolve) => frame.addEventListener("load", resolve, { once: true }));
    frame.src = `../index.html?style-test=${Date.now()}`;
    await loaded;

    const appDocument = frame.contentDocument;
    const stepLabels = [...appDocument.querySelectorAll(".step-label")].map((el) => el.textContent.trim());
    if (!stepLabels.includes("02 · Style")) {
      throw new Error("Missing '02 · Style' step label");
    }
    if (!stepLabels.includes("03 · Paper")) {
      throw new Error("Missing '03 · Paper' step label");
    }
    if (!stepLabels.includes("04 · Details")) {
      throw new Error("Missing '04 · Details' step label");
    }

    const styleSelect = appDocument.querySelector("#style");
    if (!styleSelect) throw new Error("Style select element is missing");
    if (styleSelect.value !== "warm-sunshine") {
      throw new Error("Style did not default to warm-sunshine");
    }
    if (appDocument.body.dataset.style !== "warm-sunshine") {
      throw new Error("Body dataset style was not set to warm-sunshine");
    }

    const firstPage = appDocument.querySelector(".calendar-page");
    if (firstPage?.dataset.style !== "warm-sunshine") {
      throw new Error("Calendar page dataset style was not set to warm-sunshine");
    }

    styleSelect.value = "high-contrast";
    styleSelect.dispatchEvent(new Event("change", { bubbles: true }));

    if (appDocument.body.dataset.style !== "high-contrast") {
      throw new Error("Changing style did not update body dataset");
    }
    const updatedPage = appDocument.querySelector(".calendar-page");
    if (updatedPage?.dataset.style !== "high-contrast") {
      throw new Error("Changing style did not update page dataset");
    }

    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved?.style !== "high-contrast") {
      throw new Error("Selected style was not saved to localStorage");
    }
  } finally {
    localStorage.removeItem(storageKey);
    frame.remove();
  }
});

test("recovers from invalid saved style in localStorage", async () => {
  const storageKey = "paperday-settings-v1";
  const frame = document.createElement("iframe");
  frame.title = "Paperday application invalid style recovery test";
  frame.hidden = true;
  document.body.append(frame);
  localStorage.setItem(storageKey, JSON.stringify({ style: "invalid-bogus-style" }));

  try {
    const loaded = new Promise((resolve) => frame.addEventListener("load", resolve, { once: true }));
    frame.src = `../index.html?invalid-style-test=${Date.now()}`;
    await loaded;

    const appDocument = frame.contentDocument;
    const styleSelect = appDocument.querySelector("#style");
    if (styleSelect.value !== "warm-sunshine") {
      throw new Error("Invalid style did not fall back to warm-sunshine");
    }
    if (appDocument.body.dataset.style !== "warm-sunshine") {
      throw new Error("Body did not fall back to warm-sunshine");
    }
  } finally {
    localStorage.removeItem(storageKey);
    frame.remove();
  }
});

const results = document.querySelector("#results");
let passed = 0;

for (const { name, run } of tests) {
  const item = document.createElement("li");
  try {
    await run();
    item.textContent = `PASS — ${name}`;
    item.className = "pass";
    passed += 1;
  } catch (error) {
    item.textContent = `FAIL — ${name}: ${error.message}`;
    item.className = "fail";
  }
  results.append(item);
}

const summary = document.querySelector("#summary");
summary.textContent = `${passed}/${tests.length} tests passed`;
summary.dataset.passed = String(passed === tests.length);
