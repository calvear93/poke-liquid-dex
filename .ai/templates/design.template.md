# Design: <change title>

- **Change ID:** <verb-led-kebab-id>
- **Proposal:** ./proposal.md
- **Status:** draft | approved

> Technical design that satisfies the proposal, grounded in this repo's architecture
> (`AGENTS.md`, `.github/instructions/architecture-guide.instructions.md`,
> `.vscode/__templates__/`). Optional for trivial changes. The "how", not the task list.

## Context

<What in the current code is relevant. Constraints, existing patterns to reuse, prior art.>

## Decisions

- **Decision:** <what you chose>. **Why:** <rationale>. **Alternatives considered:** <a, b>.
- ...

## Affected areas

- **Pages:** `src/app/pages/<page-name>/<PageName>.page.tsx` — wired into `app.routes.tsx`
- **Components:** `src/app/components/<category>/<ComponentName>.tsx` — declarative + accessible
- **State (atoms / hooks):** `src/app/.../<feature>.atom.ts` (Jotai) + custom hooks for logic
- **Schemas:** `src/app/.../<name>.schema.ts` (Zod) — form/API/prop validation
- **IoC / config:** bindings in `src/app/app.ioc.ts` (`createContainer()` from `#libs/ioc`),
  consumed via `useInjection`
- **Data fetching:** services bound in the IoC container (injected HTTP/fetch client)
- **Routing / features:** `src/app/app.routes.tsx` (`#libs/router`), `src/app/app.features.ts`
  (`#libs/feature`)

## Data & validation

- Zod schemas for inputs and API responses; explicit types (no `any`, prefer `unknown` +
  narrowing). Atom shape and derived/read-write split. See `zod-schema` skill.

## Config & dependency injection

- What gets bound in the IoC container and how components/hooks consume it via `useInjection`.
  No hardcoded URLs/keys; no scattered `import.meta.env`. See `ioc-binding` skill.

## Testing strategy

- Which requirements/scenarios map to which co-located Vitest specs (`*.spec.tsx` / `*.spec.ts`).
  Assert on user-visible output; cover happy path + loading/error + an edge case; mock IoC
  values through the IoC container. Target ≥ 80% coverage. See `vitest-tdd` skill.

## Risks / trade-offs

- <Error/loading states, accessibility, async error paths, performance, rollback.>
