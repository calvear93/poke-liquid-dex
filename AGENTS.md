# AGENTS.md

> Single source of truth for **all** AI coding assistants working in this repository
> (GitHub Copilot, Claude, Gemini, Codex, Cursor, and any agent that reads `AGENTS.md`).

This is a modern, production-ready **React + TypeScript SPA template** built on Vite. It
emphasizes type safety end-to-end, dependency injection via a custom IoC container,
feature flags, type-safe routing, and comprehensive testing.

## How to use this document

- This file is the canonical, tool-agnostic instruction set. `CLAUDE.md` and `GEMINI.md`
  are thin pointers to it, and GitHub Copilot reads this file natively — **do not**
  duplicate guidance into those pointers.
- Keep this file as the high-level contract (stack, rules, conventions). Long-form
  detail lives in the deep references at the bottom; link to them instead of repeating.
- User instructions (a direct request in chat) always take precedence over this file.

## Tech stack

| Area              | Choice                                     |
| ----------------- | ------------------------------------------ |
| Framework         | React 19+ with TypeScript 5+               |
| Build tool        | Vite (HMR dev server + production builds)  |
| Router            | React Router 7+ via `#libs/router`         |
| Validation        | Zod 4+ (TypeScript-first schemas)          |
| Local/atom state  | Jotai + React hooks                        |
| Dependency inject | Custom IoC container via `#libs/ioc`       |
| Feature flags     | Custom system via `#libs/feature`          |
| Styling           | CSS Modules + UnoCSS (atomic CSS)          |
| Testing           | Vitest + React Testing Library (happy-dom) |
| Coverage          | Vitest Coverage V8 (target ≥ 80%)          |
| Mutation testing  | Stryker Mutator                            |
| Env loading       | `@calvear/env` (`env/` folder)             |
| Tooling           | ESLint + Prettier + Stylelint, pnpm        |
| Runtime           | Node `>=24`, pnpm `>=11`                   |

## Commands

The project uses a **single environment** (`main`), so commands have no suffix.

```bash
pnpm start                       # dev server with HMR
pnpm test                        # tests in watch mode
pnpm test --run                  # tests once (no watch)
pnpm test --coverage --run       # tests once with coverage (CI/validation)
pnpm test:mutation               # Stryker mutation tests (validate test quality)
pnpm lint                        # ESLint (cached)
pnpm stylelint                   # CSS linting
pnpm format                      # Prettier (write)
pnpm env:schema                  # regenerate env JSON schema after config changes
pnpm build                       # production build
pnpm preview                     # build + preview locally
```

Run `pnpm lint && pnpm format && pnpm test --coverage --run` before finalizing
non-trivial changes.

## Project structure

```
src/
  app/            feature code: pages, components, layouts, atoms, app.ioc, app.routes
  libs/           reusable libraries (ioc, router, feature) with their own README
env/              environment configuration (appsettings.json + <env> files)
.vscode/__templates__/  canonical code scaffolds for every pattern (component, page, atom, layout, schema, test, class, error/exception)
```

Path aliases (see `package.json#imports`): `#libs/ioc`, `#libs/router`, `#libs/feature`.
See **architecture-guide** for full folder topology and wiring.

When creating a new file, start from the matching scaffold under
[`.vscode/__templates__/`](.vscode/__templates__/) — it is the source of truth for
suffixes, folder layout, and component/atom/schema/test signatures.

## Core principles

- **Type safety first** — leverage TypeScript and Zod from UI to data layer; never `any`.
- **Inject, never hardcode** — all config and services flow through the IoC container.
- **Logic in hooks** — keep components declarative; move business logic into custom hooks.
- **Accessibility by default** — semantic HTML and ARIA on every interactive component.
- **Test what you ship** — unit + integration tests; meaningful assertions (mutation-aware).
- **YAGNI** — minimal, atomic changes; no speculative abstractions.

## Critical rules

These are non-negotiable. Violations should be fixed before code is considered done.

### Configuration & dependency injection

- **NEVER** hardcode URLs, API keys, or configuration inside components, hooks, or services.
- Keep `import.meta.env` access centralized in a config/bootstrap layer (e.g. an
  `app.config.ts` parsed with Zod) instead of scattering it across components and hooks.
- Define non-secret config in `env/appsettings.json`; secrets in `env/main.env.json` /
  `env/main.local.env.json` (the project uses a single environment, `main`).
- Bind config and services in the bootstrap layer (`app.ioc.ts`, which calls
  `createContainer()` from `#libs/ioc`) and consume them with the `useInjection` hook.
  See **architecture-guide** → Configuration architecture.

### Language policy

- All code and documentation is in **English**: identifiers, comments, props, errors, docs.
- **Exception:** preserve business-domain terms in their original language when the user
  explicitly defines them as domain entities (e.g. `Siniestro`, `Episodio`). Implementation
  around them stays in English.

### TypeScript & validation

- Explicit types everywhere; no `any` (prefer `unknown` + narrowing).
- Use Zod schemas for form data, API responses, and complex prop validation.
- Prefer `async`/`await` over raw Promises; always handle the error path.

### Accessibility

- Use semantic elements and proper ARIA roles/labels; ensure keyboard navigation and
  focus management for interactive components.

## Code style (essentials)

- Tabs for indentation (width 4); single quotes; semicolons; trailing commas (all); ~80 col width.
- Arrow functions with parens around params; named exports preferred over default exports.
- Include `.ts`/`.tsx` extensions in relative imports; use `#libs/*` aliases for libraries.
- Import order: external packages → `#libs/*` → relative imports.
- Files `kebab-case`, components `PascalCase`, functions/vars `camelCase`,
  module constants `SCREAMING_SNAKE_CASE`, private members prefixed `_`.

Full ruleset, file-suffix table, and anti-patterns: **coding-standards**.

## Testing

- Vitest + React Testing Library; assert on user-visible output, not internals.
- Inject mocked dependencies with `InversionOfControlProvider` + a `mockIoCValues` Map.
- Cover happy path, loading/error states, and at least one edge case. Target ≥ 80% coverage.
- Place `*.spec.tsx`/`*.spec.ts` alongside source files.

Worked test recipes: **patterns** → Testing patterns.

## Commit conventions

Use **Conventional Commits with Gitmoji**:

```
<type>(<optional scope>) <gitmoji>: <description>
```

Examples:

```
feat(auth) ✨: add token refresh flow
fix(router) 🐛: resolve lazy route fallback
refactor(hooks) ♻️: extract data-fetching logic
test(user) ✅: cover edit error state
chore(deps) 🔧: bump vite
```

Common types: `feat` ✨, `fix` 🐛, `docs` 📚, `style` 🎨, `refactor` ♻️, `perf` ⚡,
`test` ✅, `chore` 🔧, `ci`, `build`. Security 🔒, UI 💄, remove 🗑️, move 🚚.

## Spec-driven development (SDD)

Build features through a spec-first loop that follows the **OpenSpec** convention
([openspec.dev](https://openspec.dev)): living specs are the current truth, and each request
is a **change** (like a DB migration) carrying spec **deltas** that get applied on ship.
`AGENTS.md` is the constitution; the procedures live in [`.ai/skills/`](.ai/skills/):

```
/spec-intake    rough idea → an idea brief (optional on-ramp: shape a detailed input)
/spec-propose   idea    → specs/changes/<id>/proposal.md + specs/<cap>/spec.md deltas (what + why)
/spec-design    change  → specs/changes/<id>/design.md   (technical design; skip if trivial)
/spec-tasks     change  → specs/changes/<id>/tasks.md    (atomic, test-first tasks)
/spec-implement change  → code + tests (typecheck → run Vitest → fix)
/spec-archive   change  → verify + apply deltas to specs/specs/ + move to specs/changes/archive/
```

`/spec-intake` is optional: a guided interview that helps anyone (technical or not) turn a
rough idea into a detailed brief, which `/spec-propose` then formalizes. Skip it when the
request is already clear and complete.

Folder model (root `specs/`): `specs/specs/` = **living truth** (one folder per capability);
`specs/changes/<id>/` = **proposals** with `## ADDED|MODIFIED|REMOVED Requirements` deltas;
`specs/changes/archive/YYYY-MM-DD-<id>/` = shipped changes (the durable decision log). See
[`.ai/skills/spec-conventions.md`](.ai/skills/spec-conventions.md) for the exact format and
[`specs/project.md`](specs/project.md) for project context. The official `openspec` CLI is not
used (it hardcodes an `openspec/` root and can't target `specs/`); the skills are the engine.

`/spec-implement` reuses the canonical task prompts in [`.ai/prompts/`](.ai/prompts/)
(`component-creation`, `page-creation`, `custom-hook-creation`, `testing-creation`) instead of
redefining them. GitHub Copilot exposes the loop as `/spec-*` prompts under `.github/prompts/`;
Claude, Gemini, and Codex follow the procedure files directly. The best-practice skills
(`typescript`, `react-patterns`, `zod-schema`, `ioc-binding`, `vitest-tdd`, `vite-config`) live alongside them in
[`.ai/skills/`](.ai/skills/) — read the relevant one when its topic applies.

## Deep references

| Document                                                                      | Scope                                                                                                            |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| [Architecture guide](.github/instructions/architecture-guide.instructions.md) | Folder topology, IoC/config wiring, routing, feature flags, import conventions                                   |
| [Coding standards](.github/instructions/coding-standards.instructions.md)     | Formatting, naming, file suffixes, TypeScript rules, comments, anti-patterns                                     |
| [Patterns](.github/instructions/patterns.instructions.md)                     | Copy-paste recipes: components, hooks, services, schemas, forms, errors, tests                                   |
| [Code exemplars](exemplars.md)                                                | Pointers to high-quality real examples in this repo                                                              |
| [README](README.md)                                                           | Human-facing project documentation and setup                                                                     |
| [`.vscode/__templates__/`](.vscode/__templates__/)                            | Canonical code scaffolds for every pattern (component, page, atom, layout, schema, test, class, error/exception) |

Task prompts and agent definitions have canonical bodies in `.ai/prompts/` and `.ai/agents/`.
GitHub Copilot surfaces them natively via thin pointers in `.github/prompts/` and
`.github/agents/`; Claude, Gemini, and Codex read the `.ai/` files directly (see `CLAUDE.md`,
`GEMINI.md`, and this file).
