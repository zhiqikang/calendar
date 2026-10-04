# Paperday Design System & Visual Specification

A comprehensive summary of the design language, color palette tokens, typography rules, component styling, and print geometry for **Paperday** (`calendar`).

---

## 1. Design Philosophy & Visual Aesthetic

Paperday is designed with an **editorial, tactile, artisanal stationery aesthetic** that balances two distinct contexts:
1. **Interactive Screen Workbench**: Warm, welcoming, glassmorphic controls set on a subtle grid canvas with soft washi & ecru paper tones, sumi ink, and warm brass accents.
2. **Physical Print Presentation**: High-contrast, crisp, margin-controlled typography calibrated for physical A4 and US Letter paper, with zero browser chrome and precise page breaks.

---

## 2. Color Palette & Token System

### Core Palette Tokens (`:root` in `screen.css`)

| Token Name | Hex Code | Visual Sample / Role | Usage |
| :--- | :--- | :--- | :--- |
| `--ink` | `#1a1f2c` | Deep Sumi Ink | Primary body text, brand headings, active segmented buttons, brand icon base |
| `--ink-soft` | `#4f5869` | Muted Slate / Indigo Fog | Secondary text, helper labels, header/footer text, subtle icons |
| `--paper` | `#fefdf9` | Washi White | Printable calendar sheet background (screen view) |
| `--cream` | `#f4efe6` | Warm Linen / Ecru | Global application page background (`html`, `body`, `<meta name="theme-color">`) |
| `--line` | `#ded7cb` | Muted Oat / Warm Gray | Form input borders, segmented control tracks |
| `--line-strong`| `#c4beaf` | Stone Gray | Calendar day-cell grid boundaries |
| `--accent` | `#c0832b` | Warm Brass Ochre | Primary call-to-action button, active switch tracks, brand ring accents |
| `--accent-dark`| `#9c651d` | Deep Brass | CTA button hover state, uppercase step labels & eyebrow titles |
| `--sage` | `#e8ece6` | Pale Matcha / Soft Tea | Weekend day-cell background tint (rendered at `rgba(232, 236, 230, 0.65)`) |
| `--sage-deep` | `#b8c3b4` | Deep Matcha | Accent tinting & structural boundaries |
| `--shadow` | `rgba(26, 31, 44, 0.12)` | Organic Drop Shadow | `0 24px 64px rgba(26, 31, 44, 0.12)` for calendar paper sheets |

---

### Extended UI & Functional Colors

| Context | Color / Value | Description |
| :--- | :--- | :--- |
| **Body Background Accent** | `radial-gradient(circle at 18% 4%, rgba(255, 255, 255, 0.85), transparent 30rem), #f4efe6` | Subtle organic spotlight on the top-left canvas |
| **Workspace Panel** | `rgba(255, 255, 255, 0.60)` (Border: `rgba(26, 31, 44, 0.12)`) | Frosted card container with `box-shadow: 0 30px 80px rgba(26, 31, 44, 0.07)` |
| **Control Sidebar** | `rgba(254, 253, 249, 0.94)` (Border: `rgba(26, 31, 44, 0.10)`) | High-legibility form workbench background |
| **Preview Canvas** | `#e7e3db` with `rgba(26, 31, 44, 0.026)` grid pattern | 24px × 24px subtle cutting-mat / draft grid |
| **Preview Badge** | `rgba(255, 255, 255, 0.68)` (Border: `rgba(26, 31, 44, 0.14)`) | Pill badge indicating total page count |
| **Form Inputs & Selects**| `#fcfbfa` (Border: `#ded7cb`) | Off-white form input fill |
| **Focus Rings** | `3px solid rgba(192, 131, 43, 0.35)` | 2px offset accessible focus indicator |
| **Switch Inactive Track** | `#cfc9be` (Thumb: `#ffffff`) | Soft oat/gray toggle switch off-state |
| **Muted Form Hints** | `#6e7787` | Used for `.field-help`, `.switch-row small`, and status messages |
| **Holiday Text (Monthly)**| `#b33a22` | Warm vermilion red text for holiday names in day cells |
| **Holiday Dot (Mini/Year)**| `#c84b31` | Vermilion dot indicator in compact calendar views |
| **Calendar Dividers** | `#6b7785` (1.5px solid) | Header bottom border |
| **Favicon SVG** | `#1a1f2c` (Body), `white` (Grid rule), `#c0832b` (Pins) | Embedded SVG favicon palette |
| **Print Output** | `background: white !important; color-adjust: exact;` | Ink-friendly white background for physical printing |

---

### Calendar Style Token System (`--cal-*`)

Calendar sheets are styled via decoupled CSS custom properties scoped to `[data-style="<style-id>"]`:

| Token Name | Warm Sunshine (Default) | High Contrast | Role / Usage |
| :--- | :--- | :--- | :--- |
| `--cal-font-display` | Cormorant Garamond, serif | Plus Jakarta Sans, sans-serif | Sheet title and mini-month headings |
| `--cal-font-sans` | Plus Jakarta Sans, sans-serif | Plus Jakarta Sans, sans-serif | Day numbers, weekdays, brand, labels |
| `--cal-paper` | `#fefdf9` (Washi White) | `#ffffff` (Pure White) | Sheet background fill |
| `--cal-ink` | `#1e2229` (Sumi Ink) | `#000000` (Pure Black) | Primary typography |
| `--cal-ink-soft` | `#4f5869` | `#222222` | Muted secondary copy |
| `--cal-eyebrow` | `#9c651d` (Deep Brass) | `#000000` | Header eyebrow label |
| `--cal-brand` | `#636f7e` | `#000000` | Header brand label & mini month year |
| `--cal-divider` | `#6b7785` | `#000000` | Weekday header & mini-month divider |
| `--cal-weekday` | `#556271` | `#000000` | Weekday header letters |
| `--cal-grid` | `#c4beaf` | `#000000` | Day-cell borders |
| `--cal-weekend` | `rgba(232, 236, 230, 0.65)` | `#e5e5e5` | Weekend cell background tint |
| `--cal-holiday` | `#b33a22` | `#990000` | Holiday text labels |
| `--cal-holiday-marker` | `#c84b31` | `#990000` | Compact holiday marker dots |

---

## 3. Typography & Font Specifications

Paperday uses a complementary dual-type pairing: **Cormorant Garamond** (with Georgia fallback) for editorial display elegance and **Plus Jakarta Sans** (with Inter / System Sans fallback) for clean, readable UI controls and tabular calendar numbers.

### Font Families

```css
/* Primary UI, Sans-Serif Data Stack */
font-family: "Plus Jakarta Sans", Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
font-synthesis: none;

/* Editorial Display, Serif Stack */
font-family: "Cormorant Garamond", Georgia, "Times New Roman", serif;
```

---

### Screen Typographic Hierarchy

| Role / Element | Selector | Font Family | Size | Weight | Line Height / Spacing |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Display Title** | `.intro h1` | Cormorant Garamond (Serif) | `clamp(3rem, 6vw, 6rem)` | 600 | `0.95`, `-0.035em` track |
| **Panel Headings** | `.panel-heading h2`, `.preview-toolbar h2` | Cormorant Garamond (Serif) | `1.85rem` | 600 | Normal |
| **Brand Wordmark** | `.brand` | Cormorant Garamond (Serif) | `1.55rem` | 700 | Normal |
| **Calendar Sheet Title** | `.calendar-title` | Cormorant Garamond (Serif) | `clamp(1.55rem, 4.2vw, 3.4rem)`| 600 | `1.0`, `-0.03em` track |
| **Mini-Month Title** | `.mini-month-heading h3` | Cormorant Garamond (Serif) | `clamp(0.6rem, 1.6vw, 1.15rem)`| 700 | Normal |
| **Intro Subtitle** | `.intro-copy` | Plus Jakarta Sans (Sans) | `1.08rem` | 400 | `1.65` |
| **Step / Section Labels**| `.step-label`, `.eyebrow` | Plus Jakarta Sans (Sans) | `0.72rem` | 750 | `0.16em` track, UPPERCASE |
| **Calendar Eyebrow** | `.calendar-eyebrow` | Plus Jakarta Sans (Sans) | `clamp(0.42rem, 1vw, 0.68rem)` | 750 | `0.16em` track, UPPERCASE |
| **Calendar Brand Stamp**| `.calendar-brand` | Plus Jakarta Sans (Sans) | `clamp(0.38rem, 0.8vw, 0.58rem)` | 800 | `0.18em` track, UPPERCASE |
| **Weekday Header** | `.weekday` | Plus Jakarta Sans (Sans) | `clamp(0.46rem, 1.2vw, 0.74rem)`| 750 | `0.08em` track, UPPERCASE |
| **Day Numbers** | `.day-number` | Plus Jakarta Sans (Sans) | `clamp(0.52rem, 1.4vw, 0.88rem)`| 600 | `tabular-nums` |
| **Holiday Labels** | `.holiday-labels` | Plus Jakarta Sans (Sans) | `clamp(0.38rem, 0.9vw, 0.68rem)`| 700 | `1.15`, truncated ellipsis |
| **Form Legends & Spans**| `legend`, `.field > span` | Plus Jakarta Sans (Sans) | `0.78rem` | 700 | Normal |
| **Segmented Buttons** | `.segmented-control span`| Plus Jakarta Sans (Sans) | `0.83rem` (Compact: `0.76rem`) | 650 | Normal |
| **Form Inputs / Selects**| `.field input`, `select` | Plus Jakarta Sans (Sans) | `0.84rem` | 400 | Normal |
| **Form Help & Footers** | `.field-help`, `.site-footer p` | Plus Jakarta Sans (Sans) | `0.72rem` / `0.86rem` | 400 | `1.45` |

---

### Print Typographic Hierarchy (`print.css`)

In physical print media, fluid `clamp()` sizing is replaced by absolute typographical point (`pt`) sizes:

| Element | Print Font Size | Details |
| :--- | :--- | :--- |
| **Monthly Calendar Title** | `28pt` | Cormorant Garamond, serif |
| **Multi-Month Calendar Title**| `24pt` | Cormorant Garamond, serif |
| **Calendar Eyebrow** | `7pt` | Plus Jakarta Sans, uppercase, 0.16em track |
| **Calendar Brand Stamp** | `6pt` | Plus Jakarta Sans, uppercase, 0.18em track |
| **Weekday Header** | `7pt` | Plus Jakarta Sans, uppercase, padding `2.2mm 1mm` |
| **Day Numbers (Monthly)** | `9pt` | Plus Jakarta Sans tabular-nums, positioned `2mm` top / `2.5mm` right |
| **Holiday Labels (Monthly)** | `6.5pt` | Plus Jakarta Sans bold |
| **Holiday Marker (Mini)** | `1mm × 1mm` | Rounded dot indicator |
| **Mini-Month Title (2-month)**| `17pt` (Year sub: `7pt`) | Weekday: `7pt`, Day: `9pt` |
| **Mini-Month Title (4-month)**| `13pt` (Year sub: `6pt`) | Weekday: `5.5pt`, Day: `7pt` |
| **Mini-Month Title (6-month)**| `11pt` (Year sub: `5pt`) | Weekday: `4.5pt`, Day: `6pt` |
| **Mini-Month Title (Yearly)** | `10pt` (Year sub: `5pt`) | Weekday: `4pt`, Day: `5pt` |

---

## 4. Layout, Geometry & Print Calibration

### Page Proportions & Aspect Ratios

Dynamic page geometry is driven by data attributes (`data-paper` and `data-orientation`) on the `<body>`:

```css
/* A4 Dimensions (210mm × 297mm) */
body[data-paper="a4"][data-orientation="portrait"]  { --page-width: 210mm; --page-height: 297mm; --page-ratio: 210 / 297; }
body[data-paper="a4"][data-orientation="landscape"] { --page-width: 297mm; --page-height: 210mm; --page-ratio: 297 / 210; }

/* US Letter Dimensions (8.5in × 11in) */
body[data-paper="letter"][data-orientation="portrait"]  { --page-width: 8.5in; --page-height: 11in; --page-ratio: 8.5 / 11; }
body[data-paper="letter"][data-orientation="landscape"] { --page-width: 11in; --page-height: 8.5in; --page-ratio: 11 / 8.5; }
```

- **Screen Preview Page**: Fixed aspect-ratio matching the physical paper (`aspect-ratio: var(--page-ratio)`), max-width `820px`, padding `clamp(22px, 4.2%, 50px)`, with soft drop shadow.
- **Physical Print Output**: Exact margins (`padding: 12mm; @page { margin: 0; }`), automatic page breaks (`break-inside: avoid; break-after: page;`), with web chrome completely hidden via `.no-print { display: none !important; }`.

---

### Calendar Grid Specifications

- **Cell Matrix**: Fixed **7 columns × 6 rows** (42 total day cells) generated by `getMonthGrid()`. This guarantees structural consistency regardless of whether a month spans 4, 5, or 6 calendar weeks.
- **Grid Layout Types**:
  - **1 Month / Page**: Roomy 42-cell layout with room for holiday labels.
  - **2 Months / Page**: 1 column × 2 rows (portrait) or 2 columns × 1 row (landscape).
  - **4 Months / Page**: 2 columns × 2 rows.
  - **6 Months / Page**: 2 columns × 3 rows (portrait) or 3 columns × 2 rows (landscape).
  - **Whole Year (12 Months)**: 3 columns × 4 rows (portrait) or 4 columns × 3 rows (landscape).

---

## 5. UI Components & Micro-Interactions

### 1. Brand Mark
- **Dimensions**: `31px` × `27px`
- **Background**: `--ink` (`#1a1f2c`) with `border-radius: 5px`
- **Graphic Elements**: 3-column dot matrix with 2 brass binder rings (`::before` / `::after`) in `--accent` (`#c0832b`).

### 2. Segmented Pill Controls
- **Track**: Background `#ede7dc`, border `1px solid var(--line)`, `border-radius: 11px`.
- **Selected State**: High-contrast `--ink` fill, crisp white text, and `box-shadow: 0 4px 12px rgba(26, 31, 44, 0.18)`.
- **Transition**: `160ms ease`.

### 3. Toggle Switch
- **Dimensions**: `38px` width × `22px` height.
- **Track**: `#cfc9be` rounded pill; transitions to `--accent` (`#c0832b`) when checked.
- **Thumb**: `16px` white circle with `0 1px 4px rgba(0, 0, 0, 0.18)` shadow, translating `16px` on toggle.

### 4. Primary CTA Button
- **Height**: Minimum `50px`, `border-radius: 10px`.
- **Styling**: Solid `--accent` (`#c0832b`), white text, bold `750` weight.
- **Hover**: Background switches to `--accent-dark` (`#9c651d`) with `transform: translateY(-1px)`.
- **Disabled / Printing State**: `cursor: wait; opacity: 0.7; transform: none;`.

### 5. Accessibility & Motion
- **Focus Rings**: Universal `:focus-visible` with `3px solid rgba(192, 131, 43, 0.35)` and `outline-offset: 2px`.
- **Reduced Motion**: Full `@media (prefers-reduced-motion: reduce)` support resetting transition durations to `0.01ms`.
- **ARIA & Roles**: Full `grid`, `gridcell`, `columnheader`, and `aria-live="polite"` status announcements.
