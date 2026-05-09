# Policy Review Dashboard

A single-page dashboard for Tricura Insurance Group. Users explore a paginated table of insurance policies, inspect full policy detail inline, filter and search the list, and perform create, edit, and delete operations — all with proper loading, empty, and error states throughout.

## Setup

**Prerequisites:** Node.js 20+ and npm.

```bash
# 1. Install dependencies
npm install

# 2. Create the environment file
cp .env.example .env

# The default value works if the API server runs on port 4000.
# Edit .env if your API is on a different port:
# VITE_API_URL=http://localhost:4000

# 3. Start the API server (separate terminal)
# Follow the API server's own README.

# 4. Start the dev server
npm run dev
```

The app is available at `http://localhost:5173`.

## Production build and preview

```bash
# Build for production
npm run build

# Serve the production build locally
npm run preview
```

The preview is available at `http://localhost:4173`.

## Running tests

```bash
# Unit and integration tests
npm test

# Type checking
npm run typecheck

# Linting
npm run lint
```

The pre-commit hook runs `biome check --write` and `vitest run` automatically on every commit.

## Assumptions

The spec left five decisions open. This section documents each choice.

### 1. Rows per page

The pagination footer includes a "Rows per page" selector with options 10, 20, and 50. The default is 20, matching the seed data. The selected `limit` is reflected in the URL (`?limit=20`) so the preference persists on navigation and refresh. Changing the page size resets the page to 1.

### 2. Region filter: single-select

The filter UI offers a single-select dropdown for region, not checkboxes. The API accepts only one `region` value per request, so allowing multiple selections in the UI would silently discard all but one. A single-select dropdown makes the constraint visible and prevents confusion.

### 3. Days until renewal: computed and read-only

The "Days until renewal" field in the policy form is read-only and computed automatically from the effective date: `differenceInDays(effectiveDate, today)`. Displaying a computed value alongside its source makes the relationship explicit and eliminates a class of inconsistency bugs (e.g., the user editing the days field without touching the date). Negative values indicate the policy is past renewal and are displayed as-is.

### 4. Pending review type: dropdown

The "Type" field for pending reviews uses a dropdown bound to the API's `PendingReviewType` enum (`License`, `Care Plan`, `Compliance`, `Safety`, `Financial`). Free-text input would allow values that the API rejects, producing opaque 400 errors. The dropdown prevents invalid input at the source.

### 5. Delete entry point: button in the expanded row panel

The Delete action is a button inside the expanded row panel, separate from the edit modal. The confirmation dialog opens on top of the panel — not requiring the user to first open, then close, the edit modal. This keeps the delete flow independent of edit, which is the correct interaction model: deleting a record is a destructive action that should not be buried inside an edit flow.

## Tradeoffs

**URL state over session/local storage.** All filter, search, pagination, and expansion state lives in the URL. This makes the app fully shareable and bookmarkable without any persistence layer, but it means state does not survive if the user manually clears the URL. The tradeoff favors collaboration and debuggability over convenience.

**Lazy detail fetch.** Policy detail (`GET /policies/:id`) is fetched only when a row is expanded, not prefetched. This avoids N requests on list load but means the first expansion always hits the network. With more time, prefetching on hover would eliminate the perceived delay.

**Full array replacement for `pendingReviews`.** The API's `PATCH` replaces the `pendingReviews` array wholesale. The form always sends the full current array on submit. A partial-update approach (individual add/remove endpoints) would be more efficient for large arrays; it would also require API changes.

**No Zustand|Redux.** Global state management was intentionally omitted. All shared state is either URL state (filters, pagination, expansion) or server state (React Query cache). This keeps the data flow simple and avoids the overhead of a store for a dashboard of this scope.

**`severity` filter not exposed.** The API supports filtering by `severity`, but the filter modal does not include it. The field exists on pending reviews (per-item), not on the policy itself, so filtering by severity in the list is ambiguous without clearer product requirements.

## Notes on performance considerations

### Strategies applied in this project

**Server-side pagination.** The table never loads all records at once. Every change to `page`, `limit`, or any filter hits the API and returns only the requested slice. This keeps the initial payload small and the DOM lean regardless of dataset size.

**React Query cache with a 30-second stale window.** The `QueryClient` is configured with `staleTime: 30_000`. Navigating back to a previously visited filter/page combination returns the cached response immediately, with no network round-trip, and only triggers a background refetch after the window expires. Each unique combination of query params gets its own cache bucket, so switching between filter states does not evict earlier results.

**Lazy detail fetch.** `usePolicy` sets `enabled: id !== undefined`, so `GET /policies/:id` is only issued when a row is actually expanded. Fetching detail for every visible row on list load would multiply the request count by the page size — the lazy approach avoids that entirely.

**Targeted cache invalidation.** Mutations invalidate by partial key (`['policies']`) rather than clearing the entire cache. A create or delete only refetches list queries; it does not discard unrelated cached detail entries.

### Metrics to track and tools to use

| Metric | What it reveals | How to measure |
|--------|-----------------|----------------|
| LCP (Largest Contentful Paint) | When the primary table content is visible and useful | Lighthouse, Chrome DevTools Performance panel |
| INP (Interaction to Next Paint) | Perceived responsiveness to filter changes, row expansion, and form submissions | Chrome DevTools + Web Vitals extension |
| Cache hit rate | Whether the stale window is sized correctly for real usage patterns | React Query Devtools (not installed — would be added as a dev dependency) |
| Network waterfall | Redundant requests, request fan-out, time-to-first-byte for list and detail endpoints | Chrome DevTools Network tab, filtered by XHR |
| Bundle size | Whether new dependencies are inflating the initial load | `npm run build` output, Vite bundle report or `source-map-explorer` |

In practice, the highest-value instrumentation for a dashboard like this would be React Query Devtools (once added) for cache behaviour and the Network tab for request count — both give immediate signal on the two areas most likely to regress as features are added.

## What I would improve with more time

**Refactors**

**Component and utility consolidation.** A review of the codebase identified a few structural improvements worth addressing: duplicated formatting functions defined locally in multiple components (a `formatters.ts` utility, following the same pattern as `risk.ts`, would centralise them), a large component that mixes data fetching and presentation concerns and would benefit from being split, and minor inconsistencies in shared UI behaviour such as modal close guards. None of these affect functionality, but they represent the kind of cleanup that would improve maintainability as the codebase grows.

**LCP improvement.** Chrome DevTools reports a Largest Contentful Paint of ~4.3 s in development, with the page heading identified as the LCP element. The main contributor is the render being gated on the first data fetch: the table shell — including the heading — only appears after the API response arrives. Two changes would address this directly: introducing skeleton rows so the page structure renders immediately (decoupling LCP from network latency), and setting a `staleTime` long enough that returning visitors see cached data before any refetch begins. Together, these would bring LCP well under the 2.5 s good threshold for most users.

**Optimistic updates.** Mutations currently wait for the server round-trip before updating the UI. Optimistic updates on delete and edit would make the app feel faster, at the cost of rollback logic on error.

**Virtualized table.** The current table renders all visible rows in the DOM. For large page sizes or future infinite-scroll designs, a virtualized list (e.g., TanStack Virtual) would be necessary for smooth performance.

**E2E tests.** The test suite covers units and integration against MSW handlers, but there are no browser-level end-to-end tests. Playwright tests on the critical paths (create, edit, delete, filter) would give stronger confidence before deployment.

**Error boundary.** The current error states are per-component (`PoliciesErrorState`, `PolicyDetailError`). A top-level React error boundary would catch unexpected render errors and prevent the entire page from going blank.

**Accessibility audit with a screen reader.** Keyboard navigation is covered and ARIA attributes are in place, but the implementation has only been tested visually. A full pass with VoiceOver or NVDA would surface gaps in announcement flow and modal focus management.
