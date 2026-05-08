# Compliance Checklist

Validate before presenting any implementation for review.

## Code quality
1. All code and comments are written in English
2. TypeScript strict — no `any`, no `@ts-ignore` without a documented justification
3. No hardcoded values — base URL via `VITE_API_URL`, magic numbers extracted as named constants
4. Components call hooks only — never call services directly from a component

## State & data
5. All server state managed via React Query hooks — no raw Axios calls in components or pages
6. URL reflects: `search`, `page`, all active filters, and expanded row ID (`expanded`)
7. When filters change, `page` resets to `1`
8. Risk label always computed via `getRiskLevel()` from `src/lib/risk.ts` — never inlined

## UX states
9. Every async operation has a loading state
10. Every list view has an empty state
11. Every async operation has an error state (list-level and row-level where applicable)
12. Disabled states applied to actions during in-flight mutations

## Accessibility
13. All interactive elements are keyboard-accessible
14. Risk badge and status indicators use both color and text (color is never the sole signal)
15. Modals use `role="dialog"` with `aria-labelledby` and trap focus correctly
16. Responsive layout verified at mobile (375px) and desktop (1280px+) breakpoints

## Quality gates
17. `npm run typecheck` passes with zero errors
18. `npm test` passes with zero failures
19. `npm run lint` passes (Biome — zero errors, zero warnings treated as errors)
20. Golden path and key edge cases verified manually in the browser
