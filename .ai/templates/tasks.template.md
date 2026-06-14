# Tasks: <change title>

- **Change ID:** <verb-led-kebab-id>
- **Proposal:** ./proposal.md · **Design:** ./design.md (if present)
- **Status:** draft | in progress | done

> Atomic, ordered, **test-first** tasks. Each is small, independently verifiable (write/adjust
> the Vitest spec, then the implementation). Check off as you go. Hierarchical numbering.

## 1. <Section name>

- [ ] 1.1 <task> — File(s): `src/app|src/libs/<path>.tsx` · Test: `<...>.spec.tsx`
      covering requirement `<Capability › Requirement name>` · Done when: typechecks clean and
      the assertion passes
- [ ] 1.2 <task> — ...

## 2. <Section name>

- [ ] 2.1 <task> — ...

## Traceability

Every requirement/scenario in the change deltas must be covered by at least one task/test.

| Requirement (capability › name) | Task(s) |
| ------------------------------- | ------- |
| <capability> › <Requirement A>  | 1.1     |
| <capability> › <Requirement B>  | 2.1     |

## Definition of done

- [ ] All tasks checked; type-checked build is clean (`pnpm build`).
- [ ] Full Vitest suite green with coverage on target (`pnpm test --coverage --run`).
- [ ] `pnpm lint` and `pnpm stylelint` clean.
- [ ] `pnpm format` clean (Prettier).
- [ ] Every delta requirement traces to a passing test.
- [ ] Ready for `/spec-archive` (deltas apply cleanly to `specs/specs/`).
