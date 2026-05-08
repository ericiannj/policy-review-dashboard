# CLAUDE.md — Policy Review Dashboard

## Project

Policy Review Dashboard is a single-page frontend application. Users explore, inspect, filter, and manage insurance policies through an accessible, responsive dashboard.

This is a technical assessment. The evaluation criteria are: API integration quality, state management clarity, performance awareness, code quality, and UX implementation.

## Stack

| Layer | Technology |
|-------|-----------|
| Bundler | Vite |
| Package manager | npm |
| Framework | React 19 + TypeScript |
| Routing | React Router v6 |
| Server state | TanStack Query v5 |
| HTTP client | Axios |
| Global state | Zustand (only if complexity warrants — discuss first) |
| Styling | Tailwind CSS + shadcn/ui |
| Icons | lucide-react |
| Linting / formatting | Biome |
| Testing | Vitest + React Testing Library |
| Git hooks | Husky |

## Architecture

### Service layer — `src/services/`

All HTTP calls live here. One module per resource (`policies.ts`). Each export is a typed async function that uses the shared Axios instance and returns unwrapped response data. Services are the only place that knows the API exists.

### Custom hooks — `src/hooks/`

React Query hooks that wrap service calls. One hook per operation, named after what it does (`usePolicies`, `usePolicy`, `useCreatePolicy`, `useUpdatePolicy`, `useDeletePolicy`). Components call hooks — never services directly.

### URL state

`search`, `page`, all filter params, and the expanded row ID (`expanded`) are reflected in the URL via `useSearchParams`. Modal open/close state is local only.

### Folder structure

```
src/
├── components/
│   ├── ui/                   # shadcn/ui components + base primitives
│   └── features/             # Domain-scoped components
│       ├── policies/         # Table, row, expanded panel
│       ├── filters/          # Filter bar, modal, chips
│       └── policy-form/      # Create / edit form modal
├── hooks/                    # Custom React Query hooks
├── services/                 # Axios service layer
├── types/                    # TypeScript interfaces from API schema
├── lib/                      # Shared utilities
│   ├── axios.ts              # Axios instance
│   ├── query-client.ts       # QueryClient instance
│   └── risk.ts               # Risk label computation
└── pages/                    # Route-level components
```

## API

Base URL: `http://localhost:4000` (via `VITE_API_URL` env var).
Full reference: `docs/api.md`.

Risk label computation (frontend-only — not returned by API):

| Risk | Condition |
|------|-----------|
| High | `r >= 0.70` |
| Medium | `0.40 <= r < 0.70` |
| Low | `r < 0.40` |

Computed via `getRiskLevel()` in `src/lib/risk.ts` — never inline the thresholds.

## Principles

- **English only.** All code, comments, variable names, type names, and commit messages in English.
- **Simplicity first.** Prefer the smallest change that solves the problem. Touch only what is needed.
- **No premature abstraction.** Add Zustand, extra context, or new patterns only when the concrete need is clear.
- **Root cause over workaround.** If a fix feels like a patch, say so and propose the clean alternative.

## Rules

### Language
All code, comments, variable names, type names, and commit messages must be in English. No exceptions.

### Tests
Unit and integration tests are expected alongside implementation — not as an afterthought. Run `npm test` before each commit. Vitest + RTL is the stack.

### Pre-commit hooks
Husky runs `biome check --write` and `vitest run` on every commit. Never bypass with `--no-verify`.

### No automatic commits
Do not create git commits without explicit user approval. Present the diff and wait for the green light.

### Plan before non-trivial work
For tasks spanning 3+ steps or that involve architectural decisions, present a plan and get approval before writing code.

### Verify before declaring done
Never claim a task is complete without evidence. Run `npm run typecheck`, `npm test`, and verify manually in the browser. Cite the output.

### Present tradeoffs for meaningful choices
Library selection, architectural patterns, data modeling — always present at least two options with pros/cons before proceeding.

### Respect the implementation plan
Follow `docs/implementation-plan.md`. Work the current commit's scope. Do not implement future commits' features unless explicitly asked.

### Verify syntax against official docs
Before writing implementation code that uses a library from the stack (React Query, Axios, React Router, shadcn/ui, Vitest, Biome, Husky, etc.), use Context7 to confirm the current API and configuration syntax. Training data may be outdated. Do not rely on memory for library-specific patterns.

## Quick Reference

| What | Where |
|------|-------|
| API reference | `docs/api.md` |
| Project overview | `docs/overview.md` |
| Implementation plan | `docs/implementation-plan.md` |
| Frontend conventions | `.claude/rules/frontend-conventions.md` |
| API consumer conventions | `.claude/rules/api-conventions.md` |
| Compliance checklist | `.claude/rules/compliance-checklist.md` |
