---
paths:
  - "src/**"
---

# Frontend Conventions

## Service layer (`src/services/`)

- One module per resource: `src/services/policies.ts`.
- Each function is `async`, fully typed, and returns unwrapped response data (not the Axios response object).
- Errors propagate — do not catch inside services. React Query handles them.
- Import the shared instance from `src/lib/axios.ts`.

```typescript
// src/services/policies.ts
import { api } from '@/lib/axios'
import type { PolicyListParams, PolicyListResponse, PolicyDetail } from '@/types/policy'

export const getPolicies = (params: PolicyListParams): Promise<PolicyListResponse> =>
  api.get('/policies', { params }).then((res) => res.data)

export const getPolicy = (id: string): Promise<PolicyDetail> =>
  api.get(`/policies/${id}`).then((res) => res.data)
```

## Custom hooks (`src/hooks/`)

- One file per operation: `use-policies.ts`, `use-policy.ts`, `use-create-policy.ts`, etc.
- Use `useQuery` for reads, `useMutation` for writes (TanStack Query v5 API).
- Export query key factories from the hook file — mutations import them for cache invalidation.
- Components call hooks only. Never import from `src/services/` in a component.

```typescript
// src/hooks/use-policies.ts
import { useQuery } from '@tanstack/react-query'
import { getPolicies } from '@/services/policies'
import type { PolicyListParams } from '@/types/policy'

export const policiesQueryKey = (params: PolicyListParams) => ['policies', params] as const

export const usePolicies = (params: PolicyListParams) =>
  useQuery({
    queryKey: policiesQueryKey(params),
    queryFn: () => getPolicies(params),
  })
```

## URL state

- Read and write URL params via `useSearchParams` from React Router.
- Params in URL: `search`, `page`, `region`, `effectiveDateFrom`, `effectiveDateTo`, `premiumMin`, `premiumMax`, `claimsTotalMin`, `claimsTotalMax`, `reimbursementRiskMin`, `reimbursementRiskMax`, `expanded`.
- Modal open/close state is local (`useState`) — not in URL.
- Changing any filter resets `page` to `1`.

## Types (`src/types/policy.ts`)

Two primary API shapes:
- `PolicySummary` — flat list item from `GET /policies`
- `PolicyDetail` — full nested object from `GET /policies/:id`

Separate input shape:
- `PolicyPayload` — body for `POST /policies` and `PATCH /policies/:id`

Shared enum types: `Region`, `PendingReviewType`, `ReviewSeverity`.

## Risk label (`src/lib/risk.ts`)

Single canonical utility — never inline thresholds in components.

```typescript
export type RiskLevel = 'Low' | 'Medium' | 'High'

export const getRiskLevel = (reimbursementRisk: number): RiskLevel => {
  if (reimbursementRisk >= 0.7) return 'High'
  if (reimbursementRisk >= 0.4) return 'Medium'
  return 'Low'
}
```

## Components

- Functional components only — no class components.
- Props interfaces named `<ComponentName>Props`, defined in the same file.
- Feature-scoped components: `src/components/features/<feature>/`.
- Shared primitives (shadcn/ui wrappers, base elements): `src/components/ui/`.
- Do not modify shadcn/ui source files — wrap them if customization is needed.
- One component per file. Barrel `index.ts` files are allowed per feature folder.

## Styling

- Tailwind CSS only — no inline styles, no CSS modules.
- Design tokens via CSS custom properties defined in `index.css`.
- Never hardcode color hex values — use Tailwind semantic classes or token variables.
- Responsive-first: mobile layout by default, then `md:` and `lg:` breakpoints.
- `lucide-react` for all icons. Sizes: 16px (inline/button), 20px (navigation), 24px (empty states).

## Accessibility

- Use semantic HTML first (`button`, `table`, `dialog`) before reaching for ARIA.
- Modals: `role="dialog"`, `aria-labelledby` pointing to the title, focus trapped inside.
- All interactive elements reachable by keyboard (`Tab`, `Enter`, `Escape` for modals).
- Loading states use `aria-busy` or `aria-live` regions for screen readers.
- Risk badge and status indicators convey meaning via both text and color.

## Testing

- Test files colocated: `component.tsx` → `component.test.tsx`, `use-hook.ts` → `use-hook.test.ts`.
- Unit tests: pure utilities (`getRiskLevel`, service functions with mocked Axios).
- Integration tests: user flows rendered with RTL + mocked API (via `msw` or `vi.mock`).
- Never test implementation details — test observable behavior and output.
- Mock at the network boundary, not at the hook or service level, unless explicitly testing a hook.
