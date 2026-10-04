# Paperday

A dependency-free printable calendar maker. It runs entirely in the browser and produces monthly or yearly layouts for A4 and US Letter paper. It should be painfually obvious that this is vibe coded and you should use it with caution.

## Run locally

From this directory:

```powershell
python -m http.server 4173
```

Then open `http://localhost:4173`.

## Publish with GitHub Pages

1. Push the project to a GitHub repository whose default branch is `main`.
2. Open **Settings → Pages** in the repository.
3. Set **Source** to **GitHub Actions**.
4. Push to `main`, or run the Pages workflow manually.

The site uses only relative URLs, so it works both at a custom domain and under `username.github.io/repository-name/`.

## Reusable components

The rendering layer lives in `components/calendar-components.js`. Every component returns a regular DOM node, so it can be mounted in any container and shares the same screen and print styles.

```js
import { MonthlyCalendarPage } from "./components/calendar-components.js";

const page = MonthlyCalendarPage({
  month: { year: 2027, month: 0 },
  settings: { weekStart: "monday" },
  holidays: [{ date: "2027-01-01", name: "New Year’s Day" }],
  brand: "MY CALENDAR",
});

document.querySelector("#output").append(page);
```

Available components: `CalendarHeader`, `WeekdayRow`, `MonthGrid`, `MiniMonth`, `MonthlyCalendarPage`, `MultiMonthCalendarPage`, `YearlyCalendarPage`, and the high-level `Calendar` composer.

## Holidays

Pass an array of exact-date holiday objects to `Calendar` or any month/page component. Dates use the timezone-safe `YYYY-MM-DD` format, and multiple holidays may share a date.

```js
const holidays = [
  { date: "2026-12-25", name: "Christmas Day" },
  { date: "2027-01-01", name: "New Year’s Day" },
];

document.querySelector("#output").append(Calendar({
  months,
  settings,
  holidays,
}));
```

Monthly pages print the holiday names inside their day cells. Compact multi-month and yearly layouts use a small marker while keeping the holiday names in accessible labels and hover text.

## Layout variants

The `Calendar` composer paginates the same 12-month sequence into five densities:

- 1 month per page — 12 pages
- 2 months per page — 6 pages
- 4 months per page — 3 pages
- 6 months per page — 2 pages
- Whole year — 1 page

Every variant supports portrait or landscape paper, Sunday- or Monday-first weeks, cross-year starting months, grid visibility, and weekend shading.

## Calendar styles

Paperday supports pluggable calendar styles defined in `styles.js` and rendered via CSS custom properties:

- **Warm Sunshine** (`warm-sunshine`, default): Warm linen paper with sumi ink and warm brass accents.
- **High Contrast** (`high-contrast`): Crisp stark white and deep black for maximum clarity and bold print.

### Adding a new style

1. Open `styles.js` and add an entry to `CALENDAR_STYLES`:
   ```js
   "cool-slate": Object.freeze({
     id: "cool-slate",
     label: "Cool Slate",
     description: "Crisp slate paper with deep charcoal ink and cool steel accents.",
     themeColor: "#f1f5f9",
   }),
   ```
2. Open `screen.css` and define the `--cal-*` tokens under `[data-style="<id>"]`:
   ```css
   [data-style="cool-slate"] {
     --cal-font-display: "Plus Jakarta Sans", sans-serif;
     --cal-font-sans: "Plus Jakarta Sans", sans-serif;
     --cal-paper: #f8fafc;
     --cal-ink: #0f172a;
     --cal-eyebrow: #475569;
     --cal-brand: #64748b;
     --cal-divider: #94a3b8;
     --cal-weekday: #64748b;
     --cal-grid: #cbd5e1;
     --cal-weekend: rgba(226, 232, 240, 0.7);
     --cal-holiday: #0284c7;
     --cal-holiday-marker: #0284c7;
   }
   ```
The style dropdown automatically discovers the new style from `CALENDAR_STYLES`, persists the user's selection in `localStorage`, and applies it to screen and print views.

## Screen and print presentation

- `screen.css` contains the editor, responsive preview, and shared calendar component geometry.
- `print.css` is loaded only for print media and owns physical page dimensions, margins, page breaks, print typography, and removal of editor chrome.
- `app.js` writes the currently selected paper size and orientation into the final `@page` rule, overriding the A4 portrait fallback in `print.css`.

## Printing

`printing.js` provides the reusable print controller used by the app. It prepares the document after fonts and layout settle, sets a useful Save-as-PDF filename, prevents duplicate print requests, and restores the interface after printing. The same lifecycle runs for the button, Ctrl+P, and the browser’s Print menu.

## Test the calendar engine and components

While the local server is running:

- Open `http://localhost:4173/tests/calendar.test.html` for date-engine and component tests.
- Open `http://localhost:4173/tests/presentation.test.html` for screen/print stylesheet separation tests.
- Open `http://localhost:4173/tests/printing.test.html` for printing lifecycle tests.

`tests/print-fixture.html` is a deterministic print-only harness used to validate physical page sizes and page counts across layout variants.

## MVP features

- One-, two-, four-, six-, and twelve-month page layouts
- Any starting month from 1900 through 2200
- Sunday- or Monday-first weeks
- A4 and US Letter paper
- Portrait and landscape orientation
- Weekend shading and grid-line options
- Pluggable calendar visual styles (Warm Sunshine, High Contrast)
- Browser printing and Save as PDF through the system print dialog
- Settings saved locally in the browser
