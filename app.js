import {
  MONTH_NAMES,
  getCalendarTitle,
  getMonthSequence,
  parseHolidays,
} from "./calendar.js?v=6";
import {
  Calendar,
  getCalendarPageCount,
  getLayoutDefinition,
} from "./components/calendar-components.js?v=6";
import { createPrintController } from "./printing.js?v=6";
import {
  CALENDAR_STYLES,
  DEFAULT_STYLE,
  getStyleDefinition,
  isValidStyle,
} from "./styles.js?v=6";

const STORAGE_KEY = "paperday-settings-v2";
const LEGACY_STORAGE_KEY = "paperday-settings-v1";
const today = new Date();
const defaults = {
  layout: "monthly",
  style: DEFAULT_STYLE,
  year: today.getFullYear(),
  startMonth: today.getMonth(),
  weekStart: "sunday",
  paper: "a4",
  orientation: "portrait",
  shadeWeekends: true,
  showGrid: true,
  holidaysText: "",
};

const form = document.querySelector("#calendar-form");
const output = document.querySelector("#calendar-output");
const monthSelect = document.querySelector("#start-month");
const styleSelect = document.querySelector("#style");
const styleHelp = document.querySelector("#style-help");
const yearInput = document.querySelector("#year");
const printButton = document.querySelector("#print-button");
const printStatus = document.querySelector("#print-status");
const resetButton = document.querySelector("#reset-button");
const previewBadge = document.querySelector("#preview-badge");
const printSummary = document.querySelector("#print-summary");
const layoutHelp = document.querySelector("#layout-help");
const dynamicPageStyle = document.querySelector("#dynamic-page-style");
const holidaysInput = document.querySelector("#holidays-input");
const holidaysHelp = document.querySelector("#holidays-help");

if (styleSelect) {
  styleSelect.replaceChildren(
    ...Object.values(CALENDAR_STYLES).map((style) => {
      const option = document.createElement("option");
      option.value = style.id;
      option.textContent = style.label;
      return option;
    }),
  );
}

MONTH_NAMES.forEach((month, index) => {
  const option = document.createElement("option");
  option.value = String(index);
  option.textContent = month;
  monthSelect.append(option);
});

function normalizeStyle(value) {
  return isValidStyle(value) ? value : defaults.style;
}

export { parseHolidays };

function loadSettings() {
  try {
    const current = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const stored = current ?? JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY));
    return {
      ...defaults,
      ...stored,
      style: normalizeStyle(stored?.style),
      startMonth: current
        ? normalizeStartMonth(stored?.startMonth)
        : defaults.startMonth,
      year: current ? stored?.year ?? defaults.year : defaults.year,
    };
  } catch {
    return { ...defaults };
  }
}

function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Storage may be unavailable or full; rendering must still work.
  }
}
function normalizeStartMonth(value) {
  if (value === null || value === undefined || value === "") return defaults.startMonth;

  const month = Number(value);
  return Number.isInteger(month) && month >= 0 && month < MONTH_NAMES.length
    ? month
    : defaults.startMonth;
}

function setRadioValue(name, value) {
  const radio = form.querySelector(`input[name="${name}"][value="${value}"]`);
  if (radio) radio.checked = true;
}

function applySettingsToForm(settings) {
  yearInput.value = String(settings.year);
  form.elements.startMonth.value = String(settings.startMonth);
  if (form.elements.style) form.elements.style.value = settings.style;
  form.elements.paper.value = settings.paper;
  form.elements.orientation.value = settings.orientation;
  form.elements.shadeWeekends.checked = settings.shadeWeekends;
  form.elements.showGrid.checked = settings.showGrid;
  setRadioValue("layout", settings.layout);
  setRadioValue("weekStart", settings.weekStart);
  if (holidaysInput) holidaysInput.value = settings.holidaysText ?? "";
}

function getSettings() {
  const data = new FormData(form);
  const parsedYear = Number.parseInt(data.get("year"), 10);

  return {
    layout: data.get("layout"),
    style: normalizeStyle(data.get("style")),
    year: Number.isFinite(parsedYear)
      ? Math.min(2200, Math.max(1900, parsedYear))
      : defaults.year,
    startMonth: normalizeStartMonth(data.get("startMonth")),
    weekStart: data.get("weekStart"),
    paper: data.get("paper"),
    orientation: data.get("orientation"),
    shadeWeekends: data.has("shadeWeekends"),
    showGrid: data.has("showGrid"),
    holidaysText: holidaysInput ? holidaysInput.value : "",
  };
}

function updatePageSize(settings) {
  document.body.dataset.paper = settings.paper;
  document.body.dataset.orientation = settings.orientation;
  const paperName = settings.paper === "a4" ? "A4" : "letter";
  dynamicPageStyle.textContent = `@page { size: ${paperName} ${settings.orientation}; margin: 0; }`;
}

function updateStyle(settings) {
  document.body.dataset.style = settings.style;
  const styleDefinition = getStyleDefinition(settings.style);
  if (styleHelp) {
    styleHelp.textContent = styleDefinition.description;
  }
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta && styleDefinition.themeColor) {
    themeMeta.setAttribute("content", styleDefinition.themeColor);
  }
}

function render() {
  const settings = getSettings();
  const months = getMonthSequence(settings.year, settings.startMonth);
  updatePageSize(settings);
  updateStyle(settings);

  const { holidays, errors } = parseHolidays(settings.holidaysText, settings.year);
  if (holidaysHelp) {
    holidaysHelp.textContent = errors.length > 0 ? errors.join(" · ") : "";
  }

  output.replaceChildren(Calendar({ months, settings, holidays }));

  const layout = getLayoutDefinition(settings.layout);
  const pageCount = getCalendarPageCount(settings.layout, months.length);
  previewBadge.textContent = `${pageCount} ${pageCount === 1 ? "page" : "pages"}`;
  printSummary.textContent = `${settings.paper === "a4" ? "A4" : "Letter"} · ${settings.orientation} · ${pageCount} ${pageCount === 1 ? "page" : "pages"}`;
  layoutHelp.textContent = layout.description;
  saveSettings(settings);
}

form.addEventListener("change", render);
yearInput.addEventListener("input", render);
if (holidaysInput) holidaysInput.addEventListener("input", render);
resetButton.addEventListener("click", () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // Reset the visible form even when storage is unavailable.
  }
  applySettingsToForm(defaults);
  render();
});

applySettingsToForm(loadSettings());
render();

createPrintController({
  button: printButton,
  status: printStatus,
  getLabel: () => {
    const settings = getSettings();
    const months = getMonthSequence(settings.year, settings.startMonth);
    return `${getCalendarTitle(months)} ${getLayoutDefinition(settings.layout).label} calendar`;
  },
});
