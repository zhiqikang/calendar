import {
  MONTH_NAMES,
  getCalendarTitle,
  getMonthSequence,
} from "./calendar.js";
import {
  Calendar,
  getCalendarPageCount,
  getLayoutDefinition,
} from "./components/calendar-components.js";
import { createPrintController } from "./printing.js";

const STORAGE_KEY = "paperday-settings-v1";
const defaults = {
  layout: "monthly",
  year: 2026,
  startMonth: 0,
  weekStart: "sunday",
  paper: "a4",
  orientation: "portrait",
  shadeWeekends: true,
  showGrid: true,
};

const form = document.querySelector("#calendar-form");
const output = document.querySelector("#calendar-output");
const monthSelect = document.querySelector("#start-month");
const yearInput = document.querySelector("#year");
const printButton = document.querySelector("#print-button");
const printStatus = document.querySelector("#print-status");
const resetButton = document.querySelector("#reset-button");
const previewBadge = document.querySelector("#preview-badge");
const printSummary = document.querySelector("#print-summary");
const layoutHelp = document.querySelector("#layout-help");
const dynamicPageStyle = document.querySelector("#dynamic-page-style");

MONTH_NAMES.forEach((month, index) => {
  const option = document.createElement("option");
  option.value = String(index);
  option.textContent = month;
  monthSelect.append(option);
});

function loadSettings() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return {
      ...defaults,
      ...stored,
      startMonth: normalizeStartMonth(stored?.startMonth),
    };
  } catch {
    return { ...defaults };
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
  form.elements.paper.value = settings.paper;
  form.elements.orientation.value = settings.orientation;
  form.elements.shadeWeekends.checked = settings.shadeWeekends;
  form.elements.showGrid.checked = settings.showGrid;
  setRadioValue("layout", settings.layout);
  setRadioValue("weekStart", settings.weekStart);
}

function getSettings() {
  const data = new FormData(form);
  const parsedYear = Number.parseInt(data.get("year"), 10);

  return {
    layout: data.get("layout"),
    year: Number.isFinite(parsedYear)
      ? Math.min(2200, Math.max(1900, parsedYear))
      : defaults.year,
    startMonth: normalizeStartMonth(data.get("startMonth")),
    weekStart: data.get("weekStart"),
    paper: data.get("paper"),
    orientation: data.get("orientation"),
    shadeWeekends: data.has("shadeWeekends"),
    showGrid: data.has("showGrid"),
  };
}

function updatePageSize(settings) {
  document.body.dataset.paper = settings.paper;
  document.body.dataset.orientation = settings.orientation;
  const paperName = settings.paper === "a4" ? "A4" : "letter";
  dynamicPageStyle.textContent = `@page { size: ${paperName} ${settings.orientation}; margin: 0; }`;
}

function render() {
  const settings = getSettings();
  const months = getMonthSequence(settings.year, settings.startMonth);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  updatePageSize(settings);
  output.replaceChildren(Calendar({ months, settings }));

  const layout = getLayoutDefinition(settings.layout);
  const pageCount = getCalendarPageCount(settings.layout, months.length);
  previewBadge.textContent = `${pageCount} ${pageCount === 1 ? "page" : "pages"}`;
  printSummary.textContent = `${settings.paper === "a4" ? "A4" : "Letter"} · ${settings.orientation} · ${pageCount} ${pageCount === 1 ? "page" : "pages"}`;
  layoutHelp.textContent = layout.description;
}

form.addEventListener("change", render);
yearInput.addEventListener("input", render);
resetButton.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
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
