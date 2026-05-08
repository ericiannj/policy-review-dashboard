---
paths:
  - "src/services/**"
  - "src/hooks/**"
  - "src/lib/axios.ts"
  - "src/lib/query-client.ts"
---

# API Consumer Conventions

## Axios instance (`src/lib/axios.ts`)

One shared instance. All services import from it. Base URL from `VITE_API_URL` with fallback.

```typescript
import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:4000',
  headers: { 'Content-Type': 'application/json' },
})
```

Do not add response interceptors that swallow errors — let them propagate to React Query.

## QueryClient (`src/lib/query-client.ts`)

```typescript
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
})
```

## Error shape

The API always returns errors as:

```json
{ "error": { "code": "...", "message": "...", "details": {} } }
```

Access via `error.response?.data?.error` in catch blocks or mutation `onError` callbacks. Validation errors include `details.fieldErrors` keyed by field name.

## Query keys

- Stable, serializable arrays: `['policies', params]`, `['policy', id]`.
- Exported as factory functions from the hook file that owns the read query.
- Mutation hooks import the factory to call `queryClient.invalidateQueries`.

```typescript
// Exported from use-policies.ts
export const policiesQueryKey = (params: PolicyListParams) => ['policies', params] as const

// Exported from use-policy.ts
export const policyQueryKey = (id: string) => ['policy', id] as const
```

## Mutation patterns

| Operation | On success | Invalidate |
|-----------|-----------|-----------|
| Create | redirect to list or close modal | `['policies', ...]` (all variants) |
| Update | close modal | `['policy', id]` + `['policies', ...]` |
| Delete | collapse row | `['policies', ...]` |

Use `queryClient.invalidateQueries({ queryKey: ['policies'] })` (partial key match) to invalidate all list variants.

## PATCH behavior

The API deep-merges nested objects but **replaces arrays wholesale**. When patching `pendingReviews`, always send the complete desired array — never a delta.

## Pagination params

Always pass `page` and `limit` to `GET /policies`. Never slice client-side.

## What NOT to expose in the UI

- `severity` filter — documented in API README but not implemented. Do not add a filter control for it.
