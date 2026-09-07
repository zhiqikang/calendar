import { getMonthSequence } from "../calendar.js";
import {
  CALENDAR_LAYOUTS,
  Calendar,
  getCalendarPageCount,
} from "../components/calendar-components.js";

const params = new URLSearchParams(window.location.search);
const requestedLayout = params.get("layout") ?? "monthly";
const layout = CALENDAR_LAYOUTS[requestedLayout] ? requestedLayout : "monthly";
const paper = params.get("paper") === "letter" ? "letter" : "a4";
const orientation = params.get("orientation") === "landscape" ? "landscape" : "portrait";
const weekStart = params.get("weekStart") === "monday" ? "monday" : "sunday";
const parsedYear = Number.parseInt(params.get("year") ?? "2026", 10);
const parsedMonth = Number.parseInt(params.get("startMonth") ?? "0", 10);
const year = Number.isInteger(parsedYear) ? Math.min(2200, Math.max(1900, parsedYear)) : 2026;
const startMonth = Number.isInteger(parsedMonth) ? Math.min(11, Math.max(0, parsedMonth)) : 0;
const months = getMonthSequence(year, startMonth);
const holidays = params.get("holidays") === "true"
  ? [
      { date: `${year}-01-01`, name: "New Year’s Day" },
      { date: `${year}-01-01`, name: "Second observance" },
      { date: `${year}-12-25`, name: "Christmas Day" },
    ]
  : [];
const settings = {
  layout,
  weekStart,
  paper,
  orientation,
  shadeWeekends: true,
  showGrid: true,
};

document.body.dataset.paper = paper;
document.body.dataset.orientation = orientation;
document.querySelector("#dynamic-page-style").textContent =
  `@page { size: ${paper === "a4" ? "A4" : "letter"} ${orientation}; margin: 0; }`;
document.querySelector("#calendar-output").append(Calendar({ months, settings, holidays }));
document.title = `Paperday print fixture - ${layout} - ${paper} - ${orientation}`;
document.documentElement.dataset.expectedPages = String(getCalendarPageCount(layout, months.length));
document.documentElement.dataset.printReady = "true";
