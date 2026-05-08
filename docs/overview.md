# Policy Review Dashboard — Overview

## What is being built

A single-page dashboard for Tricura Insurance Group. Users explore a paginated table of insurance policies, inspect full policy detail inline, filter and search the list, and perform create, edit, and delete operations — all with proper loading, empty, and error states throughout.

## Features

### Policy list

- Table with columns: account name, region, facility count, effective date, premium, claims total, reimbursement risk badge
- Risk badge computed on the frontend from `financials.reimbursementRisk` (High / Medium / Low)
- Server-side pagination (page + limit reflected in URL)
- Text search on account name (reflected in URL)
- Toolbar shows: search input, Filters button, applied-filter chips

### Policy detail (inline row expansion)

- Clicking a row expands it in place; only one row open at a time
- Full detail fetched from `GET /policies/:id` on expand (lazy — not prefetched)
- Expanded panel sections:
  - **Compliance:** missing documents, expired documents, pending reviews list (type, due date, severity)
  - **Financials:** premium, claims total, reimbursement risk
  - **Renewal:** effective date, days until renewal
- Edit and Delete action buttons inside the expanded panel
- Expanded row ID reflected in URL (`?expanded=POL-XXXX`)

### Filter modal

- Opened via the Filters button in the toolbar
- Controls: region (select), effective date range, premium range, claims total range, reimbursement risk range
- Applied filters shown as dismissible chips in the toolbar
- All filter values reflected in URL

### Policy form (Create & Edit)

- Single modal covers both operations; title changes accordingly
- Sections match the API schema: account, renewal, financials, compliance
- `pendingReviews` is a dynamic list — items can be added and removed
- On create: `POST /policies`, refetch list, close modal
- On edit: `PATCH /policies/:id`, refetch detail + list, close modal

### Delete

- Triggered from the expanded row panel
- Confirmation dialog before deletion
- On confirm: `DELETE /policies/:id`, refetch list, collapse row

### States handled

| State | Where |
|-------|-------|
| Loading skeleton | List (rows), expanded row detail |
| Empty state | List when filters return zero results |
| Error | List-level (fetch failed), row-level (detail fetch failed) |
| Disabled | Action buttons during in-flight mutations |

### URL routing

| URL param | Controls |
|-----------|---------|
| `search` | Search input value |
| `page` | Current page |
| `region` | Region filter |
| `effectiveDateFrom` / `effectiveDateTo` | Date range filter |
| `premiumMin` / `premiumMax` | Premium range filter |
| `claimsTotalMin` / `claimsTotalMax` | Claims range filter |
| `reimbursementRiskMin` / `reimbursementRiskMax` | Risk range filter |
| `expanded` | Currently expanded row ID |

## Architecture decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Server state | TanStack Query v5 | Cache, deduplication, loading/error states out of the box |
| HTTP client | Axios | Consistent interceptor model, typed responses |
| Global state | None initially; Zustand if needed | Avoid premature abstraction |
| Routing | React Router v6 | URL state management via `useSearchParams` |
| Styling | Tailwind + shadcn/ui | Speed + consistency without fighting a design system |
| Linting | Biome | Single tool replaces ESLint + Prettier |

## Constraints and known gaps

- `severity` filter exists in API docs but is not implemented — not exposed in UI
- Data resets on API server restart (in-memory store) — not a UI concern
- `daysUntilRenewal` can be negative if the policy is past renewal — display accordingly
- `PATCH` replaces arrays wholesale — form must send full `pendingReviews` array on edit
