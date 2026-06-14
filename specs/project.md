# Project: (((app-title)))

> OpenSpec project context. This is the stable, high-level description of **this** codebase
> that every spec-driven change reads first. Keep it short and current; deep rules live in
> [`AGENTS.md`](../AGENTS.md) and [`.github/instructions/`](../.github/instructions/).

## Stack

- **Framework:** React 19+ with TypeScript 5+
- **Build tool:** Vite (HMR dev server + production builds)
- **Architecture:** SPA — `src/app` (pages, components, atoms, layouts, `app.ioc`,
  `app.routes`) + `src/libs` (`ioc`, `router`, `feature`)
- **Router:** React Router 7+ via `#libs/router`
- **Validation:** Zod 4+ (TypeScript-first schemas)
- **State:** Jotai atoms + React hooks
- **Dependency injection:** custom IoC container via `#libs/ioc`
- **Testing:** Vitest + React Testing Library (happy-dom), coverage target ≥ 80%
- **Runtime:** Node `>=24`, pnpm `>=11`

## Conventions

- Code and inline docs in **English** (identifiers, comments, props, errors); preserve
  explicitly defined business-domain terms in their original language. Full rules in
  [`AGENTS.md`](../AGENTS.md).
- The canonical code scaffolds live under [`.vscode/__templates__/`](../.vscode/__templates__/) —
  start from the matching one for any new file.

## Quality gates (the change lifecycle runs these)

```bash
pnpm lint                       # ESLint (cached, auto-fix)
pnpm stylelint                  # CSS linting
pnpm test --coverage --run  # full Vitest suite once, with coverage
pnpm build                  # type-checked production build
pnpm format                     # Prettier (write)
```

## How specs work here (OpenSpec)

- `specs/specs/` — **living truth**: one folder per capability, the behavior that **is** built.
- `specs/changes/` — **proposals** (like DB migrations): each change carries spec **deltas**
  (`## ADDED|MODIFIED|REMOVED Requirements`). When shipped, `spec-archive` applies the deltas
  to `specs/specs/` and moves the change to `specs/changes/archive/`.

See the lifecycle in [`.ai/README.md`](../.ai/README.md) and the format in
[`.ai/skills/spec-conventions.md`](../.ai/skills/spec-conventions.md).
