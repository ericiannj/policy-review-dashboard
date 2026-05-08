# UI Guide — Policy Review Dashboard

Visual and behavioral reference for component implementation. Not pixel-perfect — use as structural guide.

---

## Colors & Tokens

| Token | Usage | Approximate value |
|-------|-------|-------------------|
| Primary | Buttons, active chips, pagination, links, focus rings | blue-600 (`#2563EB`) |
| Primary hover | Button hover | blue-700 |
| Risk High | Badge text + progress bar | red-500 |
| Risk Medium | Badge text | orange-500 / amber-500 |
| Risk Low | Badge text | green-600 |
| Severity critical | Dot + text | red-500 |
| Severity high | Dot + text | orange-500 |
| Severity medium | Dot + text | amber-500 |
| Severity low | Dot + text | green-600 |
| Filter chip background | Active filter pills | blue-600 |
| Filter chip text | | white |
| Region badge | Outline pill | white bg, gray border, dark text |
| Skeleton | Loading bars | gray-200, animated pulse |
| Error icon bg | State icons | red-100 / rose-100 |
| Error icon | | red-500 |
| Section labels | Uppercase gray labels | gray-500, text-xs, tracking-wide |
| Muted text | Policy IDs, subtitles | gray-400 / gray-500 |
| Expanded row bg | Inline expanded panel | blue-50 / slate-50 |
| Table header | Column labels | gray-500 or gray-600, font-medium |
| Delete text | Edit modal footer | red-600 |

---

## Typography

- Page title: `text-2xl font-bold` or `text-3xl font-bold`, black
- Section labels inside expanded row / form: `text-xs uppercase tracking-widest font-semibold text-gray-500`
- Account name in table: `font-medium` or `font-semibold`, dark
- Policy ID under account name: `text-sm text-gray-400`
- Data values in expanded panel (premium, claims): `text-2xl font-bold`
- Modal title: `text-xl font-semibold`
- Subtitle/description under modal title: `text-sm text-gray-500`
- Error/empty state headline: `font-semibold`
- Error/empty state subtext: `text-sm text-gray-500`

---

## Page Layout

- Full-width, no max-width container on the dashboard
- White background overall
- Filter bar sits above the table section
- Table section has a white card-like container with a border or subtle shadow
- Section header row ("Policies" + "+ NEW POLICY") inside the table container, above column headers

---

## Filter Bar

Horizontal bar, full width, sits between the page title area and the Policies table.

Components left to right:
1. **Search input** — left icon (magnifier), placeholder "Search accounts by name...", no border-radius extremes, standard input height
2. **Filters button** — outlined style, left icon (filter/sliders icon), label "◎ FILTERS · {count}" — count badge is part of the label text, not a separate pill. Shows count of active filters.
3. **Filter chips** — appear to the right of the filters button, horizontally. Each chip: blue background, white text, label describes the filter range/value, "×" dismiss button on the right. Example labels: "Region: Northeast, Midwest ×", "Risk: 0.20 – 0.85 ×", "Effective: May – Dec 2026 ×", "Premium: $200k – $500k ×", "Claims: $0 – $400k ×"
4. **CLEAR ALL** — text-only link, right-aligned, appears only when filters are active

---

## Policies Table

### Header row
Inside the table container:
- Left: "Policies" (`font-semibold text-lg`)
- Right: "+ NEW POLICY" button (solid blue, primary)

### Column headers
`text-sm text-gray-500 font-medium`, no background change

| Column | Width / alignment |
|--------|------------------|
| Account Name | widest, left |
| Region | medium, left |
| Facilities | narrow, right or center |
| Effective Date | medium, left |
| Premium | medium, right-aligned |
| Claims Total | medium, right-aligned |
| Risk | narrow, right |

### Table row (collapsed)
- Left-most: small "·" dot/bullet (expand indicator), positioned before Account Name
- Account Name: two-line — name on top (`font-medium`), policy ID below (`text-sm text-gray-400`)
- Region: pill badge (outlined, rounded-full, border border-gray-300, px-3 py-0.5, text-sm)
- Facilities: plain number
- Effective Date: formatted as "Jul 1, 2026"
- Premium / Claims Total: formatted as "$447,300" (USD, comma-separated, no decimals for large amounts)
- Risk: colored label text ("High" / "Medium" / "Low") + raw float next to it in gray ("0.93")

Row hover: subtle background change (gray-50)

### Table row (expanded)
- The row indicator changes (bullet/chevron rotates or changes)
- Below the row's data, a full-width panel opens with light blue-gray background (blue-50 or slate-50)
- Panel has 3 columns separated by implicit spacing:

**Left column — RENEWAL & ACCOUNT**
```
RENEWAL & ACCOUNT          ← section label (uppercase xs gray)
EFFECTIVE                  ← field label (uppercase xs gray)
Jul 1, 2026                ← value (base size, dark)

DAYS TO RENEWAL
60

REGION
Midwest

FACILITIES
8
```

**Middle column — FINANCIALS**
```
FINANCIALS

PREMIUM        CLAIMS
$447k          $601k      ← large bold values (text-2xl font-bold)

Reimbursement risk    [High] 0.93   ← risk badge + raw number
█████████████░░░░░░░░               ← colored progress bar (red for High)
```
Progress bar: full-width within column, height ~6-8px, rounded, red fill for High.

**Right column — COMPLIANCE · {n} MISSING · {n} EXPIRED**
- Section label includes counts inline: "COMPLIANCE · 4 MISSING · 5 EXPIRED"
- "EDIT" link in blue, top-right of this column
- Below: list of pending reviews, each item:
  ```
  License                           ● critical
  Due May 11
  
  Incident Report                   ● high
  Due May 19
  ```
  Each review: name on first line (`font-medium`), due date on second line (`text-sm text-gray-500`), severity badge on the right (colored dot + text label)

---

## Loading State (Skeleton)

Same table structure (headers visible). Each row replaced by skeleton bars:
- Left (Account Name area): two stacked bars of different widths, gray, rounded, animated pulse
- Each column: one or two gray bars, widths proportional to typical content
- Risk column: wider bar to represent the badge

---

## Empty State

Centered vertically in the table body area, above where rows would be:
- Icon: magnifier/search icon in a light gray circle (size ~48px)
- Title: "No policies match these filters" (`font-semibold`)
- Subtitle: "Try widening your search to see more results." (`text-sm text-gray-500`)
- Two buttons side by side:
  - "CLEAR FILTERS" — outlined/ghost style
  - "+ CREATE NEW POLICY" — solid blue primary

---

## Error State — List Level

Centered in table body:
- Icon: "!" in a light pink/rose circle (red-100 bg, red-500 text, ~48px)
- Title: "Couldn't load policies" (`font-semibold`)
- Subtitle: "Something went wrong, try again in a moment." (`text-sm text-gray-500`)
- Error code chip: monospace, gray background, small padding — e.g., `500 internal_server_error`
- "RETRY" button — solid blue

---

## Error State — Expanded Row Level

Inline panel within the expanded row (replaces the 3-column detail layout):
- Same icon, title ("Couldn't load policy details"), subtitle, and error code chip format as list error
- "RETRY" button — solid blue
- The rows above and below the expanded position remain visible and normal

---

## Pagination (table footer)

Right-aligned within the table container, below the last row:
- Left side: "Rows per page: 20 ▾" — label + dropdown selector for page size
- Center-right: "1–20 of 100" — range indicator
- Navigation: "‹" (prev, disabled on page 1) + page number buttons + "›" (next, disabled on last page)
- Active page number: solid blue circle with white number
- Inactive page numbers: plain text, clickable
- Shows up to 5 page number buttons

---

## Filter Modal

Triggered by the Filters button. Overlays the dashboard with a dimmed backdrop.

**Modal container:** white, ~580px wide, padding, rounded corners, shadow

**Header:**
- Title: "Filters" (`text-xl font-semibold`)
- Subtitle: "Narrow the policy list. Filters are combined with AND." (`text-sm text-gray-500`)
- "×" close button, top-right

**Sections** (with uppercase labels, `text-xs tracking-widest text-gray-500`):

1. **REGION**
   - 5 checkboxes in a single horizontal row: Northeast, Southeast, Midwest, Southwest, West
   - Standard checkbox + label style

2. **EFFECTIVE DATE RANGE**
   - Two date inputs side by side: "From" and "To" with floating labels
   - Input has a visible border, standard date input

3. **PREMIUM RANGE ($)**
   - Two number inputs side by side: "Min" and "Max" with floating labels
   - Below: range slider spanning full width, labeled "$0" on left and "$1M" on right
   - Slider has two handles (min/max), blue track between them, gray track outside

4. **TOTAL CLAIMS RANGE ($)**
   - Same structure as Premium Range

5. **REIMBURSEMENT RISK RANGE**
   - Two number inputs: "Min" and "Max"
   - Slider: 0.00 to 1.00 range labels

**Footer:**
- Left: "RESET ALL" — blue text link
- Right: "CANCEL" (text/ghost) + "APPLY FILTERS" (solid blue button)

---

## Policy Form Modal

Single modal for both create and edit modes.

**Header:**
- Create mode: title "Create New Policy"
- Edit mode: title "Edit Policy", policy ID shown below title in gray (`text-sm text-gray-500`)
- "×" close button

**Sections** (uppercase labels `text-xs tracking-widest text-gray-500`):

**ACCOUNT**
Three inputs in a row:
- "Account name" — text input, widest (floated label style with blue border on focus)
- "Region" — dropdown/select with arrow indicator
- "Facility count" — number input

**RENEWAL**
Two inputs in a row:
- "Effective date" — date input
- "Days until renewal (computed)" — number input (readonly, value computed from date)

**FINANCIALS**
Two inputs in a row:
- "Premium ($)" — number input
- "Claims total ($)" — number input

**REIMBURSEMENT RISK** (separate subsection within or below financials)
- "Value" — small number input showing current float value
- Full-width slider: 0.00 to 1.00, value and slider are synced bidirectionally

**COMPLIANCE**
Two inputs in a row:
- "Missing documents" — number input
- "Expired documents" — number input

**PENDING REVIEWS**
- Section label left + "+ ADD REVIEW" blue text link right-aligned
- Each review item (inline row):
  - "Type" text input — enum values but displayed as text field (License, Care Plan, etc.)
  - "Due date" — date input
  - "Severity" — dropdown (low, medium, high, critical)
  - 🗑️ delete icon button (right side)
- Items stacked vertically, each on its own row

**Footer:**
- Create mode: "CANCEL" (text) + "CREATE POLICY" (solid blue) — right-aligned
- Edit mode: "DELETE POLICY" (red text link, left) + "CANCEL" (text) + "SAVE CHANGES" (solid blue) — right for CANCEL+SAVE

---

## Buttons Reference

| Variant | Style | Usage |
|---------|-------|-------|
| Primary | Solid blue bg, white text, rounded | Main CTAs: "+ NEW POLICY", "APPLY FILTERS", "CREATE POLICY", "SAVE CHANGES", "RETRY" |
| Ghost/Outline | White bg, border, dark text | "CLEAR FILTERS", "CANCEL" |
| Text | No border/bg, blue text | "CLEAR ALL", "RESET ALL", "EDIT", "+ ADD REVIEW" |
| Destructive text | No border/bg, red text | "DELETE POLICY" in edit modal footer |
| Destructive solid | Solid red bg (not shown — if needed for confirm dialogs) | — |

---

## Severity Badge (Pending Reviews)

Each severity displayed as a colored dot + text label:
- `● critical` — red dot, red text
- `● high` — orange dot, orange text
- `● medium` — amber dot, amber text
- `● low` — green dot, green text

---

## Risk Badge (Table Column)

Two elements side by side:
- Text label: "High" / "Medium" / "Low" — colored, no background (just colored text, possibly `font-medium`)
- Raw float: gray text, e.g., "0.93"

In the expanded row reimbursement risk line, the badge is more prominent: `[High]` appears as a small pill/tag (possibly with a subtle background) next to the raw number, followed by the progress bar.
