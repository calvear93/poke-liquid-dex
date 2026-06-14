# Skill: Spec — Archive

Verify the change against its spec and quality gates, then **apply the deltas to the living
specs and archive the change**. This is the "apply the migration" step — the piece that makes
`specs/specs/` the durable, current truth.

## When to use

After `/spec-implement`, when all tasks are checked. Input: the change folder
`specs/changes/<change-id>/` (proposal, deltas, tasks). Read `spec-conventions` first.

## Procedure

### 1. Verify (quality gate — React + Vite + TypeScript)

```bash
pnpm lint                       # ESLint (cached, auto-fix)
pnpm stylelint                  # CSS linting
pnpm test --coverage --run  # full Vitest suite once, with coverage (target ≥ 80%)
pnpm build                  # type-checked production build (zero type errors)
pnpm format                     # Prettier (write)
```

All must pass: **zero type errors**, all Vitest assertions green, coverage on target, lint and
formatter clean. Report real output — do not claim green without running. (Porting to another
stack: swap only these commands for the repo's build/test/lint/format loop.)

### 2. Trace deltas → tests

For each requirement/scenario in the change deltas, confirm a passing Vitest test exercises it
(use the traceability table in `tasks.md`). Flag any uncovered requirement; if gaps exist, loop
back to `/spec-tasks` or `/spec-implement` — do not archive.

### 3. Spot-check best practices

(`AGENTS.md`, `zod-schema`, `ioc-binding`, `vitest-tdd` skills): config/services injected
through the IoC container (no hardcoded URLs/keys, no scattered `import.meta.env`); Zod schemas
validate form data / API responses / complex props; no `any`; components declarative with logic
in hooks; accessible markup (semantic HTML + ARIA, keyboard/focus); tests assert on
user-visible output and cover happy path + loading/error + an edge case; tabs, single quotes,
named exports, `#libs/*` aliases, sorted imports/JSX props.

### 4. Apply the deltas to the living specs

For each `specs/changes/<change-id>/specs/<capability>/spec.md`, update
`specs/specs/<capability>/spec.md`:

- **ADDED Requirements** → if the capability spec doesn't exist, create it from
  `.ai/templates/spec.template.md` (fill `## Purpose`); then insert each `### Requirement:`
  block (with its scenarios) into `## Requirements`. Error if a same-named requirement already
  exists.
- **MODIFIED Requirements** → find the `### Requirement:` whose name matches **exactly** and
  replace its whole block (heading through its last scenario) with the new body. Drop the
  `(Previously: …)` line — it documented the change, not the new truth. Error if not found.
- **REMOVED Requirements** → delete the matching `### Requirement:` block. If a capability ends
  up with zero requirements, delete its `spec.md` (and empty folder).

Keep living specs **clean of delta markers** — no `## ADDED/MODIFIED/REMOVED`, no
`(Previously:)`/`(Reason:)` lines. They read as plain current truth.

### 5. Archive the change

```bash
TODAY=$(date +%F)                       # YYYY-MM-DD
git mv specs/changes/<change-id> specs/changes/archive/$TODAY-<change-id>
```

(Use `git mv` so history follows; plain `mv` if not yet tracked.) Set `proposal.md` status to
`archived`. The archived folder is the permanent record of why and how the change was made.

### 6. Re-validate

Confirm the touched living specs are well-formed per `spec-conventions` (every requirement has
≥ 1 scenario, no leftover delta markers) and `pnpm format` is still clean.

> No CLI: the official `openspec` CLI is not used (it hardcodes an `openspec/` root and can't
> target `specs/`). Steps 4–5 above are done by hand — they are the authoritative procedure.

## Output

- Pass/fail per gate with the actual command output (lint, `pnpm test`, `pnpm build`,
  `pnpm format`).
- A requirement-by-requirement coverage table (covered / missing).
- The list of living specs created/modified/removed and the archived change path.
- Any follow-ups or deferred items.
