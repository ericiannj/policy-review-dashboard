# Implementation Plan

Each section maps to one git commit. Commits are semantic and ordered — do not work ahead without explicit approval. Each commit lists its scope, what to verify automatically, and what to verify manually in the browser.

---

## Commit 0 — docs: project documentation and AI guidance

**Scope:** All documentation that guides the implementation. No application code.

Files:
- `CLAUDE.md` — project context, stack, architecture, rules
- `rules/compliance-checklist.md` — quality gates
- `rules/frontend-conventions.md` — React patterns, service layer, hooks
- `rules/api-conventions.md` — Axios instance, query keys, mutation patterns
- `rules/documentation.md` — doc standards
- `docs/api.md` — API reference for frontend consumption
- `docs/overview.md` — what is being built
- `docs/implementation-plan.md` — this file

**Automated checks:** none (docs only)

**Manual verification:** All files readable and internally consistent. No references to wrong project (Pocket Advisor). API shapes match what the API actually returns.

---

## Commit 1 — chore: project scaffold

**Scope:** Vite + React + TypeScript project initialised with all dependencies, tooling configured, and folder structure created. No business logic.

Steps:
1. `npm create vite@latest . -- --template react-ts`
2. Install runtime deps: `@tanstack/react-query`, `axios`, `react-router-dom`, `lucide-react`
3. Install shadcn/ui: `npx shadcn@latest init` (configure Tailwind, CSS variables, path aliases)
4. Install dev deps: `@biomejs/biome`, `husky`, `lint-staged`, `vitest`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `msw`, `jsdom`
5. Configure `biome.json` (recommended rules, a11y group enabled, `noConsole` as warn)
6. Configure `vite.config.ts` (path alias `@/` → `src/`, Vitest with jsdom environment)
7. Configure `tsconfig.json` (strict, path alias)
8. Configure Husky: `pre-commit` hook runs `npx biome check --write .` then `npx vitest run`
9. Configure `lint-staged` to run Biome only on staged files
10. Create folder skeleton: `src/components/ui/`, `src/components/features/policies/`, `src/components/features/filters/`, `src/components/features/policy-form/`, `src/hooks/`, `src/services/`, `src/types/`, `src/lib/`, `src/pages/`
11. Create `.env.example` with `VITE_API_URL=http://localhost:4000`

**Automated checks:**
- `npm run dev` starts without errors
- `npm run typecheck` passes
- `npm run lint` passes
- `npm test` runs (zero tests, exits 0 — configure `passWithNoTests`)
- Husky pre-commit hook fires on a test commit

**Manual verification:**
- Browser shows default Vite + React screen at `localhost:5173`
- Path alias `@/` resolves (import something from `@/lib/...` in a temp file)

---

## Commit 2 — feat: TypeScript types and Axios service layer

**Scope:** All TypeScript types from the API schema and the complete service layer. No React code.

Files:
- `src/types/policy.ts` — `PolicySummary`, `PolicyDetail`, `PolicyPayload`, `PolicyListParams`, `PolicyListResponse`, enum types (`Region`, `PendingReviewType`, `ReviewSeverity`)
- `src/lib/axios.ts` — shared Axios instance with `VITE_API_URL` base URL
- `src/lib/risk.ts` — `getRiskLevel(reimbursementRisk: number): RiskLevel`
- `src/services/policies.ts` — `getPolicies`, `getPolicy`, `createPolicy`, `updatePolicy`, `deletePolicy`

Tests:
- `src/lib/risk.test.ts` — unit tests for all three threshold boundaries and edge values
- `src/services/policies.test.ts` — unit tests with mocked Axios (verify correct endpoints, params, and return shapes are called)

**Automated checks:**
- `npm run typecheck` — zero errors
- `npm test` — all new tests pass

**Manual verification:** none (no UI yet)

---

## Commit 3 — feat: React Query setup and custom hooks

**Scope:** QueryClient configuration and all five custom hooks. No UI.

Files:
- `src/lib/query-client.ts` — `QueryClient` with `staleTime: 30_000`, `retry: 1`
- `src/main.tsx` — wrap app in `QueryClientProvider` with the shared client
- `src/hooks/use-policies.ts` — `usePolicies(params)`, exports `policiesQueryKey`
- `src/hooks/use-policy.ts` — `usePolicy(id)`, exports `policyQueryKey`; enabled only when `id` is defined
- `src/hooks/use-create-policy.ts` — `useCreatePolicy()`, invalidates list on success
- `src/hooks/use-update-policy.ts` — `useUpdatePolicy()`, invalidates detail + list on success
- `src/hooks/use-delete-policy.ts` — `useDeletePolicy()`, invalidates list on success

Tests:
- `src/hooks/use-policies.test.ts` — test loading, success, and error states using `renderHook` + `msw`
- `src/hooks/use-policy.test.ts` — test enabled flag and 404 error handling

**Automated checks:**
- `npm run typecheck` — zero errors
- `npm test` — all tests pass

**Manual verification:** none (no UI yet)

---

## Commit 4 — feat: base layout and design foundation

**Scope:** Application shell, routing setup, and design tokens. The page is empty but structurally complete.

Files:
- `src/index.css` — CSS custom properties for colors, typography scale, spacing tokens
- `src/components/ui/` — install needed shadcn/ui components: `Button`, `Input`, `Table`, `Dialog`, `Select`, `Badge`, `Skeleton`, `Tooltip`
- `src/pages/DashboardPage.tsx` — top-level page component (empty for now)
- `src/App.tsx` — React Router `BrowserRouter` with a single route `/` → `DashboardPage`

**Automated checks:**
- `npm run typecheck` — zero errors
- `npm run lint` — zero errors

**Manual verification:**
- App renders without console errors
- Layout is responsive: no horizontal overflow at 375px; full width at 1280px

---

## Commit 5 — feat: policies table with list states

**Scope:** The policy table renders with real API data and handles all list-level states.

Files:
- `src/components/features/policies/PoliciesTable.tsx` — table with columns: account name, region, facility count, effective date, premium, claims total, risk badge
- `src/components/features/policies/RiskBadge.tsx` — badge using `getRiskLevel()`, distinct visual for High / Medium / Low
- `src/components/features/policies/PoliciesTableSkeleton.tsx` — skeleton rows during loading
- `src/components/features/policies/PoliciesEmptyState.tsx` — empty state when no results
- `src/components/features/policies/PoliciesErrorState.tsx` — list-level error with retry button
- `src/pages/DashboardPage.tsx` — wires `usePolicies` with default params, renders the correct state

Tests:
- `PoliciesTable.test.tsx` — renders correct columns; formats currency; shows correct risk badge label
- `RiskBadge.test.tsx` — correct label for High (0.70), Medium (0.55), Low (0.20) and boundary values

**Automated checks:**
- `npm run typecheck` — zero errors
- `npm test` — all tests pass

**Manual verification:**
- Table renders 20 rows of seed data
- Currency values formatted (e.g., `$128,000`)
- Risk badge shows correct label and color for visible rows
- Skeleton shows during slow network (throttle in DevTools)
- Error state appears when API is unreachable (stop the API server)
- No horizontal overflow on mobile

---

## Commit 6 — feat: search, pagination, and URL state

**Scope:** Search input with debounce, server-side pagination, and all state synced to URL.

> **Gap — Rows per page selector:** The UI mock shows a "Rows per page: 20 ▾" dropdown in the table footer. This was not in the original plan. Before implementing, decide: what page-size options to offer (e.g. 10, 20, 50), whether `limit` is reflected in the URL, and whether it resets to page 1 when changed. Document the decision in the README.

Files:
- `src/components/features/filters/SearchInput.tsx` — debounced text input (300ms), reads/writes `?search`
- `src/components/features/policies/PaginationControls.tsx` — previous/next + page indicator, reads/writes `?page`; resets to 1 when search changes
- `src/pages/DashboardPage.tsx` — reads all URL params, passes to `usePolicies`, renders search + pagination

Tests:
- `SearchInput.test.tsx` — debounce fires after 300ms; updates URL param
- `PaginationControls.test.tsx` — disables Previous on page 1; disables Next on last page

**Automated checks:**
- `npm run typecheck` — zero errors
- `npm test` — all tests pass

**Manual verification:**
- Typing in search updates table after 300ms
- Page param appears in URL bar (`?page=2`)
- Navigating back restores previous page and search
- Changing search resets to page 1
- Previous disabled on page 1; Next disabled when `page === totalPages`

---

## Commit 7 — feat: row expansion and policy detail panel

**Scope:** Inline row expansion with lazy detail fetch, detail panel layout, and row-level states.

Files:
- `src/components/features/policies/ExpandedPolicyRow.tsx` — expanded panel with Compliance, Financials, Renewal sections; Edit and Delete buttons
- `src/components/features/policies/PolicyDetailSkeleton.tsx` — inline skeleton while detail loads
- `src/components/features/policies/PolicyDetailError.tsx` — inline error with retry
- `src/components/features/policies/PendingReviewsList.tsx` — list of pending reviews with type, due date, and severity badge
- `src/components/features/policies/PoliciesTable.tsx` — updated: clicking a row toggles expansion, only one row open at a time, expanded ID written to `?expanded`
- `src/hooks/use-policy.ts` — enabled only when expanded ID is set

Tests:
- `ExpandedPolicyRow.test.tsx` — renders compliance, financial, renewal data; clicking a second row closes the first; error state shown on 404

**Automated checks:**
- `npm run typecheck` — zero errors
- `npm test` — all tests pass

**Manual verification:**
- Clicking a row expands it with full detail
- Clicking another row closes the first and opens the second
- Clicking the same row toggles it closed
- Expanded row ID appears in URL; navigating back restores the expanded state
- Skeleton shown while detail loads (throttle network)
- Row-level error shown when detail fetch fails (use a bad ID via URL)
- Negative `daysUntilRenewal` displays clearly (e.g., "Overdue by 5 days")

---

## Commit 8 — feat: filter modal and applied filter chips

**Scope:** Filter modal with all controls, chips in the toolbar, and URL sync for all filter values.

> **Gap — Region filter: multi-select vs. single-select:** The UI mock shows checkboxes allowing multiple regions to be selected simultaneously (e.g. "Region: Northeast, Midwest"). The API only accepts a single `region` param per request. Before implementing, decide: limit the UI to single-select (radio buttons or a dropdown) to match the API, or accept the constraint and document it. Document the decision in the README.

Files:
- `src/components/features/filters/FilterModal.tsx` — modal with: region select, effective date range (date inputs), premium range (number inputs), claims total range, reimbursement risk range (0–1 slider or number inputs)
- `src/components/features/filters/FilterChips.tsx` — dismissible chips for each active filter
- `src/components/features/filters/FilterBar.tsx` — composes SearchInput, Filters button, FilterChips
- `src/pages/DashboardPage.tsx` — updated: reads all filter params from URL, passes to `usePolicies`, renders FilterBar

Tests:
- `FilterModal.test.tsx` — selecting region updates URL; clearing a chip removes the param; applying invalid range shows validation error
- `FilterChips.test.tsx` — one chip per active filter; dismissing removes only that param

**Automated checks:**
- `npm run typecheck` — zero errors
- `npm test` — all tests pass

**Manual verification:**
- Opening filter modal shows current filter values from URL
- Applying filters updates the table and adds chips
- Dismissing a chip removes that filter and refetches
- Applying all filters simultaneously works correctly
- Filters + search + page all coexist in URL without conflict
- Changing any filter resets page to 1

---

## Commit 9 — feat: policy form (create and edit)

**Scope:** Single form modal covering both create and edit flows.

> **Gap — "Days until renewal" field:** The mock shows this field labelled "(computed)" but still rendered as an editable input. Before implementing, decide: treat it as readonly and auto-compute from `effectiveDate - today` on the frontend, or allow manual input and send the value as-is to the API. Document the decision in the README.

> **Gap — Pending review "Type" field:** The mock shows "Type" as a plain text input (e.g. "License", "Care Plan"). The API enforces a strict enum for this field. Before implementing, decide: render it as a dropdown with the enum values (safer, prevents validation errors) or keep it as a free-text input with client-side validation. Document the decision in the README.

Files:
- `src/components/features/policy-form/PolicyFormModal.tsx` — modal wrapper, title changes based on mode (Create / Edit)
- `src/components/features/policy-form/PolicyForm.tsx` — form sections: Account (name, region, facility count), Renewal (effective date, days until renewal), Financials (premium, claims total, reimbursement risk), Compliance (missing docs, expired docs, pending reviews list)
- `src/components/features/policy-form/PendingReviewsField.tsx` — dynamic list: add item (type, due date, severity), remove item; sends full array on submit
- `src/hooks/use-create-policy.ts` — wired to form submit in create mode
- `src/hooks/use-update-policy.ts` — wired to form submit in edit mode
- `src/components/features/policies/ExpandedPolicyRow.tsx` — Edit button opens `PolicyFormModal` in edit mode pre-populated with current data
- `src/pages/DashboardPage.tsx` — Create button in toolbar opens `PolicyFormModal` in create mode

Tests:
- `PolicyForm.test.tsx` — required field validation blocks submit; submitting create mode calls POST service; submitting edit mode calls PATCH service with only changed fields; pending reviews can be added and removed
- `PendingReviewsField.test.tsx` — add and remove items; empty list valid

**Automated checks:**
- `npm run typecheck` — zero errors
- `npm test` — all tests pass

**Manual verification:**
- Creating a policy: form submits, list refreshes, new policy appears
- Editing a policy: form pre-populated with current values, submit updates detail panel and list
- Required field validation prevents submit
- Submit button disabled while mutation is in-flight
- Adding and removing pending review items works
- Sending a full pending reviews array on edit (check Network tab — full array in PATCH body)

---

## Commit 10 — feat: delete policy

**Scope:** Delete confirmation and mutation.

> **Gap — Delete entry point:** The mock shows "DELETE POLICY" as a red text link in the footer of the edit modal, not as a standalone button in the expanded row. Before implementing, decide: trigger delete from inside the edit modal footer (as mocked), or add a separate Delete button directly in the expanded panel. Also decide whether the confirmation dialog appears on top of the edit modal or whether the edit modal closes first. Document the decision in the README.

Files:
- `src/components/features/policies/DeletePolicyDialog.tsx` — confirmation dialog: "Delete this policy? This cannot be undone." with Cancel and Delete buttons
- `src/hooks/use-delete-policy.ts` — on success, collapses row (clear `expanded` URL param) and invalidates list
- `src/components/features/policies/ExpandedPolicyRow.tsx` — Delete button opens `DeletePolicyDialog`

Tests:
- `DeletePolicyDialog.test.tsx` — Cancel closes without calling delete; Confirm calls delete hook; Delete button disabled during in-flight mutation; success collapses row

**Automated checks:**
- `npm run typecheck` — zero errors
- `npm test` — all tests pass

**Manual verification:**
- Delete button in expanded row opens confirmation dialog
- Cancel closes dialog; row remains expanded
- Confirming deletes the policy, collapses the row, and removes it from the list
- Delete button shows loading state during in-flight request

---

## Commit 11 — test: integration tests and accessibility

**Scope:** Integration tests for the main user flows and accessibility audit.

New tests:
- `DashboardPage.test.tsx` — full list renders; search filters results; pagination advances; row expands and shows detail; filter modal applies filter and shows chip
- Run `axe-core` or manual keyboard navigation audit

Accessibility fixes (if found):
- Focus management for modals
- `aria-live` regions for loading and error states
- Skip links or landmark regions if missing

**Automated checks:**
- `npm run typecheck` — zero errors
- `npm test` — all integration tests pass

**Manual verification:**
- Tab through entire dashboard without a mouse — all controls reachable
- Open filter modal, close with Escape — focus returns to Filters button
- Open policy form, submit — focus returns to table
- Screen reader announces loading states (test with VoiceOver or NVDA if available)
- 375px viewport: no overflow, filter modal scrollable, table usable

---

## Commit 12 — docs: README

**Scope:** Final README for the repository root.

Sections:
- **Setup** — prerequisites, `npm install`, `VITE_API_URL` env var, `npm run dev`
- **Running tests** — `npm test`, `npm run typecheck`, `npm run lint`
- **Assumptions** — decisions made where the spec was ambiguous. Must cover all five gap decisions resolved during implementation: rows-per-page options, region filter behaviour, days-until-renewal computation, pending review type input, and delete entry point.
- **Tradeoffs** — what was prioritised and what was cut
- **What I would improve with more time** — honest next steps

**Manual verification:** Follow the README from a clean directory — it works.
